#!/bin/bash

echo "🚀 Setting up GitHub repository for automatic deployment to Render..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please run 'git init' first."
    exit 1
fi

echo "📝 Current git status:"
git status

echo ""
echo "🔗 To set up automatic deployment to Render:"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Name: inventory-monitoring-system"
echo "   - Make it public or private"
echo "   - Don't initialize with README (we already have one)"
echo ""
echo "2. Connect your local repository to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/inventory-monitoring-system.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Render:"
echo "   - Go to https://render.com"
echo "   - Sign up/Login with GitHub"
echo "   - Click 'New Web Service'"
echo "   - Connect your GitHub repository"
echo "   - Render will automatically detect the render.yaml file"
echo "   - Set your environment variables in Render dashboard"
echo ""
echo "4. After deployment, any changes you push to main will automatically deploy!"
echo ""
echo "✅ Your repository is ready for automatic deployment!"
echo ""
echo "📋 Next steps:"
echo "   - Create GitHub repository"
echo "   - Connect local repo to GitHub"
echo "   - Deploy to Render"
echo "   - Set environment variables"
echo "   - Test automatic deployment by making changes and pushing" 