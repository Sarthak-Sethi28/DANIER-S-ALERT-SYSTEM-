#!/bin/bash

# 🚀 AWS Backend Deployment Script for Danier Stock Alert System
# This script deploys the FastAPI backend to AWS Elastic Beanstalk

set -e  # Exit on any error

echo "🚀 Starting AWS Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="danier-stock-alert-backend"
ENVIRONMENT_NAME="danier-stock-alert-prod"
REGION="us-east-1"
PLATFORM="Python 3.11"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   App Name: $APP_NAME"
echo "   Environment: $ENVIRONMENT_NAME"
echo "   Region: $REGION"
echo "   Platform: $PLATFORM"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo -e "${YELLOW}⚠️  EB CLI not found. Installing...${NC}"
    pip install awsebcli
fi

# Navigate to backend directory
cd backend

echo -e "${BLUE}📦 Preparing application for deployment...${NC}"

# Create .ebignore if it doesn't exist
if [ ! -f .ebignore ]; then
    echo "Creating .ebignore file..."
    cat > .ebignore << EOF
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.env
*.log
uploads/
emails/
*.db
.git/
.gitignore
README.md
EOF
fi

# Initialize EB application (if not already done)
if [ ! -f .elasticbeanstalk/config.yml ]; then
    echo -e "${BLUE}🔧 Initializing Elastic Beanstalk application...${NC}"
    eb init $APP_NAME --platform "$PLATFORM" --region $REGION
fi

# Create environment if it doesn't exist
echo -e "${BLUE}🌍 Checking environment status...${NC}"
if ! eb status $ENVIRONMENT_NAME &> /dev/null; then
    echo -e "${YELLOW}⚠️  Environment doesn't exist. Creating...${NC}"
    eb create $ENVIRONMENT_NAME --instance-type t3.small --single-instance
else
    echo -e "${GREEN}✅ Environment exists. Updating...${NC}"
fi

# Deploy the application
echo -e "${BLUE}🚀 Deploying to AWS Elastic Beanstalk...${NC}"
eb deploy $ENVIRONMENT_NAME

# Get the application URL
echo -e "${BLUE}🔗 Getting application URL...${NC}"
APP_URL=$(eb status $ENVIRONMENT_NAME | grep CNAME | awk '{print $2}')

if [ -n "$APP_URL" ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🌐 Application URL: https://$APP_URL${NC}"
    echo -e "${GREEN}📊 Health Check: https://$APP_URL/health${NC}"
    
    # Save URL to file for frontend configuration
    echo "https://$APP_URL" > ../backend_url.txt
    echo -e "${BLUE}💾 Backend URL saved to backend_url.txt${NC}"
else
    echo -e "${RED}❌ Failed to get application URL${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Backend deployment completed successfully!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "   1. Configure environment variables in AWS Console"
echo "   2. Set up S3 bucket for file storage"
echo "   3. Configure SES for email alerts"
echo "   4. Deploy frontend to S3" 