#!/usr/bin/env python3
"""
Test script to find files with differences and test comparison logic
"""

import pandas as pd
import sys
import os
import glob

# Add backend to path
sys.path.append('backend')

from comparison_service import ComparisonService
from key_items_service import KeyItemsService

def find_different_files():
    """Find files that are actually different"""
    
    print("🔍 FINDING FILES WITH DIFFERENCES")
    print("=" * 50)
    
    # Initialize services
    key_items_service = KeyItemsService()
    
    # Get all files
    files = glob.glob("backend/uploads/*.xlsx")
    files.sort()
    
    print(f"📁 Found {len(files)} files")
    print()
    
    # Test pairs of files to find differences
    for i in range(len(files) - 1):
        file1 = files[i]
        file2 = files[i + 1]
        
        print(f"🔍 Testing: {os.path.basename(file1)} vs {os.path.basename(file2)}")
        
        try:
            df1 = key_items_service._load_inventory_file(file1)
            df2 = key_items_service._load_inventory_file(file2)
            
            if df1.equals(df2):
                print("   ❌ Files are identical")
            else:
                print("   ✅ Files are different!")
                
                # Check for ASHER items
                asher_1 = df1[df1['Item Description'].str.contains('ASHER', na=False)]
                asher_2 = df2[df2['Item Description'].str.contains('ASHER', na=False)]
                
                print(f"   📊 ASHER items: {len(asher_1)} vs {len(asher_2)}")
                
                if len(asher_1) > 0 and len(asher_2) > 0:
                    # Compare ASHER items
                    merged_asher = pd.merge(
                        asher_1[['Item Description', 'Grand Total']], 
                        asher_2[['Item Description', 'Grand Total']], 
                        on='Item Description', 
                        suffixes=('_1', '_2')
                    )
                    
                    merged_asher['change'] = merged_asher['Grand Total_1'] - merged_asher['Grand Total_2']
                    
                    # Find ASHER items with changes
                    changed_asher = merged_asher[merged_asher['change'] != 0]
                    
                    if len(changed_asher) > 0:
                        print(f"   🎯 Found {len(changed_asher)} ASHER items with stock changes!")
                        print("   Sample changes:")
                        for _, row in changed_asher.head(3).iterrows():
                            print(f"      {row['Item Description']}: {row['Grand Total_1']} → {row['Grand Total_2']} ({row['change']})")
                        
                        # Test the comparison logic with these files
                        print("\n🧪 TESTING COMPARISON LOGIC WITH THESE FILES...")
                        test_comparison_logic(file1, file2)
                        return file1, file2
                    else:
                        print("   ⚠️  No ASHER items with stock changes")
                else:
                    print("   ⚠️  No ASHER items found")
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
        
        print()
    
    print("❌ No suitable file pairs found for testing")

def test_comparison_logic(file1, file2):
    """Test the comparison logic with the given files"""
    
    print(f"\n🧪 TESTING COMPARISON LOGIC")
    print("=" * 40)
    
    comparison_service = ComparisonService(KeyItemsService())
    
    try:
        result = comparison_service.get_smart_performance_analysis(file1, file2)
        
        if "error" in result:
            print(f"❌ Error: {result['error']}")
            return
        
        print("✅ Analysis completed successfully!")
        print()
        
        # Show summary
        if "business_insights" in result and "summary" in result["business_insights"]:
            summary = result["business_insights"]["summary"]
            print("📊 ANALYSIS SUMMARY:")
            print("-" * 30)
            for key, value in summary.items():
                print(f"  {key}: {value}")
            print()
        
        # Show excellent performers
        if "business_insights" in result and "excellent_performers" in result["business_insights"]:
            excellent = result["business_insights"]["excellent_performers"]
            print(f"✅ EXCELLENT PERFORMERS ({len(excellent)} items):")
            print("-" * 40)
            for i, item in enumerate(excellent[:5]):  # Show first 5
                print(f"  {i+1}. {item.get('item_name', 'Unknown')} - {item.get('insight', 'No insight')}")
            if len(excellent) > 5:
                print(f"  ... and {len(excellent) - 5} more items")
            print()
        
        # Show urgent restock
        if "business_insights" in result and "urgent_restock" in result["business_insights"]:
            urgent = result["business_insights"]["urgent_restock"]
            print(f"🚨 URGENT RESTOCK ({len(urgent)} items):")
            print("-" * 40)
            for i, item in enumerate(urgent[:5]):  # Show first 5
                print(f"  {i+1}. {item.get('item_name', 'Unknown')} - {item.get('insight', 'No insight')}")
            if len(urgent) > 5:
                print(f"  ... and {len(urgent) - 5} more items")
            print()
        
        # Show poor performers
        if "business_insights" in result and "poor_performers" in result["business_insights"]:
            poor = result["business_insights"]["poor_performers"]
            print(f"📉 POOR PERFORMERS ({len(poor)} items):")
            print("-" * 40)
            for i, item in enumerate(poor[:5]):  # Show first 5
                print(f"  {i+1}. {item.get('item_name', 'Unknown')} - {item.get('insight', 'No insight')}")
            if len(poor) > 5:
                print(f"  ... and {len(poor) - 5} more items")
            print()
        
        print("🎯 VERIFICATION:")
        print("-" * 20)
        print("✅ If ASHER items with stock decreases appear in EXCELLENT PERFORMERS, the logic is correct")
        print("✅ If ASHER items with stock decreases appear in POOR PERFORMERS, there's a bug")
        
    except Exception as e:
        print(f"❌ Error during analysis: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    find_different_files() 