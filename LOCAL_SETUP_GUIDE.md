# PLO-GA Mapping System - Local Setup Guide (Windows)

This guide will help you run the entire application on your local Windows machine with WAMP.

## Prerequisites

1. **WAMP Server** (already installed)
2. **Node.js** (version 18 or higher)
3. **Python** (version 3.8 or higher)
4. **Git** (for pulling updates)

---

## Step 1: Install Node.js

1. Download Node.js from https://nodejs.org/ (LTS version recommended)
2. Run the installer and follow the prompts
3. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

---

## Step 2: Install Python

1. Download Python from https://python.org/downloads/
2. **IMPORTANT**: During installation, check "Add Python to PATH"
3. Verify installation:
   ```cmd
   python --version
   ```
4. Install required Python library:
   ```cmd
   python -m pip install python-docx
   ```

---

## Step 3: Set Up the Project

1. **Navigate to project directory:**
   ```cmd
   cd C:\wamp\www\plo-ga-mapping-system
   ```

2. **Pull the latest code:**
   ```cmd
   git pull origin main
   ```

3. **Install Node.js dependencies:**
   ```cmd
   npm install -g pnpm
   pnpm install
   ```

---

## Step 4: Configure Database

1. **Open phpMyAdmin** (http://localhost/phpmyadmin)

2. **Create database** (if not already created):
   ```sql
   CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Create `.env` file** in the project root (`C:\wamp\www\plo-ga-mapping-system\.env`):
   ```env
   DATABASE_URL=mysql://root:@localhost:3306/plo_ga_mapping
   NODE_ENV=development
   PORT=3000
   ```
   
   **Note**: Replace `root:` with your MySQL username and password if different (e.g., `root:password@localhost`)

4. **Run database migrations:**
   ```cmd
   pnpm db:push
   ```

5. **Seed the database with QU programs:**
   - Open phpMyAdmin
   - Select `plo_ga_mapping` database
   - Go to SQL tab
   - Copy and paste contents of `scripts/seed-all-qu-programs.sql`
   - Click "Go"

---

## Step 5: Start the Development Server

1. **Start the server:**
   ```cmd
   pnpm run dev
   ```

2. **Open your browser:**
   - Go to http://localhost:3000
   - You should see the PLO-GA Mapping System homepage

---

## Step 6: Test Document Upload

1. Go to http://localhost:3000/upload
2. Click "Choose File" and select a Word document
3. Click "Parse Document"
4. Review the extracted data
5. Select a program from the dropdown
6. Click "Import Data"

---

## Common Issues

### Issue 1: "python: command not found"

**Solution**: Python is not in your PATH. Reinstall Python and make sure to check "Add Python to PATH" during installation.

### Issue 2: "ModuleNotFoundError: No module named 'docx'"

**Solution**: Install python-docx:
```cmd
python -m pip install python-docx
```

### Issue 3: "Error: connect ECONNREFUSED 127.0.0.1:3306"

**Solution**: 
- Make sure WAMP is running (green icon in system tray)
- Check that MySQL service is started
- Verify database credentials in `.env` file

### Issue 4: Port 3000 already in use

**Solution**: Change the port in `.env`:
```env
PORT=3001
```
Then access the app at http://localhost:3001

---

## Project Structure

```
C:\wamp\www\plo-ga-mapping-system\
├── client/              # Frontend React application
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable UI components
│   │   └── lib/        # Utilities and tRPC client
│   └── public/         # Static assets
├── server/              # Backend Express + tRPC server
│   ├── routers.ts      # API endpoints
│   ├── db.ts           # Database queries
│   └── _core/          # Framework code
├── drizzle/             # Database schema and migrations
│   └── schema.ts       # Database tables definition
├── scripts/             # Utility scripts
│   ├── parse-docx.py   # Word document parser
│   └── seed-*.sql      # Database seed files
├── .env                 # Environment variables (create this)
└── package.json         # Node.js dependencies
```

---

## Useful Commands

```cmd
# Start development server
pnpm run dev

# Push database schema changes
pnpm db:push

# Run tests
pnpm test

# Build for production
pnpm build

# Pull latest code from GitHub
git pull origin main

# Install new dependencies
pnpm install
```

---

## Next Steps

After successful setup:

1. **Upload test documents** - Try uploading the existing mapping documents
2. **Explore the database** - Check phpMyAdmin to see the imported data
3. **View programs** - Click "View Programs" to see all 54 QU programs
4. **Check analytics** - Click "View Dashboard" to see alignment statistics

---

## Support

If you encounter any issues not covered in this guide, please check:
- Node.js version: `node --version` (should be 18+)
- Python version: `python --version` (should be 3.8+)
- WAMP status: Green icon in system tray
- MySQL status: Check WAMP control panel
