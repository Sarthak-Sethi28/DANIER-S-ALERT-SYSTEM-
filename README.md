# Inventory Monitoring System

Enterprise-grade inventory monitoring and analytics system with automatic deployment to Render.

## 🚀 Features

- **Real-time Inventory Tracking**: Monitor stock levels, sales history, and reorder points
- **Automated Alerts**: Email notifications for low stock and critical items
- **Analytics Dashboard**: Business intelligence reports and performance metrics
- **Multi-file Upload**: Support for Excel files with automatic processing
- **Stable Server**: Health checks and database retry logic prevent crashes

## 🛠️ Tech Stack

- **Backend**: NestJS with TypeORM and PostgreSQL
- **Frontend**: React with TypeScript
- **Deployment**: Render (Backend) + Vercel (Frontend)
- **Database**: PostgreSQL with connection pooling
- **Email**: Nodemailer with Gmail SMTP

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Gmail account for email alerts

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/inventory-monitoring-system.git
cd inventory-monitoring-system
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run build
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🌐 Deployment

### Automatic Deployment to Render

This repository is configured for automatic deployment to Render. When you push changes to the `main` branch, Render will automatically:

1. **Build the application** using the `render.yaml` configuration
2. **Deploy the backend** with health checks and database retry logic
3. **Update the live application** without downtime

### Manual Deployment Steps

1. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Connect your GitHub account
   - Select this repository
   - Choose "Web Service"

2. **Configure Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_HOST=your-postgres-host
   DATABASE_PORT=5432
   DATABASE_NAME=your-database-name
   DATABASE_USER=your-database-user
   DATABASE_PASSWORD=your-database-password
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

3. **Deploy**:
   - Render will automatically build and deploy using the `render.yaml` configuration
   - Health checks will ensure the server stays running

## 🔧 Configuration

### Health Check Endpoints
- `GET /` - Root health check
- `GET /health` - Detailed health status
- `GET /api/docs` - API documentation

### Database Configuration
The system includes automatic retry logic:
- **Retry Attempts**: 10
- **Retry Delay**: 3 seconds
- **Keep Connection Alive**: Enabled

## 📊 API Endpoints

- `GET /api/inventory` - Get inventory data
- `GET /api/analytics` - Get analytics reports
- `GET /api/alerts` - Get alert history
- `POST /api/upload` - Upload Excel files

## 🔍 Monitoring

### Health Checks
The application includes comprehensive health checks that prevent server crashes:
- Immediate response endpoints (`/` and `/health`)
- Database connection monitoring
- Automatic retry logic for failed connections

### Logs
Monitor your application through Render's built-in logging system.

## 🛡️ Security

- Helmet.js for security headers
- CORS configuration
- Input validation with class-validator
- Rate limiting with @nestjs/throttler

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Note**: This system is configured for automatic deployment. Any changes pushed to the main branch will automatically deploy to Render within minutes. 