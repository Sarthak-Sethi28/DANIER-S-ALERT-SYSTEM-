#!/usr/bin/env python3
"""
Test script to check different inventory files and their column structures
"""

import requests
import pandas as pd
import os

def test_file_columns(file_path):
    """Test what columns are in a specific file"""
    try:
        print(f"\n🔍 Testing file: {file_path}")
        print("=" * 50)
        
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            return
        
        # Read the file and show columns
        df = pd.read_excel(file_path)
        print(f"📊 Total rows: {len(df)}")
        print(f"📋 Available columns: {list(df.columns)}")
        
        # Check for key items
        key_items = ["DARIA", "ELIZA", "HANNAH", "JULIETTE", "MAGALIE", "ASHER", "BOWEN", "CAMDEN 2", "CORBAN", "ELI", "HAYDEN", "JAXON", "MILLER 2", "RONAN"]
        
        # Try to find item description column
        item_desc_col = None
        for col in df.columns:
            if 'description' in col.lower() or 'item' in col.lower():
                item_desc_col = col
                break
        
        if item_desc_col:
            print(f"✅ Found item description column: {item_desc_col}")
            
            # Check for key items
            found_items = []
            for item in key_items:
                if df[item_desc_col].str.contains(item, case=False, na=False).any():
                    found_items.append(item)
            
            print(f"🎯 Key items found: {found_items}")
            print(f"📈 Key items missing: {[item for item in key_items if item not in found_items]}")
        else:
            print("❌ No item description column found")
        
    except Exception as e:
        print(f"❌ Error reading file: {e}")

def test_upload_endpoint(file_path):
    """Test the upload endpoint with a specific file"""
    try:
        print(f"\n🚀 Testing upload for: {file_path}")
        print("=" * 50)
        
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            return
        
        # Upload file
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
            response = requests.post('http://localhost:8000/upload-report', files=files)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Upload successful!")
            print(f"📊 Found {len(data.get('key_items_low_stock', []))} low stock items")
            print(f"📧 Email sent: {data.get('email_sent', False)}")
            print(f"📁 File processed: {data.get('file_processed', 'Unknown')}")
            
            # Show results by item
            results_by_item = data.get('results_by_item', {})
            if results_by_item:
                print("\n📋 Results by Key Item:")
                for item, alerts in results_by_item.items():
                    print(f"  • {item}: {len(alerts)} alerts")
        else:
            print(f"❌ Upload failed with status {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing upload: {e}")

if __name__ == "__main__":
    print("🔍 Danier Inventory File Column Checker")
    print("=" * 60)
    
    # Test the original file
    original_file = "../Inventory Report -July 25,2025.xlsx"
    test_file_columns(original_file)
    test_upload_endpoint(original_file)
    
    # Test potential different files
    possible_files = [
        "../Inventory Report -July 7,2025.xlsx",
        "../Inventory Report -July 7, 2025.xlsx", 
        "../Inventory Report July 7, 2025.xlsx",
        "../Inventory Report July 7 2025.xlsx",
        "../July 7 Inventory Report.xlsx",
        "../July 7, 2025 Inventory Report.xlsx"
    ]
    
    print("\n🔍 Checking for other inventory files...")
    for file_path in possible_files:
        if os.path.exists(file_path):
            test_file_columns(file_path)
            test_upload_endpoint(file_path)
            break
    else:
        print("❌ No other inventory files found in the expected locations")
        print("💡 Please place your July 7th inventory file in the parent directory")
        print("   Expected names:")
        for file_path in possible_files:
            print(f"   - {file_path}") 