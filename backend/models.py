from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class UploadedFile(Base):
    __tablename__ = "uploaded_files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    total_items = Column(Integer, default=0)
    low_stock_count = Column(Integer, default=0)

class Recipient(Base):
    __tablename__ = "recipients"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)
    department = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_sent = Column(DateTime, nullable=True)
    email_count = Column(Integer, default=0)
    preferences = Column(Text, nullable=True)  # JSON string for email preferences

# New: Persistent thresholds
class ThresholdOverride(Base):
    __tablename__ = "threshold_overrides"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True, nullable=False)
    size = Column(String, index=True, nullable=False)
    color = Column(String, index=True, nullable=False)
    threshold = Column(Integer, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ThresholdHistory(Base):
    __tablename__ = "threshold_history"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True, nullable=False)
    size = Column(String, index=True, nullable=False)
    color = Column(String, index=True, nullable=False)
    old_threshold = Column(Integer, nullable=True)
    new_threshold = Column(Integer, nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow)
    note = Column(Text, nullable=True)

# New: Single app user credential storage
class UserCredential(Base):
    __tablename__ = "user_credentials"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    password_salt = Column(String, nullable=False)
    email = Column(String, nullable=True)
    reset_code_hash = Column(String, nullable=True)
    reset_code_expires_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

 