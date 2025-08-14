#!/bin/bash

# Deploy Server Crash Fix Script
# This script helps deploy the fixes to prevent server crashes

echo "🚀 DEPLOYING SERVER CRASH FIX"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "backend/main.py" ]; then
    echo "❌ Error: Please run this script from the danier-stock-alert directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "../danier_env" ]; then
    echo "❌ Virtual environment not found. Please run setup first."
    exit 1
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source ../danier_env/bin/activate

# Install new dependency
echo "📦 Installing psutil for memory monitoring..."
pip install psutil>=5.9.0

# Test the backend locally first
echo "🧪 Testing backend locally..."
cd backend
python -c "
import sys
sys.path.append('.')
from main import app
print('✅ Backend imports successfully')
"

if [ $? -eq 0 ]; then
    echo "✅ Backend test passed"
else
    echo "❌ Backend test failed"
    exit 1
fi

cd ..

# Check git status
echo "📋 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Changes detected, committing..."
    git add .
    git commit -m "Fix server crash issue with lightweight upload processing and memory management"
    echo "✅ Changes committed"
else
    echo "📝 No changes to commit"
fi

# Push to Railway
echo "🚀 Pushing to Railway..."
git push

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to Railway"
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE!"
    echo "=============================="
    echo "📋 Next steps:"
    echo "1. Wait for Railway to deploy (usually 2-3 minutes)"
    echo "2. Check Railway logs for any errors"
    echo "3. Test upload functionality"
    echo "4. Monitor memory usage in logs"
    echo ""
    echo "🔍 To monitor deployment:"
    echo "- Check Railway dashboard for deployment status"
    echo "- Watch logs for memory usage messages"
    echo "- Test upload with a small file first"
    echo ""
    echo "✅ The server should now stay connected after uploads!"
else
    echo "❌ Failed to push to Railway"
    echo "Please check your git configuration and try again"
    exit 1
fi 