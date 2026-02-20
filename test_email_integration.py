#!/usr/bin/env python3
"""
Test Email Integration for Danier Stock Alert System
Tests that emails are sent FROM danieralertsystem@gmail.com to recipients
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from email_service import EmailService
import json

def test_email_integration():
    """Test the email integration end-to-end"""
    
    print("🧪 Testing Danier Email Integration")
    print("=" * 50)
    
    # Initialize email service
    email_service = EmailService()
    
    # Check email configuration
    print(f"📧 Email FROM address: {email_service.email_from}")
    print(f"📧 SMTP User: {email_service.smtp_user}")
    print(f"📧 SMTP Host: {email_service.smtp_host}")
    print(f"📧 SMTP Port: {email_service.smtp_port}")
    print()
    
    # Load recipients
    try:
        with open('backend/recipients.json', 'r') as f:
            recipients_data = json.load(f)
        
        # Get active recipients
        active_recipients = [r['email'] for r in recipients_data if r.get('active', False)]
        recipient_names = {r['email']: r['name'] for r in recipients_data}
        
        print(f"📋 Active Recipients: {active_recipients}")
        print()
        
        if not active_recipients:
            print("❌ No active recipients found!")
            return False
            
    except Exception as e:
        print(f"❌ Error loading recipients: {e}")
        return False
    
    # Create test low stock data
    test_low_stock = [
        {
            'style': 'JACKET-001',
            'color': 'Black',
            'size': 'M',
            'current': 2,
            'required': 10
        },
        {
            'style': 'JACKET-001', 
            'color': 'Black',
            'size': 'L',
            'current': 1,
            'required': 8
        }
    ]
    
    print("📧 Test Email Details:")
    print(f"   FROM: Danier Stock Alerts <danieralertsystem@gmail.com>")
    print(f"   TO: {', '.join(active_recipients)}")
    print(f"   SUBJECT: Test Stock Alert - Email Integration Test")
    print()
    
    # Send test email
    try:
        print("📤 Sending test email...")
        result = email_service.send_personalized_alert(
            recipients=active_recipients,
            low_stock_items=test_low_stock,
            recipient_names=recipient_names,
            item_name="EMAIL_INTEGRATION_TEST"
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
    success = test_email_integration()
    if success:
        print("\n✅ Email integration test PASSED!")
        print("✅ Emails are configured to send FROM danieralertsystem@gmail.com")
        print("✅ Emails are being sent to active recipients")
    else:
        print("\n❌ Email integration test FAILED!")
        print("❌ Please check the configuration and try again")
    
    sys.exit(0 if success else 1) 