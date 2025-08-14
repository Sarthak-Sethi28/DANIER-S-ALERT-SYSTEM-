#!/usr/bin/env python3
"""
Test script to specifically check ASHER items in comparison
"""

import pandas as pd
import sys
import os

# Add backend to path
sys.path.append('backend')

from comparison_service import ComparisonService
from key_items_service import KeyItemsService

def test_asher_specific():
    """Test specifically what's happening with ASHER items"""
    
    print("🔍 TESTING ASHER ITEMS SPECIFICALLY")
    print("=" * 50)
    
    # Initialize services
    key_items_service = KeyItemsService()
    comparison_service = ComparisonService(key_items_service)
    
    # Use the files we found that have differences
    file1 = "backend/uploads/inventory_20250729_131258.xlsx"
    file2 = "backend/uploads/inventory_20250729_131355.xlsx"
    
    print(f"📁 Testing with files:")
    print(f"   File 1: {os.path.basename(file1)}")
    print(f"   File 2: {os.path.basename(file2)}")
    print()
    
    try:
        # Load files manually
        df1 = key_items_service._load_inventory_file(file1)
        df2 = key_items_service._load_inventory_file(file2)
        
        # Find ASHER items in both files
        asher_1 = df1[df1['Item Description'].str.contains('ASHER', na=False)]
        asher_2 = df2[df2['Item Description'].str.contains('ASHER', na=False)]
        
        print(f"📊 ASHER ITEMS FOUND:")
        print(f"   File 1: {len(asher_1)} ASHER items")
        print(f"   File 2: {len(asher_2)} ASHER items")
        print()
        
        # Show sample ASHER items
        print("📋 SAMPLE ASHER ITEMS FROM FILE 1:")
        print(asher_1[['Item Description', 'Grand Total']].head(5))
        print()
        
        print("📋 SAMPLE ASHER ITEMS FROM FILE 2:")
        print(asher_2[['Item Description', 'Grand Total']].head(5))
        print()
        
        # Merge ASHER items
        merged_asher = pd.merge(
            asher_1[['Item Description', 'Grand Total']], 
            asher_2[['Item Description', 'Grand Total']], 
            on='Item Description', 
            suffixes=('_1', '_2')
        )
        
        merged_asher['change'] = merged_asher['Grand Total_1'] - merged_asher['Grand Total_2']
        
        print(f"🔗 MERGED ASHER ITEMS: {len(merged_asher)}")
        print("📊 SAMPLE MERGED ASHER ITEMS:")
        print(merged_asher.head(10))
        print()
        
        # Categorize ASHER items
        excellent_asher = merged_asher[(merged_asher['change'] < 0) & (merged_asher['Grand Total_2'] > 0)]
        urgent_asher = merged_asher[(merged_asher['Grand Total_2'] == 0) & (merged_asher['Grand Total_1'] > 0)]
        poor_asher = merged_asher[(merged_asher['change'] == 0) & (merged_asher['Grand Total_1'] > 0)]
        
        print("🎯 ASHER ITEMS CATEGORIZATION:")
        print(f"   EXCELLENT PERFORMERS: {len(excellent_asher)} items")
        print(f"   URGENT RESTOCK: {len(urgent_asher)} items")
        print(f"   POOR PERFORMERS: {len(poor_asher)} items")
        print()
        
        if len(excellent_asher) > 0:
            print("✅ ASHER ITEMS IN EXCELLENT PERFORMERS:")
            print("-" * 40)
            for _, row in excellent_asher.head(10).iterrows():
                print(f"   {row['Item Description']}: {row['Grand Total_1']} → {row['Grand Total_2']} ({row['change']})")
            print()
        
        if len(urgent_asher) > 0:
            print("🚨 ASHER ITEMS IN URGENT RESTOCK:")
            print("-" * 40)
            for _, row in urgent_asher.head(10).iterrows():
                print(f"   {row['Item Description']}: {row['Grand Total_1']} → {row['Grand Total_2']} ({row['change']})")
            print()
        
        # Now test the actual comparison service
        print("🧪 TESTING COMPARISON SERVICE...")
        result = comparison_service.get_smart_performance_analysis(file1, file2)
        
        if "error" in result:
            print(f"❌ Error: {result['error']}")
            return
        
        # Check if ASHER items appear in the results
        excellent = result["business_insights"]["excellent_performers"]
        urgent = result["business_insights"]["urgent_restock"]
        poor = result["business_insights"]["poor_performers"]
        
        # Count ASHER items in each category
        asher_in_excellent = [item for item in excellent if 'ASHER' in item.get('item_name', '')]
        asher_in_urgent = [item for item in urgent if 'ASHER' in item.get('item_name', '')]
        asher_in_poor = [item for item in poor if 'ASHER' in item.get('item_name', '')]
        
        print("🎯 ASHER ITEMS IN COMPARISON SERVICE RESULTS:")
        print(f"   In EXCELLENT: {len(asher_in_excellent)}")
        print(f"   In URGENT: {len(asher_in_urgent)}")
        print(f"   In POOR: {len(asher_in_poor)}")
        print()
        
        if len(asher_in_excellent) > 0:
            print("✅ ASHER ITEMS FOUND IN EXCELLENT PERFORMERS:")
            for item in asher_in_excellent[:5]:
                print(f"   {item.get('item_name', 'Unknown')} - {item.get('insight', 'No insight')}")
        else:
            print("❌ NO ASHER ITEMS FOUND IN EXCELLENT PERFORMERS!")
            print("   This means there's a bug in the comparison service")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_asher_specific() 