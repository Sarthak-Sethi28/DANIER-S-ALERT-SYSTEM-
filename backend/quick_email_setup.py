#!/usr/bin/env python3
"""
Quick Email Setup for Danier Stock Alert System
Simple script to configure real email functionality
"""

import os

def quick_setup():
    print("📧 Quick Email Setup for Danier Stock Alert")
    print("=" * 50)
    
    print("\n🔧 Current Configuration:")
    print("-" * 30)
    
    # Read current .env
    env_vars = {}
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
    
    print(f"SMTP Host: {env_vars.get('SMTP_HOST', 'Not set')}")
    print(f"SMTP User: {env_vars.get('SMTP_USER', 'Not set')}")
    print(f"SMTP Password: {'***' if env_vars.get('SMTP_PASS') != 'your_email_password' else 'NOT CONFIGURED'}")
    
    print("\n📋 To enable real email sending:")
    print("1. Get Gmail App Password (16 characters)")
    print("2. Run this command:")
    print("   python quick_email_setup.py --set-password YOUR_16_CHAR_PASSWORD")
    print("\n3. Or manually edit .env file and replace:")
    print("   SMTP_PASS=your_email_password")
    print("   with:")
    print("   SMTP_PASS=your_actual_16_char_app_password")
    
    print("\n🎯 Quick Test:")
    print("After setting password, test with:")
    print("curl -X POST http://localhost:8000/email/send-item-alert/ALVARO")

def set_password(password):
    """Set the SMTP password"""
    if len(password) != 16:
        print("❌ Error: Gmail App Password should be 16 characters")
        return
    
    # Read current .env
    env_lines = []
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            env_lines = f.readlines()
    
    # Update SMTP_PASS
    updated = False
    for i, line in enumerate(env_lines):
        if line.startswith('SMTP_PASS='):
            env_lines[i] = f'SMTP_PASS={password}\n'
            updated = True
            break
    
    if not updated:
        env_lines.append(f'SMTP_PASS={password}\n')
    
    # Write back
    with open('.env', 'w') as f:
        f.writelines(env_lines)
    
    print(f"✅ SMTP password updated successfully!")
    print(f"📧 You can now send real emails!")
    print(f"\n🧪 Test it:")
    print(f"curl -X POST http://localhost:8000/email/send-item-alert/ALVARO")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--set-password':
        if len(sys.argv) > 2:
            set_password(sys.argv[2])
        else:
            print("❌ Please provide the 16-character app password")
            print("Usage: python quick_email_setup.py --set-password YOUR_PASSWORD")
    else:
        quick_setup() 