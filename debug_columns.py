#!/usr/bin/env python3
"""
Debug script to analyze inventory file columns
"""

import pandas as pd
import os

def analyze_file(file_path):
    """Analyze the structure of an inventory file"""
    try:
        print(f"\n🔍 Analyzing file: {file_path}")
        print("=" * 60)
        
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            return
        
        # Read the file
        df = pd.read_excel(file_path)
        print(f"📊 Total rows: {len(df)}")
        print(f"📋 All columns: {list(df.columns)}")
        
        # Look for key columns
        print("\n🔍 Looking for key columns:")
        
        # Item Description
        item_desc_cols = [col for col in df.columns if 'description' in col.lower()]
        print(f"📝 Item Description columns: {item_desc_cols}")
        
        # Color columns
        color_cols = [col for col in df.columns if 'color' in col.lower() or 'colour' in col.lower()]
        print(f"🎨 Color columns: {color_cols}")
        
        # Code/Size columns
        code_cols = [col for col in df.columns if 'code' in col.lower() or 'size' in col.lower()]
        print(f"🔢 Code/Size columns: {code_cols}")
        
        # Total/Stock columns
        total_cols = [col for col in df.columns if 'total' in col.lower() or 'stock' in col.lower()]
        print(f"📦 Total/Stock columns: {total_cols}")
        
        # Season columns
        season_cols = [col for col in df.columns if 'season' in col.lower()]
        print(f"🌱 Season columns: {season_cols}")
        
        # Check for key items in Item Description column
        if 'Item Description' in df.columns:
            print(f"\n🎯 Checking for key items in 'Item Description' column:")
            key_items = ["DARIA", "ELIZA", "HANNAH", "JULIETTE", "MAGALIE", "ASHER", "BOWEN", "CAMDEN 2", "CORBAN", "ELI", "HAYDEN", "JAXON", "MILLER 2", "RONAN"]
            
            found_items = []
            for item in key_items:
                if df['Item Description'].str.contains(item, case=False, na=False).any():
                    count = df['Item Description'].str.contains(item, case=False, na=False).sum()
                    found_items.append((item, count))
                    print(f"  ✅ {item}: {count} entries")
            
            missing_items = [item for item in key_items if not df['Item Description'].str.contains(item, case=False, na=False).any()]
            if missing_items:
                print(f"  ❌ Missing items: {missing_items}")
        
        # Show first few rows of key columns
        print(f"\n📋 Sample data (first 3 rows):")
        key_cols = ['Item Description', 'Variant Color', 'Variant Code', 'Grand Total', 'Season Code']
        available_cols = [col for col in key_cols if col in df.columns]
        
        if available_cols:
            print(df[available_cols].head(3).to_string())
        else:
            print("❌ None of the expected key columns found")
        
    except Exception as e:
        print(f"❌ Error analyzing file: {e}")

if __name__ == "__main__":
    print("🔍 Danier Inventory File Column Analyzer")
    print("=" * 60)
    
    # Analyze the original file
    original_file = "../Inventory Report -July 25,2025.xlsx"
    analyze_file(original_file) 