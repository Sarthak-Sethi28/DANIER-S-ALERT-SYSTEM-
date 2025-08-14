# Gmail App Password Setup for Danier Stock Alert System

## Current Status
✅ Email is correctly configured to send FROM: `danieralertsystem@gmail.com`
✅ Recipients are properly configured
❌ Gmail authentication failing - need App Password

## Steps to Fix Gmail Authentication:

### 1. Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Sign in to `danieralertsystem@gmail.com`
3. Under "Signing in to Google", enable **2-Step Verification**

### 2. Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Sign in to `danieralertsystem@gmail.com`
3. Select app: **Mail**
4. Select device: **Other (Custom name)**
5. Enter name: **Danier Stock Alert System**
6. Click **Generate**
7. **COPY THE 16-CHARACTER PASSWORD** (example: `abcd efgh ijkl mnop`)

### 3. Update the System
Once you have the App Password, run this command:

```bash
cd "danier-stock-alert"
source ../danier_env/bin/activate
python -c "
import os
print('Current password in code:', repr('Danieralertsystem2018'))
print('Replace it with your new App Password')
"
```

### 4. Update Email Service
Edit `backend/email_service.py` line 286:
```python
# CHANGE THIS LINE:
smtp_pass = "Danieralertsystem2018"

# TO YOUR NEW APP PASSWORD:
smtp_pass = "your_16_character_app_password_here"
```

### 5. Test the Fix
Run the test again:
```bash
python test_email_integration.py
```

## Security Notes
- App Passwords are specific to applications and more secure
- Regular Gmail passwords don't work for SMTP anymore
- Keep your App Password secure and don't share it

## Alternative: Environment Variable (Recommended)
Create a `.env` file in the backend directory:
```
SMTP_PASS=your_16_character_app_password_here
```

Then the system will automatically use it instead of the hardcoded password. 