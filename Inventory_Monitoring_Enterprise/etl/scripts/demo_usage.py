#!/usr/bin/env python3
"""
Demo Usage Script for Inventory Monitoring Enterprise
Demonstrates how to use the processed inventory data for business intelligence
"""

import pandas as pd
import json
from pathlib import Path
from datetime import datetime
# import matplotlib.pyplot as plt
# import seaborn as sns

class InventoryAnalytics:
    """Analytics class for inventory data"""
    
    def __init__(self, data_file: str):
        """Initialize with processed inventory data"""
        self.data_file = data_file
        self.df = self.load_data()
        
    def load_data(self) -> pd.DataFrame:
        """Load processed inventory data"""
        if self.data_file.endswith('.json'):
            with open(self.data_file, 'r') as f:
                data = json.load(f)
            return pd.DataFrame(data)
        else:
            return pd.read_csv(self.data_file)
    
    def get_inventory_summary(self) -> dict:
        """Get comprehensive inventory summary"""
        summary = {
            'total_items': len(self.df),
            'total_quantity': self.df['total_quantity'].sum(),
            'total_value': self.df['total_value'].sum(),
            'average_price': self.df['Selling Price'].mean(),
            'tier_distribution': self.df['tier'].value_counts().to_dict(),
            'top_styles': self.df.groupby('Style')['total_value'].sum().nlargest(10).to_dict(),
            'low_stock_items': len(self.df[self.df['total_quantity'] <= 50]),
            'critical_stock_items': len(self.df[self.df['total_quantity'] <= 10])
        }
        return summary
    
    def get_tier_analysis(self) -> dict:
        """Analyze inventory by tier"""
        tier_analysis = {}
        
        for tier in self.df['tier'].unique():
            tier_data = self.df[self.df['tier'] == tier]
            tier_analysis[tier] = {
                'count': len(tier_data),
                'total_quantity': tier_data['total_quantity'].sum(),
                'total_value': tier_data['total_value'].sum(),
                'average_quantity': tier_data['total_quantity'].mean(),
                'average_value': tier_data['total_value'].mean(),
                'low_stock_count': len(tier_data[tier_data['total_quantity'] <= 50])
            }
        
        return tier_analysis
    
    def get_location_analysis(self) -> dict:
        """Analyze inventory by location"""
        location_cols = [col for col in self.df.columns if col.replace('.0', '').isdigit()]
        
        location_analysis = {}
        for col in location_cols:
            location_analysis[col] = {
                'total_quantity': self.df[col].sum(),
                'total_value': (self.df[col] * self.df['Selling Price']).sum(),
                'item_count': len(self.df[self.df[col] > 0])
            }
        
        return location_analysis
    
    def get_reorder_recommendations(self) -> pd.DataFrame:
        """Get reorder recommendations"""
        reorder_items = self.df[self.df['total_quantity'] <= self.df['reorder_threshold']].copy()
        reorder_items['reorder_quantity'] = reorder_items['reorder_threshold'] - reorder_items['total_quantity']
        reorder_items['reorder_value'] = reorder_items['reorder_quantity'] * reorder_items['Selling Price']
        
        return reorder_items[['Style', 'Variant Code', 'total_quantity', 'reorder_threshold', 
                             'reorder_quantity', 'reorder_value', 'tier']].sort_values('reorder_value', ascending=False)
    
    def get_top_performers(self, n: int = 10) -> pd.DataFrame:
        """Get top performing items"""
        return self.df.nlargest(n, 'total_value')[['Style', 'Variant Code', 'total_quantity', 
                                                  'total_value', 'tier', 'Selling Price']]
    
    def get_low_stock_analysis(self) -> pd.DataFrame:
        """Analyze low stock items"""
        low_stock = self.df[self.df['total_quantity'] <= 50].copy()
        low_stock['stock_level'] = low_stock['total_quantity'].apply(lambda x: 'Critical' if x <= 10 else 'Low')
        
        return low_stock[['Style', 'Variant Code', 'total_quantity', 'stock_level', 
                         'tier', 'Selling Price']].sort_values('total_quantity')
    
    def generate_reports(self, output_dir: str = "etl/reports"):
        """Generate comprehensive reports"""
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Summary report
        summary = self.get_inventory_summary()
        with open(f"{output_dir}/summary_{timestamp}.json", 'w') as f:
            json.dump(summary, f, indent=2)
        
        # Tier analysis
        tier_analysis = self.get_tier_analysis()
        with open(f"{output_dir}/tier_analysis_{timestamp}.json", 'w') as f:
            json.dump(tier_analysis, f, indent=2)
        
        # Reorder recommendations
        reorder_recs = self.get_reorder_recommendations()
        reorder_recs.to_csv(f"{output_dir}/reorder_recommendations_{timestamp}.csv", index=False)
        
        # Top performers
        top_performers = self.get_top_performers()
        top_performers.to_csv(f"{output_dir}/top_performers_{timestamp}.csv", index=False)
        
        # Low stock analysis
        low_stock = self.get_low_stock_analysis()
        low_stock.to_csv(f"{output_dir}/low_stock_{timestamp}.csv", index=False)
        
        print(f"Reports generated in {output_dir}/")
        return {
            'summary': summary,
            'tier_analysis': tier_analysis,
            'reorder_recommendations': reorder_recs,
            'top_performers': top_performers,
            'low_stock': low_stock
        }

def main():
    """Main demonstration function"""
    print("Inventory Monitoring Enterprise - Demo Usage")
    print("=" * 50)
    
    # Find the most recent processed data file
    processed_dir = Path("etl/data/processed")
    if not processed_dir.exists():
        print("No processed data found. Please run the ETL pipeline first.")
        return
    
    # Get the most recent JSON file
    json_files = list(processed_dir.glob("*.json"))
    if not json_files:
        print("No JSON data files found.")
        return
    
    latest_file = max(json_files, key=lambda x: x.stat().st_mtime)
    print(f"Using data file: {latest_file}")
    
    # Initialize analytics
    analytics = InventoryAnalytics(str(latest_file))
    
    # Generate reports
    reports = analytics.generate_reports()
    
    # Print summary
    summary = reports['summary']
    print(f"\nInventory Summary:")
    print(f"Total Items: {summary['total_items']:,}")
    print(f"Total Quantity: {summary['total_quantity']:,}")
    print(f"Total Value: ${summary['total_value']:,.2f}")
    print(f"Average Price: ${summary['average_price']:.2f}")
    print(f"Low Stock Items: {summary['low_stock_items']}")
    print(f"Critical Stock Items: {summary['critical_stock_items']}")
    
    print(f"\nTier Distribution:")
    for tier, count in summary['tier_distribution'].items():
        print(f"  {tier}: {count} items")
    
    print(f"\nTop 5 Styles by Value:")
    for i, (style, value) in enumerate(list(summary['top_styles'].items())[:5], 1):
        print(f"  {i}. {style}: ${value:,.2f}")
    
    # Reorder recommendations
    reorder_recs = reports['reorder_recommendations']
    if len(reorder_recs) > 0:
        print(f"\nTop 5 Reorder Recommendations:")
        for i, (_, row) in enumerate(reorder_recs.head().iterrows(), 1):
            print(f"  {i}. {row['Style']} {row['Variant Code']}: "
                  f"Reorder {row['reorder_quantity']} units (${row['reorder_value']:,.2f})")
    
    # Low stock items
    low_stock = reports['low_stock']
    if len(low_stock) > 0:
        print(f"\nCritical Stock Items (≤10 units):")
        critical_items = low_stock[low_stock['stock_level'] == 'Critical']
        for i, (_, row) in enumerate(critical_items.head().iterrows(), 1):
            print(f"  {i}. {row['Style']} {row['Variant Code']}: {row['total_quantity']} units")
    
    print(f"\nDetailed reports saved to etl/reports/")

if __name__ == "__main__":
    main() 