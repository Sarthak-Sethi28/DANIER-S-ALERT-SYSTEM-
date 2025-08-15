# Deploy Backend to Render

## Step 1: Create Render Service

1. Go to https://render.com
2. Sign in with your GitHub account
3. Click "New" → "Web Service"
4. Connect your GitHub repository: `DANIER-S-ALERT-SYSTEM-`
5. Use these settings:

**Basic Settings:**
- Name: `danier-alert-system`
- Environment: `Python`
- Build Command: `pip install -r backend/requirements.txt`
- Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1 --timeout-keep-alive 600`

**Environment Variables:**
```
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
DEFAULT_RECIPIENT_EMAIL=alerts@danier.ca
DATABASE_URL=sqlite:////var/data/danier_stock_alert.db
UPLOAD_DIR=/var/data/uploads
```

**Disk:**
- Mount Path: `/var/data`
- Size: 1GB

## Step 2: Get the URL

After deployment, Render will give you a URL like:
`https://danier-alert-system-[hash].onrender.com`

## Step 3: Update Frontend

Update the frontend's `vercel.json` with the correct Render URL.

## Alternative: Use render.yaml

The `render.yaml` file is already configured for auto-deployment. Just push to main branch and Render should pick it up automatically if the service exists. 