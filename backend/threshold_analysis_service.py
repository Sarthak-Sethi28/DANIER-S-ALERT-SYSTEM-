#!/usr/bin/env python3
"""
Threshold Analysis Service
Tracks which products went below threshold between file uploads
"""

import os
import json
import pandas as pd
from typing import Dict, List, Tuple, Any
from datetime import datetime
import numpy as np

class ThresholdAnalysisService:
    def __init__(self, uploads_dir="uploads", threshold=10):
        self.uploads_dir = uploads_dir
        self.threshold = threshold
        self.analysis_cache = {}
        
    def analyze_threshold_changes(self, current_file_path: str, previous_file_path: str = None) -> Dict[str, Any]:
        """
        Analyze which products went below threshold between two file uploads
        """
        try:
            # Load current file
            current_df = self._load_inventory_file(current_file_path)
            if current_df is None:
                return {"error": "Failed to load current file"}
            
            # Get current low stock items
            current_low_stock = self._get_low_stock_items(current_df)
            
            if previous_file_path and os.path.exists(previous_file_path):
                # Compare with previous file
                previous_df = self._load_inventory_file(previous_file_path)
                if previous_df is None:
                    return {"error": "Failed to load previous file"}
                
                previous_low_stock = self._get_low_stock_items(previous_df)
                
                # Find new items that went below threshold
                new_below_threshold = self._find_new_below_threshold(current_low_stock, previous_low_stock)
                
                # Find items that improved (went above threshold)
                improved_items = self._find_improved_items(current_low_stock, previous_low_stock)
                
                # Find items that got worse (stock decreased but still below threshold)
                worsened_items = self._find_worsened_items(current_low_stock, previous_low_stock)
                
                return {
                    "analysis_type": "threshold_change_analysis",
                    "current_file": os.path.basename(current_file_path),
                    "previous_file": os.path.basename(previous_file_path),
                    "threshold": self.threshold,
                    "summary": {
                        "total_current_low_stock": len(current_low_stock),
                        "total_previous_low_stock": len(previous_low_stock),
                        "new_below_threshold": len(new_below_threshold),
                        "improved_items": len(improved_items),
                        "worsened_items": len(worsened_items),
                        "net_change": len(current_low_stock) - len(previous_low_stock)
                    },
                    "new_below_threshold_items": new_below_threshold,
                    "improved_items": improved_items,
                    "worsened_items": worsened_items,
                    "current_low_stock": current_low_stock,
                    "analysis_timestamp": datetime.now().isoformat()
                }
            else:
                # First file upload - just show current low stock
                return {
                    "analysis_type": "initial_threshold_analysis",
                    "current_file": os.path.basename(current_file_path),
                    "threshold": self.threshold,
                    "summary": {
                        "total_low_stock": len(current_low_stock),
                        "message": "First file upload - baseline established"
                    },
                    "current_low_stock": current_low_stock,
                    "analysis_timestamp": datetime.now().isoformat()
                }
                
        except Exception as e:
            return {"error": f"Threshold analysis failed: {str(e)}"}
    
    def _load_inventory_file(self, file_path: str) -> pd.DataFrame:
        """Load inventory file with error handling"""
        try:
            df = pd.read_excel(file_path)
            return df
        except Exception as e:
            print(f"Error loading file {file_path}: {e}")
            return None
    
    def _get_low_stock_items(self, df: pd.DataFrame) -> List[Dict]:
        """Get all items below threshold from dataframe"""
        try:
            # Filter for KI00 items
            if 'Season Code' not in df.columns:
                return []
            
            ki00_data = df[df['Season Code'] == 'KI00'].copy()
            if ki00_data.empty:
                return []
            
            # Detect columns
            item_column = self._detect_item_column(df.columns)
            color_column = self._detect_color_column(df.columns)
            size_column = self._detect_size_column(df.columns)
            stock_column = self._detect_stock_column(df.columns)
            
            if not all([item_column, stock_column]):
                return []
            
            # Convert stock to numeric
            ki00_data[stock_column] = pd.to_numeric(ki00_data[stock_column], errors='coerce').fillna(0)
            
            # Filter items below threshold
            low_stock = ki00_data[ki00_data[stock_column] < self.threshold].copy()
            
            # Create unique identifiers
            low_stock['unique_id'] = (
                low_stock[item_column].astype(str) + '|' + 
                low_stock[color_column].astype(str) + '|' + 
                low_stock[size_column].astype(str)
            )
            
            # Convert to list of dictionaries
            items = []
            for _, row in low_stock.iterrows():
                items.append({
                    "unique_id": row['unique_id'],
                    "item_name": str(row[item_column]).split(' - ')[0].strip(),
                    "color": str(row[color_column]),
                    "size": str(row[size_column]),
                    "current_stock": int(row[stock_column]),
                    "threshold": self.threshold,
                    "shortage": self.threshold - int(row[stock_column])
                })
            
            return items
            
        except Exception as e:
            print(f"Error getting low stock items: {e}")
            return []
    
    def _detect_item_column(self, columns: List[str]) -> str:
        """Detect item description column"""
        possible_names = ['Item Description', 'Item', 'Product', 'Description']
        for col in columns:
            if any(name.lower() in col.lower() for name in possible_names):
                return col
        return None
    
    def _detect_color_column(self, columns: List[str]) -> str:
        """Detect color column"""
        possible_names = ['Variant Color', 'Color', 'Colour']
        for col in columns:
            if any(name.lower() in col.lower() for name in possible_names):
                return col
        return None
    
    def _detect_size_column(self, columns: List[str]) -> str:
        """Detect size column"""
        possible_names = ['Variant Code', 'Size', 'Variant']
        for col in columns:
            if any(name.lower() in col.lower() for name in possible_names):
                return col
        return None
    
    def _detect_stock_column(self, columns: List[str]) -> str:
        """Detect stock column"""
        possible_names = ['Grand Total', 'Stock', 'Quantity', 'Available']
        for col in columns:
            if any(name.lower() in col.lower() for name in possible_names):
                return col
        return None
    
    def _find_new_below_threshold(self, current: List[Dict], previous: List[Dict]) -> List[Dict]:
        """Find items that are newly below threshold"""
        current_ids = {item['unique_id'] for item in current}
        previous_ids = {item['unique_id'] for item in previous}
        
        new_ids = current_ids - previous_ids
        return [item for item in current if item['unique_id'] in new_ids]
    
    def _find_improved_items(self, current: List[Dict], previous: List[Dict]) -> List[Dict]:
        """Find items that improved (went above threshold)"""
        current_ids = {item['unique_id'] for item in current}
        previous_ids = {item['unique_id'] for item in previous}
        
        improved_ids = previous_ids - current_ids
        return [item for item in previous if item['unique_id'] in improved_ids]
    
    def _find_worsened_items(self, current: List[Dict], previous: List[Dict]) -> List[Dict]:
        """Find items that got worse (stock decreased but still below threshold)"""
        current_dict = {item['unique_id']: item for item in current}
        previous_dict = {item['unique_id']: item for item in previous}
        
        worsened = []
        for unique_id in current_dict:
            if unique_id in previous_dict:
                current_stock = current_dict[unique_id]['current_stock']
                previous_stock = previous_dict[unique_id]['current_stock']
                
                if current_stock < previous_stock:
                    worsened.append({
                        **current_dict[unique_id],
                        "previous_stock": previous_stock,
                        "stock_decrease": previous_stock - current_stock
                    })
        
        return worsened
    
    def get_threshold_alert_summary(self, analysis_result: Dict) -> str:
        """Generate a human-readable summary of threshold changes"""
        if "error" in analysis_result:
            return f"❌ Analysis Error: {analysis_result['error']}"
        
        summary = analysis_result.get('summary', {})
        
        if analysis_result['analysis_type'] == 'initial_threshold_analysis':
            return f"📊 Initial Analysis: {summary['total_low_stock']} items below threshold ({self.threshold})"
        
        # Threshold change analysis
        parts = []
        
        if summary['new_below_threshold'] > 0:
            parts.append(f"🚨 {summary['new_below_threshold']} NEW items below threshold")
        
        if summary['improved_items'] > 0:
            parts.append(f"✅ {summary['improved_items']} items improved (above threshold)")
        
        if summary['worsened_items'] > 0:
            parts.append(f"📉 {summary['worsened_items']} items got worse")
        
        net_change = summary['net_change']
        if net_change > 0:
            parts.append(f"📈 Net increase: +{net_change} low stock items")
        elif net_change < 0:
            parts.append(f"📉 Net decrease: {net_change} low stock items")
        else:
            parts.append("➡️ No net change in low stock items")
        
        return " | ".join(parts) 