#!/usr/bin/env python3
"""
Email Service for Danier Stock Alert System
Handles sending personalized stock alert emails
"""

import os
import smtplib
import ssl
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Dict
import json

class EmailService:
    def __init__(self):
        # Use environment variables for configuration
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER', 'danieralertsystem@gmail.com')
        self.smtp_pass = os.getenv('SMTP_PASS', 'Danieralertsystem2018')
        self.email_from = os.getenv('EMAIL_FROM', 'Danier Stock Alerts <danieralertsystem@gmail.com>')
        
        # Create emails directory if it doesn't exist
        self.emails_dir = "emails"
        if not os.path.exists(self.emails_dir):
            os.makedirs(self.emails_dir)

    def create_personalized_alert_email(self, low_stock_items: List[Dict], 
                                      recipient_name: str = None, 
                                      item_name: str = None) -> str:
        """Create personalized HTML email content"""
        
        # Create a beautiful HTML email
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Danier Stock Alert</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }}
                .container {{
                    background-color: white;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    text-align: center;
                    border-bottom: 3px solid #e74c3c;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }}
                .logo {{
                    font-size: 28px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 10px;
                }}
                .alert-icon {{
                    font-size: 24px;
                    color: #e74c3c;
                    margin-bottom: 10px;
                }}
                .greeting {{
                    font-size: 18px;
                    margin-bottom: 20px;
                    color: #2c3e50;
                }}
                .item-name {{
                    background-color: #e74c3c;
                    color: white;
                    padding: 10px 15px;
                    border-radius: 5px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    text-align: center;
                }}
                .table-container {{
                    margin: 20px 0;
                }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    background-color: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }}
                th {{
                    background-color: #34495e;
                    color: white;
                    padding: 15px;
                    text-align: left;
                    font-weight: bold;
                }}
                td {{
                    padding: 12px 15px;
                    border-bottom: 1px solid #ecf0f1;
                }}
                tr:nth-child(even) {{
                    background-color: #f8f9fa;
                }}
                .low-stock {{
                    color: #e74c3c;
                    font-weight: bold;
                }}
                .footer {{
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ecf0f1;
                    text-align: center;
                    color: #7f8c8d;
                    font-size: 14px;
                }}
                .urgent {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">DANIER STOCK ALERTS</div>
                    <div class="alert-icon">⚠️</div>
                    <h2>Low Stock Alert</h2>
                </div>
                
                <div class="greeting">
                    {'Dear ' + recipient_name + ',' if recipient_name else 'Hello,'}
                </div>
                
                <div class="urgent">
                    <strong>URGENT:</strong> Low stock items detected that require immediate attention.
                    <br><small>Items with stock levels below 10 units need replenishment.</small>
                </div>
                
                {f'<div class="item-name">Item: {item_name}</div>' if item_name else ''}
                
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Color</th>
                                <th>Size</th>
                                <th>Available</th>
                                <th>Required</th>
                                <th>Shortage</th>
                            </tr>
                        </thead>
                        <tbody>
        """
        
        for item in low_stock_items:
            # Extract exact data from the inventory file - handle both data structures
            color = item.get('color', 'N/A')
            size = item.get('size', 'N/A')
            
            # Handle different data structures from key_items_service
            if 'stock_level' in item:
                # Data from get_all_key_items_with_alerts
                available = item.get('stock_level', 0)
                required = item.get('required_threshold', 10)
                shortage = item.get('shortage', max(0, required - available))
            else:
                # Data from process_key_items_inventory
                available = item.get('current_stock', 0)
                required = item.get('required_threshold', 10)
                shortage = item.get('shortage', max(0, required - available))
            
            html_content += f"""
                            <tr>
                                <td>{color}</td>
                                <td>{size}</td>
                                <td class="low-stock">{available}</td>
                                <td>{required}</td>
                                <td class="low-stock">{shortage}</td>
                            </tr>
            """
        
        html_content += """
                        </tbody>
                    </table>
                </div>
                
                <div class="footer">
                    <p><strong>Danier Stock Alert System</strong></p>
                    <p>This is an automated alert. Please take immediate action to replenish stock.</p>
                    <p>Generated on: """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html_content

    def send_personalized_alert(self, recipients: List[str], low_stock_items: List[Dict], 
                               recipient_names: Dict[str, str] = None, 
                               item_name: str = None) -> Dict:
        """Send personalized alert email to recipients"""
        if not recipients:
            return {"success": False, "message": "No recipients provided"}
        
        try:
            # Create personalized HTML content
            html_content = self.create_personalized_alert_email(
                low_stock_items, 
                recipient_names.get(recipients[0]) if recipient_names else None,
                item_name
            )
            
            # Personalize subject
            if item_name:
                subject = f"⚠️ Low Stock Alert - {item_name} - Danier Inventory"
            else:
                subject = f"⚠️ Low Stock Alert - Danier Inventory - {datetime.now().strftime('%Y-%m-%d')}"
            
            # Try to send real email using Gmail SMTP
            sent_count = 0
            email_files = []
            
            for recipient in recipients:
                recipient_name = recipient_names.get(recipient, recipient) if recipient_names else recipient
                
                # Try to send real email
                email_sent = self._send_real_gmail_email(recipient, subject, html_content, recipient_name)
                
                if email_sent:
                    sent_count += 1
                    print(f"✅ REAL EMAIL SENT to: {recipient}")
                else:
                    print(f"❌ Failed to send real email to: {recipient}")
                
                # Create backup email file
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                email_filename = f"email_alert_{item_name or 'GENERAL'}_{timestamp}_{recipient.replace('@', '_at_')}.html"
                email_filepath = os.path.join(self.emails_dir, email_filename)
                
                # Save email content to file
                with open(email_filepath, 'w', encoding='utf-8') as f:
                    f.write(html_content)
                
                email_files.append(email_filepath)
                
                # Update recipient stats
                self._update_recipient_stats(recipient)
            
            # Return proper format for frontend
            return {
                "success": True,
                "message": f"Email alert sent to {sent_count} recipients (Real emails: {sent_count}/{len(recipients)})",
                "recipients": recipients,
                "email_files": email_files,
                "item_name": item_name,
                "items_count": len(low_stock_items),
                "real_emails_sent": sent_count,
                "total_recipients": len(recipients),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False, 
                "message": f"Failed to send email: {str(e)}",
                "error": str(e)
            }

    def _send_real_gmail_email(self, recipient: str, subject: str, html_content: str, recipient_name: str = None) -> bool:
        """Send real email using Gmail SMTP with proper FROM address"""
        try:
            # Create message with proper FROM address
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = "Danier Stock Alerts <danieralertsystem@gmail.com>"
            msg['To'] = recipient
            
            # Add HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Try Gmail SMTP with your credentials
            smtp_user = "danieralertsystem@gmail.com"
            smtp_pass = "pojc nsir pjaw hhbq"
            
            # Try different ports
            for port in [587, 465]:
                try:
                    if port == 465:
                        server = smtplib.SMTP_SSL('smtp.gmail.com', port, timeout=5)
                    else:
                        server = smtplib.SMTP('smtp.gmail.com', port, timeout=5)
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
            print(f"❌ Gmail email error: {str(e)}")
            return False

    def _send_real_email(self, recipient: str, subject: str, html_content: str, recipient_name: str = None) -> bool:
        """Send real email via SMTP"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.email_from
            msg['To'] = recipient
            
            # Add HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Try different SMTP configurations
            smtp_configs = [
                # Gmail with current password
                {
                    'host': 'smtp.gmail.com',
                    'port': 587,
                    'user': self.smtp_user,
                    'pass': self.smtp_pass,
                    'use_tls': True
                },
                # Gmail with SSL
                {
                    'host': 'smtp.gmail.com',
                    'port': 465,
                    'user': self.smtp_user,
                    'pass': self.smtp_pass,
                    'use_ssl': True
                },
                # Try without authentication (for testing)
                {
                    'host': 'localhost',
                    'port': 25,
                    'user': None,
                    'pass': None,
                    'use_tls': False
                }
            ]
            
            for config in smtp_configs:
                try:
                    if config.get('use_ssl'):
                        server = smtplib.SMTP_SSL(config['host'], config['port'])
                    else:
                        server = smtplib.SMTP(config['host'], config['port'])
                        if config.get('use_tls'):
                            server.starttls()
                    
                    if config['user'] and config['pass']:
                        server.login(config['user'], config['pass'])
                    
                    server.send_message(msg)
                    server.quit()
                    return True
                    
                except Exception as e:
                    print(f"SMTP config failed: {config['host']}:{config['port']} - {str(e)}")
                    continue
            
            # If all SMTP configs fail, try using a simple mail command
            return self._send_via_mail_command(recipient, subject, html_content)
            
        except Exception as e:
            print(f"Error sending real email: {str(e)}")
            return False

    def _send_via_mail_command(self, recipient: str, subject: str, html_content: str) -> bool:
        """Send email using system mail command as fallback"""
        try:
            import subprocess
            
            # Create a simple text version
            text_content = f"""
Danier Stock Alert

{subject}

This is an automated stock alert from the Danier Stock Alert System.

Please check the attached HTML file for detailed information.

Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
            """
            
            # Save HTML to temporary file
            temp_html = f"/tmp/danier_alert_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            with open(temp_html, 'w') as f:
                f.write(html_content)
            
            # Try to send using mail command
            cmd = f'echo "{text_content}" | mail -s "{subject}" -a {temp_html} {recipient}'
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            
            # Clean up temp file
            try:
                os.remove(temp_html)
            except:
                pass
            
            return result.returncode == 0
            
        except Exception as e:
            print(f"Mail command failed: {str(e)}")
            return False

    def _update_recipient_stats(self, email: str):
        """Update recipient statistics"""
        try:
            # Load recipients data
            recipients_file = "recipients.json"
            if os.path.exists(recipients_file):
                with open(recipients_file, 'r') as f:
                    recipients_data = json.load(f)
                
                # Update the specific recipient
                for recipient in recipients_data:
                    if recipient.get('email') == email:
                        recipient['email_count'] = recipient.get('email_count', 0) + 1
                        recipient['last_sent'] = datetime.now().isoformat()
                        break
                
                # Save updated data
                with open(recipients_file, 'w') as f:
                    json.dump(recipients_data, f, indent=2)
        except Exception as e:
            print(f"Error updating recipient stats: {e}")

    def get_email_status(self) -> Dict:
        """Get email service status"""
        return {
            "smtp_configured": bool(self.smtp_user and self.smtp_pass),
            "smtp_host": self.smtp_host,
            "smtp_port": self.smtp_port,
            "smtp_user": self.smtp_user,
            "emails_directory": self.emails_dir,
            "status": "operational"
        } 