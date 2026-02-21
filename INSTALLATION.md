# PLO-GA Mapping System - Installation Guide

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)
8. [Deployment Checklist](#deployment-checklist)

---

## System Requirements

### Minimum Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, Ubuntu 20.04+ (or equivalent Linux distribution)
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 2 GB free disk space
- **Network**: Internet connection for initial setup and package downloads

### Software Requirements

- **Node.js**: Version 18.x or higher
- **pnpm**: Version 8.x or higher (package manager)
- **Python**: Version 3.8 or higher
- **MySQL/MariaDB**: Version 8.0+ or compatible database (TiDB, PlanetScale, etc.)
- **Git**: For cloning the repository

---

## Prerequisites

Before installing the PLO-GA Mapping System, ensure you have the following software installed on your machine.

### 1. Install Node.js

Download and install Node.js from the official website: [https://nodejs.org/](https://nodejs.org/)

Verify installation:
```bash
node --version
# Should output v18.x.x or higher
```

### 2. Install pnpm

After installing Node.js, install pnpm globally:
```bash
npm install -g pnpm
```

Verify installation:
```bash
pnpm --version
# Should output 8.x.x or higher
```

### 3. Install Python

Download and install Python from: [https://www.python.org/downloads/](https://www.python.org/downloads/)

**Important**: During installation on Windows, check the box "Add Python to PATH"

Verify installation:
```bash
python --version
# or
python3 --version
# Should output Python 3.8.x or higher
```

### 4. Install MySQL/MariaDB

**Option A: MySQL**
- Download from: [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
- Follow the installation wizard
- Remember the root password you set during installation

**Option B: MariaDB**
- Download from: [https://mariadb.org/download/](https://mariadb.org/download/)
- Follow the installation wizard

**Option C: Use Cloud Database** (Recommended for production)
- TiDB Cloud: [https://tidbcloud.com/](https://tidbcloud.com/)
- PlanetScale: [https://planetscale.com/](https://planetscale.com/)
- AWS RDS, Azure Database for MySQL, etc.

Verify MySQL installation:
```bash
mysql --version
# Should output mysql Ver 8.0.x or higher
```

### 5. Install Git

Download from: [https://git-scm.com/downloads](https://git-scm.com/downloads)

Verify installation:
```bash
git --version
```

---

## Installation Steps

### Step 1: Clone the Repository

Open a terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
git clone https://github.com/agastli/plo-ga-mapping-system.git
cd plo-ga-mapping-system
```

### Step 2: Install Node.js Dependencies

Install all required Node.js packages:

```bash
pnpm install
```

This will install all dependencies listed in `package.json`, including:
- Express.js (backend server)
- React (frontend framework)
- tRPC (API layer)
- Drizzle ORM (database ORM)
- Vite (build tool)
- And many others

### Step 3: Install Python Dependencies

Install required Python packages for document parsing and export:

```bash
# On Windows
pip install python-docx openpyxl reportlab

# On macOS/Linux
pip3 install python-docx openpyxl reportlab
```

**Python Dependencies:**
- `python-docx`: For parsing and generating Word documents
- `openpyxl`: For generating Excel spreadsheets
- `reportlab`: For generating PDF documents

---

## Database Setup

### Step 1: Create Database

Connect to your MySQL server and create a new database:

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create a dedicated user (recommended)
CREATE USER 'plo_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON plo_ga_mapping.* TO 'plo_user'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

### Step 2: Configure Database Connection

Create a `.env` file in the project root directory:

```bash
# On Windows
copy .env.example .env

# On macOS/Linux
cp .env.example .env
```

Edit the `.env` file and add your database connection string:

```env
DATABASE_URL=mysql://plo_user:your_secure_password@localhost:3306/plo_ga_mapping
```

**Connection String Format:**
```
mysql://[username]:[password]@[host]:[port]/[database_name]
```

**Examples:**

Local MySQL:
```
DATABASE_URL=mysql://root:password@localhost:3306/plo_ga_mapping
```

TiDB Cloud:
```
DATABASE_URL=mysql://user.root:password@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/plo_ga_mapping?ssl={"rejectUnauthorized":true}
```

### Step 3: Run Database Migrations

Initialize the database schema:

```bash
pnpm db:push
```

This command will:
1. Read the schema from `drizzle/schema.ts`
2. Generate SQL migration files in `drizzle/` directory
3. Execute the migrations to create all necessary tables

**Tables created:**
- `users` - User accounts
- `colleges` - Academic colleges
- `departments` - Academic departments
- `programs` - Academic programs
- `graduateAttributes` - 5 Graduate Attributes
- `competencies` - 21 Competencies
- `plos` - Program Learning Outcomes
- `mappings` - PLO-to-Competency weight mappings
- `justifications` - Competency justifications
- `auditLog` - Change tracking
- `reportTemplates` - Custom export templates

### Step 4: Seed Initial Data (Graduate Attributes & Competencies)

The system requires 5 Graduate Attributes and 21 Competencies to be pre-populated. Run:

```bash
node scripts/seed-ga-competencies.js
```

If this script doesn't exist, you can manually insert the data using the SQL scripts in `drizzle/seed/` directory, or use the web interface to add them after starting the application.

---

## Environment Configuration

### Required Environment Variables

Create or edit the `.env` file in the project root:

```env
# Database Connection
DATABASE_URL=mysql://username:password@host:port/database

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (generate a random string)
JWT_SECRET=your-random-jwt-secret-key-here

# OAuth Configuration (if using Manus OAuth)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=your-app-id

# Application Metadata
OWNER_NAME=Qatar University
OWNER_OPEN_ID=admin@qu.edu.qa
VITE_APP_TITLE=PLO-GA Mapping System
VITE_APP_LOGO=/qu-logo.png

# Analytics (optional)
VITE_ANALYTICS_WEBSITE_ID=your-analytics-id
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
```

### Generate JWT Secret

Generate a secure random string for JWT_SECRET:

**On Linux/macOS:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

---

## Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
pnpm dev
```

This will:
1. Start the Express backend server on `http://localhost:3000`
2. Start the Vite frontend development server
3. Enable hot module replacement (HMR) for instant updates

Open your browser and navigate to:
```
http://localhost:3000
```

### Production Build

Build the application for production:

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

The production build will:
1. Compile TypeScript to JavaScript
2. Bundle and minify frontend assets
3. Optimize for performance

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Cannot find module 'python-docx'"

**Solution:**
```bash
pip install python-docx openpyxl reportlab
```

#### Issue 2: "ECONNREFUSED" - Cannot connect to database

**Causes:**
- MySQL server is not running
- Incorrect database credentials
- Wrong host/port in DATABASE_URL

**Solutions:**
1. Start MySQL service:
   ```bash
   # Windows
   net start MySQL80
   
   # macOS
   brew services start mysql
   
   # Linux
   sudo systemctl start mysql
   ```

2. Verify credentials:
   ```bash
   mysql -u username -p
   ```

3. Check DATABASE_URL format in `.env`

#### Issue 3: "Port 3000 is already in use"

**Solution:**
Change the port in `.env`:
```env
PORT=3001
```

Or kill the process using port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill
```

#### Issue 4: Python script execution fails

**Causes:**
- Python not in PATH
- Wrong Python command (`python` vs `python3`)

**Solutions:**
1. Verify Python installation:
   ```bash
   python --version
   python3 --version
   ```

2. Update `server/_core/index.ts` if needed to use `python3` instead of `python`

#### Issue 5: Database migration fails

**Solution:**
1. Drop and recreate the database:
   ```sql
   DROP DATABASE plo_ga_mapping;
   CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Run migrations again:
   ```bash
   pnpm db:push
   ```

#### Issue 6: "Module not found" errors after git pull

**Solution:**
```bash
# Reinstall dependencies
pnpm install

# Clear cache and rebuild
rm -rf node_modules/.vite
pnpm build
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All dependencies installed (`pnpm install`)
- [ ] Python packages installed (`pip install python-docx openpyxl reportlab`)
- [ ] Database created and accessible
- [ ] `.env` file configured with production values
- [ ] Database migrations run successfully (`pnpm db:push`)
- [ ] Graduate Attributes and Competencies seeded
- [ ] Application builds without errors (`pnpm build`)
- [ ] All tests pass (`pnpm test`)

### Production Environment

- [ ] Use production database (not localhost)
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable SSL/TLS for database connections
- [ ] Configure firewall rules
- [ ] Set up backup strategy for database
- [ ] Configure logging and monitoring
- [ ] Set up reverse proxy (Nginx/Apache) if needed
- [ ] Configure domain name and SSL certificate

### Post-Deployment

- [ ] Verify application is accessible
- [ ] Test file upload functionality
- [ ] Test document parsing (Word import)
- [ ] Test export functionality (PDF, Word, Excel, CSV)
- [ ] Test analytics dashboards
- [ ] Verify database backups are working
- [ ] Monitor application logs for errors
- [ ] Set up automated backups
- [ ] Document any production-specific configurations

---

## Additional Resources

### Project Structure

```
plo-ga-mapping-system/
├── client/                  # Frontend React application
│   ├── public/             # Static assets (logos, images)
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       ├── lib/            # Utilities and tRPC client
│       └── App.tsx         # Main app component
├── server/                  # Backend Express application
│   ├── _core/              # Core server functionality
│   ├── db.ts               # Database query helpers
│   └── routers.ts          # tRPC API routes
├── drizzle/                 # Database schema and migrations
│   └── schema.ts           # Database table definitions
├── scripts/                 # Python scripts for parsing/export
│   ├── parse-docx.py       # Word document parser
│   ├── export-to-pdf.py    # PDF export generator
│   ├── export-to-excel.py  # Excel export generator
│   └── export-to-word.py   # Word export generator
├── .env                     # Environment variables (create this)
├── package.json             # Node.js dependencies
└── INSTALLATION.md          # This file
```

### Useful Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm test                   # Run tests

# Database
pnpm db:push                # Run database migrations
pnpm db:studio              # Open Drizzle Studio (database GUI)

# Git
git pull origin main        # Pull latest changes
git add .                   # Stage all changes
git commit -m "message"     # Commit changes
git push origin main        # Push to GitHub
```

### Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the project README.md
3. Check GitHub Issues: https://github.com/agastli/plo-ga-mapping-system/issues
4. Contact: Academic Planning & Quality Assurance Office, Qatar University

---

**Last Updated**: February 2026  
**Version**: 1.0.0
