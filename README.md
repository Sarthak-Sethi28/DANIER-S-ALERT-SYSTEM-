# Inventory Monitoring Enterprise

A fully automated, Oracle-grade Inventory Monitoring & Analytics system that maintains stateful inventory tracking with automatic reorder logic, tier-based categorization, and real-time alerts.

## 🚀 Features

### Core Functionality
- **Stateful Inventory Management**: Persistent storage of current on-hand quantities
- **Daily Delta Processing**: Automatic ingestion of NAV sales exports
- **Tier-Based Categorization**: 
  - Best Sellers (top 10%) - 500 unit reorder
  - Doing Good (next 20%) - 300 unit reorder  
  - Making Progress (next 30%) - 200 unit reorder
  - Okay (bottom 40%) - 100 unit reorder
- **Automatic Reorder Logic**: When SKU falls below tier threshold, automatically restock
- **Smart Alerting**: Immediate low-stock and demotion notifications
- **Daily Digest**: Consolidated morning reports
- **Interactive Dashboards**: Real-time inventory health and sales trends

### Enterprise Features
- **Oracle-grade Reliability**: Enterprise-level error handling and monitoring
- **Zero Manual Intervention**: Fully automated once configured
- **Real-time Insights**: Immediate alerts and live dashboards
- **Scalable Architecture**: Containerized microservices approach
- **Professional UI**: Modern admin interface for configuration

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   ETL Pipeline  │
│   React/TS      │◄──►│   NestJS/TS     │◄──►│   Python/Pandas │
│   Recharts      │    │   TypeORM       │    │   SQLAlchemy    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   Oracle/PostgreSQL │
                    │   Migrations    │
                    └─────────────────┘
```

## 📁 Project Structure

```
Inventory_Monitoring_Enterprise/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Dashboard and admin pages
│   │   ├── services/        # API integration
│   │   ├── utils/           # Helper functions
│   │   └── styles/          # SCSS modules
│   └── public/              # Static assets
├── backend/                  # NestJS API server
│   ├── src/
│   │   ├── controllers/     # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── entities/        # Database models
│   │   ├── middleware/      # Request processing
│   │   └── config/          # Configuration
│   └── migrations/          # Database migrations
├── etl/                     # Data processing pipeline
│   ├── scripts/             # Python ETL scripts
│   ├── data/                # Data files
│   └── logs/                # Processing logs
├── database/                # Database management
│   ├── migrations/          # Schema migrations
│   └── seeds/               # Initial data
├── infrastructure/          # DevOps configuration
│   ├── docker/              # Container definitions
│   ├── kubernetes/          # K8s manifests
│   └── monitoring/          # Prometheus/Grafana
└── docs/                    # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- Oracle Database or PostgreSQL

### Installation

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd Inventory_Monitoring_Enterprise
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Configure database, SMTP, and other settings
   ```

3. **Database Setup**
   ```bash
   cd database
   # Run migrations and seed data
   ```

4. **Start Services**
   ```bash
   docker-compose up -d
   ```

5. **Access Dashboard**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - Grafana: http://localhost:3002

## 📊 Dashboard Features

### Inventory Health Dashboard
- Color-coded bar chart of OnHand vs. threshold by category
- Real-time inventory status across product families
- Drill-down tables with filtering capabilities

### Best-Seller Trends Dashboard
- Line chart of six-month sales for current Best Sellers
- Week-over-week comparison analytics
- Interactive filtering by SKU, date, category

## 🔧 Configuration

### Admin Interface
- Adjust tier thresholds and reorder quantities
- Configure email recipients and schedules
- Set up alert preferences and monitoring rules

### ETL Pipeline
- Configure NAV export file paths
- Set processing schedules (default: 2 AM daily)
- Customize validation rules and error handling

## 📈 Monitoring & Alerts

### Alert Types
1. **Low-Stock Alerts**: Immediate notification when Best Sellers go below threshold
2. **Demotion Alerts**: Notification when SKUs move to lower tiers
3. **Daily Digest**: Consolidated morning report of all events
4. **Error Alerts**: System failure notifications to administrators

### Monitoring Stack
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Centralized Logging**: Structured log aggregation
- **Health Checks**: Automated system monitoring

## 🔒 Security

- **Secrets Management**: Vault/Azure Key Vault integration
- **Authentication**: JWT-based API security
- **Data Encryption**: At-rest and in-transit encryption
- **Access Control**: Role-based permissions

## 🚀 Deployment

### Development
```bash
npm run dev:frontend
npm run dev:backend
python etl/scripts/main.py
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
kubectl apply -f infrastructure/kubernetes/
```

## 📝 API Documentation

### Core Endpoints
- `GET /api/inventory/status` - Current inventory state
- `GET /api/bestsellers` - Best seller analytics
- `POST /api/config` - Update system configuration
- `GET /api/alerts` - Alert history and status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

---

**Inventory Monitoring Enterprise** - Oracle-grade inventory management, automated and intelligent. 