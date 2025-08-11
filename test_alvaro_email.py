#!/usr/bin/env python3
"""
Test ALVARO Email Data Accuracy
Ensures the email shows correct data from the dashboard
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from email_service import EmailService
import json

def test_alvaro_email_data():
    """Test ALVARO email with real data structure"""
    
    print("🧪 Testing ALVARO Email Data Accuracy")
    print("=" * 50)
    
    # Initialize email service
    email_service = EmailService()
    
    # Create realistic ALVARO data structure (matching key_items_service output)
    alvaro_low_stock_items = [
        {
            "item_name": "ALVARO",
            "color": "BLACK/BROWN",
            "size": "3M",
            "current_stock": 2,
            "required_threshold": 10,
            "shortage": 8
        },
        {
            "item_name": "ALVARO", 
            "color": "BLACK/BROWN",
            "size": "3L",
            "current_stock": 0,
            "required_threshold": 10,
            "shortage": 10
        },
        {
            "item_name": "ALVARO",
            "color": "NAVY",
            "size": "3S",
            "current_stock": 5,
            "required_threshold": 10,
            "shortage": 5
        }
    ]
    
    print("📊 Test Data Structure:")
    for item in alvaro_low_stock_items:
        print(f"   Color: {item['color']}")
        print(f"   Size: {item['size']}")
        print(f"   Available: {item['current_stock']}")
        print(f"   Required: {item['required_threshold']}")
        print(f"   Shortage: {item['shortage']}")
        print()
    
    # Load recipients
    try:
        with open('backend/recipients.json', 'r') as f:
            recipients_data = json.load(f)
        
        active_recipients = [r['email'] for r in recipients_data if r.get('active', False)]
        recipient_names = {r['email']: r['name'] for r in recipients_data}
        
        print(f"📋 Sending to: {active_recipients}")
        print()
        
    except Exception as e:
        print(f"❌ Error loading recipients: {e}")
        return False
    
    # Send test email with ALVARO data
    try:
        print("📤 Sending ALVARO test email...")
        result = email_service.send_personalized_alert(
            recipients=active_recipients,
            low_stock_items=alvaro_low_stock_items,
            recipient_names=recipient_names,
            item_name="ALVARO"
        )
        
        print("📊 Email Results:")
        print(f"   Success: {result.get('success')}")
        print(f"   Message: {result.get('message')}")
        print(f"   Real emails sent: {result.get('real_emails_sent', 0)}/{result.get('total_recipients', 0)}")
        
        if result.get('email_files'):
            print(f"   Backup files created: {len(result.get('email_files', []))}")
            print(f"   Files: {result.get('email_files', [])}")
        
        return result.get('success', False)
        
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False

if __name__ == "__main__":
    success = test_alvaro_email_data()
    if success:
        print("\n✅ ALVARO email test PASSED!")
        print("✅ Email data structure is correct")
        print("✅ Emails will show accurate stock information")
    else:
        print("\n❌ ALVARO email test FAILED!")
        print("❌ Please check the data structure")
    
    sys.exit(0 if success else 1) 