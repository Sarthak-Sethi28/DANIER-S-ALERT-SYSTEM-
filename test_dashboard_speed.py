#!/usr/bin/env python3
"""
Test dashboard speed and functionality
"""

import requests
import time
import json

API_BASE_URL = "http://localhost:8000"

def test_dashboard_speed():
    """Test dashboard endpoints for speed and accuracy"""
    print("🚀 TESTING DASHBOARD SPEED")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. HEALTH CHECK")
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        health_time = time.time() - start_time
        print(f"⏱️ Health check time: {health_time:.2f} seconds")
        print(f"✅ Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test 2: Batch alerts endpoint
    print("\n2. BATCH ALERTS ENDPOINT")
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/key-items/batch-alerts", timeout=30)
        batch_time = time.time() - start_time
        print(f"⏱️ Batch alerts time: {batch_time:.2f} seconds")
        print(f"✅ Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            items = data.get('key_items', [])
            total_alerts = sum(len(item.get('alerts', [])) for item in items)
            print(f"📊 Items loaded: {len(items)}")
            print(f"🚨 Total alerts: {total_alerts}")
            
            if total_alerts > 0:
                print("✅ SUCCESS: Dashboard is working correctly!")
            else:
                print("⚠️ WARNING: No alerts found")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Batch alerts failed: {e}")
        return
    
    # Test 3: Summary endpoint
    print("\n3. SUMMARY ENDPOINT")
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/key-items/summary", timeout=10)
        summary_time = time.time() - start_time
        print(f"⏱️ Summary time: {summary_time:.2f} seconds")
        print(f"✅ Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            items = data.get('key_items', [])
            total_alerts = sum(item.get('alert_count', 0) for item in items)
            print(f"📊 Items in summary: {len(items)}")
            print(f"🚨 Total alerts in summary: {total_alerts}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Summary failed: {e}")
        return
    
    # Test 4: Performance analysis
    print("\n4. PERFORMANCE ANALYSIS")
    total_time = batch_time + summary_time
    print(f"⏱️ Total API time: {total_time:.2f} seconds")
    
    if total_time < 5:
        print("✅ EXCELLENT: Dashboard loads very fast!")
    elif total_time < 10:
        print("✅ GOOD: Dashboard loads reasonably fast")
    elif total_time < 20:
        print("⚠️ SLOW: Dashboard takes a while to load")
    else:
        print("❌ VERY SLOW: Dashboard needs optimization")
    
    print("\n✅ TEST COMPLETE")

if __name__ == "__main__":
    test_dashboard_speed() 