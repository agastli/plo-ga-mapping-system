@echo off
REM PLO-GA Mapping System - Windows Setup Script
REM This script automates the installation process on Windows

echo ========================================
echo PLO-GA Mapping System - Setup Wizard
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/8] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installation, run this script again.
    pause
    exit /b 1
)
echo Node.js is installed.
node --version
echo.

REM Check if pnpm is installed
echo [2/8] Checking pnpm installation...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo pnpm is not installed. Installing pnpm...
    npm install -g pnpm
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install pnpm!
        pause
        exit /b 1
    )
)
echo pnpm is installed.
pnpm --version
echo.

REM Check if Python is installed
echo [3/8] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo Please download and install Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation!
    echo After installation, run this script again.
    pause
    exit /b 1
)
echo Python is installed.
python --version
echo.

REM Check if MySQL is installed
echo [4/8] Checking MySQL installation...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MySQL is not detected!
    echo Please ensure MySQL/MariaDB is installed and running.
    echo You can download MySQL from: https://dev.mysql.com/downloads/mysql/
    echo.
    echo Press any key to continue anyway, or Ctrl+C to exit and install MySQL first.
    pause >nul
)
echo.

REM Install Node.js dependencies
echo [5/8] Installing Node.js dependencies...
echo This may take a few minutes...
pnpm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies!
    pause
    exit /b 1
)
echo Node.js dependencies installed successfully.
echo.

REM Install Python dependencies
echo [6/8] Installing Python dependencies...
pip install python-docx openpyxl reportlab
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies!
    pause
    exit /b 1
)
echo Python dependencies installed successfully.
echo.

REM Create .env file if it doesn't exist
echo [7/8] Configuring environment...
if not exist ".env" (
    echo Creating .env file...
    (
        echo # Database Connection
        echo DATABASE_URL=mysql://root:password@localhost:3306/plo_ga_mapping
        echo.
        echo # Server Configuration
        echo PORT=3000
        echo NODE_ENV=development
        echo.
        echo # JWT Secret ^(generate a secure random string^)
        echo JWT_SECRET=change-this-to-a-secure-random-string
        echo.
        echo # Application Metadata
        echo OWNER_NAME=Qatar University
        echo OWNER_OPEN_ID=admin@qu.edu.qa
        echo VITE_APP_TITLE=PLO-GA Mapping System
        echo VITE_APP_LOGO=/qu-logo.png
    ) > .env
    echo .env file created. Please edit it with your database credentials!
    echo.
) else (
    echo .env file already exists.
    echo.
)

REM Database setup instructions
echo [8/8] Database Setup
echo.
echo IMPORTANT: Before running the application, you need to:
echo 1. Start your MySQL server
echo 2. Create a database named 'plo_ga_mapping'
echo 3. Update the DATABASE_URL in the .env file with your credentials
echo 4. Run: pnpm db:push
echo.
echo To create the database, run these MySQL commands:
echo   mysql -u root -p
echo   CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo   EXIT;
echo.
echo After setting up the database, run: pnpm db:push
echo.

REM Setup complete
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit the .env file with your database credentials
echo 2. Create the database: plo_ga_mapping
echo 3. Run database migrations: pnpm db:push
echo 4. Start the development server: pnpm dev
echo.
echo For detailed instructions, see INSTALLATION.md
echo.
pause
