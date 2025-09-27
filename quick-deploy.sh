#!/bin/bash
# One-click deployment script for Helio Telemedicine App

echo "🏥 Helio Telemedicine - One-Click Deployment"
echo "============================================"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is required but not installed."
    exit 1
fi

# Check if we're on Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "🪟 Windows detected - using python instead of python3"
    PYTHON_CMD="python"
else
    PYTHON_CMD="python3"
fi

echo "🚀 Choose your deployment platform:"
echo "1. Railway.app (Recommended - Free PostgreSQL)"
echo "2. Render.com (Free tier with limitations)"
echo "3. Manual setup instructions"

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🚄 Deploying to Railway.app..."
        $PYTHON_CMD deploy.py
        ;;
    2)
        echo "🎨 Setting up Render.com deployment..."
        $PYTHON_CMD deploy_render.py
        ;;
    3)
        echo "📋 Opening deployment guide..."
        if command -v start &> /dev/null; then
            start DEPLOYMENT_GUIDE.md
        elif command -v open &> /dev/null; then
            open DEPLOYMENT_GUIDE.md
        elif command -v xdg-open &> /dev/null; then
            xdg-open DEPLOYMENT_GUIDE.md
        else
            echo "Please open DEPLOYMENT_GUIDE.md manually"
        fi
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo "✅ Deployment process completed!"
echo "📱 Your Helio telemedicine app will be available shortly."