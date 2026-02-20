#!/bin/bash

# Danier Inventory Alert System - User Ready Startup Script
# This script ensures the system is always ready for end users

echo "🚀 Starting Danier Inventory Alert System..."
echo "=========================================="

# Check if virtual environment exists
if [ ! -d "../danier_env" ]; then
    echo "❌ Virtual environment not found. Please run setup first."
    exit 1
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source ../danier_env/bin/activate

# Check if uploads directory exists, create if not
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p uploads
fi

# Check if database exists
if [ ! -f "danier_stock_alert.db" ]; then
    echo "🗄️ Initializing database..."
    python -c "
import sys
sys.path.append('backend')
from backend.database import init_db
init_db()
print('Database initialized successfully')
"
fi

# Check if any files exist in uploads directory
if [ -z "$(ls -A uploads 2>/dev/null)" ]; then
    echo "⚠️ No inventory files found in uploads directory"
    echo "📋 This is normal for first-time users"
    echo "💡 Users should upload their first inventory file through the web interface"
else
    echo "✅ Found inventory files in uploads directory"
fi

# Start the backend server
echo "🌐 Starting backend server..."
echo "📱 The system will be available at: http://localhost:8000"
echo "📋 User Guide: USER_GUIDE.md"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=========================================="

cd backend && python main.py 