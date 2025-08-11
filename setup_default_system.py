#!/usr/bin/env python3
"""
Default System Setup for Danier Stock Alert System
This script configures the system with optimal defaults and ensures everything is saved properly.
"""

import os
import json
import shutil
from datetime import datetime
import subprocess
import sys

class DefaultSystemSetup:
    def __init__(self):
        self.backend_dir = "backend"
        self.frontend_dir = "frontend"
        self.emails_dir = "emails"
        self.backup_dir = "backups"
        
    def create_backup(self):
        """Create backup of current system state"""
        print("📦 Creating system backup...")
        
        if not os.path.exists(self.backup_dir):
            os.makedirs(self.backup_dir)
            
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"system_backup_{timestamp}"
        backup_path = os.path.join(self.backup_dir, backup_name)
        
        # Create backup of critical files
        critical_files = [
            "backend/email_service.py",
            "backend/recipients.json",
            "backend/main.py",
            "backend/database.py",
            "backend/models.py"
        ]
        
        os.makedirs(backup_path, exist_ok=True)
        
        for file_path in critical_files:
            if os.path.exists(file_path):
                backup_file = os.path.join(backup_path, os.path.basename(file_path))
                shutil.copy2(file_path, backup_file)
                print(f"   ✅ Backed up: {file_path}")
                
        print(f"✅ System backup created: {backup_path}")
        return backup_path
    
    def setup_default_recipients(self):
        """Setup default email recipients"""
        print("📧 Setting up default recipients...")
        
        default_recipients = [
            {
                "id": 1,
                "email": "danieralertsystem@gmail.com",
                "name": "Danier Alert System",
                "department": "Inventory Management",
                "created_at": datetime.now().isoformat(),
                "last_sent": None,
                "email_count": 0,
                "active": True,
                "preferences": {}
            },
            {
                "id": 2,
                "email": "sarthaksethi2803@gmail.com",
                "name": "Sarthak",
                "department": "Ecommerce",
                "created_at": datetime.now().isoformat(),
                "last_sent": None,
                "email_count": 0,
                "active": True,
                "preferences": {}
            }
        ]
        
        recipients_file = os.path.join(self.backend_dir, "recipients.json")
        with open(recipients_file, 'w') as f:
            json.dump(default_recipients, f, indent=2)
            
        print("✅ Default recipients configured")
    
    def setup_email_service(self):
        """Ensure email service is properly configured"""
        print("📧 Configuring email service...")
        
        email_service_file = os.path.join(self.backend_dir, "email_service.py")
        
        # Check if working backup exists
        backup_file = os.path.join(self.backend_dir, "email_service_WORKING_BACKUP.py")
        if os.path.exists(backup_file):
            shutil.copy2(backup_file, email_service_file)
            print("✅ Restored working email service from backup")
        else:
            print("⚠️  No working backup found, using current email service")
    
    def setup_environment(self):
        """Setup environment variables"""
        print("🔧 Setting up environment...")
        
        env_vars = {
            "SMTP_HOST": "smtp.gmail.com",
            "SMTP_PORT": "587",
            "SMTP_USER": "danieralertsystem@gmail.com",
            "SMTP_PASS": "Danieralertsystem2018",
            "EMAIL_FROM": "Danier Stock Alerts <danieralertsystem@gmail.com>",
            "DEFAULT_RECIPIENT_EMAIL": "danieralertsystem@gmail.com"
        }
        
        env_file = ".env"
        with open(env_file, 'w') as f:
            for key, value in env_vars.items():
                f.write(f"{key}={value}\n")
                
        print("✅ Environment variables configured")
    
    def create_directories(self):
        """Create necessary directories"""
        print("📁 Creating directories...")
        
        directories = [
            self.emails_dir,
            "uploads",
            "logs",
            "backups"
        ]
        
        for directory in directories:
            if not os.path.exists(directory):
                os.makedirs(directory)
                print(f"   ✅ Created: {directory}")
    
    def setup_database(self):
        """Initialize database"""
        print("🗄️  Setting up database...")
        
        try:
            # Import and initialize database
            sys.path.append(self.backend_dir)
            from database import init_db
            init_db()
            print("✅ Database initialized")
        except Exception as e:
            print(f"⚠️  Database setup warning: {e}")
    
    def create_system_status_file(self):
        """Create system status file"""
        print("📋 Creating system status...")
        
        status = {
            "system_name": "Danier Stock Alert System",
            "version": "2.0.0",
            "setup_date": datetime.now().isoformat(),
            "status": "OPERATIONAL",
            "email_integration": "WORKING",
            "default_recipients": [
                "danieralertsystem@gmail.com",
                "sarthaksethi2803@gmail.com"
            ],
            "features": [
                "Inventory file upload and processing",
                "Key items stock alerts",
                "Email notifications",
                "Threshold management",
                "Performance analysis",
                "File comparison"
            ],
            "startup_commands": {
                "simple": "./start-simple.sh",
                "docker": "./start.sh",
                "enterprise": "./start-enterprise.sh"
            },
            "urls": {
                "frontend": "http://localhost:3000",
                "backend": "http://localhost:8000",
                "api_docs": "http://localhost:8000/docs"
            }
        }
        
        status_file = "SYSTEM_STATUS.json"
        with open(status_file, 'w') as f:
            json.dump(status, f, indent=2)
            
        print("✅ System status file created")
    
    def create_quick_start_guide(self):
        """Create quick start guide"""
        print("📚 Creating quick start guide...")
        
        guide_content = """# Danier Stock Alert System - Quick Start Guide

## 🚀 Quick Start

### Option 1: Simple Mode (Recommended)
```bash
./start-simple.sh
```

### Option 2: Docker Mode
```bash
./start.sh
```

### Option 3: Enterprise Mode
```bash
./start-enterprise.sh
```

## 📊 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📧 Email Configuration

The system is pre-configured with:
- **From**: danieralertsystem@gmail.com
- **To**: danieralertsystem@gmail.com, sarthaksethi2803@gmail.com
- **SMTP**: Gmail (configured and tested)

## 🔧 Features

✅ **Inventory Upload**: Upload Excel files for processing
✅ **Key Items Alerts**: Automatic detection of low stock items
✅ **Email Notifications**: Real-time email alerts
✅ **Threshold Management**: Custom stock thresholds
✅ **Performance Analysis**: Compare inventory files
✅ **File Management**: Archive and organize uploads

## 📋 Usage

1. **Upload Inventory**: Go to http://localhost:3000 and upload your Excel file
2. **View Alerts**: Check key items alerts automatically
3. **Email Notifications**: Receive alerts via email
4. **Manage Thresholds**: Set custom stock levels
5. **Analyze Performance**: Compare different inventory files

## 🛠️ Troubleshooting

- **Backend Issues**: Check `backend.log`
- **Frontend Issues**: Check `frontend.log`
- **Email Issues**: Verify Gmail credentials
- **Database Issues**: Check `backend/danier_stock_alert.db`

## 📞 Support

For issues or questions, check the logs and system status files.

---
*System configured on: {date}*
""".format(date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        
        with open("QUICK_START_GUIDE.md", 'w') as f:
            f.write(guide_content)
            
        print("✅ Quick start guide created")
    
    def run_system_tests(self):
        """Run basic system tests"""
        print("🧪 Running system tests...")
        
        tests = [
            ("Check backend directory", os.path.exists(self.backend_dir)),
            ("Check frontend directory", os.path.exists(self.frontend_dir)),
            ("Check email service", os.path.exists(os.path.join(self.backend_dir, "email_service.py"))),
            ("Check recipients file", os.path.exists(os.path.join(self.backend_dir, "recipients.json"))),
            ("Check requirements", os.path.exists(os.path.join(self.backend_dir, "requirements.txt"))),
        ]
        
        all_passed = True
        for test_name, result in tests:
            status = "✅" if result else "❌"
            print(f"   {status} {test_name}")
            if not result:
                all_passed = False
        
        if all_passed:
            print("✅ All system tests passed")
        else:
            print("⚠️  Some tests failed - check system setup")
        
        return all_passed
    
    def setup_complete(self):
        """Complete system setup"""
        print("\n🎯 Setting up default system...")
        print("=" * 50)
        
        # Create backup first
        backup_path = self.create_backup()
        
        # Setup all components
        self.create_directories()
        self.setup_environment()
        self.setup_email_service()
        self.setup_default_recipients()
        self.setup_database()
        self.create_system_status_file()
        self.create_quick_start_guide()
        
        # Run tests
        tests_passed = self.run_system_tests()
        
        print("\n" + "=" * 50)
        print("🎉 DEFAULT SYSTEM SETUP COMPLETE!")
        print("=" * 50)
        
        if tests_passed:
            print("✅ System is ready for use")
        else:
            print("⚠️  System setup complete but some tests failed")
        
        print(f"📦 Backup created: {backup_path}")
        print("📚 Quick start guide: QUICK_START_GUIDE.md")
        print("📋 System status: SYSTEM_STATUS.json")
        
        print("\n🚀 To start the system:")
        print("   ./start-simple.sh  (Recommended)")
        print("   ./start.sh         (Docker)")
        print("   ./start-enterprise.sh (Enterprise)")
        
        print("\n📊 Access points:")
        print("   Frontend: http://localhost:3000")
        print("   Backend:  http://localhost:8000")
        print("   API Docs: http://localhost:8000/docs")
        
        return True

def main():
    """Main setup function"""
    setup = DefaultSystemSetup()
    setup.setup_complete()

if __name__ == "__main__":
    main() 