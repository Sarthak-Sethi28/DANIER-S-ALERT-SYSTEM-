# Danier Stock Alert System

Professional internal software system for automated inventory management and low stock email alerts.

## 🎯 Purpose

Automatically processes daily .xlsx inventory reports, identifies low stock items (below 120 units), and sends styled HTML email alerts to designated recipients.

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory**
```bash
cd danier-stock-alert/backend
```

2. **Create virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
cp env_example.txt .env
# Edit .env with your SMTP credentials
```

5. **Start backend server**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd danier-stock-alert/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

## 📊 System Features

### ✅ Upload & Processing
- Drag & drop .xlsx file upload
- Groups data by "Item Description"
- Sums "Grand Total" column for each group
- Filters items below 120 unit threshold

### ✅ Email Alerts
- Automatic HTML email alerts
- Color-coded stock levels (Critical < 50, Low 50-79, Warning 80-119)
- Styled with Danier branding
- Sent only when low stock items detected

### ✅ Dashboard
- Real-time inventory status
- Today's low stock items display
- Upload history tracking
- Email delivery status

### ✅ Recipient Management
- Add/remove email recipients
- Email validation
- Recipient history tracking

## 🏗️ Architecture

```
danier-stock-alert/
├── backend/               # FastAPI Python backend
│   ├── main.py           # API endpoints
│   ├── models.py         # Database models
│   ├── database.py       # Database configuration
│   ├── inventory_service.py  # Excel processing
│   ├── email_service.py  # Email functionality
│   └── requirements.txt  # Python dependencies
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API calls
│   │   └── App.js        # Main application
│   └── package.json      # Node dependencies
└── README.md            # This file
```

## 🔧 Configuration

### Environment Variables (.env)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@danier.ca
SMTP_PASS=your_app_password
EMAIL_FROM=Danier Stock Alerts <alerts@danier.ca>
THRESHOLD=120
DATABASE_URL=sqlite:///./danier_stock_alert.db
```

### File Requirements
- Excel (.xlsx) format only
- Must contain "Item Description" column
- Must contain "Grand Total" column
- Data automatically grouped by Item Description

## 📧 Email Configuration

For Gmail SMTP:
1. Enable 2-factor authentication
2. Generate App Password
3. Use App Password in SMTP_PASS

## 🔄 Workflow

1. **Upload Report**: Drag .xlsx file to upload area
2. **Processing**: System groups by Item Description, sums Grand Total
3. **Analysis**: Identifies items with total < 120 units
4. **Alert**: Sends HTML email to all recipients if low stock found
5. **Dashboard**: Updates real-time status and history

## 🛠️ API Endpoints

- `POST /upload-report` - Process inventory file
- `GET /alerts/today` - Get today's low stock items
- `GET /recipients` - List email recipients
- `POST /recipients` - Add new recipient
- `DELETE /recipients/{id}` - Remove recipient
- `GET /settings/threshold` - Get stock threshold
- `GET /upload-history` - Get upload history

## 🎨 Frontend Pages

- **Upload**: File upload with drag & drop
- **Dashboard**: Status overview and alerts
- **Recipients**: Email management
- **Settings**: System configuration

## 🔍 Testing

Test with the provided inventory file:
```bash
# Backend will be available at: http://localhost:8000
# Frontend will be available at: http://localhost:3000
```

## 🚨 Alert Levels

- **Critical**: Stock < 50 (Red)
- **Low**: Stock 50-79 (Orange)  
- **Warning**: Stock 80-119 (Yellow)

## 📱 Responsive Design

- Mobile-friendly interface
- Tailwind CSS styling
- Danier brand colors (gold: #d4af37)

## 🔐 Security

- CORS enabled for localhost development
- Email validation
- SQL injection protection via SQLAlchemy
- File type validation (.xlsx only)

## 💾 Database Schema

- **recipients**: Email addresses and names
- **upload_logs**: Processing history and status
- **low_stock_items**: Detailed stock information

## 🎯 Production Deployment

1. Set production environment variables
2. Configure production SMTP server
3. Update CORS origins for production domain
4. Use PostgreSQL for production database
5. Deploy backend with Gunicorn
6. Build and serve frontend with nginx

---

**Built for Danier** - Automated inventory management system 