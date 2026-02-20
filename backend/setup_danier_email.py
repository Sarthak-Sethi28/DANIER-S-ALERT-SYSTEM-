#!/usr/bin/env python3
"""
Quick Setup for Danier Stock Alert Email System
Configure with danieralertsystem@gmail.com
"""

import os

def setup_danier_email():
    print("📧 Danier Stock Alert - Email Setup")
    print("=" * 40)
    print("📧 Email: danieralertsystem@gmail.com")
    print("🔐 Password: Danieralertsystem2018")
    print("\n⚠️  IMPORTANT: We need the App Password, not the login password!")
    print("   Follow these steps:")
    print("   1. Go to danieralertsystem@gmail.com")
    print("   2. Enable 2-Factor Authentication")
    print("   3. Generate App Password (16 characters)")
    print("   4. Enter it below\n")
    
    app_password = input("Enter the 16-character App Password: ").strip()
    
    if len(app_password) != 16:
        print("❌ App Password must be exactly 16 characters")
        return
    
    # Create .env content
    env_content = f"""# Database Configuration
DATABASE_URL=sqlite:///./danier_stock_alert.db

# SMTP Email Configuration (Danier Dedicated Account)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=danieralertsystem@gmail.com
SMTP_PASS={app_password}
EMAIL_FROM=Danier Stock Alerts <danieralertsystem@gmail.com>

# Application Settings
THRESHOLD=120
"""
    
    # Backup existing .env
    if os.path.exists('.env'):
        backup_name = '.env.backup.before_danier_setup'
        os.rename('.env', backup_name)
        print(f"✅ Backed up existing .env to {backup_name}")
    
    # Write new .env
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print(f"\n✅ Configuration Complete!")
    print(f"📧 Email: danieralertsystem@gmail.com")
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

if __name__ == "__main__":
    setup_danier_email() 