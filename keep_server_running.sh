#!/bin/bash

# Permanent Server Manager for Danier Stock Alert System
# Ensures backend and frontend stay online 24/7

echo "🔥 Starting Danier Server - Permanent Mode"
echo "=========================================="

# Function to start backend
start_backend() {
    echo "🚀 Starting backend server..."
    cd backend
    source ../../danier_env/bin/activate
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend started with PID: $BACKEND_PID"
}

# Function to start frontend  
start_frontend() {
    echo "🚀 Starting frontend..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    echo "✅ Frontend started with PID: $FRONTEND_PID"
}

# Function to check if backend is running
check_backend() {
    curl -f http://localhost:8000/ >/dev/null 2>&1
    return $?
}

# Function to check if frontend is running
check_frontend() {
    curl -f http://localhost:3000/ >/dev/null 2>&1
    return $?
}

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
sleep 3

# Start backend
start_backend
sleep 5

# Start frontend if not running
if ! check_frontend; then
    start_frontend
    sleep 10
fi

# Monitor and restart if needed
echo "🛡️  Monitoring server health..."
while true; do
    # Check backend
    if ! check_backend; then
        echo "❌ Backend down! Restarting..."
        pkill -f "uvicorn" 2>/dev/null || true
        sleep 2
        start_backend
        sleep 5
    fi
    
    # Check frontend
    if ! check_frontend; then
        echo "❌ Frontend down! Restarting..."
        pkill -f "npm start" 2>/dev/null || true
        sleep 2
        start_frontend
        sleep 10
    fi
    
    # Status check
    backend_status="❌"
    frontend_status="❌"
    
    if check_backend; then
        backend_status="✅"
    fi
    
    if check_frontend; then
        frontend_status="✅"
    fi
    
    echo "$(date): Backend $backend_status | Frontend $frontend_status"
    
    # Wait before next check
    sleep 30
done 