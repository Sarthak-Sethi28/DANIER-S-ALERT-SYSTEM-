# 🚀 AWS Deployment Guide for Danier Stock Alert System

## **Architecture Overview**
- **Backend**: AWS Elastic Beanstalk (Python/FastAPI)
- **Frontend**: AWS S3 + CloudFront (Static hosting)
- **Database**: AWS RDS (PostgreSQL) or keep SQLite
- **File Storage**: AWS S3 for inventory files
- **Email**: AWS SES for email alerts

---

## **Step 1: AWS Account Setup & Prerequisites**

### 1.1 AWS Account Setup
1. **Create AWS Account** (if you don't have one)
   - Go to [aws.amazon.com](https://aws.amazon.com)
   - Sign up for a new account
   - Add payment method (you'll get free tier benefits)

2. **Install AWS CLI**
   ```bash
   # macOS
   brew install awscli
   
   # Or download from AWS website
   curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
   sudo installer -pkg AWSCLIV2.pkg -target /
   ```

3. **Configure AWS CLI**
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Enter your default region (e.g., us-east-1)
   # Enter your output format (json)
   ```

### 1.2 Install Required Tools
```bash
# Install EB CLI for Elastic Beanstalk
pip install awsebcli

# Install AWS CDK (optional, for infrastructure as code)
npm install -g aws-cdk
```

---

## **Step 2: Backend Deployment (AWS Elastic Beanstalk)**

### 2.1 Prepare Backend for AWS
1. **Create AWS-specific configuration files**

2. **Update requirements.txt** (already good)

3. **Create Elastic Beanstalk configuration**

### 2.2 Deploy Backend
1. **Initialize EB Application**
2. **Configure Environment**
3. **Deploy Application**

---

## **Step 3: Frontend Deployment (AWS S3 + CloudFront)**

### 3.1 Prepare Frontend for AWS
1. **Build React App**
2. **Configure for S3 hosting**
3. **Set up CloudFront distribution**

### 3.2 Deploy Frontend
1. **Create S3 Bucket**
2. **Upload built files**
3. **Configure CloudFront**

---

## **Step 4: Database & Storage Setup**

### 4.1 Database Options
- **Option A**: Keep SQLite (simple, no additional cost)
- **Option B**: Migrate to RDS PostgreSQL (scalable, managed)

### 4.2 S3 File Storage
- **Configure S3 bucket for file uploads**
- **Set up IAM permissions**

---

## **Step 5: Email Service (AWS SES)**

### 5.1 Configure SES
1. **Verify email addresses**
2. **Set up SMTP credentials**
3. **Configure sending limits**

---

## **Step 6: Domain & SSL Setup**

### 6.1 Without Custom Domain
- Use AWS-provided URLs
- Free SSL certificates via AWS

### 6.2 With Custom Domain (Future)
- Route 53 for DNS
- ACM for SSL certificates

---

## **Step 7: Monitoring & Maintenance**

### 7.1 CloudWatch Setup
- **Application monitoring**
- **Error tracking**
- **Performance metrics**

### 7.2 Backup Strategy
- **Database backups**
- **File storage backups**
- **Configuration backups**

---

## **Estimated Costs (Monthly)**
- **Elastic Beanstalk**: $20-50 (depending on instance size)
- **S3 Storage**: $0.023/GB (very cheap)
- **CloudFront**: $0.085/GB (first 1TB free)
- **SES**: $0.10 per 1000 emails (first 62,000 free)
- **RDS** (optional): $15-30
- **Total**: ~$30-80/month

---

## **Next Steps**
1. Follow each step in detail
2. Test thoroughly in staging
3. Monitor performance
4. Set up alerts and monitoring 