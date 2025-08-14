# ⚡ QUICK EMAIL FIX - 2 MINUTES!

## Current Status:
✅ System is starting up
✅ FROM: danieralertsystem@gmail.com  
✅ TO: Your recipients
❌ Need Gmail App Password

## SUPER FAST FIX:

### 1. Get Gmail App Password (1 minute)
- Go to: https://myaccount.google.com/apppasswords
- Sign in to `danieralertsystem@gmail.com`  
- Create new app password for "Danier Stock Alerts"
- Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)

### 2. Update System (30 seconds)
Replace line 286 in `backend/email_service.py`:
```python
# CHANGE THIS:
smtp_pass = "your_gmail_app_password_here"

# TO YOUR APP PASSWORD:
smtp_pass = "abcd efgh ijkl mnop"  # Your actual app password
```

### 3. Test (30 seconds)
```bash
python test_email_integration.py
```

## Done! 
Emails will now send FROM `danieralertsystem@gmail.com` to your recipients!

## Access Your System:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs 