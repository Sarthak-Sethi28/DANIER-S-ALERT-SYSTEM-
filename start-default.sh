#!/bin/bash

# Default Danier Stock Alert System Startup
# This script ensures proper virtual environment activation and system startup

echo "🚀 Starting Danier Stock Alert System (Default Mode)"
echo "=================================================="

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f uvicorn 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true
sleep 3

# Check if virtual environment exists
VENV_PATH="../danier_env"
if [ ! -d "$VENV_PATH" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    cd ..
    python3 -m venv danier_env
    cd danier-stock-alert
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
if [ -f "$VENV_PATH/bin/activate" ]; then
    source "$VENV_PATH/bin/activate"
    echo "✅ Virtual environment activated"
else
    echo "❌ Failed to activate virtual environment"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  Some dependencies may not have installed properly"
fi

# Initialize database
echo "🗄️  Initializing database..."
python -c "
import sys
sys.path.append('.')
from database import init_db
init_db()
print('Database initialized successfully')
" 2>/dev/null || echo "⚠️  Database initialization warning"

# Start backend in background
echo "🚀 Starting backend on port 8000..."
python -m uvicorn main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
for i in {1..20}; do
    if curl -f http://localhost:8000/ >/dev/null 2>&1; then
        echo "✅ Backend is running!"
        break
    fi
    if [ $i -eq 20 ]; then
        echo "❌ Backend failed to start. Check backend.log for details"
        exit 1
    fi
    sleep 1
done

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Frontend dependencies installed"
    else
        echo "⚠️  Some frontend dependencies may not have installed properly"
    fi
fi

# Start frontend in background
echo "🚀 Starting frontend on port 3000..."
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
for i in {1..30}; do
    if curl -f http://localhost:3000/ >/dev/null 2>&1; then
        echo "✅ Frontend is running!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  Frontend may still be starting. Check frontend.log for details"
    fi
    sleep 2
done

# Create system status
echo "📋 Creating system status..."
cat > SYSTEM_STATUS.txt << EOF
DANIER STOCK ALERT SYSTEM - RUNNING
====================================
DATE: $(date)
STATUS: ✅ OPERATIONAL

BACKEND:
- PID: $BACKEND_PID
- URL: http://localhost:8000
- Log: backend.log

FRONTEND:
- PID: $FRONTEND_PID
- URL: http://localhost:3000
- Log: frontend.log

EMAIL CONFIGURATION:
- SMTP: smtp.gmail.com:587
- From: danieralertsystem@gmail.com
- Recipients: danieralertsystem@gmail.com, sarthaksethi2803@gmail.com

VIRTUAL ENVIRONMENT:
- Path: $VENV_PATH
- Status: ✅ Active

SYSTEM READY FOR USE ✅
EOF

echo ""
echo "🎉 SYSTEM IS READY!"
echo "=================================================="
echo "📊 Frontend (Upload Page): http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "📋 Backend PID: $BACKEND_PID"
echo "📋 Frontend PID: $FRONTEND_PID"
echo "📋 Virtual Environment: $VENV_PATH"
echo ""
echo "📋 To stop: ./stop-system.sh"
echo "📋 View logs: tail -f backend.log frontend.log"
echo "📋 System status: cat SYSTEM_STATUS.txt"
echo "=================================================="

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    pkill -f uvicorn 2>/dev/null
    pkill -f "npm start" 2>/dev/null
    echo "✅ Services stopped"
    
    # Update system status
    echo "SYSTEM STOPPED - $(date)" > SYSTEM_STATUS.txt
    exit 0
}

# Setup signal handling
trap cleanup SIGINT SIGTERM

# Keep script running and show status
echo "Press Ctrl+C to stop all services"
echo "System is running... (check logs for details)"

# Wait for processes
wait 