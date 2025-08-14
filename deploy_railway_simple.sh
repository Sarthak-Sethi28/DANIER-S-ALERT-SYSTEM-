#!/bin/bash

# 🚀 Simple Railway Deployment Script for Danier Stock Alert System
# This script deploys your app to Railway with minimal complexity

set -e  # Exit on any error

echo "🚀 Starting Simple Railway Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Simple Deployment Configuration${NC}"
echo "   Platform: Railway"
echo "   Pricing: $7-15/month (vs AWS $30-80)"
echo "   Approach: Step-by-step deployment"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found. Please install it first:${NC}"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Railway. Please login first:${NC}"
    echo "   railway login"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI ready${NC}"

# Deploy Backend
echo -e "${BLUE}🚀 Deploying Backend...${NC}"
cd backend

# Check if Railway project exists
if [ ! -f ".railway" ]; then
    echo "Initializing Railway project for backend..."
    railway init --name "danier-backend"
fi

echo -e "${YELLOW}📝 Manual Step Required:${NC}"
echo "   When prompted, select 'danier-backend' service"
echo "   This will deploy your backend to Railway"
echo ""
echo "   Press Enter when ready to continue..."
read -r

# Deploy backend
echo "Deploying backend..."
railway up

# Wait for deployment
echo "Waiting for deployment to complete..."
sleep 30

# Get backend URL
echo "Getting backend URL..."
railway status

echo -e "${GREEN}✅ Backend deployment initiated!${NC}"
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "   1. Check Railway dashboard for deployment status"
echo "   2. Get your backend URL from the dashboard"
echo "   3. Test the health endpoint: https://your-app.railway.app/health"
echo "   4. Deploy frontend when backend is ready"

cd ..

echo -e "${GREEN}🎉 Simple Railway deployment setup completed!${NC}"
echo -e "${YELLOW}💰 Cost: $7-15/month (60-75% cheaper than AWS!)${NC}" 