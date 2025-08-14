# Deployment Guide - Inventory Monitoring System

## Server Stability Fixes Applied

### 1. Health Check Endpoints
- Added `/` and `/health` endpoints that respond immediately
- These endpoints are excluded from the global `/api` prefix
- Render will use these for health checks to prevent restarts

### 2. Database Connection Stability
- Added TypeORM retry configuration:
  - `retryAttempts: 10`
  - `retryDelay: 3000`
  - `keepConnectionAlive: true`
- This prevents crashes when database is temporarily unavailable

### 3. Server Binding
- Server now binds to `0.0.0.0` instead of localhost
- This allows external connections from Render/Vercel

### 4. Fixed Dependencies
- Corrected `@nestjs/mailer` to `@nestjs-modules/mailer`
- Fixed TypeScript import issues with helmet and compression
- Updated throttler configuration to match new API

## Render Deployment

### 1. Create render.yaml
```yaml
services:
  - type: web
    name: inventory-monitoring-backend
    env: node
    plan: free
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_HOST
        sync: false
      - key: DATABASE_PORT
        sync: false
      - key: DATABASE_NAME
        sync: false
      - key: DATABASE_USER
        sync: false
      - key: DATABASE_PASSWORD
        sync: false
      - key: SMTP_HOST
        sync: false
      - key: SMTP_PORT
        sync: false
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASS
        sync: false
```

### 2. Environment Variables to Set in Render Dashboard
- `DATABASE_HOST`: Your PostgreSQL host
- `DATABASE_PORT`: 5432 (default)
- `DATABASE_NAME`: Your database name
- `DATABASE_USER`: Your database user
- `DATABASE_PASSWORD`: Your database password
- `SMTP_HOST`: smtp.gmail.com
- `SMTP_PORT`: 587
- `SMTP_USER`: Your email
- `SMTP_PASS`: Your email password

### 3. Health Check Configuration
- Health check path: `/`
- Health check interval: 30 seconds
- Health check timeout: 10 seconds
- Health check grace period: 60 seconds

## Vercel Deployment

### 1. Frontend Configuration
Create `vercel.json` in frontend directory:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-render-backend-url.onrender.com/api/$1"
    }
  ]
}
```

### 2. Environment Variables
Set in Vercel dashboard:
- `REACT_APP_API_URL`: Your Render backend URL

## Local Development

### 1. Start Backend
```bash
cd backend
npm install
npm run start:dev
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm start
```

## Troubleshooting

### Server Crashes Every 2-3 Minutes
**Fixed by:**
1. Health check endpoints that respond immediately
2. Database connection retries
3. Proper error handling in TypeORM

### Database Connection Issues
**Fixed by:**
1. Retry configuration in TypeORM
2. Graceful handling of connection failures
3. Keep-alive connections

### Render Health Check Failures
**Fixed by:**
1. Dedicated health endpoints at `/` and `/health`
2. Excluded from global prefix to avoid middleware issues
3. Immediate response without database queries

## File Structure
```
backend/
├── src/
│   ├── main.ts (updated with health checks)
│   ├── app.module.ts (updated with retry config)
│   ├── controllers/
│   │   ├── health.controller.ts (new)
│   │   ├── inventory.controller.ts (stub)
│   │   ├── analytics.controller.ts (stub)
│   │   ├── alerts.controller.ts (stub)
│   │   └── config.controller.ts (stub)
│   ├── services/
│   │   ├── inventory.service.ts (stub)
│   │   ├── analytics.service.ts (stub)
│   │   ├── alert.service.ts (stub)
│   │   ├── config.service.ts (stub)
│   │   ├── email.service.ts (stub)
│   │   └── scheduler.service.ts (stub)
│   └── entities/ (all required entities)
├── package.json (fixed dependencies)
├── Procfile (for alternative deployment)
└── start.sh (local development script)

render.yaml (Render configuration)
```

## Next Steps
1. Deploy to Render using the provided configuration
2. Set up environment variables in Render dashboard
3. Deploy frontend to Vercel
4. Test health endpoints: `https://your-app.onrender.com/`
5. Monitor logs for any remaining issues

The server should now be stable and not crash every 2-3 minutes! 