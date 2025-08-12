# 🚀 AWS Quick Start Guide - Danier Stock Alert System

## **Prerequisites**

### 1. AWS Account Setup
- [ ] Create AWS account at [aws.amazon.com](https://aws.amazon.com)
- [ ] Add payment method (you'll get free tier benefits)
- [ ] Note your AWS Account ID

### 2. Install Required Tools
```bash
# Install AWS CLI
brew install awscli  # macOS
# Or download from AWS website for other OS

# Install EB CLI
pip install awsebcli

# Verify installations
aws --version
eb --version
```

### 3. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key  
# Enter your default region (e.g., us-east-1)
# Enter your output format (json)
```

---

## **🚀 One-Click Deployment**

### Option 1: Complete Automated Deployment
```bash
cd danier-stock-alert
./deploy_to_aws.sh
```

This will:
- ✅ Set up all AWS services
- ✅ Deploy backend to Elastic Beanstalk
- ✅ Deploy frontend to S3
- ✅ Test the deployment
- ✅ Create deployment summary

### Option 2: Step-by-Step Deployment

#### Step 1: Setup AWS Services
```bash
cd danier-stock-alert
./setup_aws_services.sh
```

#### Step 2: Deploy Backend
```bash
./deploy_backend_aws.sh
```

#### Step 3: Deploy Frontend
```bash
./deploy_frontend_aws.sh
```

---

## **🔧 Manual Setup (If Scripts Fail)**

### 1. Create S3 Buckets
```bash
# Files bucket
aws s3 mb s3://danier-stock-alert-files --region us-east-1

# Frontend bucket
aws s3 mb s3://danier-stock-alert-frontend --region us-east-1
aws s3 website s3://danier-stock-alert-frontend --index-document index.html --error-document index.html
```

### 2. Setup SES Email
```bash
# Verify email address
aws ses verify-email-identity --email-address alerts@danier.ca
# Check your email and click verification link
```

### 3. Deploy Backend Manually
```bash
cd backend
eb init danier-stock-alert-backend --platform "Python 3.11" --region us-east-1
eb create danier-stock-alert-prod --instance-type t3.small --single-instance
```

### 4. Deploy Frontend Manually
```bash
cd frontend
npm install
npm run build
aws s3 sync build/ s3://danier-stock-alert-frontend --delete
```

---

## **🔗 After Deployment**

### Get Your URLs
```bash
# Backend URL
cat backend_url.txt

# Frontend URL  
cat frontend_urls.txt
```

### Test Your Application
1. **Backend Health Check**: Visit `https://your-eb-url.elasticbeanstalk.com/`
2. **Frontend**: Visit the S3 website URL
3. **Upload Test File**: Try uploading an inventory file
4. **Email Test**: Test email functionality

---

## **⚙️ Configuration**

### Environment Variables (Set in AWS Console)
- `AWS_S3_BUCKET`: danier-stock-alert-files
- `AWS_REGION`: us-east-1
- `SES_EMAIL`: alerts@danier.ca
- `ENVIRONMENT`: production

### Custom Domain (Optional)
1. Register domain with Route 53
2. Create SSL certificate with ACM
3. Update CloudFront distribution
4. Update DNS records

---

## **💰 Cost Optimization**

### Free Tier Benefits
- **EC2**: 750 hours/month (t3.micro)
- **S3**: 5GB storage
- **CloudFront**: 1TB data transfer
- **SES**: 62,000 emails/month

### Estimated Monthly Costs
- **Elastic Beanstalk**: $20-50
- **S3 Storage**: $0.023/GB
- **CloudFront**: $0.085/GB
- **SES**: $0.10 per 1000 emails
- **Total**: ~$30-80/month

---

## **🔍 Troubleshooting**

### Common Issues

#### 1. AWS Credentials Error
```bash
aws configure
# Re-enter your credentials
```

#### 2. EB CLI Not Found
```bash
pip install awsebcli
```

#### 3. Build Failures
```bash
# Check logs
eb logs

# SSH into instance
eb ssh
```

#### 4. CORS Issues
- Check CORS configuration in backend
- Verify frontend API URL

#### 5. Email Not Working
- Verify SES email address
- Check SES sending limits
- Review email service configuration

### Useful Commands
```bash
# Check EB status
eb status

# View logs
eb logs

# SSH into instance
eb ssh

# Check S3 bucket
aws s3 ls s3://danier-stock-alert-files

# Test SES
aws ses get-send-quota
```

---

## **📞 Support**

### AWS Support
- **Documentation**: [docs.aws.amazon.com](https://docs.aws.amazon.com/)
- **Support Center**: [aws.amazon.com/support](https://aws.amazon.com/support/)

### Application Support
- Check deployment logs
- Review error messages
- Contact development team

---

## **🎉 Success Checklist**

- [ ] AWS account created and configured
- [ ] All tools installed (AWS CLI, EB CLI)
- [ ] AWS credentials configured
- [ ] S3 buckets created
- [ ] SES email verified
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Application tested and working
- [ ] Email alerts configured
- [ ] Monitoring set up
- [ ] Team trained on new system

**🎊 Congratulations! Your Danier Stock Alert System is now live on AWS!** 