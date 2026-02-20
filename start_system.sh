#!/bin/bash

# Danier Stock Alert System Startup Script

echo "🚀 Starting Danier Stock Alert System..."
echo "========================================="

# Check if in correct directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the danier-stock-alert directory"
    exit 1
fi

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal trapping
trap cleanup SIGINT SIGTERM

# Start Backend
echo "📦 Starting Backend (FastAPI)..."
cd backend
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp env_example.txt .env
fi

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "../danier_env" ]; then
    source ../danier_env/bin/activate
fi

uvicorn main:app --reload --host 0.0.0.0 --port 8000 > /dev/null 2>&1 &
BACKEND_PID=$!
cd ..

echo "✅ Backend started on http://localhost:8000"

# Wait a moment for backend to start
sleep 2

# Start Frontend
echo "🌐 Starting Frontend (React)..."
cd frontend
npm start > /dev/null 2>&1 &
FRONTEND_PID=$!
cd ..

echo "✅ Frontend starting on http://localhost:3000"
echo ""
echo "🎯 System Ready!"
echo "========================================="
echo "📊 Dashboard: http://localhost:3000"
echo "🔧 API Docs:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo "========================================="

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID 