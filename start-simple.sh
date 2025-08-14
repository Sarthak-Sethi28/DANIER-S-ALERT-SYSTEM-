#!/bin/bash

# Simple & Reliable Danier Stock Alert System Startup
echo "🚀 Starting Danier Stock Alert System (Simple Mode)"
echo "=============================================="

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f uvicorn 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true
sleep 3

# Check virtual environment
if [ ! -d "../danier_env" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    cd ..
    python3 -m venv danier_env
    cd danier-stock-alert
fi

# Activate virtual environment and install dependencies
echo "📦 Setting up backend..."
source ../danier_env/bin/activate
cd backend
pip install -r requirements.txt > /dev/null 2>&1

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
    sleep 1
done

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install > /dev/null 2>&1
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
    sleep 2
done

echo ""
echo "🎉 SYSTEM IS READY!"
echo "=============================================="
echo "📊 Frontend (Upload Page): http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "📋 Backend PID: $BACKEND_PID"
echo "📋 Frontend PID: $FRONTEND_PID"
echo ""
echo "📋 To stop: killall -f uvicorn && killall -f node"
echo "📋 View logs: tail -f backend.log frontend.log"
echo "=============================================="

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    pkill -f uvicorn 2>/dev/null
    pkill -f "npm start" 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Setup signal handling
trap cleanup SIGINT SIGTERM

# Keep script running
echo "Press Ctrl+C to stop all services"
wait 