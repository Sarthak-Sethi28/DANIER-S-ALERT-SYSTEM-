#!/usr/bin/env python3
"""
Email Management Utility for Inventory Monitoring Enterprise
Allows easy management of email recipients for different alert types
"""

import json
import os
from pathlib import Path
from typing import List, Dict, Optional

class EmailManager:
    """Manage email recipients for different alert types"""
    
    def __init__(self, config_file="etl/config/email_recipients.json"):
        self.config_file = config_file
        self.config = self.load_config()
    
    def load_config(self) -> Dict:
        """Load email configuration"""
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return self.get_default_config()
    
    def get_default_config(self) -> Dict:
        """Get default email configuration"""
        return {
            "email_recipients": {
                "critical_stock": ["admin@danier.com"],
                "low_stock": ["admin@danier.com"],
                "reorder": ["admin@danier.com"],
                "daily_digest": ["admin@danier.com"],
                "system_alerts": ["admin@danier.com"],
                "all_alerts": ["admin@danier.com"]
            },
            "email_groups": {
                "management": ["admin@danier.com"],
                "inventory_team": ["admin@danier.com"],
                "purchasing_team": ["admin@danier.com"],
                "store_managers": ["admin@danier.com"]
            },
            "email_settings": {
                "default_recipients": ["admin@danier.com"],
                "cc_recipients": [],
                "bcc_recipients": []
            }
        }
    
    def save_config(self):
        """Save email configuration to file"""
        # Create directory if it doesn't exist
        Path(self.config_file).parent.mkdir(parents=True, exist_ok=True)
        
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def add_recipient(self, alert_type: str, email: str) -> bool:
        """Add email recipient to specific alert type"""
        if alert_type not in self.config["email_recipients"]:
            print(f"❌ Invalid alert type: {alert_type}")
            print(f"Valid types: {list(self.config['email_recipients'].keys())}")
            return False
        
        if email not in self.config["email_recipients"][alert_type]:
            self.config["email_recipients"][alert_type].append(email)
            self.save_config()
            print(f"✅ Added {email} to {alert_type} alerts")
            return True
        else:
            print(f"⚠️  {email} already exists in {alert_type} alerts")
            return False
    
    def remove_recipient(self, alert_type: str, email: str) -> bool:
        """Remove email recipient from specific alert type"""
        if alert_type not in self.config["email_recipients"]:
            print(f"❌ Invalid alert type: {alert_type}")
            return False
        
        if email in self.config["email_recipients"][alert_type]:
            self.config["email_recipients"][alert_type].remove(email)
            self.save_config()
            print(f"✅ Removed {email} from {alert_type} alerts")
            return True
        else:
            print(f"⚠️  {email} not found in {alert_type} alerts")
            return False
    
    def add_to_group(self, group_name: str, email: str) -> bool:
        """Add email to a group"""
        if group_name not in self.config["email_groups"]:
            print(f"❌ Invalid group: {group_name}")
            print(f"Valid groups: {list(self.config['email_groups'].keys())}")
            return False
        
        if email not in self.config["email_groups"][group_name]:
            self.config["email_groups"][group_name].append(email)
            self.save_config()
            print(f"✅ Added {email} to {group_name} group")
            return True
        else:
            print(f"⚠️  {email} already exists in {group_name} group")
            return False
    
    def remove_from_group(self, group_name: str, email: str) -> bool:
        """Remove email from a group"""
        if group_name not in self.config["email_groups"]:
            print(f"❌ Invalid group: {group_name}")
            return False
        
        if email in self.config["email_groups"][group_name]:
            self.config["email_groups"][group_name].remove(email)
            self.save_config()
            print(f"✅ Removed {email} from {group_name} group")
            return True
        else:
            print(f"⚠️  {email} not found in {group_name} group")
            return False
    
    def add_group_to_alert(self, alert_type: str, group_name: str) -> bool:
        """Add all emails from a group to an alert type"""
        if group_name not in self.config["email_groups"]:
            print(f"❌ Invalid group: {group_name}")
            return False
        
        if alert_type not in self.config["email_recipients"]:
            print(f"❌ Invalid alert type: {alert_type}")
            return False
        
        added_count = 0
        for email in self.config["email_groups"][group_name]:
            if email not in self.config["email_recipients"][alert_type]:
                self.config["email_recipients"][alert_type].append(email)
                added_count += 1
        
        if added_count > 0:
            self.save_config()
            print(f"✅ Added {added_count} emails from {group_name} to {alert_type} alerts")
            return True
        else:
            print(f"⚠️  All emails from {group_name} already exist in {alert_type} alerts")
            return False
    
    def list_recipients(self, alert_type: Optional[str] = None):
        """List all recipients or recipients for specific alert type"""
        if alert_type:
            if alert_type not in self.config["email_recipients"]:
                print(f"❌ Invalid alert type: {alert_type}")
                return
            
            print(f"\n📧 Recipients for {alert_type} alerts:")
            for email in self.config["email_recipients"][alert_type]:
                print(f"  • {email}")
        else:
            print("\n📧 All Email Recipients:")
            for alert_type, emails in self.config["email_recipients"].items():
                print(f"\n  {alert_type.upper()}:")
                for email in emails:
                    print(f"    • {email}")
    
    def list_groups(self, group_name: Optional[str] = None):
        """List all groups or members of specific group"""
        if group_name:
            if group_name not in self.config["email_groups"]:
                print(f"❌ Invalid group: {group_name}")
                return
            
            print(f"\n👥 Members of {group_name} group:")
            for email in self.config["email_groups"][group_name]:
                print(f"  • {email}")
        else:
            print("\n👥 All Email Groups:")
            for group_name, emails in self.config["email_groups"].items():
                print(f"\n  {group_name.upper()}:")
                for email in emails:
                    print(f"    • {email}")
    
    def get_recipients_for_alert(self, alert_type: str) -> List[str]:
        """Get all recipients for a specific alert type"""
        return self.config["email_recipients"].get(alert_type, [])
    
    def validate_email(self, email: str) -> bool:
        """Basic email validation"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def bulk_add_recipients(self, alert_type: str, emails: List[str]) -> int:
        """Add multiple emails to an alert type"""
        if alert_type not in self.config["email_recipients"]:
            print(f"❌ Invalid alert type: {alert_type}")
            return 0
        
        added_count = 0
        for email in emails:
            if self.validate_email(email) and email not in self.config["email_recipients"][alert_type]:
                self.config["email_recipients"][alert_type].append(email)
                added_count += 1
        
        if added_count > 0:
            self.save_config()
            print(f"✅ Added {added_count} new emails to {alert_type} alerts")
        
        return added_count

def main():
    """Interactive email management interface"""
    print("📧 Email Management for Inventory Monitoring Enterprise")
    print("=" * 60)
    
    email_manager = EmailManager()
    
    while True:
        print("\n🔧 Email Management Options:")
        print("1. Add recipient to alert type")
        print("2. Remove recipient from alert type")
        print("3. Add email to group")
        print("4. Remove email from group")
        print("5. Add group to alert type")
        print("6. List all recipients")
        print("7. List all groups")
        print("8. Bulk add recipients")
        print("9. Exit")
        
        choice = input("\nEnter your choice (1-9): ").strip()
        
        if choice == "1":
            print("\n📧 Add Recipient to Alert Type")
            print("Alert types:", list(email_manager.config["email_recipients"].keys()))
            alert_type = input("Enter alert type: ").strip()
            email = input("Enter email address: ").strip()
            email_manager.add_recipient(alert_type, email)
        
        elif choice == "2":
            print("\n🗑️  Remove Recipient from Alert Type")
            print("Alert types:", list(email_manager.config["email_recipients"].keys()))
            alert_type = input("Enter alert type: ").strip()
            email = input("Enter email address: ").strip()
            email_manager.remove_recipient(alert_type, email)
        
        elif choice == "3":
            print("\n👥 Add Email to Group")
            print("Groups:", list(email_manager.config["email_groups"].keys()))
            group = input("Enter group name: ").strip()
            email = input("Enter email address: ").strip()
            email_manager.add_to_group(group, email)
        
        elif choice == "4":
            print("\n👥 Remove Email from Group")
            print("Groups:", list(email_manager.config["email_groups"].keys()))
            group = input("Enter group name: ").strip()
            email = input("Enter email address: ").strip()
            email_manager.remove_from_group(group, email)
        
        elif choice == "5":
            print("\n📧 Add Group to Alert Type")
            print("Groups:", list(email_manager.config["email_groups"].keys()))
            group = input("Enter group name: ").strip()
            print("Alert types:", list(email_manager.config["email_recipients"].keys()))
            alert_type = input("Enter alert type: ").strip()
            email_manager.add_group_to_alert(alert_type, group)
        
        elif choice == "6":
            email_manager.list_recipients()
        
        elif choice == "7":
            email_manager.list_groups()
        
        elif choice == "8":
            print("\n📧 Bulk Add Recipients")
            print("Alert types:", list(email_manager.config["email_recipients"].keys()))
            alert_type = input("Enter alert type: ").strip()
            print("Enter email addresses (comma-separated):")
            emails_input = input().strip()
            emails = [email.strip() for email in emails_input.split(",")]
            email_manager.bulk_add_recipients(alert_type, emails)
        
        elif choice == "9":
            print("👋 Goodbye!")
            break
        
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    main() 