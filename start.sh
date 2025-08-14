#!/bin/bash

# Professional Danier Stock Alert System Startup
echo "🚀 Starting Danier Stock Alert System (Containerized)"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    echo "   Visit: https://www.docker.com/get-started"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

# Kill any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down 2>/dev/null || true

# Remove any existing images to force rebuild
echo "🔄 Rebuilding containers for latest changes..."
docker-compose build --no-cache

# Start the system
echo "🚀 Starting containerized system..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check backend health
echo "🔍 Checking backend health..."
for i in {1..30}; do
    if curl -f http://localhost:8000/ >/dev/null 2>&1; then
        echo "✅ Backend is healthy!"
        break
    fi
    echo "   Waiting for backend... (attempt $i/30)"
    sleep 2
done

# Check frontend
echo "🔍 Checking frontend..."
for i in {1..30}; do
    if curl -f http://localhost:3000/ >/dev/null 2>&1; then
        echo "✅ Frontend is healthy!"
        break
    fi
    echo "   Waiting for frontend... (attempt $i/30)"
    sleep 2
done

echo ""
echo "🎉 SYSTEM READY!"
echo "=================================================="
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "📋 To stop the system: docker-compose down"
echo "📋 To view logs: docker-compose logs -f"
echo "==================================================" 