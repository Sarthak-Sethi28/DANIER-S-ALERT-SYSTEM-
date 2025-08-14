import pandas as pd
from typing import List, Dict, Tuple
import os
from dotenv import load_dotenv

load_dotenv()

class InventoryService:
    def __init__(self):
        self.threshold = int(os.getenv("THRESHOLD", "120"))
    
    def process_inventory_file(self, file_path: str) -> Tuple[List[Dict], bool, str]:
        """
        Process inventory Excel file and return low stock items
        
        Returns:
            Tuple of (low_stock_items, success, error_message)
        """
        try:
            # Read Excel file
            df = pd.read_excel(file_path)
            
            # Validate required columns
            required_columns = ['Item Description', 'Grand Total']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                return [], False, f"Missing required columns: {', '.join(missing_columns)}"
            
            # Filter out rows where Item Description is empty or null
            df = df.dropna(subset=['Item Description'])
            
            # Filter out KI00 season items as requested (exclude KI00 season code)
            df = df[df['Season Code'] != 'KI00']
            
            # Group by Item Description and sum Grand Total
            grouped_data = df.groupby('Item Description')['Grand Total'].sum().reset_index()
            
            # Filter for low stock items (below threshold)
            low_stock_items = grouped_data[grouped_data['Grand Total'] < self.threshold]
            
            # Convert to list of dictionaries
            low_stock_list = []
            for _, row in low_stock_items.iterrows():
                low_stock_list.append({
                    'item_description': row['Item Description'],
                    'stock': int(row['Grand Total'])
                })
            
            # Sort by stock level (lowest first)
            low_stock_list.sort(key=lambda x: x['stock'])
            
            return low_stock_list, True, ""
            
        except Exception as e:
            return [], False, f"Error processing file: {str(e)}"
    
    def get_summary_stats(self, file_path: str) -> Dict:
        """Get summary statistics from inventory file"""
        try:
            df = pd.read_excel(file_path)
            
            if 'Item Description' not in df.columns or 'Grand Total' not in df.columns:
                return {}
            
            # Group by Item Description and sum Grand Total
            grouped_data = df.groupby('Item Description')['Grand Total'].sum().reset_index()
            
            total_items = len(grouped_data)
            total_stock = grouped_data['Grand Total'].sum()
            low_stock_count = len(grouped_data[grouped_data['Grand Total'] < self.threshold])
            
            return {
                'total_items': total_items,
                'total_stock': int(total_stock),
                'low_stock_count': low_stock_count,
                'threshold': self.threshold
            }
            
        except Exception as e:
            return {'error': str(e)} 