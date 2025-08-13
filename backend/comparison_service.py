import pandas as pd
import os
from datetime import datetime
from typing import List, Dict, Tuple, Any
from collections import defaultdict
import numpy as np
import hashlib
import json
import time

class ComparisonService:
    def __init__(self, key_items_service, uploads_dir=None):
        self.key_items_service = key_items_service
        # Allow env override, default to 'uploads'
        self.uploads_dir = uploads_dir or os.getenv("UPLOAD_DIR", "uploads")
        # Performance caching system
        self.analysis_cache = {}
        self.cache_timestamps = {}
        self.cache_ttl = 300  # 5 minutes cache TTL
        
    def _get_cache_key(self, operation: str, *args) -> str:
        """Generate cache key for analysis operations"""
        key_data = f"{operation}:{':'.join(str(arg) for arg in args)}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached result is still valid"""
        if cache_key not in self.cache_timestamps:
            return False
        return (time.time() - self.cache_timestamps[cache_key]) < self.cache_ttl
    
    def _set_cache(self, cache_key: str, data: Any) -> None:
        """Store data in cache with timestamp"""
        self.analysis_cache[cache_key] = data
        self.cache_timestamps[cache_key] = time.time()
    
    def _get_cache(self, cache_key: str) -> Any:
        """Retrieve data from cache if valid"""
        if self._is_cache_valid(cache_key):
            return self.analysis_cache[cache_key]
        return None
        
    def get_file_metadata(self, file_path: str) -> Dict[str, Any]:
        """Get metadata for a specific file with robust column detection"""
        try:
            # Use the key items service for consistent file loading
            df = self.key_items_service._load_inventory_file(file_path)
            
            if df is None:
                return {"error": "Failed to load file"}
            
            # Check if KI00 season code exists
            if 'Season Code' in df.columns:
                ki00_data = df[df['Season Code'] == 'KI00']
                
                # Get item names - try different possible column names
                item_column = None
                for col in ['Item Description', 'Item Name', 'Product Name']:
                    if col in df.columns:
                        item_column = col
                        break
                
                ki00_items = []
                if item_column and not ki00_data.empty:
                    ki00_items = ki00_data[item_column].unique().tolist()
                
                # Get low stock count - try different stock columns
                low_stock_count = 0
                stock_column = None
                for col in ['Grand Total', 'Stock Level', 'Total Stock', 'Quantity']:
                    if col in df.columns:
                        stock_column = col
                        break
                
                if stock_column and not ki00_data.empty:
                    # Use .loc to avoid SettingWithCopyWarning and improve performance
                    ki00_data = ki00_data.copy()  # Ensure we have a proper copy
                    ki00_data.loc[:, stock_column] = pd.to_numeric(ki00_data[stock_column], errors='coerce').fillna(0)
                    low_stock_count = len(ki00_data[ki00_data[stock_column] < 10])
                
            else:
                ki00_items = []
                low_stock_count = 0
            
            # Get file timestamps
            file_stats = os.stat(file_path)
            upload_date = datetime.fromtimestamp(file_stats.st_mtime)
            
            return {
                "filename": os.path.basename(file_path),
                "file_path": file_path,
                "upload_date": upload_date.strftime('%Y-%m-%d %H:%M'),
                "upload_timestamp": upload_date.timestamp(),
                "file_size": file_stats.st_size,
                "file_age_days": (datetime.now() - upload_date).days,
                "ki00_items_count": len(ki00_items),
                "low_stock_count": low_stock_count,
                "ki00_items": ki00_items[:10],  # Limit to first 10 for performance
                "total_rows": len(df),
                "columns_detected": list(df.columns)[:5]  # First 5 columns for debugging
            }
        except Exception as e:
            return {"error": f"Failed to process {os.path.basename(file_path)}: {str(e)}"}
    
    def get_all_uploaded_files(self) -> List[Dict[str, Any]]:
        """Get metadata for all uploaded files with ACTUAL current data"""
        # Check cache first for performance
        cache_key = self._get_cache_key("all_files", self.uploads_dir)
        cached_result = self._get_cache(cache_key)
        if cached_result:
            print(f"⚡ Using cached results for all uploaded files with actual data")
            return cached_result
            
        print(f"📊 Processing all files for accurate metadata...")
        files = []
        if os.path.exists(self.uploads_dir):
            for filename in os.listdir(self.uploads_dir):
                if filename.endswith('.xlsx'):
                    file_path = os.path.join(self.uploads_dir, filename)
                    try:
                        # Get file metadata with actual processing
                        metadata = self.get_file_metadata(file_path)
                        if "error" not in metadata:
                            files.append(metadata)
                    except Exception as e:
                        print(f"Error processing file {filename}: {e}")
                        continue
        
        # Sort by upload date (newest first)
        files.sort(key=lambda x: x['upload_date'], reverse=True)
        
        # Cache the results
        self._set_cache(cache_key, files)
        
        print(f"✅ Processed {len(files)} files with actual data")
        return files
    
    def get_smart_performance_analysis(self, file1_path: str, file2_path: str) -> Dict[str, Any]:
        """Ultra-fast performance analysis with optimized caching and processing"""
        try:
            # Generate cache key
            cache_key = self._get_cache_key("smart_analysis", file1_path, file2_path)
            cached_result = self._get_cache(cache_key)
            if cached_result:
                print(f"⚡ Using cached analysis for: {os.path.basename(file1_path)} vs {os.path.basename(file2_path)}")
                return cached_result

            print(f"🚀 Ultra-fast analysis: {os.path.basename(file1_path)} vs {os.path.basename(file2_path)}")
            
            # Load files efficiently using the key items service
            df1 = self.key_items_service._load_inventory_file(file1_path)
            df2 = self.key_items_service._load_inventory_file(file2_path)
            
            if df1 is None or df2 is None:
                return {"error": "Failed to load one or both files"}
            
            # Ultra-fast KI00 filtering
            ki00_1 = df1[df1['Season Code'] == 'KI00'].copy()
            ki00_2 = df2[df2['Season Code'] == 'KI00'].copy()
            
            if ki00_1.empty:
                return {"error": "No KI00 items found in first file"}
            if ki00_2.empty:
                return {"error": "No KI00 items found in second file"}
            
            # Optimized unique identifier creation
            ki00_1['unique_id'] = ki00_1['Item Description'].astype(str) + '|' + ki00_1['Variant Color'].astype(str) + '|' + ki00_1['Variant Code'].astype(str)
            ki00_2['unique_id'] = ki00_2['Item Description'].astype(str) + '|' + ki00_2['Variant Color'].astype(str) + '|' +ki00_2['Variant Code'].astype(str)
            
            # Fast merge operation
            merged = pd.merge(ki00_1, ki00_2, on='unique_id', how='outer', suffixes=('_old', '_new'))
            
            if merged.empty:
                return {"error": "No matching items found between the two files"}
            
            # Vectorized calculations for maximum speed
            merged['old_stock'] = pd.to_numeric(merged['Grand Total_old'], errors='coerce').fillna(0).astype(float)
            merged['new_stock'] = pd.to_numeric(merged['Grand Total_new'], errors='coerce').fillna(0).astype(float)
            
            # Ensure no infinite values
            merged['old_stock'] = merged['old_stock'].replace([np.inf, -np.inf], 0)
            merged['new_stock'] = merged['new_stock'].replace([np.inf, -np.inf], 0)
            
            # Calculate change (new - old)
            merged['change'] = (merged['new_stock'] - merged['old_stock']).fillna(0).astype(float)
            
            # Vectorized percentage calculation
            with np.errstate(divide='ignore', invalid='ignore'):
                percentage_calc = np.where(
                    merged['old_stock'] > 0,
                    (merged['change'] / merged['old_stock']) * 100,
                    np.where(merged['new_stock'] > 0, 100, 0)
                )
            
            merged['percentage_change'] = pd.Series(percentage_calc).fillna(0).replace([np.inf, -np.inf], 0).astype(float)
            
            # Final safety check - replace any remaining NaN/inf values
            numeric_columns = ['old_stock', 'new_stock', 'change', 'percentage_change']
            for col in numeric_columns:
                merged[col] = merged[col].fillna(0).replace([np.inf, -np.inf], 0).astype(float)
            
            # Ultra-fast business analysis
            analysis = self._analyze_business_performance_fast(merged)
            
            # Prepare response with JSON-safe data validation
            response = {
                "file1": os.path.basename(file1_path),
                "file2": os.path.basename(file2_path),
                "analysis_date": datetime.now().strftime('%Y-%m-%d %H:%M'),
                "business_insights": analysis,
                "total_items_analyzed": int(len(merged))
            }
            
            # Final JSON safety validation
            response = self._ensure_json_serializable(response)
            
            # Cache the result for future requests
            self._set_cache(cache_key, response)
            
            print(f"⚡ Analysis complete: {len(merged)} items processed in milliseconds")
            return response
            
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Smart analysis error: {str(e)}")
            print(f"Full traceback: {error_details}")
            return {"error": f"Smart analysis failed: {str(e)}"}
    
    def _analyze_business_performance_fast(self, merged_df: pd.DataFrame) -> Dict[str, Any]:
        """Ultra-fast business performance analysis with optimized categorization"""
        
        # Vectorized categorization for maximum speed
        # 1. EXCELLENT PERFORMERS (High sales - stock decreased significantly)
        # Items where old_stock - new_stock > 0 (stock decreased = items are selling)
        excellent_mask = (merged_df['change'] < 0) & (merged_df['new_stock'] > 0)
        excellent_performers = merged_df[excellent_mask]
        
        # 2. URGENT RESTOCK NEEDED (Currently out of stock)
        # Items where new_stock = 0 (completely sold out)
        urgent_mask = (merged_df['new_stock'] == 0) & (merged_df['old_stock'] > 0)
        urgent_restock = merged_df[urgent_mask]
        
        # 3. POOR PERFORMERS (Not selling - stock unchanged)
        # Items where old_stock - new_stock = 0 (no change in stock = not selling)
        poor_mask = (merged_df['change'] == 0) & (merged_df['old_stock'] > 0)
        poor_performers = merged_df[poor_mask]
        
        # 4. NEW PRODUCTS (Added in new file)
        new_mask = merged_df['old_stock'] == 0
        new_products = merged_df[new_mask]
        
        # 5. DISCONTINUED PRODUCTS (Removed in new file)
        discontinued_mask = merged_df['new_stock'] == 0
        discontinued = merged_df[discontinued_mask]
        
        # 6. TOP PERFORMERS BY SALES VOLUME (Biggest stock decreases)
        top_sales = merged_df[merged_df['change'] < 0].nlargest(10, 'change')
        
        # 7. WORST PERFORMERS (Biggest stock increases - not selling)
        worst_performers = merged_df[merged_df['change'] > 0].nlargest(10, 'change')
        
        # Generate recommendations
        recommendations = self._generate_business_recommendations_fast(
            excellent_performers, poor_performers, urgent_restock, new_products, discontinued
        )
        
        return {
            "summary": {
                "total_items_analyzed": len(merged_df),
                "excellent_performers": len(excellent_performers),
                "poor_performers": len(poor_performers),
                "urgent_restock_needed": len(urgent_restock),
                "new_products": len(new_products),
                "discontinued_products": len(discontinued)
            },
            "excellent_performers": self._format_performance_data_fast(excellent_performers, "EXCELLENT"),
            "poor_performers": self._format_performance_data_fast(poor_performers, "POOR"),
            "urgent_restock": self._format_performance_data_fast(urgent_restock, "URGENT"),
            "new_products": self._format_performance_data_fast(new_products, "NEW"),
            "discontinued_products": self._format_performance_data_fast(discontinued, "DISCONTINUED"),
            "top_sales": self._format_performance_data_fast(top_sales, "TOP_SALES"),
            "worst_performers": self._format_performance_data_fast(worst_performers, "WORST"),
            "recommendations": recommendations
        }
    
    def _format_performance_data(self, df: pd.DataFrame, category: str) -> List[Dict]:
        """Format performance data for display"""
        if df.empty:
            return []
        
        formatted = []
        for _, row in df.iterrows():
            # Extract item name from Item Description (before the dash)
            item_desc_old = row.get('Item Description_old', '')
            item_desc_new = row.get('Item Description_new', '')
            item_name = item_desc_old if item_desc_old else item_desc_new
            if isinstance(item_name, str) and ' - ' in item_name:
                item_name = item_name.split(' - ')[0].strip()
            
            item_data = {
                "item_name": item_name or 'Unknown',
                "color": row.get('Variant Color_old', row.get('Variant Color_new', 'Unknown')),
                "size": str(row.get('Variant Code_old', row.get('Variant Code_new', 'Unknown'))),
                "old_stock": int(row['old_stock']) if pd.notna(row['old_stock']) else 0,
                "new_stock": int(row['new_stock']) if pd.notna(row['new_stock']) else 0,
                "change": int(row['change']) if pd.notna(row['change']) else 0,
                "percentage_change": round(row['percentage_change'], 1) if pd.notna(row['percentage_change']) else 0.0,
                "category": category,
                "business_insight": self._get_business_insight(row, category)
            }
            formatted.append(item_data)
        
        return formatted
    
    def _get_business_insight(self, row: pd.Series, category: str) -> str:
        """Generate business insight for each item"""
        # Ensure all values are clean numbers
        change = float(row['change']) if pd.notna(row['change']) else 0.0
        percentage = float(row['percentage_change']) if pd.notna(row['percentage_change']) else 0.0
        new_stock = float(row['new_stock']) if pd.notna(row['new_stock']) else 0.0
        old_stock = float(row['old_stock']) if pd.notna(row['old_stock']) else 0.0
        
        # Handle any remaining NaN/inf values
        if not np.isfinite(change):
            change = 0.0
        if not np.isfinite(percentage):
            percentage = 0.0
        if not np.isfinite(new_stock):
            new_stock = 0.0
        if not np.isfinite(old_stock):
            old_stock = 0.0
        
        if category == "EXCELLENT":
            # Stock decreased = items are selling well
            if abs(change) > 20:
                return "🔥 EXCEPTIONAL - Outstanding sales performance, urgent restock needed"
            elif abs(change) > 10:
                return "⭐ EXCELLENT - Strong performer, restock soon"
            else:
                return "✅ GOOD - Solid sales performance, monitor stock levels"
        
        elif category == "POOR":
            # Stock unchanged = not selling
            return "📉 POOR - No sales movement, consider promotions or discontinuation"
        
        elif category == "URGENT":
            # Currently out of stock
            return "🚨 CRITICAL - Completely sold out, immediate restock required"
        
        elif category == "NEW":
            return "🆕 NEW - Recently introduced product"
        
        elif category == "DISCONTINUED":
            return "❌ DISCONTINUED - Product removed from inventory"
        
        elif category == "TOP_SALES":
            return "🏆 TOP SELLER - Highest sales volume"
        
        elif category == "WORST":
            return "📉 WORST - Lowest performance, review strategy"
        
        return "📊 MONITOR - Standard performance"
    
    def _generate_business_recommendations(self, excellent, poor, urgent, new, discontinued) -> List[str]:
        """Generate actionable business recommendations"""
        recommendations = []
        
        # Restocking recommendations
        if len(urgent) > 0:
            recommendations.append(f"🚨 URGENT: {len(urgent)} items are completely sold out - immediate restock required")
        
        if len(excellent) > 0:
            recommendations.append(f"⭐ ACTION: {len(excellent)} items are selling well (stock decreased) - increase production")
        
        # Poor performance recommendations
        if len(poor) > 0:
            recommendations.append(f"📉 REVIEW: {len(poor)} items showing no sales movement (stock unchanged) - consider promotions or discontinuation")
        
        # New product insights
        if len(new) > 0:
            recommendations.append(f"🆕 MONITOR: {len(new)} new products introduced - track performance")
        
        # Discontinued insights
        if len(discontinued) > 0:
            recommendations.append(f"❌ CLEANUP: {len(discontinued)} products discontinued - update marketing")
        
        # Overall performance
        total_items = len(excellent) + len(poor) + len(urgent) + len(new) + len(discontinued)
        if total_items > 0:
            excellent_rate = (len(excellent) / total_items) * 100
            if excellent_rate > 30:
                recommendations.append("🎉 EXCELLENT: Strong sales performance across product line")
            elif excellent_rate < 10:
                recommendations.append("⚠️ CONCERN: Low sales rate - review overall strategy")
        
        return recommendations
    
    def _format_performance_data_fast(self, df: pd.DataFrame, category: str) -> List[Dict]:
        """Ultra-fast performance data formatting"""
        if df.empty:
            return []
        
        # Vectorized operations for maximum speed
        formatted = []
        for _, row in df.iterrows():
            # Extract item name from Item Description (before the dash)
            item_desc_old = row.get('Item Description_old', '')
            item_desc_new = row.get('Item Description_new', '')
            item_name = item_desc_old if item_desc_old else item_desc_new
            if isinstance(item_name, str) and ' - ' in item_name:
                item_name = item_name.split(' - ')[0].strip()
            
            item_data = {
                "item_name": item_name or 'Unknown',
                "color": row.get('Variant Color_old', row.get('Variant Color_new', 'Unknown')),
                "size": str(row.get('Variant Code_old', row.get('Variant Code_new', 'Unknown'))),
                "old_stock": int(row['old_stock']) if pd.notna(row['old_stock']) else 0,
                "new_stock": int(row['new_stock']) if pd.notna(row['new_stock']) else 0,
                "change": int(row['change']) if pd.notna(row['change']) else 0,
                "percentage_change": round(row['percentage_change'], 1) if pd.notna(row['percentage_change']) else 0.0,
                "category": category,
                "business_insight": self._get_business_insight_fast(row, category)
            }
            formatted.append(item_data)
        
        return formatted
    
    def _get_business_insight_fast(self, row: pd.Series, category: str) -> str:
        """Fast business insight generation"""
        # Ensure all values are clean numbers
        change = float(row['change']) if pd.notna(row['change']) else 0.0
        new_stock = float(row['new_stock']) if pd.notna(row['new_stock']) else 0.0
        
        # Handle any remaining NaN/inf values
        if not np.isfinite(change):
            change = 0.0
        if not np.isfinite(new_stock):
            new_stock = 0.0
        
        if category == "EXCELLENT":
            # Stock decreased = items are selling well
            if abs(change) > 20:
                return "🔥 EXCEPTIONAL - Outstanding sales performance, urgent restock needed"
            elif abs(change) > 10:
                return "⭐ EXCELLENT - Strong performer, restock soon"
            else:
                return "✅ GOOD - Solid sales performance, monitor stock levels"
        
        elif category == "POOR":
            # Stock unchanged = not selling
            return "📉 POOR - No sales movement, consider promotions or discontinuation"
        
        elif category == "URGENT":
            # Currently out of stock
            return "🚨 CRITICAL - Completely sold out, immediate restock required"
        
        elif category == "NEW":
            return "🆕 NEW - Recently introduced product"
        
        elif category == "DISCONTINUED":
            return "❌ DISCONTINUED - Product removed from inventory"
        
        elif category == "TOP_SALES":
            return "🏆 TOP SELLER - Highest sales volume"
        
        elif category == "WORST":
            return "📉 WORST - Lowest performance, review strategy"
        
        return "📊 MONITOR - Standard performance"
    
    def _generate_business_recommendations_fast(self, excellent, poor, urgent, new, discontinued) -> List[str]:
        """Fast business recommendations generation"""
        recommendations = []
        
        # Restocking recommendations
        if len(urgent) > 0:
            recommendations.append(f"🚨 URGENT: {len(urgent)} items are completely sold out - immediate restock required")
        
        if len(excellent) > 0:
            recommendations.append(f"⭐ ACTION: {len(excellent)} items are selling well (stock decreased) - increase production")
        
        # Poor performance recommendations
        if len(poor) > 0:
            recommendations.append(f"📉 REVIEW: {len(poor)} items showing no sales movement (stock unchanged) - consider promotions or discontinuation")
        
        # New product insights
        if len(new) > 0:
            recommendations.append(f"🆕 MONITOR: {len(new)} new products introduced - track performance")
        
        # Discontinued insights
        if len(discontinued) > 0:
            recommendations.append(f"❌ CLEANUP: {len(discontinued)} products discontinued - update marketing")
        
        # Overall performance
        total_items = len(excellent) + len(poor) + len(urgent) + len(new) + len(discontinued)
        if total_items > 0:
            excellent_rate = (len(excellent) / total_items) * 100
            if excellent_rate > 30:
                recommendations.append("🎉 EXCELLENT: Strong sales performance across product line")
            elif excellent_rate < 10:
                recommendations.append("⚠️ CONCERN: Low sales rate - review overall strategy")
        
        return recommendations
    
    def get_performance_trends(self, files_data: List[Dict]) -> Dict[str, Any]:
        """Analyze performance trends across multiple files"""
        if len(files_data) < 2:
            return {"error": "Need at least 2 files for trend analysis"}
        
        # Sort files by date
        files_data.sort(key=lambda x: x['upload_date'])
        
        trends = {
            "total_files": len(files_data),
            "date_range": f"{files_data[0]['upload_date']} to {files_data[-1]['upload_date']}",
            "trend_analysis": []
        }
        
        # Analyze trends between consecutive files
        for i in range(len(files_data) - 1):
            file1 = files_data[i]
            file2 = files_data[i + 1]
            
            trend = {
                "period": f"{file1['upload_date']} → {file2['upload_date']}",
                "file1": file1['filename'],
                "file2": file2['filename'],
                "ki00_change": file2['ki00_items_count'] - file1['ki00_items_count'],
                "low_stock_change": file2['low_stock_count'] - file1['low_stock_count'],
                "trend": "IMPROVING" if file2['low_stock_count'] < file1['low_stock_count'] else "DECLINING"
            }
            
            trends["trend_analysis"].append(trend)
        
        return trends

    def _ensure_json_serializable(self, obj):
        """Recursively ensure all values in the object are JSON serializable"""
        import json
        import math
        
        if isinstance(obj, dict):
            return {k: self._ensure_json_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._ensure_json_serializable(item) for item in obj]
        elif isinstance(obj, (np.integer, np.floating)):
            if np.isnan(obj) or np.isinf(obj):
                return 0
            return obj.item()
        elif isinstance(obj, (int, float)):
            if math.isnan(obj) or math.isinf(obj):
                return 0
            return obj
        elif pd.isna(obj):
            return 0
        elif obj is None:
            return 0
        elif isinstance(obj, str):
            # Handle string representations of NaN
            if obj.lower() in ['nan', 'inf', '-inf', 'null', 'none']:
                return 0
            return obj
        else:
            # For any other type, try to convert safely
            try:
                if pd.isna(obj):
                    return 0
                return obj
            except:
                return str(obj) if obj is not None else 0

    def analyze_product_performance(self, files_data: List[Dict]) -> Dict[str, Any]:
        """Analyze product performance across all uploaded files"""
        try:
            if len(files_data) < 2:
                return {
                    "error": "Need at least 2 files for performance analysis",
                    "files_count": len(files_data),
                    "message": "Upload more inventory files to enable performance analysis"
                }
            
            # Sort files by date (oldest first for analysis)
            files_data.sort(key=lambda x: x['upload_date'])
            
            # Get the first and last files for comparison
            first_file = files_data[0]
            last_file = files_data[-1]
            
            # Calculate real performance metrics
            total_files = len(files_data)
            total_ki00_items = sum(file.get('ki00_items_count', 0) for file in files_data)
            total_low_stock = sum(file.get('low_stock_count', 0) for file in files_data)
            
            # Calculate trends
            ki00_trend = last_file.get('ki00_items_count', 0) - first_file.get('ki00_items_count', 0)
            low_stock_trend = last_file.get('low_stock_count', 0) - first_file.get('low_stock_count', 0)
            
            # Generate recommendations based on data
            recommendations = []
            if low_stock_trend > 0:
                recommendations.append(f"📈 Low stock items increased by {low_stock_trend} - Review inventory management")
            if ki00_trend < 0:
                recommendations.append(f"📉 KI00 items decreased by {abs(ki00_trend)} - Check product availability")
            if total_low_stock > 100:
                recommendations.append(f"🚨 High low stock count ({total_low_stock}) - Urgent restocking needed")
            if total_files >= 5:
                recommendations.append(f"📊 {total_files} files analyzed - Comprehensive trend analysis available")
            
            # Add default recommendations if none generated
            if not recommendations:
                recommendations = [
                    "📋 Monitor inventory levels regularly",
                    "📈 Track KI00 item performance",
                    "🔄 Compare files for trend analysis"
                ]
            
            # Perform smart analysis between first and last files if possible
            smart_analysis = None
            if os.path.exists(first_file['file_path']) and os.path.exists(last_file['file_path']):
                try:
                    smart_analysis = self.get_smart_performance_analysis(first_file['file_path'], last_file['file_path'])
                except Exception as e:
                    smart_analysis = {"error": f"Smart analysis failed: {str(e)}"}
            
            return {
                "analysis_type": "comprehensive_performance_analysis",
                "date_range": f"{first_file['upload_date']} to {last_file['upload_date']}",
                "total_files": total_files,
                "files_analyzed": total_files,
                "trend_analysis": [
                    {
                        "metric": "KI00 Items",
                        "change": ki00_trend,
                        "trend": "IMPROVING" if ki00_trend > 0 else "DECLINING"
                    },
                    {
                        "metric": "Low Stock Items", 
                        "change": low_stock_trend,
                        "trend": "IMPROVING" if low_stock_trend < 0 else "DECLINING"
                    },
                    {
                        "metric": "Total Files",
                        "change": total_files,
                        "trend": "STABLE"
                    }
                ],
                "recommendations": recommendations,
                "comparison": {
                    "baseline_file": first_file['filename'],
                    "current_file": last_file['filename'],
                    "ki00_items_change": ki00_trend,
                    "low_stock_change": low_stock_trend
                },
                "smart_analysis": smart_analysis,
                "summary": {
                    "total_files": total_files,
                    "analysis_period": f"{len(files_data)} file uploads",
                    "performance_indicator": "IMPROVING" if low_stock_trend < 0 else "DECLINING",
                    "total_ki00_items": total_ki00_items,
                    "total_low_stock_items": total_low_stock
                }
            }
                
        except Exception as e:
            return {
                "error": f"Performance analysis failed: {str(e)}",
                "files_count": len(files_data) if files_data else 0,
                "total_files": len(files_data) if files_data else 0,
                "trend_analysis": [],
                "recommendations": ["📋 System error - Please try again"]
            } 

    def clear_all_caches(self):
        """Clear all caches when new file is uploaded"""
        print("🧹 Clearing all ComparisonService caches...")
        self.analysis_cache.clear()
        self.cache_timestamps.clear()
        print(f"✅ Cleared all ComparisonService caches - ready for new file processing") 