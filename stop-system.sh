#!/bin/bash

# Stop Danier Stock Alert System
echo "🛑 Stopping Danier Stock Alert System"
echo "===================================="

# Kill all related processes
echo "🧹 Stopping backend processes..."
pkill -f uvicorn 2>/dev/null || true
pkill -f "python -m uvicorn" 2>/dev/null || true

echo "🧹 Stopping frontend processes..."
pkill -f "npm start" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true
pkill -f "node.*react-scripts" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Check if any processes are still running
BACKEND_RUNNING=$(pgrep -f uvicorn | wc -l)
FRONTEND_RUNNING=$(pgrep -f "npm start\|react-scripts" | wc -l)

if [ $BACKEND_RUNNING -eq 0 ] && [ $FRONTEND_RUNNING -eq 0 ]; then
    echo "✅ All services stopped successfully"
else
    echo "⚠️  Some processes may still be running"
    if [ $BACKEND_RUNNING -gt 0 ]; then
        echo "   Backend processes: $BACKEND_RUNNING"
        pgrep -f uvicorn | xargs ps -p
    fi
    if [ $FRONTEND_RUNNING -gt 0 ]; then
        echo "   Frontend processes: $FRONTEND_RUNNING"
        pgrep -f "npm start\|react-scripts" | xargs ps -p
    fi
fi

# Update system status
echo "SYSTEM STOPPED - $(date)" > SYSTEM_STATUS.txt

echo ""
echo "📋 System Status: SYSTEM_STATUS.txt"
echo "📋 To restart: ./start-default.sh"
echo "====================================" 