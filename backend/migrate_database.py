#!/usr/bin/env python3
"""
Database migration script for Danier Stock Alert System
This script handles database schema updates and data migration
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import Base
from database import engine, get_db

load_dotenv()

def migrate_database():
    """Run database migrations"""
    print("🔄 Starting database migration...")
    
    try:
        # Create all tables (this will create new tables if they don't exist)
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/updated successfully")
        
        # Check if uploaded_files table exists
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='uploaded_files'
            """))
            table_exists = result.fetchone() is not None
            
            if table_exists:
                print("✅ uploaded_files table exists")
            else:
                print("❌ uploaded_files table not found - creating...")
                Base.metadata.create_all(bind=engine)
        
        # Create uploads directory if it doesn't exist (use env var)
        uploads_dir = os.getenv("UPLOAD_DIR", "uploads")
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
            print(f"✅ Created uploads directory: {uploads_dir}")
        else:
            print(f"✅ Uploads directory already exists: {uploads_dir}")
        
        print("🎉 Database migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Database migration failed: {str(e)}")
        sys.exit(1)

def check_database_status():
    """Check the current status of the database"""
    print("🔍 Checking database status...")
    
    try:
        with engine.connect() as conn:
            # Check all tables
            result = conn.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table'
                ORDER BY name
            """))
            tables = [row[0] for row in result.fetchall()]
            
            print("📋 Database tables:")
            for table in tables:
                print(f"   - {table}")
            
            # Check uploaded_files table structure
            if 'uploaded_files' in tables:
                result = conn.execute(text("PRAGMA table_info(uploaded_files)"))
                columns = result.fetchall()
                print("\n📊 uploaded_files table columns:")
                for col in columns:
                    print(f"   - {col[1]} ({col[2]})")
            
            # Check upload_logs table structure
            if 'upload_logs' in tables:
                result = conn.execute(text("PRAGMA table_info(upload_logs)"))
                columns = result.fetchall()
                print("\n📊 upload_logs table columns:")
                for col in columns:
                    print(f"   - {col[1]} ({col[2]})")
        
        print("\n✅ Database status check completed!")
        
    except Exception as e:
        print(f"❌ Database status check failed: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "status":
        check_database_status()
    else:
        migrate_database() 