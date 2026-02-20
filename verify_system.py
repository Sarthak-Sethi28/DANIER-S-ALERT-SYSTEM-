#!/usr/bin/env python3
"""
System Verification for Danier Stock Alert System
This script verifies that all system components are properly configured and working.
"""

import os
import json
import sys
import subprocess
from datetime import datetime

class SystemVerification:
    def __init__(self):
        self.backend_dir = "backend"
        self.frontend_dir = "frontend"
        self.verification_results = []
        
    def check_file_exists(self, file_path, description):
        """Check if a file exists"""
        exists = os.path.exists(file_path)
        status = "✅" if exists else "❌"
        result = {
            "test": description,
            "file": file_path,
            "status": "PASS" if exists else "FAIL",
            "details": f"File {'exists' if exists else 'missing'}"
        }
        self.verification_results.append(result)
        print(f"   {status} {description}: {file_path}")
        return exists
    
    def check_directory_exists(self, dir_path, description):
        """Check if a directory exists"""
        exists = os.path.exists(dir_path) and os.path.isdir(dir_path)
        status = "✅" if exists else "❌"
        result = {
            "test": description,
            "directory": dir_path,
            "status": "PASS" if exists else "FAIL",
            "details": f"Directory {'exists' if exists else 'missing'}"
        }
        self.verification_results.append(result)
        print(f"   {status} {description}: {dir_path}")
        return exists
    
    def check_recipients_config(self):
        """Check recipients configuration"""
        print("📧 Checking recipients configuration...")
        
        recipients_file = os.path.join(self.backend_dir, "recipients.json")
        if not os.path.exists(recipients_file):
            self.verification_results.append({
                "test": "Recipients Configuration",
                "status": "FAIL",
                "details": "recipients.json file missing"
            })
            print("   ❌ Recipients configuration: Missing recipients.json")
            return False
        
        try:
            with open(recipients_file, 'r') as f:
                recipients = json.load(f)
            
            # Check for required recipients
            required_emails = ["danieralertsystem@gmail.com", "sarthaksethi2803@gmail.com"]
            found_emails = [r.get("email") for r in recipients if r.get("active", False)]
            
            all_found = all(email in found_emails for email in required_emails)
            
            result = {
                "test": "Recipients Configuration",
                "status": "PASS" if all_found else "FAIL",
                "details": f"Found {len(found_emails)} active recipients: {found_emails}"
            }
            self.verification_results.append(result)
            
            status = "✅" if all_found else "❌"
            print(f"   {status} Recipients configuration: {len(found_emails)} active recipients")
            return all_found
            
        except Exception as e:
            self.verification_results.append({
                "test": "Recipients Configuration",
                "status": "FAIL",
                "details": f"Error reading recipients.json: {str(e)}"
            })
            print(f"   ❌ Recipients configuration: Error - {str(e)}")
            return False
    
    def check_email_service(self):
        """Check email service configuration"""
        print("📧 Checking email service...")
        
        email_service_file = os.path.join(self.backend_dir, "email_service.py")
        if not os.path.exists(email_service_file):
            self.verification_results.append({
                "test": "Email Service",
                "status": "FAIL",
                "details": "email_service.py file missing"
            })
            print("   ❌ Email service: Missing email_service.py")
            return False
        
        # Check for working backup
        backup_file = os.path.join(self.backend_dir, "email_service_WORKING_BACKUP.py")
        backup_exists = os.path.exists(backup_file)
        
        result = {
            "test": "Email Service",
            "status": "PASS",
            "details": f"Email service configured, backup {'available' if backup_exists else 'missing'}"
        }
        self.verification_results.append(result)
        
        status = "✅"
        print(f"   {status} Email service: Configured")
        if backup_exists:
            print(f"   ✅ Email service backup: Available")
        
        return True
    
    def check_startup_scripts(self):
        """Check startup scripts"""
        print("🚀 Checking startup scripts...")
        
        scripts = [
            ("start-default.sh", "Default startup script"),
            ("start-simple.sh", "Simple startup script"),
            ("start.sh", "Docker startup script"),
            ("stop-system.sh", "Stop script")
        ]
        
        all_exist = True
        for script, description in scripts:
            exists = os.path.exists(script) and os.access(script, os.X_OK)
            status = "✅" if exists else "❌"
            result = {
                "test": f"Startup Script: {description}",
                "script": script,
                "status": "PASS" if exists else "FAIL",
                "details": f"Script {'exists and executable' if exists else 'missing or not executable'}"
            }
            self.verification_results.append(result)
            print(f"   {status} {description}: {script}")
            if not exists:
                all_exist = False
        
        return all_exist
    
    def check_documentation(self):
        """Check documentation files"""
        print("📚 Checking documentation...")
        
        docs = [
            ("QUICK_START_GUIDE.md", "Quick start guide"),
            ("DEFAULT_SYSTEM_SAVED.md", "System documentation"),
            ("SYSTEM_STATUS.json", "System status file"),
            ("README.md", "Main README")
        ]
        
        all_exist = True
        for doc, description in docs:
            exists = os.path.exists(doc)
            status = "✅" if exists else "❌"
            result = {
                "test": f"Documentation: {description}",
                "file": doc,
                "status": "PASS" if exists else "FAIL",
                "details": f"Documentation {'exists' if exists else 'missing'}"
            }
            self.verification_results.append(result)
            print(f"   {status} {description}: {doc}")
            if not exists:
                all_exist = False
        
        return all_exist
    
    def check_backup_system(self):
        """Check backup system"""
        print("📦 Checking backup system...")
        
        backup_dir = "backups"
        exists = os.path.exists(backup_dir) and os.path.isdir(backup_dir)
        
        if exists:
            # Count backup files
            backup_files = [f for f in os.listdir(backup_dir) if f.startswith("system_backup_")]
            backup_count = len(backup_files)
            
            result = {
                "test": "Backup System",
                "status": "PASS",
                "details": f"Backup directory exists with {backup_count} backups"
            }
            self.verification_results.append(result)
            
            status = "✅"
            print(f"   {status} Backup system: {backup_count} backups available")
        else:
            result = {
                "test": "Backup System",
                "status": "FAIL",
                "details": "Backup directory missing"
            }
            self.verification_results.append(result)
            
            status = "❌"
            print(f"   {status} Backup system: Missing backup directory")
        
        return exists
    
    def run_verification(self):
        """Run complete system verification"""
        print("🔍 Running Danier Stock Alert System Verification")
        print("=" * 60)
        
        # Check core directories
        print("📁 Checking core directories...")
        self.check_directory_exists(self.backend_dir, "Backend directory")
        self.check_directory_exists(self.frontend_dir, "Frontend directory")
        self.check_directory_exists("emails", "Emails directory")
        self.check_directory_exists("uploads", "Uploads directory")
        
        # Check core files
        print("\n📄 Checking core files...")
        self.check_file_exists(os.path.join(self.backend_dir, "main.py"), "Main application")
        self.check_file_exists(os.path.join(self.backend_dir, "requirements.txt"), "Python requirements")
        self.check_file_exists(os.path.join(self.frontend_dir, "package.json"), "Node.js package")
        
        # Check configurations
        print("\n🔧 Checking configurations...")
        self.check_recipients_config()
        self.check_email_service()
        
        # Check startup scripts
        print("\n🚀 Checking startup scripts...")
        self.check_startup_scripts()
        
        # Check documentation
        print("\n📚 Checking documentation...")
        self.check_documentation()
        
        # Check backup system
        print("\n📦 Checking backup system...")
        self.check_backup_system()
        
        # Generate verification report
        self.generate_report()
        
        return self.verification_results
    
    def generate_report(self):
        """Generate verification report"""
        print("\n" + "=" * 60)
        print("📋 VERIFICATION REPORT")
        print("=" * 60)
        
        total_tests = len(self.verification_results)
        passed_tests = sum(1 for r in self.verification_results if r["status"] == "PASS")
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        
        if failed_tests == 0:
            print("\n🎉 ALL TESTS PASSED! System is ready for use.")
        else:
            print(f"\n⚠️  {failed_tests} tests failed. Please check the issues above.")
        
        # Save detailed report
        report = {
            "verification_date": datetime.now().isoformat(),
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "status": "PASS" if failed_tests == 0 else "FAIL",
            "results": self.verification_results
        }
        
        with open("VERIFICATION_REPORT.json", 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📋 Detailed report saved: VERIFICATION_REPORT.json")
        
        # Update system status
        status_text = "VERIFICATION PASSED" if failed_tests == 0 else "VERIFICATION FAILED"
        with open("SYSTEM_STATUS.txt", 'w') as f:
            f.write(f"DANIER STOCK ALERT SYSTEM - {status_text}\n")
            f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Tests: {passed_tests}/{total_tests} passed\n")
            f.write(f"Status: {'✅ READY' if failed_tests == 0 else '❌ NEEDS ATTENTION'}\n")

def main():
    """Main verification function"""
    verifier = SystemVerification()
    verifier.run_verification()

if __name__ == "__main__":
    main() 