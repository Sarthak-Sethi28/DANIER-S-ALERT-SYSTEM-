#!/bin/bash

# 🚀 AWS Frontend Deployment Script for Danier Stock Alert System
# This script deploys the React frontend to AWS S3 with CloudFront

set -e  # Exit on any error

echo "🚀 Starting AWS Frontend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
S3_BUCKET="danier-stock-alert-frontend"
CLOUDFRONT_DISTRIBUTION_ID=""
REGION="us-east-1"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   S3 Bucket: $S3_BUCKET"
echo "   Region: $REGION"
echo "   CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install it first.${NC}"
    exit 1
fi

# Navigate to frontend directory
cd frontend

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Get backend URL if available
if [ -f ../backend_url.txt ]; then
    BACKEND_URL=$(cat ../backend_url.txt)
    echo -e "${BLUE}🔗 Backend URL detected: $BACKEND_URL${NC}"
    
    # Create .env.production file
    cat > .env.production << EOF
REACT_APP_API_BASE_URL=$BACKEND_URL
REACT_APP_AWS_REGION=$REGION
REACT_APP_S3_BUCKET=$S3_BUCKET
EOF
    echo -e "${GREEN}✅ Created .env.production with backend URL${NC}"
else
    echo -e "${YELLOW}⚠️  No backend URL found. Using default configuration.${NC}"
fi

echo -e "${BLUE}🔨 Building React application...${NC}"
npm run build

if [ ! -d "build" ]; then
    echo -e "${RED}❌ Build failed. Check for errors above.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Create S3 bucket if it doesn't exist
echo -e "${BLUE}🪣 Checking S3 bucket...${NC}"
if ! aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
    echo -e "${YELLOW}⚠️  S3 bucket doesn't exist. Creating...${NC}"
    aws s3 mb "s3://$S3_BUCKET" --region $REGION
    
    # Configure bucket for static website hosting
    aws s3 website "s3://$S3_BUCKET" --index-document index.html --error-document index.html
    
    # Set bucket policy for public read access
    cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$S3_BUCKET/*"
        }
    ]
}
EOF
    aws s3api put-bucket-policy --bucket $S3_BUCKET --policy file://bucket-policy.json
    rm bucket-policy.json
    
    echo -e "${GREEN}✅ S3 bucket created and configured${NC}"
else
    echo -e "${GREEN}✅ S3 bucket exists${NC}"
fi

# Upload files to S3
echo -e "${BLUE}📤 Uploading files to S3...${NC}"
aws s3 sync build/ "s3://$S3_BUCKET" --delete --cache-control "max-age=31536000,public"

echo -e "${GREEN}✅ Files uploaded successfully${NC}"

# Get the S3 website URL
S3_URL=$(aws s3api get-bucket-website --bucket $S3_BUCKET --query 'IndexDocument.Suffix' --output text 2>/dev/null || echo "index.html")
S3_WEBSITE_URL="http://$S3_BUCKET.s3-website-$REGION.amazonaws.com"

echo -e "${GREEN}🎉 Frontend deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 S3 Website URL: $S3_WEBSITE_URL${NC}"

# Create CloudFront distribution if distribution ID is provided
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${BLUE}☁️  Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
    echo -e "${GREEN}✅ CloudFront cache invalidated${NC}"
fi

# Save URLs to file
cat > ../frontend_urls.txt << EOF
S3 Website URL: $S3_WEBSITE_URL
S3 Bucket: $S3_BUCKET
Region: $REGION
EOF

echo -e "${BLUE}💾 URLs saved to frontend_urls.txt${NC}"

echo -e "${GREEN}🎉 Frontend deployment completed successfully!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "   1. Set up CloudFront distribution for HTTPS"
echo "   2. Configure custom domain (optional)"
echo "   3. Test the application"
echo "   4. Set up monitoring and alerts" 