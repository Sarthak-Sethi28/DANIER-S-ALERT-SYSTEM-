# Railway Backend Deployment Guide

## Prerequisites
- Railway account (you have this ✅)
- Git repository ready

## Step 1: Prepare for Deployment

The backend is now ready for Railway deployment with:
- ✅ `railway.json` - Deployment configuration
- ✅ `Procfile` - Startup command
- ✅ `runtime.txt` - Python version
- ✅ `.gitignore` - Exclude unnecessary files
- ✅ CORS configured for any frontend domain

## Step 2: Deploy to Railway

### Option A: Deploy via Railway CLI (Recommended)

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Navigate to backend directory**:
   ```bash
   cd danier-stock-alert/backend
   ```

4. **Initialize Railway project**:
   ```bash
   railway init
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

### Option B: Deploy via Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Set root directory to `danier-stock-alert/backend`
6. Deploy

## Step 3: Configure Environment Variables

In Railway dashboard, add these environment variables:

```
DEFAULT_RECIPIENT_EMAIL=your-default-email@domain.com
```

## Step 4: Get Your Backend URL

After deployment, Railway will provide a URL like:
`https://your-app-name.railway.app`

## Step 5: Test the Deployment

Test your backend is working:
```bash
curl https://your-app-name.railway.app/health
```

## Next Steps

1. ✅ Backend deployed and tested
2. 🔄 Buy custom domain
3. 🔄 Configure custom domain in Railway
4. 🔄 Deploy frontend and update API URL
5. 🔄 Set up Google Sign-In

## Important Notes

- **Persistent Storage**: Railway will maintain your database, uploads, and emails
- **Auto-restart**: Railway will restart the app if it crashes
- **Scaling**: Can be scaled up/down as needed
- **Custom Domain**: Can be added after deployment

## Troubleshooting

If deployment fails:
1. Check Railway logs in dashboard
2. Ensure all files are committed to Git
3. Verify Python version in `runtime.txt`
4. Check `requirements.txt` exists and is valid 