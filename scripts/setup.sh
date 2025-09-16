#!/bin/bash

# Quiet Hours Scheduler Setup Script
echo "🚀 Setting up Quiet Hours Scheduler..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating environment file..."
    cp environment.config.txt .env.local
    echo "✅ Created .env.local file"
    echo "⚠️  Please edit .env.local and add your service credentials"
else
    echo "✅ .env.local already exists"
fi

# Check if .env.local has been configured
if grep -q "your_supabase_url" .env.local; then
    echo ""
    echo "⚠️  IMPORTANT: Please configure your .env.local file with:"
    echo "   - Supabase URL and keys"
    echo "   - MongoDB connection string"  
    echo "   - SendGrid API key (optional)"
    echo ""
    echo "📖 See QUICKSTART.md for detailed setup instructions"
else
    echo "✅ Environment variables appear to be configured"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "   1. Configure .env.local with your service credentials"
echo "   2. Run: npm run dev"
echo "   3. Open: http://localhost:3000"
echo ""
echo "📚 Read QUICKSTART.md for detailed instructions"
