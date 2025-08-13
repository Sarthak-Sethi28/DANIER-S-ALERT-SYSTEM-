import pandas as pd
from typing import List, Dict, Tuple
import os
from dotenv import load_dotenv
import hashlib
import time
from datetime import datetime
import re

load_dotenv()

# Resolve uploads directory once
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

class KeyItemsService:
    def __init__(self):
        # Default threshold for each size (can be configured per item later)
        self.default_size_threshold = int(os.getenv("SIZE_THRESHOLD", "30"))
        
        # Dynamic key items - will be populated from each file
        self.dynamic_key_items = {}
        self.global_key_items = set()  # Union of all KI00 items across files
        
        # Caching for performance optimization
        self.file_cache = {}  # Cache processed data for each file
        self.low_stock_cache = {}  # Cache low stock results for each file
        
        # Performance cache
        self.cache = {}
        self.cache_ttl = 300  # 5 minutes
        self.cache_timestamps = {}
        
        # Size code mapping (based on Variant Code patterns)
        self.size_mapping = {
            "3XS": "3XS",
            "2XS": "2XS", 
            "XS": "XS",
            "S": "S",
            "M": "M",
            "L": "L",
            "XL": "XL",
            "2XL": "2XL",
            "3XL": "3XL"
        }

        # Custom thresholds for specific items (in-memory, loaded from DB)
        self.custom_thresholds = {}

        # Load persisted overrides from DB at startup
        try:
            from database import get_db
            from models import ThresholdOverride
            db = next(get_db())
            try:
                rows = db.query(ThresholdOverride).all()
                for row in rows:
                    key = f"{row.item_name}|{row.size}|{row.color}"
                    self.custom_thresholds[key] = int(row.threshold)
                print(f"💾 Loaded {len(self.custom_thresholds)} persisted threshold overrides from DB")
            finally:
                db.close()
        except Exception as e:
            print(f"⚠️ Could not load threshold overrides from DB: {e}")
            # continue without persistence if DB not ready
    
    def _get_cache_key(self, operation: str, file_path: str) -> str:
        """Generate cache key for operations"""
        file_mtime = os.path.getmtime(file_path) if os.path.exists(file_path) else 0
        key_data = f"{operation}:{file_path}:{file_mtime}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached result is still valid"""
        if cache_key not in self.cache_timestamps:
            return False
        return (time.time() - self.cache_timestamps[cache_key]) < self.cache_ttl
    
    def _set_cache(self, cache_key: str, data) -> None:
        """Store data in cache"""
        self.cache[cache_key] = data
        self.cache_timestamps[cache_key] = time.time()
    
    def _get_cache(self, cache_key: str):
        """Get data from cache if valid"""
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]
        return None

    def detect_key_items_from_file(self, file_path: str) -> List[str]:
        """Dynamically detect all KI00 items from a specific inventory file"""
        try:
            print(f"🔍 Detecting KI00 items from: {file_path}")
            
            # Read the file and find all KI00 items
            df = self._load_inventory_file(file_path)
            if df is None:
                return []
            
            # Filter for KI00 items and get unique item names
            ki00_items = df[df['Season Code'] == 'KI00']['Item Description'].unique()
            
            # Extract just the item names (before the dash)
            key_items = []
            for item in ki00_items:
                if pd.notna(item) and isinstance(item, str):
                    # Extract the item name (e.g., "DARIA - SLIM FIT..." -> "DARIA")
                    item_name = item.split(' - ')[0].strip()
                    if item_name:
                        key_items.append(item_name)
            
            # Remove duplicates and sort
            key_items = sorted(list(set(key_items)))
            
            print(f"✅ Detected {len(key_items)} KI00 items: {key_items[:5]}{'...' if len(key_items) > 5 else ''}")
            return key_items
            
        except Exception as e:
            print(f"❌ Error detecting key items: {e}")
            return []
    
    def get_file_key_items(self, file_path: str) -> List[str]:
        """Get key items for a specific file (cached or detected)"""
        if file_path not in self.dynamic_key_items:
            self.dynamic_key_items[file_path] = self.detect_key_items_from_file(file_path)
            # Update global set
            self.global_key_items.update(self.dynamic_key_items[file_path])
        
        return self.dynamic_key_items[file_path]
    
    def get_all_key_items(self) -> List[str]:
        """Get all KI00 items ever detected across all files"""
        return sorted(list(self.global_key_items))
    
    def _load_inventory_file(self, file_path: str) -> pd.DataFrame:
        """Load inventory file with flexible column detection"""
        try:
            # Check cache first for performance
            if file_path in self.file_cache:
                print(f"⚡ Using cached file data for: {file_path}")
                return self.file_cache[file_path]
            
            # Get all sheet names first
            excel_file = pd.ExcelFile(file_path)
            sheet_names = excel_file.sheet_names
            
            # Required columns (flexible matching)
            required_columns = ['Item Description', 'Variant Color', 'Variant Code', 'Grand Total', 'Season Code']
            
            # Strategy: Try each sheet by name, prioritizing common names
            priority_sheets = []
            if 'Sheet1' in sheet_names:
                priority_sheets.append('Sheet1')
            if 'Inventory' in sheet_names:
                priority_sheets.append('Inventory')
            if 'Data' in sheet_names:
                priority_sheets.append('Data')
            
            # Add all other sheets
            for sheet in sheet_names:
                if sheet not in priority_sheets:
                    priority_sheets.append(sheet)
            
            for sheet_name in priority_sheets:
                try:
                    # Try different header rows
                    for header_row in [0, 1, 2]:
                        try:
                            df = pd.read_excel(file_path, sheet_name=sheet_name, header=header_row)
                            
                            # Check if we have the required columns
                            if all(col in df.columns for col in required_columns):
                                return df
                            
                            # Try flexible column matching
                            column_mapping = {}
                            for required_col in required_columns:
                                for actual_col in df.columns:
                                    if required_col.lower() in str(actual_col).lower():
                                        column_mapping[required_col] = actual_col
                                        break
                            
                            if len(column_mapping) == len(required_columns):
                                # Rename columns to standard names
                                df = df.rename(columns=column_mapping)
                                # Cache the processed DataFrame for future use
                                self.file_cache[file_path] = df
                                return df
                                
                        except Exception:
                            continue
                            
                except Exception:
                    continue
            
            return None
            
        except Exception as e:
            print(f"❌ Error loading file: {e}")
            return None
    
    def extract_size_from_variant(self, variant_code: str) -> str:
        """Extract size from variant code with improved pattern matching"""
        if pd.isna(variant_code) or not isinstance(variant_code, str):
            return "Unknown"
        
        variant_str = str(variant_code).strip()
        
        # Handle variant codes with dots (e.g., '990.3XS' -> '3XS', '990.L' -> 'L')
        if '.' in variant_str:
            parts = variant_str.split('.')
            if len(parts) > 1:
                size_part = parts[1].rstrip('.')  # Remove trailing dots
                
                # Handle belt sizes (numeric)
                if size_part.isdigit():
                    return size_part
                
                # Handle standard sizes - order from longest to shortest to avoid partial matches
                size_patterns = [
                    '3XL', '2XL', '3XS', '2XS',  # Multi-character sizes first
                    'XL', 'XS',  # Two-character sizes
                    'NS', 'S', 'M', 'L'  # Single-character sizes
                ]
                
                for pattern in size_patterns:
                    if size_part == pattern:  # Exact match
                        return pattern
        
        # Handle variant codes without dots (e.g., '990L' -> 'L', '632XS' -> 'XS')
        # Use exact end matching to avoid partial matches
        size_patterns = [
            '3XL', '2XL', '3XS', '2XS',  # Multi-character sizes first
            'XL', 'XS',  # Two-character sizes
            'NS', 'S', 'M', 'L'  # Single-character sizes
        ]
        
        # Try to find size at the end of the variant code with exact matching
        for pattern in size_patterns:
            if variant_str.endswith(pattern):
                return pattern
        
        # Handle belt sizes without dots (e.g., '99026' -> '26')
        # Look for 2-digit numbers at the end
        import re
        belt_match = re.search(r'(\d{2})$', variant_str)
        if belt_match:
            return belt_match.group(1)
        
        return "Unknown"
    
    def process_key_items_inventory(self, file_path: str) -> Tuple[List[Dict], bool, str]:
        """
        Ultra-fast processing of inventory file for key items size-level tracking
        
        Returns:
            Tuple of (low_stock_items, success, error_message)
        """
        try:
            # Check cache first for performance
            if file_path in self.low_stock_cache:
                print(f"⚡ Using cached results for: {file_path}")
                return self.low_stock_cache[file_path]
            
            print(f"🚀 Ultra-fast analysis of: {file_path}")
            
            # Get dynamic key items for this specific file
            file_key_items = self.get_file_key_items(file_path)
            if not file_key_items:
                return [], False, "❌ No KI00 items found in this file"
            
            print(f"🎯 Processing {len(file_key_items)} KI00 items for this file")
            
            # Load the inventory file (with caching)
            df = self._load_inventory_file(file_path)
            if df is None:
                return [], False, "❌ Could not load inventory file"
            
            print(f"📊 Processing {len(df)} rows of data")
            
            # Ultra-fast KI00 filtering
            ki00_df = df[df['Season Code'] == 'KI00'].copy()
            print(f"🎯 Found {len(ki00_df)} key item entries")
            
            # Vectorized processing for maximum speed
            low_stock_items = []
            
            # Pre-filter for KI00 items only
            for item_name in file_key_items:
                # Vectorized filtering
                item_mask = ki00_df['Item Description'].str.startswith(f"{item_name} -", na=False)
                item_df = ki00_df[item_mask]
                
                if len(item_df) == 0:
                    continue
                
                # Process each row efficiently
                for _, row in item_df.iterrows():
                    try:
                        item_description = row['Item Description']
                        color = row['Variant Color']
                        variant_code = row['Variant Code']
                        current_stock = row['Grand Total']
                        season_code = row['Season Code']
                        
                        # Extract size from variant code
                        size = self.extract_size_from_variant(variant_code)
                        
                        # Get custom threshold for this item, size, and color, or use default
                        threshold = self.get_custom_threshold(item_name, size, color)
                        
                        # Check if stock is below threshold
                        if pd.notna(current_stock) and current_stock < threshold:
                            shortage = threshold - current_stock
                            
                            low_stock_items.append({
                                'item_name': item_name,
                                'item_description': item_description,
                                'color': color,
                                'size': size,
                                'season_code': season_code,
                                'variant_code': variant_code,
                                'current_stock': int(current_stock),
                                'required_threshold': threshold,
                                'shortage': int(shortage)
                            })
                    
                    except Exception as e:
                        print(f"⚠️ Error processing item {item_name}: {e}")
                        continue
            
            print(f"📊 Found {len(low_stock_items)} low stock items across all key styles")
            
            # Cache the results
            result = (low_stock_items, True, "")
            self.low_stock_cache[file_path] = result
            
            return result
            
        except Exception as e:
            error_msg = f"Error in inventory processing: {str(e)}"
            print(f"❌ {error_msg}")
            return [], False, error_msg
    
    def get_key_items_summary(self, file_path: str) -> Dict:
        """Get summary of key items stock levels for a specific file"""
        try:
            # Get dynamic key items for this specific file
            file_key_items = self.get_file_key_items(file_path)
            if not file_key_items:
                return {"error": "No KI00 items found in this file"}
            
            # Load the inventory file
            df = self._load_inventory_file(file_path)
            if df is None:
                return {"error": "Could not load inventory file"}
            
            # Filter for KI00 items only
            ki00_df = df[df['Season Code'] == 'KI00'].copy()
            
            summary = {}
            
            for item_name in file_key_items:
                # Filter for this specific item
                item_df = ki00_df[ki00_df['Item Description'].str.startswith(f"{item_name} -", na=False)]
                
                if not item_df.empty:
                    total_stock = 0
                    for _, row in item_df.iterrows():
                        stock_value = row['Grand Total']
                        if pd.notna(stock_value):
                            try:
                                total_stock += int(float(stock_value))
                            except (ValueError, TypeError):
                                pass
                    
                    summary[item_name] = {
                        'total_stock': total_stock,
                        'variants_count': len(item_df)
                    }
                else:
                    summary[item_name] = {
                        'total_stock': 0,
                        'variants_count': 0
                    }
            
            return summary
            
        except Exception as e:
            return {"error": f"Error processing summary: {str(e)}"} 

    def get_key_items_batch(self, file_path: str) -> Tuple[bool, List[str], str]:
        """Ultra-fast batch processing of key items"""
        try:
            # Check cache first
            cache_key = self._get_cache_key("key_items_batch", file_path)
            cached_result = self._get_cache(cache_key)
            if cached_result:
                print(f"⚡ Using cached key items for: {os.path.basename(file_path)}")
                return cached_result

            print(f"🚀 Fast batch processing: {os.path.basename(file_path)}")
            
            # Load file efficiently
            df = self._load_inventory_file(file_path)
            if df is None:
                return False, [], "Failed to load inventory file"
            
            # Ultra-fast KI00 detection
            if 'Season Code' not in df.columns:
                return False, [], "Season Code column not found"
            
            ki00_data = df[df['Season Code'] == 'KI00']
            if ki00_data.empty:
                return False, [], "No KI00 items found"
            
            # Extract unique item names quickly
            item_column = self._detect_item_column(df.columns)
            if not item_column:
                return False, [], "Item description column not found"
            
            # Super-fast unique item extraction
            unique_items = ki00_data[item_column].str.split(' - ').str[0].str.strip().unique().tolist()
            unique_items = [item for item in unique_items if item and str(item) != 'nan']
            
            result = (True, unique_items, "")
            self._set_cache(cache_key, result)
            
            print(f"⚡ Processed {len(unique_items)} key items in batch mode")
            return result
            
        except Exception as e:
            print(f"❌ Error in batch processing: {str(e)}")
            return False, [], str(e)
    
    def get_item_alerts_cached(self, item_name: str) -> List[Dict]:
        """Get alerts for specific item with aggressive caching"""
        try:
            # Find latest file
            uploads_dir = UPLOAD_DIR
            if not os.path.exists(uploads_dir):
                return []
            
            files = [f for f in os.listdir(uploads_dir) if f.endswith('.xlsx')]
            if not files:
                return []
            
            files.sort(key=lambda x: os.path.getmtime(os.path.join(uploads_dir, x)), reverse=True)
            latest_file = os.path.join(uploads_dir, files[0])
            
            # Check cache
            cache_key = self._get_cache_key(f"alerts_{item_name}", latest_file)
            cached_result = self._get_cache(cache_key)
            if cached_result:
                print(f"⚡ Using cached alerts for: {item_name}")
                return cached_result
            
            # Fast processing
            alerts = self._get_item_alerts_fast(latest_file, item_name)
            self._set_cache(cache_key, alerts)
            
            return alerts
            
        except Exception as e:
            print(f"❌ Error getting cached alerts for {item_name}: {str(e)}")
            return []
    
    def _get_item_alerts_fast(self, file_path: str, item_name: str) -> List[Dict]:
        """Fast alert processing for specific item"""
        try:
            df = self._load_inventory_file(file_path)
            if df is None:
                return []
            
            # Filter for KI00 and specific item efficiently
            ki00_data = df[df['Season Code'] == 'KI00'].copy()
            if ki00_data.empty:
                return []
            
            item_column = self._detect_item_column(df.columns)
            stock_column = self._detect_stock_column(df.columns)
            
            if not item_column or not stock_column:
                return []
            
            # Extract item names efficiently
            ki00_data['item_base'] = ki00_data[item_column].str.split(' - ').str[0].str.strip()
            
            # Filter for specific item
            item_data = ki00_data[ki00_data['item_base'] == item_name].copy()
            if item_data.empty:
                return []
            
            # Convert stock to numeric efficiently
            item_data[stock_column] = pd.to_numeric(item_data[stock_column], errors='coerce').fillna(0)
            
            # Filter low stock (threshold: 10)
            low_stock = item_data[item_data[stock_column] < 10]
            
            # Format results quickly
            alerts = []
            for _, row in low_stock.iterrows():
                alerts.append({
                    "item_name": item_name,
                    "color": str(row.get('Variant Color', '')),
                    "size": str(row.get('Variant Code', '')),
                    "stock_level": int(row[stock_column]),
                    "status": "LOW STOCK"
                })
            
            return alerts
            
        except Exception as e:
            print(f"❌ Error in fast alert processing: {str(e)}")
            return []

    def _detect_item_column(self, columns: List[str]) -> str | None:
        """Detect the column containing item descriptions (e.g., 'Item Description', 'Item Name')"""
        item_candidates = ['Item Description', 'Item Name']
        for col in item_candidates:
            if col in columns:
                return col
        return None

    def _detect_stock_column(self, columns: List[str]) -> str | None:
        """Detect the column containing stock values (e.g., 'Grand Total', 'Stock')"""
        stock_candidates = ['Grand Total', 'Stock']
        for col in stock_candidates:
            if col in columns:
                return col
        return None 

    def get_all_key_items_with_alerts(self, file_path: str) -> Tuple[List[Dict], bool, str]:
        """Get all key items with their alerts in a single ultra-fast batch operation"""
        try:
            # Check cache first
            cache_key = self._get_cache_key("all_key_items_with_alerts_v2", file_path)
            cached_result = self._get_cache(cache_key)
            if cached_result:
                # Normalize legacy cached tuple order: (bool, list, str) → (list, bool, str)
                if (
                    isinstance(cached_result, tuple)
                    and len(cached_result) == 3
                    and isinstance(cached_result[0], bool)
                    and isinstance(cached_result[1], list)
                ):
                    cached_result = (cached_result[1], cached_result[0], cached_result[2])
                    self._set_cache(cache_key, cached_result)
                print(f"⚡ Using cached batch alerts for: {os.path.basename(file_path)}")
                return cached_result

            print(f"🚀 Ultra-fast batch processing all alerts: {os.path.basename(file_path)}")
            
            # Load file once
            df = self._load_inventory_file(file_path)
            if df is None:
                return [], False, "Failed to load inventory file"
            
            # Filter for KI00 items once
            if 'Season Code' not in df.columns:
                return [], False, "Season Code column not found"
            
            ki00_data = df[df['Season Code'] == 'KI00'].copy()
            if ki00_data.empty:
                return [], False, "No KI00 items found"
            
            # Detect columns once
            item_column = self._detect_item_column(df.columns)
            stock_column = self._detect_stock_column(df.columns)
            
            if not item_column or not stock_column:
                return [], False, "Required columns not found"
            
            # Extract item names efficiently
            ki00_data['item_base'] = ki00_data[item_column].str.split(' - ').str[0].str.strip()
            
            # Convert stock to numeric once
            ki00_data[stock_column] = pd.to_numeric(ki00_data[stock_column], errors='coerce').fillna(0)
            
            # Get unique items
            unique_items = ki00_data['item_base'].unique()
            unique_items = [item for item in unique_items if item and str(item) != 'nan']
            
            # Process all items in one go
            all_alerts = []
            for item_name in unique_items:
                # Filter for this item
                item_data = ki00_data[ki00_data['item_base'] == item_name]
                
                # Compute total stock across all sizes and colors for this item
                try:
                    item_total_stock = int(item_data[stock_column].sum())
                except Exception:
                    # Fallback in case of unexpected non-numeric values
                    item_total_stock = int(pd.to_numeric(item_data[stock_column], errors='coerce').fillna(0).sum())
                
                # Aggregate totals by colour
                try:
                    colour_groups = item_data.groupby('Variant Color')[stock_column].sum().reset_index()
                    color_totals = [
                        {
                            "color": str(row['Variant Color']),
                            "total_stock": int(row[stock_column])
                        }
                        for _, row in colour_groups.iterrows()
                    ]
                except Exception:
                    color_totals = []
                
                # Format alerts
                alerts = []
                for _, row in item_data.iterrows():
                    color = str(row.get('Variant Color', ''))
                    variant_code = str(row.get('Variant Code', ''))
                    stock_level = int(row[stock_column])
                    
                    # Extract size from variant code (consistent with process_key_items_inventory)
                    size = self.extract_size_from_variant(variant_code)
                    
                    # Get custom threshold for this item, size, and color
                    threshold = self.get_custom_threshold(item_name, size, color)
                    
                    # Check if stock is below threshold
                    if stock_level < threshold:
                        alerts.append({
                            "item_name": item_name,
                            "color": color,
                            "size": size,
                            "stock_level": stock_level,
                            "required_threshold": threshold,
                            "shortage": threshold - stock_level,
                            "status": "LOW STOCK"
                        })
                
                all_alerts.append({
                    "name": item_name,
                    "total_stock": item_total_stock,
                    "color_totals": color_totals,
                    "alerts": alerts,
                    "alert_count": len(alerts)
                })
            
            # Return in the documented order: (List[Dict], bool, str)
            result = (all_alerts, True, "")
            self._set_cache(cache_key, result)
            
            print(f"⚡ Processed {len(unique_items)} items with {sum(len(item['alerts']) for item in all_alerts)} total alerts in batch mode")
            return result
            
        except Exception as e:
            print(f"❌ Error in batch alerts processing: {str(e)}")
            return [], False, str(e) 

    def clear_all_caches(self):
        """Clear all caches when new file is uploaded"""
        print("🧹 Clearing all KeyItemsService caches...")
        self.file_cache.clear()
        self.low_stock_cache.clear()
        self.cache.clear()
        self.cache_timestamps.clear()
        self.dynamic_key_items.clear()
        print(f"✅ Cleared all caches - ready for new file processing")
    
    def clear_file_specific_cache(self, file_path: str):
        """Clear cache for a specific file"""
        if file_path in self.file_cache:
            del self.file_cache[file_path]
        if file_path in self.low_stock_cache:
            del self.low_stock_cache[file_path]
        if file_path in self.dynamic_key_items:
            del self.dynamic_key_items[file_path]
        print(f"🧹 Cleared cache for file: {file_path}") 

    def force_fresh_processing(self, file_path: str):
        """
        Force fresh processing of a file, bypassing all caches.
        This ensures new files are always processed correctly.
        """
        print(f"🔄 FORCE FRESH PROCESSING: {file_path}")
        
        # Clear all caches first
        self.clear_all_caches()
        
        # Force reload the file data
        try:
            # Read the file fresh
            df = pd.read_excel(file_path)
            print(f"📊 Fresh file loaded: {len(df)} rows")
            
            # Detect KI00 items fresh using the correct method
            ki00_items = self.detect_key_items_from_file(file_path)
            print(f"🎯 Fresh KI00 detection: {len(ki00_items)} items")
            
            if not ki00_items:
                print("❌ No KI00 items found in fresh processing")
                return [], False, "No KI00 items found"
            
            # Filter for KI00 items only
            ki00_df = df[df['Season Code'] == 'KI00'].copy()
            print(f"🎯 Found {len(ki00_df)} key item entries")
            
            # Process each key item using the same logic as standard processing
            low_stock_items = []
            
            for item_name in ki00_items:
                # Filter for this specific item
                item_df = ki00_df[ki00_df['Item Description'].str.startswith(f"{item_name} -", na=False)]
                
                if len(item_df) == 0:
                    continue
                
                # Group by color and size
                for _, row in item_df.iterrows():
                    try:
                        item_description = row['Item Description']
                        color = row['Variant Color']
                        variant_code = row['Variant Code']
                        current_stock = row['Grand Total']
                        season_code = row['Season Code']
                        
                        # Extract size from variant code
                        size = self.extract_size_from_variant(variant_code)
                        
                        # Get custom threshold for this item, size, and color, or use default
                        threshold = self.get_custom_threshold(item_name, size, color)
                        
                        # Check if stock is below threshold
                        if pd.notna(current_stock) and current_stock < threshold:
                            shortage = threshold - current_stock
                            
                            low_stock_items.append({
                                'item_name': item_name,
                                'item_description': item_description,
                                'color': color,
                                'size': size,
                                'season_code': season_code,
                                'variant_code': variant_code,
                                'current_stock': int(current_stock),
                                'required_threshold': threshold,
                                'shortage': int(shortage)
                            })
                    
                    except Exception as e:
                        print(f"⚠️ Error processing item {item_name}: {e}")
                        continue
            
            print(f"📊 Found {len(low_stock_items)} low stock items across all key styles")
            
            # Validate the processing results
            if not self.validate_processing_results(file_path, low_stock_items):
                print("❌ Validation failed - retrying with standard processing...")
                # Fall back to standard processing
                return self.process_key_items_inventory(file_path)
            
            # Store fresh results in both caches
            result = (low_stock_items, True, "")
            self.low_stock_cache[file_path] = result
            self.file_cache[file_path] = {
                'low_stock_items': low_stock_items,
                'processed_at': datetime.now(),
                'fresh_processed': True
            }
            
            print(f"✅ Fresh processing complete: {len(low_stock_items)} low stock items found")
            return result
            
        except Exception as e:
            error_msg = f"Error in fresh processing: {str(e)}"
            print(f"❌ {error_msg}")
            return [], False, error_msg 

    def is_new_file(self, file_path: str) -> bool:
        """
        Check if a file is new (not in cache or recently uploaded)
        """
        if file_path not in self.file_cache:
            return True
        
        cache_entry = self.file_cache[file_path]
        if 'processed_at' not in cache_entry:
            return True
        
        # Consider file new if processed more than 5 minutes ago
        time_diff = datetime.now() - cache_entry['processed_at']
        return time_diff.total_seconds() > 300  # 5 minutes
    
    def validate_processing_results(self, file_path: str, low_stock_items: list) -> bool:
        """
        Validate that processing results are reasonable
        """
        try:
            df = pd.read_excel(file_path)
            total_rows = len(df)
            
            # Basic validation checks
            if total_rows == 0:
                print("❌ Validation failed: File has no data")
                return False
            
            # Check if we found any KI00 items
            ki00_items = self.detect_key_items_from_file(file_path)
            if len(ki00_items) == 0:
                print("❌ Validation failed: No KI00 items detected")
                return False
            
            # Check if low stock items make sense
            if len(low_stock_items) == 0:
                # This might be valid if all items have sufficient stock
                print("✅ Validation passed: No low stock items found (all items well stocked)")
                return True
            
            # Check if low stock items have reasonable quantities
            for item in low_stock_items:
                if item['current_stock'] < 0 or item['current_stock'] > 1000:
                    print(f"❌ Validation failed: Unreasonable quantity {item['current_stock']} for {item['item_name']}")
                    return False
            
            print(f"✅ Validation passed: {len(low_stock_items)} low stock items found")
            return True
            
        except Exception as e:
            print(f"❌ Validation error: {str(e)}")
            return False 

    def set_custom_threshold(self, item_name: str, size: str, color: str, threshold: int):
        """
        Set custom threshold for a specific key item, size, and color. Persist to DB and record history.
        """
        key = f"{item_name}|{size}|{color}"
        print(f"🔧 Setting custom threshold for {item_name} ({size}, {color}): {threshold}")
        old_value = self.custom_thresholds.get(key)
        self.custom_thresholds[key] = threshold
        # Persist
        try:
            from database import get_db
            from models import ThresholdOverride, ThresholdHistory
            db = next(get_db())
            try:
                row = db.query(ThresholdOverride).filter_by(item_name=item_name, size=size, color=color).first()
                if row:
                    row.threshold = int(threshold)
                else:
                    row = ThresholdOverride(item_name=item_name, size=size, color=color, threshold=int(threshold))
                    db.add(row)
                # History
                hist = ThresholdHistory(
                    item_name=item_name,
                    size=size,
                    color=color,
                    old_threshold=int(old_value) if old_value is not None else None,
                    new_threshold=int(threshold),
                    note="manual set"
                )
                db.add(hist)
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"⚠️ Failed to persist threshold override: {e}")
            finally:
                db.close()
        except Exception as e:
            print(f"⚠️ Persistence unavailable: {e}")
        # Targeted cache invalidation for faster UX
        keys_to_delete = []
        for k in list(self.cache.keys()):
            if item_name.upper() in k.upper() or "all_key_items_with_alerts" in k:
                keys_to_delete.append(k)
        for k in keys_to_delete:
            try:
                del self.cache[k]
                if k in self.cache_timestamps:
                    del self.cache_timestamps[k]
            except Exception:
                pass
        print(f"🧹 Cleared {len(keys_to_delete)} cache entries related to {item_name}")
        return True
    
    def get_custom_threshold(self, item_name: str, size: str = None, color: str = None) -> int:
        """
        Get custom threshold for a specific key item, size, and color, or default if not set
        """
        if size and color:
            # Try exact match first
            key = f"{item_name}|{size}|{color}"
            if key in self.custom_thresholds:
                return self.custom_thresholds[key]
            
            # Try case-insensitive match
            for stored_key, value in self.custom_thresholds.items():
                stored_parts = stored_key.split('|')
                if (len(stored_parts) == 3 and 
                    stored_parts[0].upper() == item_name.upper() and 
                    stored_parts[1].upper() == size.upper() and 
                    stored_parts[2].upper() == color.upper()):
                    return value
            
            return self.default_size_threshold
        elif size:
            # Try to find any color for this item+size combination
            for key, value in self.custom_thresholds.items():
                if key.startswith(f"{item_name}|{size}|"):
                    return value
            return self.default_size_threshold
        else:
            # Backward compatibility - return default if no size/color specified
            return self.default_size_threshold
    
    def search_article_alerts(self, search_term: str, file_path: str = None) -> list:
        """
        Search for specific article alerts by name or partial match
        """
        print(f"🔍 Searching for article: {search_term}")
        
        if not file_path:
            # Use latest file
            from main import file_storage_service
            from database import get_db
            db = next(get_db())
            file_path = file_storage_service.get_latest_file_path(db)
        
        if not file_path:
            return []
        
        # Get all low stock items
        low_stock_items, success, _ = self.process_key_items_inventory(file_path)
        
        if not success:
            return []
        
        # Filter by search term (case insensitive)
        search_term_lower = search_term.lower()
        filtered_items = []
        
        for item in low_stock_items:
            item_name_lower = item.get('item_name', '').lower()
            variant_code_lower = item.get('variant_code', '').lower()
            color_lower = item.get('color', '').lower()
            item_description_lower = item.get('item_description', '').lower()
            
            if (search_term_lower in item_name_lower or 
                search_term_lower in variant_code_lower or 
                search_term_lower in color_lower or
                search_term_lower in item_description_lower):
                filtered_items.append(item)
        
        print(f"🔍 Found {len(filtered_items)} items matching '{search_term}'")
        return filtered_items
    
    def get_all_custom_thresholds(self) -> dict:
        """
        Get all custom thresholds
        """
        return self.custom_thresholds.copy()
    
    def reset_custom_threshold(self, item_name: str, size: str, color: str):
        """
        Reset custom threshold for a specific item, size, and color to default and persist removal with history.
        """
        key = f"{item_name}|{size}|{color}"
        old_value = self.custom_thresholds.get(key)
        if key in self.custom_thresholds:
            del self.custom_thresholds[key]
        # Persist delete and add history
        try:
            from database import get_db
            from models import ThresholdOverride, ThresholdHistory
            db = next(get_db())
            try:
                row = db.query(ThresholdOverride).filter_by(item_name=item_name, size=size, color=color).first()
                if row:
                    db.delete(row)
                hist = ThresholdHistory(
                    item_name=item_name,
                    size=size,
                    color=color,
                    old_threshold=int(old_value) if old_value is not None else None,
                    new_threshold=int(self.default_size_threshold),
                    note="reset to default"
                )
                db.add(hist)
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"⚠️ Failed to persist threshold reset: {e}")
            finally:
                db.close()
        except Exception as e:
            print(f"⚠️ Persistence unavailable: {e}")
        self.clear_all_caches()
        print(f"🔄 Reset threshold for {item_name} ({size}, {color}) to default")
        return True 