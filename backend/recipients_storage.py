#!/usr/bin/env python3
"""
Simple Recipients Storage for Danier Stock Alert System
"""

import json
import os
from datetime import datetime
from typing import List, Dict, Optional

DEFAULT_RECIPIENTS = [
    {
        "email": "danieralertsystem@gmail.com",
        "name": "Danier Alerts",
        "department": "System",
    },
    {
        "email": "sarthaksethi2803@gmail.com",
        "name": "Sarthak Sethi",
        "department": "Management",
    },
]


class RecipientsStorage:
    def __init__(self, file_path: str = "recipients.json"):
        self.file_path = file_path
        self.recipients = self._load_recipients()
        self._seed_defaults()
    
    def _load_recipients(self) -> List[Dict]:
        """Load recipients from JSON file"""
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, 'r') as f:
                    return json.load(f)
            except:
                return []
        return []

    def _seed_defaults(self):
        """Ensure default recipients exist (survives ephemeral disk resets)."""
        existing_emails = {r['email'] for r in self.recipients}
        added = False
        for idx, dflt in enumerate(DEFAULT_RECIPIENTS):
            if dflt['email'] not in existing_emails:
                self.recipients.append({
                    "id": len(self.recipients) + 1,
                    "email": dflt['email'],
                    "name": dflt.get('name', 'Unknown'),
                    "department": dflt.get('department', 'General'),
                    "created_at": datetime.now().isoformat(),
                    "last_sent": None,
                    "email_count": 0,
                    "active": True,
                    "preferences": {}
                })
                added = True
        if added:
            self._save_recipients()
    
    def _save_recipients(self):
        """Save recipients to JSON file"""
        with open(self.file_path, 'w') as f:
            json.dump(self.recipients, f, indent=2)
    
    def add_recipient(self, email: str, name: str = None, department: str = None) -> Dict:
        """Add a new recipient"""
        # Check if email already exists
        for recipient in self.recipients:
            if recipient['email'] == email:
                return {"success": False, "message": "Email already exists"}
        
        new_recipient = {
            "id": len(self.recipients) + 1,
            "email": email,
            "name": name or "Unknown",
            "department": department or "General",
            "created_at": datetime.now().isoformat(),
            "last_sent": None,
            "email_count": 0,
            "active": True,
            "preferences": {}
        }
        
        self.recipients.append(new_recipient)
        self._save_recipients()
        
        return {"success": True, "message": "Recipient added successfully", "recipient": new_recipient}
    
    def get_all_recipients(self) -> List[Dict]:
        """Get all recipients"""
        return self.recipients
    
    def get_active_recipients(self) -> List[Dict]:
        """Get only active recipients"""
        return [r for r in self.recipients if r.get('active', True)]
    
    def get_active_emails(self) -> List[str]:
        """Get list of active recipient emails"""
        return [r['email'] for r in self.recipients if r.get('active', True)]
    
    def delete_recipient(self, email: str) -> Dict:
        """Delete a recipient (soft delete)"""
        for recipient in self.recipients:
            if recipient['email'] == email:
                recipient['active'] = False
                self._save_recipients()
                return {"success": True, "message": "Recipient deleted successfully"}
        
        return {"success": False, "message": "Recipient not found"}
    
    def update_recipient(self, email: str, name: str = None, department: str = None) -> Dict:
        """Update recipient information"""
        for recipient in self.recipients:
            if recipient['email'] == email:
                if name:
                    recipient['name'] = name
                if department:
                    recipient['department'] = department
                self._save_recipients()
                return {"success": True, "message": "Recipient updated successfully", "recipient": recipient}
        
        return {"success": False, "message": "Recipient not found"}
    
    def record_email_sent(self, email: str):
        """Record that an email was sent to this recipient"""
        for recipient in self.recipients:
            if recipient['email'] == email:
                recipient['email_count'] = recipient.get('email_count', 0) + 1
                recipient['last_sent'] = datetime.now().isoformat()
                self._save_recipients()
                break
    
    def get_stats(self) -> Dict:
        """Get recipient statistics"""
        total = len(self.recipients)
        active = len([r for r in self.recipients if r.get('active', True)])
        inactive = total - active
        
        # Get most active recipients (top 5 by email count)
        most_active = sorted(
            [r for r in self.recipients if r.get('active', True)],
            key=lambda x: x.get('email_count', 0),
            reverse=True
        )[:5]
        
        return {
            "total_recipients": total,
            "active_recipients": active,
            "inactive_recipients": inactive,
            "most_active": most_active
        }

# Global instance
recipients_storage = RecipientsStorage() 