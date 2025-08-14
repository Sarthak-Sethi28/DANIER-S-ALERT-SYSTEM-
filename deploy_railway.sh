#!/bin/bash

# 🚀 Railway Deployment Script for Danier Stock Alert System
# This script deploys both backend and frontend to Railway

set -e  # Exit on any error

echo "🚀 Starting Railway Deployment for Danier Stock Alert System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Railway Deployment Configuration${NC}"
echo "   Platform: Railway"
echo "   Pricing: $7-15/month (vs AWS $30-80)"
echo "   Free tier: $5 credit monthly"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway. Please login first:${NC}"
    echo "   railway login"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI ready${NC}"

# Deploy Backend
echo -e "${BLUE}🚀 Deploying Backend to Railway...${NC}"
cd backend

# Initialize Railway project if not already done
if [ ! -f ".railway" ]; then
    echo "Initializing Railway project for backend..."
    railway init
fi

# Deploy backend
echo "Deploying backend..."
railway up

# Get backend URL
BACKEND_URL=$(railway status | grep "Deployment URL" | awk '{print $3}')
echo -e "${GREEN}✅ Backend deployed: $BACKEND_URL${NC}"

# Save backend URL
echo "$BACKEND_URL" > ../backend_url.txt

# Deploy Frontend
echo -e "${BLUE}🚀 Deploying Frontend to Railway...${NC}"
cd ../frontend

# Initialize Railway project if not already done
if [ ! -f ".railway" ]; then
    echo "Initializing Railway project for frontend..."
    railway init
fi

# Set backend URL for frontend
echo "Setting backend URL for frontend..."
railway variables set REACT_APP_API_BASE_URL="$BACKEND_URL"

# Build frontend
echo "Building frontend..."
npm install
npm run build

# Deploy frontend
echo "Deploying frontend..."
railway up

# Get frontend URL
FRONTEND_URL=$(railway status | grep "Deployment URL" | awk '{print $3}')
echo -e "${GREEN}✅ Frontend deployed: $FRONTEND_URL${NC}"

# Save frontend URL
echo "$FRONTEND_URL" > ../frontend_url.txt

# Create deployment summary
echo -e "${BLUE}📋 Creating deployment summary...${NC}"
cat > ../railway-deployment-summary.txt << EOF
🚀 Railway Deployment Summary - Danier Stock Alert System

✅ Deployment Status: COMPLETED
📅 Deployment Date: $(date)
🌍 Platform: Railway

🔗 Application URLs:
   Backend API: $BACKEND_URL
   Frontend: $FRONTEND_URL

💰 Cost Savings:
   - AWS Cost: $30-80/month
   - Railway Cost: $7-15/month
   - Savings: 60-75% cheaper!

📊 Features:
   - ✅ Automatic SSL certificates
   - ✅ PostgreSQL database included
   - ✅ File storage included
   - ✅ Auto-scaling
   - ✅ Git-based deployments
   - ✅ Real-time monitoring

📝 Next Steps:
1. Test the application
2. Configure email alerts
3. Set up monitoring
4. Train users

🎉 Deployment completed successfully!
EOF

echo -e "${GREEN}✅ Deployment summary saved to railway-deployment-summary.txt${NC}"

echo -e "${GREEN}🎉 Railway deployment completed successfully!${NC}"
echo -e "${YELLOW}📋 Your URLs:${NC}"
echo "   Backend: $BACKEND_URL"
echo "   Frontend: $FRONTEND_URL"
echo -e "${YELLOW}💰 Cost: $7-15/month (60-75% cheaper than AWS!)${NC}" 