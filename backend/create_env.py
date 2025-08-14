#!/usr/bin/env python3
"""
Create .env file for Danier Stock Alert System
"""

import os

def create_env_file():
    print("📧 Creating .env file for Danier Stock Alert System")
    print("=" * 50)
    
    # Create .env content
    env_content = """# Database Configuration
DATABASE_URL=sqlite:///./danier_stock_alert.db

# SMTP Email Configuration (Danier Dedicated Account)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=danieralertsystem@gmail.com
SMTP_PASS=YOUR_16_CHAR_APP_PASSWORD_HERE
EMAIL_FROM=Danier Stock Alerts <danieralertsystem@gmail.com>

# Application Settings
THRESHOLD=120
"""
    
    # Write .env file
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ .env file created successfully!")
    print("\n📋 Next Steps:")
    print("1. Get your 16-character App Password from Gmail")
    print("2. Edit the .env file and replace 'YOUR_16_CHAR_APP_PASSWORD_HERE'")
    print("3. Test the email system")
    
    print("\n🔧 To edit the .env file:")
    print("   nano .env")
    print("   # or")
    print("   open .env")
    
    print("\n🧪 To test after configuration:")
    print("   curl -X POST http://localhost:8000/email/send-item-alert/ALVARO")

if __name__ == "__main__":
    create_env_file() 