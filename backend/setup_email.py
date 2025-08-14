#!/usr/bin/env python3
"""
Email Setup Script for Danier Stock Alert System
This script helps you configure real SMTP email settings.
"""

import os
import getpass
from pathlib import Path

def setup_email_config():
    """Interactive email configuration setup"""
    
    print("📧 Danier Stock Alert - Email Configuration Setup")
    print("=" * 50)
    
    # Check if .env exists
    env_file = Path(".env")
    if env_file.exists():
        print("✅ Found existing .env file")
        backup = input("Create backup? (y/n): ").lower().startswith('y')
        if backup:
            os.system("cp .env .env.backup")
            print("✅ Backup created as .env.backup")
    else:
        print("⚠️  No .env file found. Creating new one...")
    
    print("\n🔧 Email Configuration")
    print("-" * 30)
    
    # Email provider selection
    print("Choose your email provider:")
    print("1. Gmail (Recommended)")
    print("2. Outlook/Hotmail")
    print("3. Yahoo")
    print("4. Custom SMTP")
    
    choice = input("\nEnter choice (1-4): ").strip()
    
    if choice == "1":
        smtp_host = "smtp.gmail.com"
        smtp_port = "587"
        provider = "Gmail"
    elif choice == "2":
        smtp_host = "smtp-mail.outlook.com"
        smtp_port = "587"
        provider = "Outlook"
    elif choice == "3":
        smtp_host = "smtp.mail.yahoo.com"
        smtp_port = "587"
        provider = "Yahoo"
    elif choice == "4":
        smtp_host = input("Enter SMTP host: ").strip()
        smtp_port = input("Enter SMTP port (default 587): ").strip() or "587"
        provider = "Custom"
    else:
        print("❌ Invalid choice. Using Gmail.")
        smtp_host = "smtp.gmail.com"
        smtp_port = "587"
        provider = "Gmail"
    
    print(f"\n✅ Using {provider} configuration")
    
    # Get email credentials
    print(f"\n📧 {provider} Account Details")
    print("-" * 30)
    
    email = input("Enter your email address: ").strip()
    
    if provider == "Gmail":
        print("\n🔐 Gmail App Password Setup")
        print("You need to generate an App Password:")
        print("1. Go to Google Account settings")
        print("2. Security → 2-Step Verification")
        print("3. App passwords → Generate")
        print("4. Select 'Mail' and name it 'Danier Stock Alert'")
        print("5. Copy the 16-character password")
        print("\nNote: This is NOT your regular Gmail password!")
    
    password = getpass.getpass("Enter your email password/app password: ")
    
    # Get recipient emails
    print(f"\n📬 Recipient Configuration")
    print("-" * 30)
    
    default_recipient = input("Enter default recipient email (or press Enter to use sender email): ").strip()
    if not default_recipient:
        default_recipient = email
    
    # Create .env content
    env_content = f"""# Database Configuration
DATABASE_URL=sqlite:///./danier_stock_alert.db

# SMTP Email Configuration ({provider})
SMTP_HOST={smtp_host}
SMTP_PORT={smtp_port}
SMTP_USER={email}
SMTP_PASS={password}
EMAIL_FROM=Danier Stock Alerts <{email}>

# Application Settings
THRESHOLD=10
"""
    
    # Write .env file
    with open(".env", "w") as f:
        f.write(env_content)
    
    print(f"\n✅ Email configuration saved to .env")
    print(f"📧 SMTP Host: {smtp_host}")
    print(f"📧 SMTP Port: {smtp_port}")
    print(f"📧 Email: {email}")
    print(f"📬 Default Recipient: {default_recipient}")
    
    # Update main.py with recipient
    print(f"\n🔄 Updating recipient in main.py...")
    update_main_py_recipient(default_recipient)
    
    print(f"\n🎉 Email setup complete!")
    print(f"\n📋 Next steps:")
    print(f"1. Test the configuration: curl -X GET http://localhost:8000/email/status")
    print(f"2. Test email sending: curl -X POST http://localhost:8000/email/send-item-alert/ALVARO")
    print(f"3. Check your email inbox for test messages")
    
    if provider == "Gmail":
        print(f"\n⚠️  Important Gmail Notes:")
        print(f"- Make sure 2-Factor Authentication is enabled")
        print(f"- Use the App Password, not your regular password")
        print(f"- Check spam folder if emails don't arrive")

def update_main_py_recipient(recipient_email):
    """Update the recipient email in main.py"""
    try:
        with open("main.py", "r") as f:
            content = f.read()
        
        # Replace the recipient email
        import re
        pattern = r'recipients = \["[^"]*"\]'
        replacement = f'recipients = ["{recipient_email}"]'
        
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            
            with open("main.py", "w") as f:
                f.write(content)
            
            print(f"✅ Updated recipient to: {recipient_email}")
        else:
            print(f"⚠️  Could not find recipient line in main.py")
            print(f"   Please manually update the recipients list to: {recipient_email}")
    
    except Exception as e:
        print(f"⚠️  Could not update main.py: {e}")
        print(f"   Please manually update the recipients list to: {recipient_email}")

if __name__ == "__main__":
    setup_email_config() 