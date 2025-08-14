#!/usr/bin/env python3
"""
Test script to verify the fixes for the Danier Stock Alert System
This script tests that the system properly processes different inventory files
"""

import os
import sys
import requests
import time
from pathlib import Path

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def test_system_fixes():
    """Test that the system properly handles different inventory files"""
    
    print("🧪 Testing Danier Stock Alert System Fixes")
    print("=" * 50)
    
    # Test files to upload
    test_files = [
        "../Inventory Report -July 25,2025.xlsx",
        "../NEW Inventory Report - July 28, 2025.xlsx"
    ]
    
    base_url = "http://localhost:8000"
    
    # Check if server is running
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code != 200:
            print("❌ Server is not running. Please start the server first.")
            return False
        print("✅ Server is running")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Please start the server first.")
        return False
    
    # Test each file
    for i, file_path in enumerate(test_files, 1):
        if not os.path.exists(file_path):
            print(f"⚠️  Test file not found: {file_path}")
            continue
            
        print(f"\n📁 Testing file {i}: {os.path.basename(file_path)}")
        print("-" * 40)
        
        # Upload the file
        try:
            with open(file_path, 'rb') as f:
                files = {'file': (os.path.basename(file_path), f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
                response = requests.post(f"{base_url}/upload-report", files=files)
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Upload successful")
                    print(f"   📊 Low stock items: {data.get('low_stock_items_count', 0)}")
                    print(f"   📧 Email sent: {data.get('email_sent', False)}")
                    print(f"   📅 Upload date: {data.get('upload_date', 'N/A')}")
                else:
                    print(f"❌ Upload failed: {response.status_code}")
                    print(f"   Error: {response.text}")
                    continue
                    
        except Exception as e:
            print(f"❌ Upload error: {str(e)}")
            continue
        
        # Wait a moment for processing
        time.sleep(2)
        
        # Check the alerts endpoint
        try:
            response = requests.get(f"{base_url}/key-items/alerts")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Alerts endpoint working")
                print(f"   📁 File processed: {data.get('file_processed', 'N/A')}")
                print(f"   🎯 Low stock items: {len(data.get('low_stock_items', []))}")
                
                # Check if it's using the correct file
                if 'file_processed' in data and os.path.basename(file_path) in data['file_processed']:
                    print(f"   ✅ Using correct uploaded file")
                else:
                    print(f"   ⚠️  File processing may not be using uploaded file")
            else:
                print(f"❌ Alerts endpoint failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Alerts endpoint error: {str(e)}")
        
        # Check the key items list
        try:
            response = requests.get(f"{base_url}/key-items/list")
            if response.status_code == 200:
                data = response.json()
                total_alerts = sum(item.get('low_stock_count', 0) for item in data)
                print(f"✅ Key items list working")
                print(f"   📊 Total alerts across all items: {total_alerts}")
            else:
                print(f"❌ Key items list failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Key items list error: {str(e)}")
        
        print()
    
    # Test upload history
    try:
        response = requests.get(f"{base_url}/upload-history")
        if response.status_code == 200:
            history = response.json()
            print(f"✅ Upload history working")
            print(f"   📋 Total uploads: {len(history)}")
            for upload in history[:3]:  # Show last 3 uploads
                print(f"   📅 {upload.get('date', 'N/A')} - {upload.get('low_stock_count', 0)} items")
        else:
            print(f"❌ Upload history failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Upload history error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎉 Testing completed!")
    print("\n📝 Summary:")
    print("   - The system should now use uploaded files instead of hardcoded paths")
    print("   - Each upload should show different results based on the actual file content")
    print("   - The dashboard should reflect the latest uploaded file")
    print("   - Upload history should track all uploaded files")

if __name__ == "__main__":
    test_system_fixes() 