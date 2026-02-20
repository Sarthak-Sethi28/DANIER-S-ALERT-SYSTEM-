#!/bin/bash

# 🚀 AWS Services Setup Script for Danier Stock Alert System
# This script sets up all necessary AWS services for the application

set -e  # Exit on any error

echo "🚀 Setting up AWS Services for Danier Stock Alert System..."

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

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Region: $REGION"
echo "   Files Bucket: $S3_FILES_BUCKET"
echo "   Frontend Bucket: $S3_FRONTEND_BUCKET"
echo "   SES Email: $SES_EMAIL"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check AWS credentials
echo -e "${BLUE}🔐 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials verified${NC}"

# Step 1: Create S3 bucket for file storage
echo -e "${BLUE}🪣 Step 1: Creating S3 bucket for file storage...${NC}"
if ! aws s3 ls "s3://$S3_FILES_BUCKET" &> /dev/null; then
    echo "Creating S3 bucket: $S3_FILES_BUCKET"
    aws s3 mb "s3://$S3_FILES_BUCKET" --region $REGION
    
    # Configure bucket for file uploads
    cat > files-bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowElasticBeanstalkAccess",
            "Effect": "Allow",
            "Principal": {
                "Service": "elasticbeanstalk.amazonaws.com"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::$S3_FILES_BUCKET/*"
        }
    ]
}
EOF
    aws s3api put-bucket-policy --bucket $S3_FILES_BUCKET --policy file://files-bucket-policy.json
    rm files-bucket-policy.json
    
    echo -e "${GREEN}✅ S3 files bucket created and configured${NC}"
else
    echo -e "${GREEN}✅ S3 files bucket already exists${NC}"
fi

# Step 2: Create S3 bucket for frontend
echo -e "${BLUE}🪣 Step 2: Creating S3 bucket for frontend...${NC}"
if ! aws s3 ls "s3://$S3_FRONTEND_BUCKET" &> /dev/null; then
    echo "Creating S3 bucket: $S3_FRONTEND_BUCKET"
    aws s3 mb "s3://$S3_FRONTEND_BUCKET" --region $REGION
    
    # Configure bucket for static website hosting
    aws s3 website "s3://$S3_FRONTEND_BUCKET" --index-document index.html --error-document index.html
    
    # Set bucket policy for public read access
    cat > frontend-bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$S3_FRONTEND_BUCKET/*"
        }
    ]
}
EOF
    aws s3api put-bucket-policy --bucket $S3_FRONTEND_BUCKET --policy file://frontend-bucket-policy.json
    rm frontend-bucket-policy.json
    
    echo -e "${GREEN}✅ S3 frontend bucket created and configured${NC}"
else
    echo -e "${GREEN}✅ S3 frontend bucket already exists${NC}"
fi

# Step 3: Set up SES for email alerts
echo -e "${BLUE}📧 Step 3: Setting up SES for email alerts...${NC}"

# Check if email is verified
if ! aws ses get-identity-verification-status --identities "$SES_EMAIL" --query "VerificationStatuses[0].VerificationStatus" --output text 2>/dev/null | grep -q "Success"; then
    echo "Verifying email address: $SES_EMAIL"
    aws ses verify-email-identity --email-address "$SES_EMAIL"
    echo -e "${YELLOW}⚠️  Please check your email and click the verification link${NC}"
    echo -e "${YELLOW}   Then run this script again to continue${NC}"
    exit 0
else
    echo -e "${GREEN}✅ Email address already verified${NC}"
fi

# Step 4: Create IAM role for Elastic Beanstalk
echo -e "${BLUE}🔐 Step 4: Creating IAM role for Elastic Beanstalk...${NC}"

# Create trust policy for EB
cat > eb-trust-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "elasticbeanstalk.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF

# Create IAM role if it doesn't exist
if ! aws iam get-role --role-name "danier-stock-alert-eb-role" &> /dev/null; then
    echo "Creating IAM role: danier-stock-alert-eb-role"
    aws iam create-role --role-name "danier-stock-alert-eb-role" --assume-role-policy-document file://eb-trust-policy.json
    
    # Attach necessary policies
    aws iam attach-role-policy --role-name "danier-stock-alert-eb-role" --policy-arn "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
    aws iam attach-role-policy --role-name "danier-stock-alert-eb-role" --policy-arn "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier"
    aws iam attach-role-policy --role-name "danier-stock-alert-eb-role" --policy-arn "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker"
    
    # Create custom policy for S3 and SES access
    cat > eb-custom-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::$S3_FILES_BUCKET",
                "arn:aws:s3:::$S3_FILES_BUCKET/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*"
        }
    ]
}
EOF
    aws iam put-role-policy --role-name "danier-stock-alert-eb-role" --policy-name "DanierStockAlertPolicy" --policy-document file://eb-custom-policy.json
    
    echo -e "${GREEN}✅ IAM role created and configured${NC}"
else
    echo -e "${GREEN}✅ IAM role already exists${NC}"
fi

# Clean up temporary files
rm -f eb-trust-policy.json eb-custom-policy.json

# Step 5: Create CloudWatch log group
echo -e "${BLUE}📊 Step 5: Creating CloudWatch log group...${NC}"
if ! aws logs describe-log-groups --log-group-name-prefix "/aws/elasticbeanstalk/danier-stock-alert" --query "logGroups[0].logGroupName" --output text 2>/dev/null | grep -q "danier-stock-alert"; then
    echo "Creating CloudWatch log group"
    aws logs create-log-group --log-group-name "/aws/elasticbeanstalk/danier-stock-alert/application-logs"
    echo -e "${GREEN}✅ CloudWatch log group created${NC}"
else
    echo -e "${GREEN}✅ CloudWatch log group already exists${NC}"
fi

# Step 6: Create environment configuration file
echo -e "${BLUE}⚙️  Step 6: Creating environment configuration...${NC}"
cat > aws-environment-config.json << EOF
{
    "EnvironmentConfiguration": {
        "ApplicationName": "danier-stock-alert-backend",
        "EnvironmentName": "danier-stock-alert-prod",
        "OptionSettings": [
            {
                "Namespace": "aws:autoscaling:launchconfiguration",
                "OptionName": "IamInstanceProfile",
                "Value": "danier-stock-alert-eb-role"
            },
            {
                "Namespace": "aws:elasticbeanstalk:application:environment",
                "OptionName": "AWS_S3_BUCKET",
                "Value": "$S3_FILES_BUCKET"
            },
            {
                "Namespace": "aws:elasticbeanstalk:application:environment",
                "OptionName": "AWS_REGION",
                "Value": "$REGION"
            },
            {
                "Namespace": "aws:elasticbeanstalk:application:environment",
                "OptionName": "SES_EMAIL",
                "Value": "$SES_EMAIL"
            },
            {
                "Namespace": "aws:elasticbeanstalk:application:environment",
                "OptionName": "ENVIRONMENT",
                "Value": "production"
            }
        ]
    }
}
EOF

echo -e "${GREEN}✅ Environment configuration saved to aws-environment-config.json${NC}"

# Step 7: Create deployment summary
echo -e "${BLUE}📋 Step 7: Creating deployment summary...${NC}"
cat > aws-setup-summary.txt << EOF
🚀 AWS Services Setup Summary for Danier Stock Alert System

✅ Services Created:
- S3 Files Bucket: $S3_FILES_BUCKET
- S3 Frontend Bucket: $S3_FRONTEND_BUCKET
- SES Email: $SES_EMAIL
- IAM Role: danier-stock-alert-eb-role
- CloudWatch Log Group: /aws/elasticbeanstalk/danier-stock-alert/application-logs

📋 Next Steps:
1. Deploy backend: ./deploy_backend_aws.sh
2. Deploy frontend: ./deploy_frontend_aws.sh
3. Configure environment variables in AWS Console
4. Test the application

🔗 URLs (after deployment):
- Backend: https://your-eb-environment.elasticbeanstalk.com
- Frontend: http://$S3_FRONTEND_BUCKET.s3-website-$REGION.amazonaws.com

💰 Estimated Monthly Costs:
- Elastic Beanstalk: $20-50
- S3 Storage: $0.023/GB
- CloudFront: $0.085/GB (first 1TB free)
- SES: $0.10 per 1000 emails (first 62,000 free)
- Total: ~$30-80/month

📞 Support:
- AWS Support: https://aws.amazon.com/support/
- Documentation: https://docs.aws.amazon.com/
EOF

echo -e "${GREEN}✅ Setup summary saved to aws-setup-summary.txt${NC}"

echo -e "${GREEN}🎉 AWS Services setup completed successfully!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "   1. Run: ./deploy_backend_aws.sh"
echo "   2. Run: ./deploy_frontend_aws.sh"
echo "   3. Test the application"
echo "   4. Set up monitoring and alerts"

echo -e "${BLUE}📋 Configuration files created:${NC}"
echo "   - aws-environment-config.json"
echo "   - aws-setup-summary.txt" 