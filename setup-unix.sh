#!/bin/bash
# PLO-GA Mapping System - Linux/macOS Setup Script
# This script automates the installation process on Unix-based systems

set -e  # Exit on error

echo "========================================"
echo "PLO-GA Mapping System - Setup Wizard"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "[1/8] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed!${NC}"
    echo "Please install Node.js from: https://nodejs.org/"
    echo ""
    echo "On macOS with Homebrew:"
    echo "  brew install node"
    echo ""
    echo "On Ubuntu/Debian:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    echo ""
    exit 1
fi
echo -e "${GREEN}Node.js is installed.${NC}"
node --version
echo ""

# Check if pnpm is installed
echo "[2/8] Checking pnpm installation..."
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm is not installed. Installing pnpm...${NC}"
    npm install -g pnpm
fi
echo -e "${GREEN}pnpm is installed.${NC}"
pnpm --version
echo ""

# Check if Python is installed
echo "[3/8] Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
    PIP_CMD=pip3
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
    PIP_CMD=pip
else
    echo -e "${RED}ERROR: Python is not installed!${NC}"
    echo "Please install Python from: https://www.python.org/downloads/"
    echo ""
    echo "On macOS with Homebrew:"
    echo "  brew install python"
    echo ""
    echo "On Ubuntu/Debian:"
    echo "  sudo apt-get install python3 python3-pip"
    echo ""
    exit 1
fi
echo -e "${GREEN}Python is installed.${NC}"
$PYTHON_CMD --version
echo ""

# Check if MySQL is installed
echo "[4/8] Checking MySQL installation..."
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}WARNING: MySQL is not detected!${NC}"
    echo "Please ensure MySQL/MariaDB is installed and running."
    echo ""
    echo "On macOS with Homebrew:"
    echo "  brew install mysql"
    echo "  brew services start mysql"
    echo ""
    echo "On Ubuntu/Debian:"
    echo "  sudo apt-get install mysql-server"
    echo "  sudo systemctl start mysql"
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to exit..."
else
    echo -e "${GREEN}MySQL is installed.${NC}"
    mysql --version
fi
echo ""

# Install Node.js dependencies
echo "[5/8] Installing Node.js dependencies..."
echo "This may take a few minutes..."
pnpm install
echo -e "${GREEN}Node.js dependencies installed successfully.${NC}"
echo ""

# Install Python dependencies
echo "[6/8] Installing Python dependencies..."
$PIP_CMD install python-docx openpyxl reportlab
echo -e "${GREEN}Python dependencies installed successfully.${NC}"
echo ""

# Create .env file if it doesn't exist
echo "[7/8] Configuring environment..."
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Database Connection
DATABASE_URL=mysql://root:password@localhost:3306/plo_ga_mapping

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (generate a secure random string)
JWT_SECRET=change-this-to-a-secure-random-string

# Application Metadata
OWNER_NAME=Qatar University
OWNER_OPEN_ID=admin@qu.edu.qa
VITE_APP_TITLE=PLO-GA Mapping System
VITE_APP_LOGO=/qu-logo.png
EOF
    echo -e "${GREEN}.env file created.${NC} Please edit it with your database credentials!"
    echo ""
else
    echo ".env file already exists."
    echo ""
fi

# Database setup instructions
echo "[8/8] Database Setup"
echo ""
echo -e "${YELLOW}IMPORTANT: Before running the application, you need to:${NC}"
echo "1. Start your MySQL server"
echo "2. Create a database named 'plo_ga_mapping'"
echo "3. Update the DATABASE_URL in the .env file with your credentials"
echo "4. Run: pnpm db:push"
echo ""
echo "To create the database, run these MySQL commands:"
echo "  mysql -u root -p"
echo "  CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "  EXIT;"
echo ""
echo "After setting up the database, run: pnpm db:push"
echo ""

# Make scripts executable
chmod +x scripts/*.py 2>/dev/null || true

# Setup complete
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Edit the .env file with your database credentials"
echo "2. Create the database: plo_ga_mapping"
echo "3. Run database migrations: pnpm db:push"
echo "4. Start the development server: pnpm dev"
echo ""
echo "For detailed instructions, see INSTALLATION.md"
echo ""
