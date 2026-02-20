#!/usr/bin/env python3
"""
Update Email Password for Danier Stock Alert System
Quick script to set the App Password
"""

import os

def update_password():
    print("📧 Update Email Password")
    print("=" * 30)
    
    # Get the App Password from user
    app_password = input("Enter your 16-character App Password: ").strip()
    
    if len(app_password) != 16:
        print("❌ Error: App Password must be exactly 16 characters!")
        return
    
    # Read current .env
    env_content = ""
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            env_content = f.read()
    
    # Update the password
    if 'SMTP_PASS=' in env_content:
        # Replace the password line
        lines = env_content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('SMTP_PASS='):
                lines[i] = f'SMTP_PASS={app_password}'
                break
        
        env_content = '\n'.join(lines)
    else:
        # Add the password line if it doesn't exist
        env_content += f'\nSMTP_PASS={app_password}\n'
    
    # Write updated .env
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ Password updated successfully!")
    print(f"📧 Email: danieralertsystem@gmail.com")
    print(f"🔐 App Password: {app_password[:4]}****{app_password[-4:]}")
    print("\n🚀 Ready to send real emails!")

if __name__ == "__main__":
    update_password() 