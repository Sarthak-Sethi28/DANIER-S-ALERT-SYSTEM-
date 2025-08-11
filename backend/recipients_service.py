from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from models import Recipient
from datetime import datetime
import json

class RecipientsService:
    def __init__(self):
        pass
    
    def get_all_recipients(self, db: Session) -> List[Dict]:
        """Get all active recipients"""
        recipients = db.query(Recipient).filter(Recipient.is_active == True).all()
        return [
            {
                "id": r.id,
                "email": r.email,
                "name": r.name,
                "department": r.department,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "last_sent": r.last_sent.isoformat() if r.last_sent else None,
                "email_count": r.email_count,
                "preferences": json.loads(r.preferences) if r.preferences else {}
            }
            for r in recipients
        ]
    
    def add_recipient(self, db: Session, email: str, name: str = None, department: str = None) -> Dict:
        """Add a new recipient"""
        # Check if email already exists
        existing = db.query(Recipient).filter(Recipient.email == email).first()
        if existing:
            if existing.is_active:
                return {"success": False, "message": "Email already exists"}
            else:
                # Reactivate existing recipient
                existing.is_active = True
                existing.name = name or existing.name
                existing.department = department or existing.department
                db.commit()
                return {"success": True, "message": "Recipient reactivated", "recipient": {
                    "id": existing.id,
                    "email": existing.email,
                    "name": existing.name,
                    "department": existing.department
                }}
        
        # Create new recipient
        recipient = Recipient(
            email=email,
            name=name,
            department=department,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        db.add(recipient)
        db.commit()
        db.refresh(recipient)
        
        return {"success": True, "message": "Recipient added successfully", "recipient": {
            "id": recipient.id,
            "email": recipient.email,
            "name": recipient.name,
            "department": recipient.department
        }}
    
    def delete_recipient(self, db: Session, email: str) -> Dict:
        """Soft delete a recipient (mark as inactive)"""
        recipient = db.query(Recipient).filter(Recipient.email == email).first()
        if not recipient:
            return {"success": False, "message": "Recipient not found"}
        
        recipient.is_active = False
        db.commit()
        
        return {"success": True, "message": "Recipient deleted successfully"}
    
    def update_recipient(self, db: Session, email: str, name: str = None, department: str = None) -> Dict:
        """Update recipient information"""
        recipient = db.query(Recipient).filter(Recipient.email == email).first()
        if not recipient:
            return {"success": False, "message": "Recipient not found"}
        
        if name:
            recipient.name = name
        if department:
            recipient.department = department
        
        db.commit()
        
        return {"success": True, "message": "Recipient updated successfully"}
    
    def get_active_emails(self, db: Session) -> List[str]:
        """Get list of active recipient emails"""
        recipients = db.query(Recipient).filter(Recipient.is_active == True).all()
        return [r.email for r in recipients]
    
    def record_email_sent(self, db: Session, email: str) -> None:
        """Record that an email was sent to a recipient"""
        recipient = db.query(Recipient).filter(Recipient.email == email).first()
        if recipient:
            recipient.last_sent = datetime.utcnow()
            recipient.email_count += 1
            db.commit()
    
    def get_recipient_stats(self, db: Session) -> Dict:
        """Get recipient statistics"""
        total = db.query(Recipient).count()
        active = db.query(Recipient).filter(Recipient.is_active == True).count()
        inactive = total - active
        
        # Get most active recipients
        most_active = db.query(Recipient).filter(Recipient.is_active == True).order_by(Recipient.email_count.desc()).limit(5).all()
        
        return {
            "total_recipients": total,
            "active_recipients": active,
            "inactive_recipients": inactive,
            "most_active": [
                {"email": r.email, "name": r.name, "email_count": r.email_count}
                for r in most_active
            ]
        } 