#!/usr/bin/env python3
"""
Update Gmail App Password for Danier Stock Alert System
"""

import os
import getpass

def update_gmail_password():
    print("🔐 Gmail App Password Update Tool")
    print("=" * 40)
    print("⚠️  Make sure you have generated a Gmail App Password first!")
    print("📋 Instructions: See GMAIL_SETUP_INSTRUCTIONS.md")
    print()
    
    # Get new password
    new_password = getpass.getpass("Enter your 16-character Gmail App Password: ")
    
    if len(new_password) < 10:
        print("❌ App Password seems too short. Gmail App Passwords are usually 16 characters.")
        print("   Please check and try again.")
        return False
    
    # Update email_service.py
    email_service_file = "backend/email_service.py"
    
    try:
        # Read current file
        with open(email_service_file, 'r') as f:
            content = f.read()
        
        # Replace the password
        old_line = 'smtp_pass = "Danieralertsystem2018"'
        new_line = f'smtp_pass = "{new_password}"'
        
        if old_line in content:
            updated_content = content.replace(old_line, new_line)
            
            # Write back
            with open(email_service_file, 'w') as f:
                f.write(updated_content)
            
            print("✅ Password updated successfully in email_service.py")
            return True
        else:
            print("❌ Could not find the password line to update.")
            print("   You may need to update it manually.")
            return False
            
    except Exception as e:
        print(f"❌ Error updating password: {e}")
        return False

def test_email_after_update():
    """Test email after password update"""
    print("\n🧪 Testing email with new password...")
    try:
        import subprocess
        result = subprocess.run(['python', 'test_email_integration.py'], 
                              capture_output=True, text=True)
        
        if "Real emails sent: 2/2" in result.stdout:
            print("✅ EMAIL TEST PASSED! Emails are working perfectly!")
            return True
        elif "Real emails sent: 0/2" in result.stdout:
            print("❌ Email test failed - still authentication issues")
            print("💡 Double-check your App Password is correct")
            return False
        else:
            print("⚠️  Unexpected test result:")
            print(result.stdout)
            return False
            
    except Exception as e:
        print(f"❌ Error running test: {e}")
        return False

if __name__ == "__main__":
    print("Starting Gmail password update process...")
    
    if update_gmail_password():
        print("\n" + "="*50)
        test_email_after_update()
        print("\n📧 Your email system should now be working!")
        print("📧 Emails will be sent FROM: danieralertsystem@gmail.com")
        print("📧 Emails will be sent TO: active recipients in recipients.json")
    else:
        print("\n❌ Update failed. Please check the instructions and try again.") 