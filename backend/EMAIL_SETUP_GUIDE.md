# 📧 Email Setup Guide for Danier Stock Alert System

## 🎯 Overview
This guide will help you configure real email functionality for the Danier Stock Alert System.

## 📋 Prerequisites
- Gmail account (recommended for reliability)
- 2-Factor Authentication enabled on your Gmail account
- App Password generated for the application

## 🔧 Step-by-Step Setup

### 1. Enable 2-Factor Authentication on Gmail
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification
4. This is required to generate App Passwords

### 2. Generate App Password
1. Go to Google Account settings
2. Navigate to Security → 2-Step Verification
3. Click on "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Name it "Danier Stock Alert"
6. Copy the generated 16-character password

### 3. Configure Environment Variables
Edit the `.env` file in the backend directory:

```bash
# Database Configuration
DATABASE_URL=sqlite:///./danier_stock_alert.db

# SMTP Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=your-16-character-app-password
EMAIL_FROM=Danier Stock Alerts <your-actual-email@gmail.com>

# Application Settings
THRESHOLD=10
```

### 4. Update Recipients
In `main.py`, update the recipients list:
```python
recipients = ["your-email@gmail.com", "manager@danier.ca", "inventory@danier.ca"]
```

## 🧪 Testing the Setup

### Test Email Configuration
```bash
curl -X GET http://localhost:8000/email/status
```

### Test Email Sending
```bash
curl -X POST http://localhost:8000/email/send-item-alert/ALVARO
```

## 🔒 Security Best Practices

1. **Never commit .env file to version control**
2. **Use App Passwords, not your main password**
3. **Regularly rotate App Passwords**
4. **Use dedicated email for alerts**

## 📧 Email Format
The system will send emails in this format:
```
Hi [Recipient Name],

[ITEM_NAME]

Colour      Size   Current   Required   Shortage
[color]     [size] [current] [required] [shortage]

Generated on: [Date and Time]
```

## 🚨 Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Check if 2FA is enabled
   - Verify App Password is correct
   - Ensure SMTP_USER matches your Gmail

2. **Connection Refused**
   - Check firewall settings
   - Verify SMTP_HOST and SMTP_PORT
   - Try different port (465 for SSL)

3. **Email Not Received**
   - Check spam folder
   - Verify recipient email address
   - Check Gmail sending limits

## 📞 Support
If you encounter issues:
1. Check the backend logs
2. Verify all environment variables
3. Test with a simple email client first

## 🔄 Alternative Email Providers

### Outlook/Hotmail
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo
```
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP Server
```
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
``` 