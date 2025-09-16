@echo off
REM Quiet Hours Scheduler Setup Script for Windows

echo 🚀 Setting up Quiet Hours Scheduler...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo 🔧 Creating environment file...
    copy environment.config.txt .env.local
    echo ✅ Created .env.local file
    echo ⚠️  Please edit .env.local and add your service credentials
) else (
    echo ✅ .env.local already exists
)

REM Check if .env.local has been configured
findstr /C:"your_supabase_url" .env.local >nul
if %errorlevel% equ 0 (
    echo.
    echo ⚠️  IMPORTANT: Please configure your .env.local file with:
    echo    - Supabase URL and keys
    echo    - MongoDB connection string
    echo    - SendGrid API key (optional^)
    echo.
    echo 📖 See QUICKSTART.md for detailed setup instructions
) else (
    echo ✅ Environment variables appear to be configured
)

echo.
echo 🎉 Setup complete! Next steps:
echo    1. Configure .env.local with your service credentials
echo    2. Run: npm run dev
echo    3. Open: http://localhost:3000
echo.
echo 📚 Read QUICKSTART.md for detailed instructions

pause
