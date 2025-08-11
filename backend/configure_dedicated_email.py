#!/usr/bin/env python3
"""
Configure Dedicated Gmail Account for Danier Stock Alert System
This script helps set up a professional email system for the business
"""

import os
import getpass

def configure_dedicated_email():
    print("📧 Danier Stock Alert - Dedicated Email Setup")
    print("=" * 50)
    print("\n🎯 This will configure a dedicated Gmail account for business alerts")
    print("   This is the recommended approach for professional use.\n")
    
    print("📋 Prerequisites:")
    print("1. Create a new Gmail account (e.g., danier.stock.alerts@gmail.com)")
    print("2. Enable 2-Factor Authentication")
    print("3. Generate an App Password (16 characters)")
    print("\n" + "="*50)
    
    # Get email details
    print("\n🔧 Configuration:")
    email = input("Enter your dedicated Gmail address: ").strip()
    
    if not email or '@gmail.com' not in email:
        print("❌ Please enter a valid Gmail address")
        return
    
    print(f"\n📧 Email: {email}")
    print("🔐 Now enter your 16-character App Password:")
    app_password = getpass.getpass("App Password: ").strip()
    
    if len(app_password) != 16:
        print("❌ App Password must be exactly 16 characters")
        return
    
    # Create .env content
    env_content = f"""# Database Configuration
DATABASE_URL=sqlite:///./danier_stock_alert.db

# SMTP Email Configuration (Dedicated Gmail Account)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER={email}
SMTP_PASS={app_password}
EMAIL_FROM=Danier Stock Alerts <{email}>

# Application Settings
THRESHOLD=120
"""
    
    # Backup existing .env
    if os.path.exists('.env'):
        backup_name = '.env.backup.before_dedicated_setup'
        os.rename('.env', backup_name)
        print(f"✅ Backed up existing .env to {backup_name}")
    
    # Write new .env
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print(f"\n✅ Configuration Complete!")
    print(f"📧 Dedicated Email: {email}")
    print(f"🔧 SMTP: smtp.gmail.com:587")
    print(f"📁 Config saved to: .env")
    
    print(f"\n🎯 Next Steps:")
    print(f"1. Test the email system:")
    print(f"   curl -X POST http://localhost:8000/email/send-item-alert/ALVARO")
    print(f"2. Add recipients in the web interface")
    print(f"3. Use the blue email buttons to send alerts")
    
    print(f"\n📋 Recipient Management:")
    print(f"- Go to http://localhost:3000")
    print(f"- Click on 'Recipients' tab")
    print(f"- Add team members' email addresses")
    print(f"- They will receive alerts when you click the blue email buttons")

def test_email_config():
    """Test the email configuration"""
    print("\n🧪 Testing Email Configuration...")
    
    if not os.path.exists('.env'):
        print("❌ .env file not found. Please run configuration first.")
        return
    
    # Read current config
    env_vars = {}
    with open('.env', 'r') as f:
        for line in f:
            if '=' in line:
                key, value = line.strip().split('=', 1)
                env_vars[key] = value
    
    print(f"📧 Email: {env_vars.get('SMTP_USER', 'Not set')}")
    print(f"🔐 Password: {'***' if env_vars.get('SMTP_PASS') != 'your_email_password' else 'NOT CONFIGURED'}")
    
    if env_vars.get('SMTP_PASS') == 'your_email_password':
        print("❌ Email not configured. Run setup first.")
    else:
        print("✅ Email appears to be configured!")
        print("🧪 Test with: curl -X POST http://localhost:8000/email/send-item-alert/ALVARO")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        test_email_config()
    else:
        configure_dedicated_email() 