#!/usr/bin/env python3
"""
Test Real ANDRA Data from Inventory
Shows exactly what data will be in the ANDRA email using real inventory extraction
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from email_service import EmailService
import json

def test_real_andra_data():
    """Test ANDRA email with the EXACT data from real inventory"""
    
    print("🧪 Testing Real ANDRA Data from Inventory")
    print("=" * 60)
    
    # This is the EXACT data structure from the real inventory API
    # {"name":"ANDRA","alerts":[
    #   {"item_name":"ANDRA","color":"BLACK","size":"990.XS","stock_level":7,"status":"LOW STOCK"},
    #   {"item_name":"ANDRA","color":"BLACK","size":"990.XL","stock_level":8,"status":"LOW STOCK"}
    # ],"alert_count":2}
    
    real_andra_data = [
        {
            "item_name": "ANDRA",
            "color": "BLACK", 
            "size": "990.XS",
            "stock_level": 7,
            "status": "LOW STOCK"
        },
        {
            "item_name": "ANDRA",
            "color": "BLACK",
            "size": "990.XL", 
            "stock_level": 8,
            "status": "LOW STOCK"
        }
    ]
    
    print("📊 Real ANDRA Inventory Data:")
    for item in real_andra_data:
        print(f"   Color: {item['color']}")
        print(f"   Size: {item['size']}")
        print(f"   Available: {item['stock_level']}")
        print(f"   Required: 10 (threshold)")
        print(f"   Shortage: {max(0, 10 - item['stock_level'])}")
        print()
    
    # Initialize email service
    email_service = EmailService()
    
    # Load recipients
    try:
        with open('backend/recipients.json', 'r') as f:
            recipients_data = json.load(f)
        
        active_recipients = [r['email'] for r in recipients_data if r.get('active', False)]
        recipient_names = {r['email']: r['name'] for r in recipients_data}
        
    except Exception as e:
        print(f"❌ Error loading recipients: {e}")
        return False
    
    # Generate email content (without sending)
    try:
        print("📧 Generating ANDRA email content with real data...")
        
        html_content = email_service.create_personalized_alert_email(
            low_stock_items=real_andra_data,
            recipient_name="Test User",
            item_name="ANDRA"
        )
        
        # Save to a test file to examine
        test_file = "emails/REAL_ANDRA_TEST_email.html"
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✅ Email content generated and saved to: {test_file}")
        
        # Extract table data from the HTML to verify
        print("\n📋 Email Table Content:")
        lines = html_content.split('\n')
        in_table = False
        for line in lines:
            if '<td>' in line and '</td>' in line:
                # Extract table cell content
                cell_content = line.strip().replace('<td>', '').replace('</td>', '').replace('<td class="low-stock">', '')
                if cell_content and not cell_content.startswith('<'):
                    print(f"   Table Cell: {cell_content}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error generating email: {e}")
        return False

if __name__ == "__main__":
    success = test_real_andra_data()
    if success:
        print("\n✅ Real ANDRA data test completed!")
        print("📧 Check the generated email file to see exact content")
        print("📊 This shows what the actual email will contain")
    else:
        print("\n❌ Test failed!")
    
    sys.exit(0 if success else 1) 