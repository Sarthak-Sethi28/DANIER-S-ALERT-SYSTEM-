#!/usr/bin/env python3
"""
Setup script to add default recipient email for Danier Stock Alert System
"""

import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Recipient
import os

def setup_default_recipient():
    """Add default recipient if not exists"""
    
    # Database setup
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./danier_stock_alert.db")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if default recipient exists
        default_email = "s36sethi@uwaterloo.ca"
        existing = db.query(Recipient).filter(Recipient.email == default_email).first()
        
        if not existing:
            # Add default recipient
            recipient = Recipient(
                email=default_email,
                name="Sarthak Sethi",
                is_active=True
            )
            db.add(recipient)
            db.commit()
            print(f"✅ Added default recipient: {default_email}")
        else:
            # Make sure it's active
            if not existing.is_active:
                existing.is_active = True
                db.commit()
                print(f"✅ Reactivated recipient: {default_email}")
            else:
                print(f"✅ Default recipient already exists: {default_email}")
    
    except Exception as e:
        print(f"❌ Error setting up default recipient: {e}")
        db.rollback()
    
    finally:
        db.close()

if __name__ == "__main__":
    setup_default_recipient() 