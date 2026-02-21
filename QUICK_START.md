# PLO-GA Mapping System - Quick Start Guide

## Overview

This guide provides step-by-step instructions for installing and running the PLO-GA Mapping System on a new laptop. The entire process takes approximately 30-45 minutes.

---

## What You'll Need

Before starting, ensure you have:
- A Windows 10/11, macOS, or Linux laptop
- Administrator/sudo privileges
- Internet connection
- At least 2 GB free disk space

---

## Installation Steps

### Step 1: Install Node.js (5 minutes)

Node.js is required to run the application server and build tools.

1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS (Long Term Support)** version
3. Run the installer and follow the prompts
4. **Important for Windows**: Check "Automatically install necessary tools" during installation

**Verify installation:**
```bash
node --version
# Should show v18.x.x or higher
```

### Step 2: Install pnpm Package Manager (2 minutes)

pnpm is a fast, disk-efficient package manager.

```bash
npm install -g pnpm
```

**Verify installation:**
```bash
pnpm --version
# Should show 8.x.x or higher
```

### Step 3: Install Python (5 minutes)

Python is required for document parsing and export functionality.

1. Visit [https://www.python.org/downloads/](https://www.python.org/downloads/)
2. Download Python 3.8 or higher
3. **Critical for Windows**: Check "Add Python to PATH" during installation
4. Complete the installation

**Verify installation:**
```bash
python --version
# Should show Python 3.8.x or higher
```

### Step 4: Install MySQL Database (10 minutes)

The system uses MySQL to store all program data.

**Option A: Install MySQL Locally**

1. Visit [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Download MySQL Community Server
3. Run the installer
4. **Remember the root password** you set during installation
5. Complete the installation

**Option B: Use WAMP/XAMPP (Easier for Windows)**

1. Download WAMP from [https://www.wampserver.com/](https://www.wampserver.com/)
2. Install WAMP (includes Apache, MySQL, and PHP)
3. Start WAMP server
4. MySQL will be available at `localhost:3306`
5. Default credentials: username=`root`, password=`` (empty)

**Verify MySQL is running:**
```bash
mysql --version
# Should show mysql Ver 8.0.x or higher
```

### Step 5: Clone the Project (3 minutes)

1. Install Git from [https://git-scm.com/downloads](https://git-scm.com/downloads) if not already installed
2. Open Terminal/Command Prompt/PowerShell
3. Navigate to where you want to install the project:

```bash
# Example: Install in your user directory
cd C:\Users\YourName\Documents  # Windows
cd ~/Documents                   # macOS/Linux
```

4. Clone the repository:

```bash
git clone https://github.com/agastli/plo-ga-mapping-system.git
cd plo-ga-mapping-system
```

### Step 6: Install Project Dependencies (5 minutes)

Install all required Node.js and Python packages:

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
pip install python-docx openpyxl reportlab
```

**Note**: If `pip` doesn't work, try `pip3` instead.

### Step 7: Configure Database (5 minutes)

1. Create the database:

```bash
# Connect to MySQL
mysql -u root -p
# Enter your MySQL root password when prompted

# Create database
CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit MySQL
EXIT;
```

2. Create environment configuration file:

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

3. Edit the `.env` file with a text editor and update the database connection:

```env
DATABASE_URL=mysql://root:your_password@localhost:3306/plo_ga_mapping
```

Replace `your_password` with your actual MySQL root password. If using WAMP with no password, use:

```env
DATABASE_URL=mysql://root:@localhost:3306/plo_ga_mapping
```

### Step 8: Initialize Database Schema (2 minutes)

Run database migrations to create all necessary tables:

```bash
pnpm db:push
```

This will create all required tables including colleges, departments, programs, PLOs, mappings, and justifications.

### Step 9: Start the Application (1 minute)

Start the development server:

```bash
pnpm dev
```

You should see output indicating the server is running:
```
Server running on http://localhost:3000/
```

### Step 10: Access the Application

Open your web browser and navigate to:

```
http://localhost:3000
```

You should see the PLO-GA Mapping System homepage with the Qatar University logo and maroon theme.

---

## Quick Test

To verify everything is working:

1. **Upload a Document**: Click "Upload Document" and try uploading a PLO-GA mapping Word document
2. **View Programs**: Click "View Programs", select a college, and browse programs
3. **View Analytics**: Click "View Analytics" to see university-level statistics
4. **Export**: Try exporting analytics reports in PDF, Excel, or Word format

---

## Common Issues and Quick Fixes

### Issue: "Cannot connect to database"

**Fix:**
1. Verify MySQL is running (check WAMP icon is green, or run `mysql --version`)
2. Check your `.env` file has the correct password
3. Try connecting manually: `mysql -u root -p`

### Issue: "Python module not found"

**Fix:**
```bash
pip install python-docx openpyxl reportlab
# If that doesn't work, try:
pip3 install python-docx openpyxl reportlab
```

### Issue: "Port 3000 already in use"

**Fix:**
1. Change port in `.env` file: `PORT=3001`
2. Or kill the process using port 3000:
   - Windows: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`
   - macOS/Linux: `lsof -ti:3000 | xargs kill`

### Issue: "pnpm: command not found"

**Fix:**
```bash
npm install -g pnpm
# Close and reopen your terminal
```

---

## Stopping the Application

To stop the development server:
- Press `Ctrl+C` in the terminal where `pnpm dev` is running

---

## Next Steps

After successful installation:

1. **Import Sample Data**: Upload your PLO-GA mapping documents through the Upload page
2. **Explore Analytics**: View alignment scores and coverage rates at different levels
3. **Export Reports**: Generate professional reports in PDF, Excel, or Word format
4. **Customize**: Add colleges, departments, and programs through the interface

---

## Getting Help

If you encounter issues:

1. Check the detailed [INSTALLATION.md](INSTALLATION.md) for more troubleshooting steps
2. Review the [DATABASE_SETUP.md](DATABASE_SETUP.md) for database-specific issues
3. Check GitHub Issues: [https://github.com/agastli/plo-ga-mapping-system/issues](https://github.com/agastli/plo-ga-mapping-system/issues)

---

**Estimated Total Time**: 30-45 minutes  
**Difficulty Level**: Beginner-friendly  
**Last Updated**: February 2026
