#!/usr/bin/env python3
"""
Test Threshold Analysis Service
Demonstrates how the system tracks which products went below threshold
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from threshold_analysis_service import ThresholdAnalysisService

def test_threshold_analysis():
    """Test the threshold analysis functionality"""
    
    print("🧪 Testing Threshold Analysis Service")
    print("=" * 50)
    
    # Initialize the service
    threshold_service = ThresholdAnalysisService(threshold=10)
    
    # Simulate analysis results
    print("📊 Example Threshold Analysis Results:")
    print()
    
    # Example 1: Initial analysis
    print("1️⃣ INITIAL UPLOAD (First file):")
    initial_analysis = {
        "analysis_type": "initial_threshold_analysis",
        "current_file": "inventory_20250801_124223.xlsx",
        "threshold": 10,
        "summary": {
            "total_low_stock": 818,
            "message": "First file upload - baseline established"
        },
        "current_low_stock": [
            {"item_name": "ANDRA", "color": "BLACK", "size": "990.XS", "current_stock": 7, "shortage": 3},
            {"item_name": "ANDRA", "color": "BLACK", "size": "990.XL", "current_stock": 8, "shortage": 2},
            {"item_name": "ALVARO", "color": "BLACK/BROWN", "size": "M", "current_stock": 2, "shortage": 8}
        ]
    }
    
    summary = threshold_service.get_threshold_alert_summary(initial_analysis)
    print(f"   {summary}")
    print(f"   📋 Total items below threshold: {initial_analysis['summary']['total_low_stock']}")
    print()
    
    # Example 2: Second upload with changes
    print("2️⃣ SECOND UPLOAD (Changes detected):")
    change_analysis = {
        "analysis_type": "threshold_change_analysis",
        "current_file": "inventory_20250801_125500.xlsx",
        "previous_file": "inventory_20250801_124223.xlsx",
        "threshold": 10,
        "summary": {
            "total_current_low_stock": 819,
            "total_previous_low_stock": 818,
            "new_below_threshold": 1,
            "improved_items": 0,
            "worsened_items": 2,
            "net_change": 1
        },
        "new_below_threshold_items": [
            {"item_name": "BOWEN", "color": "NAVY", "size": "L", "current_stock": 5, "shortage": 5}
        ],
        "worsened_items": [
            {"item_name": "ANDRA", "color": "BLACK", "size": "990.XS", "current_stock": 3, "shortage": 7, "previous_stock": 7, "stock_decrease": 4},
            {"item_name": "ALVARO", "color": "BLACK/BROWN", "size": "M", "current_stock": 0, "shortage": 10, "previous_stock": 2, "stock_decrease": 2}
        ]
    }
    
    summary = threshold_service.get_threshold_alert_summary(change_analysis)
    print(f"   {summary}")
    print()
    
    print("🚨 NEW ITEMS BELOW THRESHOLD:")
    for item in change_analysis["new_below_threshold_items"]:
        print(f"   • {item['item_name']} - {item['color']} - {item['size']} (Stock: {item['current_stock']}, Shortage: {item['shortage']})")
    print()
    
    print("📉 ITEMS THAT GOT WORSE:")
    for item in change_analysis["worsened_items"]:
        print(f"   • {item['item_name']} - {item['color']} - {item['size']}")
        print(f"     Stock decreased from {item['previous_stock']} to {item['current_stock']} (-{item['stock_decrease']})")
    print()
    
    # Example 3: Third upload with improvements
    print("3️⃣ THIRD UPLOAD (Improvements detected):")
    improvement_analysis = {
        "analysis_type": "threshold_change_analysis",
        "current_file": "inventory_20250801_130000.xlsx",
        "previous_file": "inventory_20250801_125500.xlsx",
        "threshold": 10,
        "summary": {
            "total_current_low_stock": 816,
            "total_previous_low_stock": 819,
            "new_below_threshold": 0,
            "improved_items": 3,
            "worsened_items": 0,
            "net_change": -3
        },
        "improved_items": [
            {"item_name": "BOWEN", "color": "NAVY", "size": "L", "current_stock": 15, "shortage": 0},
            {"item_name": "ANDRA", "color": "BLACK", "size": "990.XS", "current_stock": 12, "shortage": 0},
            {"item_name": "ALVARO", "color": "BLACK/BROWN", "size": "M", "current_stock": 11, "shortage": 0}
        ]
    }
    
    summary = threshold_service.get_threshold_alert_summary(improvement_analysis)
    print(f"   {summary}")
    print()
    
    print("✅ ITEMS THAT IMPROVED (Above threshold):")
    for item in improvement_analysis["improved_items"]:
        print(f"   • {item['item_name']} - {item['color']} - {item['size']} (Stock: {item['current_stock']})")
    print()
    
    print("🎯 SMART ANALYSIS BENEFITS:")
    print("   • Identifies exactly which products went below threshold")
    print("   • Shows stock changes between uploads")
    print("   • Highlights items that need immediate attention")
    print("   • Tracks improvements and worsening trends")
    print("   • Provides actionable insights for inventory management")
    print()
    
    print("📊 API ENDPOINTS:")
    print("   • GET /threshold-analysis - Latest vs previous file")
    print("   • GET /threshold-analysis/{filename} - Specific file analysis")
    print()
    
    print("✅ Threshold Analysis System Ready!")

if __name__ == "__main__":
    test_threshold_analysis() 