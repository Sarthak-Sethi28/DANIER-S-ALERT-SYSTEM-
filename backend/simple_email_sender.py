#!/usr/bin/env python3
"""
Simple Email Sender for Danier Stock Alert System
Uses alternative methods to send emails when SMTP is not available
"""

import os
import smtplib
import ssl
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Dict
import json
import requests

class SimpleEmailSender:
    def __init__(self):
        self.emails_dir = "emails"
        if not os.path.exists(self.emails_dir):
            os.makedirs(self.emails_dir)
    
    def send_email(self, recipients: List[str], subject: str, html_content: str, 
                   recipient_names: Dict[str, str] = None) -> Dict:
        """Send email using multiple fallback methods"""
        
        results = {
            "success": False,
            "message": "",
            "recipients": recipients,
            "methods_tried": [],
            "emails_sent": 0,
            "email_files": []
        }
        
        for recipient in recipients:
            recipient_name = recipient_names.get(recipient, recipient) if recipient_names else recipient
            
            # Method 1: Try Gmail SMTP with different configurations
            if self._try_gmail_smtp(recipient, subject, html_content):
                results["emails_sent"] += 1
                results["methods_tried"].append(f"Gmail SMTP to {recipient}")
                continue
            
            # Method 2: Try using a free email service
            if self._try_free_email_service(recipient, subject, html_content):
                results["emails_sent"] += 1
                results["methods_tried"].append(f"Free email service to {recipient}")
                continue
            
            # Method 3: Create email file and provide instructions
            email_file = self._create_email_file(recipient, subject, html_content, recipient_name)
            results["email_files"].append(email_file)
            results["methods_tried"].append(f"Email file created for {recipient}")
        
        # Create success message
        if results["emails_sent"] > 0:
            results["success"] = True
            results["message"] = f"✅ {results['emails_sent']} real emails sent! {len(results['email_files'])} backup files created."
        else:
            results["message"] = f"📧 {len(results['email_files'])} email files created. Check the 'emails' folder for your alerts."
        
        return results
    
    def _try_gmail_smtp(self, recipient: str, subject: str, html_content: str) -> bool:
        """Try Gmail SMTP with different configurations"""
        try:
            # Try with the current password (might work in some cases)
            smtp_user = "danieralertsystem@gmail.com"
            smtp_pass = "Danieralertsystem2018"
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"Danier Stock Alerts <{smtp_user}>"
            msg['To'] = recipient
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Try different ports
            for port in [587, 465]:
                try:
                    if port == 465:
                        server = smtplib.SMTP_SSL('smtp.gmail.com', port)
                    else:
                        server = smtplib.SMTP('smtp.gmail.com', port)
                        server.starttls()
                    
                    server.login(smtp_user, smtp_pass)
                    server.send_message(msg)
                    server.quit()
                    print(f"✅ Gmail SMTP SUCCESS to {recipient}")
                    return True
                    
                except Exception as e:
                    print(f"❌ Gmail SMTP failed port {port}: {str(e)}")
                    continue
            
            return False
            
        except Exception as e:
            print(f"❌ Gmail SMTP error: {str(e)}")
            return False
    
    def _try_free_email_service(self, recipient: str, subject: str, html_content: str) -> bool:
        """Try using a free email service as fallback"""
        try:
            # This is a placeholder for a free email service
            # In a real implementation, you could use services like:
            # - SendGrid (free tier)
            # - Mailgun (free tier)
            # - AWS SES (free tier)
            
            print(f"📧 Would send via free email service to {recipient}")
            return False
            
        except Exception as e:
            print(f"❌ Free email service error: {str(e)}")
            return False
    
    def _create_email_file(self, recipient: str, subject: str, html_content: str, recipient_name: str) -> str:
        """Create an email file with instructions"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        email_filename = f"email_alert_{timestamp}_{recipient.replace('@', '_at_')}.html"
        email_filepath = os.path.join(self.emails_dir, email_filename)
        
        # Add instructions to the email content
        instructions_html = f"""
        <div style="background-color: #e8f4fd; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #0c5460; margin-top: 0;">📧 Email Delivery Instructions</h3>
            <p style="color: #0c5460; margin-bottom: 10px;"><strong>Recipient:</strong> {recipient}</p>
            <p style="color: #0c5460; margin-bottom: 10px;"><strong>Subject:</strong> {subject}</p>
            <p style="color: #0c5460; margin-bottom: 10px;"><strong>Generated:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
            <p style="color: #0c5460; margin-bottom: 0;"><strong>Status:</strong> Email file created successfully. To send this email:</p>
            <ul style="color: #0c5460; margin-top: 5px;">
                <li>Open this HTML file in your browser</li>
                <li>Copy the content and paste it into your email client</li>
                <li>Send to: {recipient}</li>
                <li>Or forward this file to the recipient</li>
            </ul>
        </div>
        """
        
        # Insert instructions at the top of the email
        full_content = instructions_html + html_content
        
        with open(email_filepath, 'w', encoding='utf-8') as f:
            f.write(full_content)
        
        print(f"📄 Email file created: {email_filepath}")
        return email_filepath 