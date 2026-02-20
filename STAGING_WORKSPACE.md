# Danier Alert System - Staging Workspace

Shared workspace for the Danier Key Items Stock Alert System. Use this folder for development, testing, and collaboration.

## 🔗 Live Deployment Links

| Environment | URL | Notes |
|-------------|-----|-------|
| **Production Frontend** | https://inventoryreport.ca | Custom domain |
| **Vercel Frontend** | https://danier-s-alert-system-re1i0tkhw-sarthak-sethi28s-projects.vercel.app | Vercel deployment |
| **Backend API (Render)** | https://danier-s-alert-system.onrender.com | danier-s-alert-system:10000 (Python/FastAPI) |

## 📂 Repository

- **GitHub**: https://github.com/Sarthak-Sethi28/DANIER-S-ALERT-SYSTEM-
- **Local Path**: `staging/danier-alert-system`

## 🚀 Quick Start (Local Development)

### 1. Backend (Python/FastAPI)
```bash
cd danier-alert-system/backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend (React)
```bash
cd danier-alert-system/frontend
npm install
npm start
```

The frontend will run at http://localhost:3000 and proxy API requests to the backend.

### 3. Point to Production Backend (Optional)
To test the frontend against the live Render API instead of local backend:
- Set `REACT_APP_API_BASE_URL=https://danier-s-alert-system.onrender.com` in `.env` or `vercel.json`

## 📁 Project Structure

```
danier-alert-system/
├── backend/          # Python FastAPI backend (Render)
├── frontend/         # React frontend (Vercel)
├── Inventory_Monitoring_Enterprise/  # NestJS alternative
├── database/         # Migrations
├── emails/           # Email templates
└── uploads/          # Uploaded files
```

## 🔧 Environment Variables

### Backend (Render)
- `DATABASE_URL` - PostgreSQL/SQLite connection
- `DEFAULT_RECIPIENT_EMAIL` - Alert recipient
- `UPLOAD_DIR` - File upload path

### Frontend (Vercel)
- `REACT_APP_API_BASE_URL` - Backend API URL (default: https://danier-s-alert-system.onrender.com)

## 📝 Workflow

1. **Pull latest**: `git pull origin main`
2. **Create branch**: `git checkout -b feature/your-feature`
3. **Make changes** in this staging folder
4. **Test locally** before pushing
5. **Push to GitHub** - Render & Vercel auto-deploy on `main`

## 🌐 Deployment

- **Backend**: Pushes to `main` auto-deploy to Render
- **Frontend**: Pushes to `main` auto-deploy to Vercel
- **Custom domain**: inventoryreport.ca → Vercel

---

*Last updated: Feb 2025*
