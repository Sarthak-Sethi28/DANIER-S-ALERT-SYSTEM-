# Danier Stock Alert System - Quick Start Guide

## 🚀 Quick Start

### Option 1: Simple Mode (Recommended)
```bash
./start-simple.sh
```

### Option 2: Docker Mode
```bash
./start.sh
```

### Option 3: Enterprise Mode
```bash
./start-enterprise.sh
```

## 📊 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📧 Email Configuration

The system is pre-configured with:
- **From**: danieralertsystem@gmail.com
- **To**: danieralertsystem@gmail.com, sarthaksethi2803@gmail.com
- **SMTP**: Gmail (configured and tested)

## 🔧 Features

✅ **Inventory Upload**: Upload Excel files for processing
✅ **Key Items Alerts**: Automatic detection of low stock items
✅ **Email Notifications**: Real-time email alerts
✅ **Threshold Management**: Custom stock thresholds
✅ **Performance Analysis**: Compare inventory files
✅ **File Management**: Archive and organize uploads

## 📋 Usage

1. **Upload Inventory**: Go to http://localhost:3000 and upload your Excel file
2. **View Alerts**: Check key items alerts automatically
3. **Email Notifications**: Receive alerts via email
4. **Manage Thresholds**: Set custom stock levels
5. **Analyze Performance**: Compare different inventory files

## 🛠️ Troubleshooting

- **Backend Issues**: Check `backend.log`
- **Frontend Issues**: Check `frontend.log`
- **Email Issues**: Verify Gmail credentials
- **Database Issues**: Check `backend/danier_stock_alert.db`

## 📞 Support

For issues or questions, check the logs and system status files.

---
*System configured on: 2025-08-01 14:46:52*
