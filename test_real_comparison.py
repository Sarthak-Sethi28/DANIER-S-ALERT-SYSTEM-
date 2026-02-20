#!/usr/bin/env python3
"""
Test script to verify comparison logic with real data
"""

import pandas as pd
import sys
import os

# Add backend to path
sys.path.append('backend')

from comparison_service import ComparisonService
from key_items_service import KeyItemsService

def test_real_comparison():
    """Test the comparison logic with real data"""
    
    print("🧪 TESTING REAL COMPARISON LOGIC")
    print("=" * 50)
    
    # Initialize services
    key_items_service = KeyItemsService()
    comparison_service = ComparisonService(key_items_service)
    
    # Test with real files
    file1 = "backend/uploads/inventory_20250729_125950.xlsx"
    file2 = "backend/uploads/inventory_20250729_130339.xlsx"
    
    if not os.path.exists(file1) or not os.path.exists(file2):
        print("❌ Test files not found!")
        return
    
    print(f"📁 Testing with files:")
    print(f"   File 1: {os.path.basename(file1)}")
    print(f"   File 2: {os.path.basename(file2)}")
    print()
    
    try:
        # Get the analysis
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
            for i, item in enumerate(excellent[:10]):  # Show first 10
                print(f"  {i+1}. {item.get('item_name', 'Unknown')} - {item.get('insight', 'No insight')}")
            if len(excellent) > 10:
                print(f"  ... and {len(excellent) - 10} more items")
            print()
        
        # Show urgent restock
        if "business_insights" in result and "urgent_restock" in result["business_insights"]:
            urgent = result["business_insights"]["urgent_restock"]
            print(f"🚨 URGENT RESTOCK ({len(urgent)} items):")
            print("-" * 40)
            for i, item in enumerate(urgent[:10]):  # Show first 10
                print(f"  {i+1}. {item.get('item_name', 'Unknown')} - {item.get('insight', 'No insight')}")
            if len(urgent) > 10:
                print(f"  ... and {len(urgent) - 10} more items")
            print()
        
        # Show poor performers
        if "business_insights" in result and "poor_performers" in result["business_insights"]:
            poor = result["business_insights"]["poor_performers"]
            print(f"📉 POOR PERFORMERS ({len(poor)} items):")
            print("-" * 40)
            for i, item in enumerate(poor[:10]):  # Show first 10
                print(f"  {i+1}. {item.get('item_name', 'Unknown')} - {item.get('insight', 'No insight')}")
            if len(poor) > 10:
                print(f"  ... and {len(poor) - 10} more items")
            print()
        
        print("🎯 VERIFICATION:")
        print("-" * 20)
        print("✅ If ASHER items with stock decreases appear in EXCELLENT PERFORMERS, the logic is correct")
        print("✅ If ASHER items with stock decreases appear in POOR PERFORMERS, there's a bug")
        print("✅ If BOWEN items with 0 stock appear in URGENT RESTOCK, the logic is correct")
        
    except Exception as e:
        print(f"❌ Error during analysis: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_real_comparison() 