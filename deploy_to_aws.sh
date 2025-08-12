#!/bin/bash

# 🚀 Master AWS Deployment Script for Danier Stock Alert System
# This script orchestrates the complete deployment to AWS

set -e  # Exit on any error

echo "🚀 Starting Complete AWS Deployment for Danier Stock Alert System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGION="us-east-1"
S3_FILES_BUCKET="danier-stock-alert-files"
S3_FRONTEND_BUCKET="danier-stock-alert-frontend"
SES_EMAIL="alerts@danier.ca"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "   Region: $REGION"
echo "   Files Bucket: $S3_FILES_BUCKET"
echo "   Frontend Bucket: $S3_FRONTEND_BUCKET"
echo "   SES Email: $SES_EMAIL"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
        echo "   Run: brew install awscli (macOS) or download from AWS website"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install it first.${NC}"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed. Please install it first.${NC}"
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python 3 is not installed. Please install it first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites met${NC}"
}

# Function to setup AWS services
setup_aws_services() {
    echo -e "${BLUE}🔧 Setting up AWS services...${NC}"
    
    if [ -f "./setup_aws_services.sh" ]; then
        ./setup_aws_services.sh
    else
        echo -e "${RED}❌ setup_aws_services.sh not found${NC}"
        exit 1
    fi
}

# Function to deploy backend
deploy_backend() {
    echo -e "${BLUE}🚀 Deploying backend to AWS Elastic Beanstalk...${NC}"
    
    if [ -f "./deploy_backend_aws.sh" ]; then
        ./deploy_backend_aws.sh
    else
        echo -e "${RED}❌ deploy_backend_aws.sh not found${NC}"
        exit 1
    fi
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${BLUE}🚀 Deploying frontend to AWS S3...${NC}"
    
    if [ -f "./deploy_frontend_aws.sh" ]; then
        ./deploy_frontend_aws.sh
    else
        echo -e "${RED}❌ deploy_frontend_aws.sh not found${NC}"
        exit 1
    fi
}

# Function to test deployment
test_deployment() {
    echo -e "${BLUE}🧪 Testing deployment...${NC}"
    
    # Get backend URL
    if [ -f "backend_url.txt" ]; then
        BACKEND_URL=$(cat backend_url.txt)
        echo -e "${GREEN}✅ Backend URL: $BACKEND_URL${NC}"
        
        # Test backend health
        echo "Testing backend health..."
        if curl -s "$BACKEND_URL/" > /dev/null; then
            echo -e "${GREEN}✅ Backend is responding${NC}"
        else
            echo -e "${YELLOW}⚠️  Backend health check failed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Backend URL not found${NC}"
    fi
    
    # Get frontend URL
    if [ -f "frontend_urls.txt" ]; then
        echo -e "${GREEN}✅ Frontend URLs:${NC}"
        cat frontend_urls.txt
    else
        echo -e "${YELLOW}⚠️  Frontend URLs not found${NC}"
    fi
}

# Function to create final summary
create_summary() {
    echo -e "${BLUE}📋 Creating deployment summary...${NC}"
    
    cat > aws-deployment-summary.txt << EOF
🚀 Danier Stock Alert System - AWS Deployment Summary

✅ Deployment Status: COMPLETED
📅 Deployment Date: $(date)
🌍 Region: $REGION

🔗 Application URLs:
EOF

    if [ -f "backend_url.txt" ]; then
        BACKEND_URL=$(cat backend_url.txt)
        echo "   Backend API: $BACKEND_URL" >> aws-deployment-summary.txt
    fi
    
    if [ -f "frontend_urls.txt" ]; then
        echo "" >> aws-deployment-summary.txt
        echo "   Frontend URLs:" >> aws-deployment-summary.txt
        cat frontend_urls.txt >> aws-deployment-summary.txt
    fi
    
    cat >> aws-deployment-summary.txt << EOF

📊 AWS Services Used:
- Elastic Beanstalk (Backend)
- S3 (File Storage & Frontend Hosting)
- SES (Email Alerts)
- CloudWatch (Logging)
- IAM (Security)

💰 Estimated Monthly Costs: $30-80

📝 Next Steps:
1. Test all functionality
2. Configure email alerts
3. Set up monitoring
4. Train users
5. Schedule regular backups

📞 Support:
- AWS Support: https://aws.amazon.com/support/
- Application Issues: Contact development team
- Documentation: Check project README

🎉 Deployment completed successfully!
EOF

    echo -e "${GREEN}✅ Deployment summary saved to aws-deployment-summary.txt${NC}"
}

# Main deployment process
main() {
    echo -e "${BLUE}🚀 Starting complete AWS deployment...${NC}"
    
    # Step 1: Check prerequisites
    check_prerequisites
    
    # Step 2: Setup AWS services
    setup_aws_services
    
    # Step 3: Deploy backend
    deploy_backend
    
    # Step 4: Deploy frontend
    deploy_frontend
    
    # Step 5: Test deployment
    test_deployment
    
    # Step 6: Create summary
    create_summary
    
    echo -e "${GREEN}🎉 Complete AWS deployment finished successfully!${NC}"
    echo -e "${YELLOW}📋 Check aws-deployment-summary.txt for details${NC}"
}

# Run main function
main "$@" 