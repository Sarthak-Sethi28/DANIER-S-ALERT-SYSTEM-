#!/usr/bin/env python3
"""
Debug script to see what's happening with the comparison logic
"""

import pandas as pd
import sys
import os

# Add backend to path
sys.path.append('backend')

from comparison_service import ComparisonService
from key_items_service import KeyItemsService

def debug_comparison():
    """Debug the comparison logic step by step"""
    
    print("🔍 DEBUGGING COMPARISON LOGIC")
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
        # Load the files manually to see what's happening
        print("📊 LOADING FILES...")
        df1 = key_items_service._load_inventory_file(file1)
        df2 = key_items_service._load_inventory_file(file2)
        
        print(f"   File 1 shape: {df1.shape}")
        print(f"   File 2 shape: {df2.shape}")
        print()
        
        # Show sample data
        print("📋 SAMPLE DATA FROM FILE 1:")
        print(df1.head(3))
        print()
        
        print("📋 SAMPLE DATA FROM FILE 2:")
        print(df2.head(3))
        print()
        
        # Check if files are identical
        if df1.equals(df2):
            print("⚠️  WARNING: Files are identical! No comparison possible.")
            return
        
        # Check for ASHER items specifically
        print("🔍 LOOKING FOR ASHER ITEMS...")
        asher_items_1 = df1[df1['Item Description'].str.contains('ASHER', na=False)]
        asher_items_2 = df2[df2['Item Description'].str.contains('ASHER', na=False)]
        
        print(f"   ASHER items in File 1: {len(asher_items_1)}")
        print(f"   ASHER items in File 2: {len(asher_items_2)}")
        
        if len(asher_items_1) > 0:
            print("   Sample ASHER items from File 1:")
            print(asher_items_1[['Item Description', 'Stock']].head(3))
        
        if len(asher_items_2) > 0:
            print("   Sample ASHER items from File 2:")
            print(asher_items_2[['Item Description', 'Stock']].head(3))
        
        print()
        
        # Try to merge the data manually
        print("🔗 MERGING DATA...")
        
        # Create a key for merging (Item Description)
        df1_merged = df1.copy()
        df2_merged = df2.copy()
        
        # Rename columns to avoid conflicts
        df1_merged = df1_merged.rename(columns={
            'Stock': 'old_stock',
            'Item Description': 'Item Description_old'
        })
        
        df2_merged = df2_merged.rename(columns={
            'Stock': 'new_stock',
            'Item Description': 'Item Description_new'
        })
        
        # Merge on Item Description
        merged = pd.merge(
            df1_merged[['Item Description_old', 'old_stock']], 
            df2_merged[['Item Description_new', 'new_stock']], 
            left_on='Item Description_old', 
            right_on='Item Description_new', 
            how='outer'
        )
        
        print(f"   Merged data shape: {merged.shape}")
        print()
        
        # Fill NaN values
        merged['old_stock'] = merged['old_stock'].fillna(0)
        merged['new_stock'] = merged['new_stock'].fillna(0)
        
        # Calculate change
        merged['change'] = merged['old_stock'] - merged['new_stock']
        
        print("📊 MERGED DATA SAMPLE:")
        print(merged.head(10))
        print()
        
        # Check for ASHER items in merged data
        asher_merged = merged[merged['Item Description_old'].str.contains('ASHER', na=False)]
        print(f"🔍 ASHER ITEMS IN MERGED DATA: {len(asher_merged)}")
        if len(asher_merged) > 0:
            print(asher_merged[['Item Description_old', 'old_stock', 'new_stock', 'change']].head(5))
        print()
        
        # Test the categorization logic
        print("🎯 TESTING CATEGORIZATION LOGIC...")
        
        # 1. EXCELLENT PERFORMERS (Stock decreased = selling well)
        excellent_mask = (merged['change'] < 0) & (merged['new_stock'] > 0)
        excellent_performers = merged[excellent_mask]
        
        print(f"✅ EXCELLENT PERFORMERS: {len(excellent_performers)} items")
        if len(excellent_performers) > 0:
            print("   Sample excellent performers:")
            print(excellent_performers[['Item Description_old', 'old_stock', 'new_stock', 'change']].head(3))
        print()
        
        # 2. URGENT RESTOCK (Currently out of stock)
        urgent_mask = (merged['new_stock'] == 0) & (merged['old_stock'] > 0)
        urgent_restock = merged[urgent_mask]
        
        print(f"🚨 URGENT RESTOCK: {len(urgent_restock)} items")
        if len(urgent_restock) > 0:
            print("   Sample urgent restock:")
            print(urgent_restock[['Item Description_old', 'old_stock', 'new_stock', 'change']].head(3))
        print()
        
        # 3. POOR PERFORMERS (Stock unchanged = not selling)
        poor_mask = (merged['change'] == 0) & (merged['old_stock'] > 0)
        poor_performers = merged[poor_mask]
        
        print(f"📉 POOR PERFORMERS: {len(poor_performers)} items")
        if len(poor_performers) > 0:
            print("   Sample poor performers:")
            print(poor_performers[['Item Description_old', 'old_stock', 'new_stock', 'change']].head(3))
        print()
        
        # Check if ASHER items are in the right categories
        asher_excellent = excellent_performers[excellent_performers['Item Description_old'].str.contains('ASHER', na=False)]
        asher_urgent = urgent_restock[urgent_restock['Item Description_old'].str.contains('ASHER', na=False)]
        asher_poor = poor_performers[poor_performers['Item Description_old'].str.contains('ASHER', na=False)]
        
        print("🎯 ASHER ITEMS CATEGORIZATION:")
        print(f"   In EXCELLENT: {len(asher_excellent)}")
        print(f"   In URGENT: {len(asher_urgent)}")
        print(f"   In POOR: {len(asher_poor)}")
        
        if len(asher_excellent) > 0:
            print("   ASHER items in EXCELLENT:")
            print(asher_excellent[['Item Description_old', 'old_stock', 'new_stock', 'change']])
        
    except Exception as e:
        print(f"❌ Error during debug: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_comparison() 