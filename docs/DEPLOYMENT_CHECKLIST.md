# Deployment Checklist & Quick Start Guide

This document provides a step-by-step checklist for deploying the PLO-GA Mapping System on a new machine.

---

## Quick Start (5 Minutes)

For experienced developers who want to get started quickly:

```bash
# 1. Clone the repository
git clone https://github.com/agastli/plo-ga-mapping-system.git
cd plo-ga-mapping-system

# 2. Run automated setup (Windows: setup-windows.bat, Unix: ./setup-unix.sh)
./setup-unix.sh  # or setup-windows.bat on Windows

# 3. Create database
mysql -u root -p -e "CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Configure .env file
# Edit .env with your database credentials

# 5. Run migrations
pnpm db:push

# 6. Start the application
pnpm dev
```

Open browser: `http://localhost:3000`

---

## Complete Deployment Checklist

### Phase 1: Pre-Installation (15 minutes)

- [ ] **System Requirements Met**
  - [ ] Operating System: Windows 10+, macOS 10.15+, or Ubuntu 20.04+
  - [ ] RAM: 4GB minimum (8GB recommended)
  - [ ] Disk Space: 2GB free
  - [ ] Internet connection available

- [ ] **Prerequisites Installed**
  - [ ] Node.js 18.x or higher (`node --version`)
  - [ ] pnpm 8.x or higher (`pnpm --version`)
  - [ ] Python 3.8 or higher (`python --version` or `python3 --version`)
  - [ ] MySQL 8.0+ or MariaDB 10.5+ (`mysql --version`)
  - [ ] Git (`git --version`)

- [ ] **Database Server Running**
  - [ ] MySQL/MariaDB service is started
  - [ ] Can connect to MySQL: `mysql -u root -p`
  - [ ] Root or admin password known

---

### Phase 2: Installation (10 minutes)

- [ ] **Clone Repository**
  ```bash
  git clone https://github.com/agastli/plo-ga-mapping-system.git
  cd plo-ga-mapping-system
  ```

- [ ] **Run Automated Setup Script**
  - **Windows**: Double-click `setup-windows.bat` or run in Command Prompt
  - **macOS/Linux**: Run `chmod +x setup-unix.sh && ./setup-unix.sh`

- [ ] **Verify Setup Completed Successfully**
  - [ ] Node.js dependencies installed (`node_modules/` folder exists)
  - [ ] Python dependencies installed (no import errors)
  - [ ] `.env` file created

---

### Phase 3: Database Configuration (10 minutes)

- [ ] **Create Database**
  ```bash
  mysql -u root -p
  ```
  ```sql
  CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER 'plo_user'@'localhost' IDENTIFIED BY 'secure_password_here';
  GRANT ALL PRIVILEGES ON plo_ga_mapping.* TO 'plo_user'@'localhost';
  FLUSH PRIVILEGES;
  EXIT;
  ```

- [ ] **Configure Environment Variables**
  - [ ] Edit `.env` file
  - [ ] Update `DATABASE_URL` with correct credentials
  - [ ] Generate and set secure `JWT_SECRET`
  - [ ] Verify other settings (PORT, OWNER_NAME, etc.)

- [ ] **Test Database Connection**
  ```bash
  mysql -u plo_user -p plo_ga_mapping -e "SELECT 1;"
  ```

- [ ] **Run Database Migrations**
  ```bash
  pnpm db:push
  ```
  - [ ] All 11 tables created successfully
  - [ ] No error messages

- [ ] **Seed Initial Data** (Optional but recommended)
  - [ ] Insert 5 Graduate Attributes
  - [ ] Insert 21 Competencies
  - [ ] Use SQL script from `docs/DATABASE_SETUP.md`

---

### Phase 4: Application Testing (10 minutes)

- [ ] **Start Development Server**
  ```bash
  pnpm dev
  ```
  - [ ] Server starts without errors
  - [ ] Console shows: "Server running on http://localhost:3000/"

- [ ] **Access Application**
  - [ ] Open browser: `http://localhost:3000`
  - [ ] Homepage loads correctly
  - [ ] QU logo displays
  - [ ] Navigation works

- [ ] **Test Core Features**
  - [ ] Navigate to Programs page
  - [ ] Navigate to Upload page
  - [ ] College/Department dropdowns work
  - [ ] Can upload a Word document (if test file available)
  - [ ] Analytics page loads

- [ ] **Test Export Features** (if data available)
  - [ ] PDF export works
  - [ ] Word export works
  - [ ] Excel export works
  - [ ] CSV export works

---

### Phase 5: Production Deployment (Optional)

Only complete this section if deploying to production.

- [ ] **Build for Production**
  ```bash
  pnpm build
  ```
  - [ ] Build completes without errors
  - [ ] `dist/` folder created

- [ ] **Production Environment Configuration**
  - [ ] Set `NODE_ENV=production` in `.env`
  - [ ] Use production database (not localhost)
  - [ ] Strong JWT_SECRET (32+ characters)
  - [ ] Database connection uses SSL/TLS
  - [ ] Firewall configured

- [ ] **Start Production Server**
  ```bash
  pnpm start
  ```
  - [ ] Application runs on configured PORT
  - [ ] No console errors

- [ ] **Security Checklist**
  - [ ] `.env` file not committed to Git
  - [ ] Strong database passwords
  - [ ] Database user has minimal required privileges
  - [ ] SSL/TLS enabled for database connections
  - [ ] Application behind reverse proxy (Nginx/Apache)
  - [ ] HTTPS configured (SSL certificate)
  - [ ] Firewall rules configured

- [ ] **Backup Strategy**
  - [ ] Automated daily database backups configured
  - [ ] Backup location secure and accessible
  - [ ] Backup restoration tested
  - [ ] Backup retention policy defined

- [ ] **Monitoring & Logging**
  - [ ] Application logs configured
  - [ ] Error monitoring set up
  - [ ] Performance monitoring enabled
  - [ ] Disk space monitoring
  - [ ] Database performance monitoring

---

## Common Issues During Deployment

### Issue 1: Port 3000 Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
1. Change PORT in `.env` to a different port (e.g., 3001)
2. Or kill the process using port 3000:
   - Windows: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`
   - Unix: `lsof -ti:3000 | xargs kill`

### Issue 2: Cannot Connect to Database

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions:**
1. Start MySQL service:
   - Windows: `net start MySQL80`
   - macOS: `brew services start mysql`
   - Linux: `sudo systemctl start mysql`
2. Verify DATABASE_URL in `.env`
3. Test connection: `mysql -u username -p`

### Issue 3: Python Module Not Found

**Symptoms:**
```
ModuleNotFoundError: No module named 'docx'
```

**Solution:**
```bash
pip install python-docx openpyxl reportlab
# or
pip3 install python-docx openpyxl reportlab
```

### Issue 4: pnpm Command Not Found

**Solution:**
```bash
npm install -g pnpm
```

### Issue 5: Database Migration Fails

**Symptoms:**
```
Error: Table 'colleges' already exists
```

**Solution:**
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE plo_ga_mapping; CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
pnpm db:push
```

---

## Post-Deployment Verification

After deployment, verify all features are working:

- [ ] **Basic Functionality**
  - [ ] Homepage loads
  - [ ] Navigation between pages works
  - [ ] Logos and images display correctly
  - [ ] Responsive design works on mobile

- [ ] **Data Management**
  - [ ] Can view programs list
  - [ ] Can upload Word documents
  - [ ] Document parsing works
  - [ ] Data saves to database

- [ ] **Analytics**
  - [ ] University-level analytics display
  - [ ] College-level analytics display
  - [ ] Department-level analytics display
  - [ ] Charts render correctly

- [ ] **Export Features**
  - [ ] PDF export generates correctly
  - [ ] Word export generates correctly
  - [ ] Excel export generates correctly
  - [ ] CSV export generates correctly
  - [ ] Batch export works
  - [ ] Downloaded files open without errors

- [ ] **Performance**
  - [ ] Pages load in < 3 seconds
  - [ ] No console errors in browser
  - [ ] No memory leaks
  - [ ] Database queries are fast

---

## Rollback Plan

If deployment fails, follow these steps to rollback:

1. **Stop the application**
   ```bash
   # Press Ctrl+C if running in terminal
   # Or kill the process
   ```

2. **Restore database from backup** (if changes were made)
   ```bash
   mysql -u username -p plo_ga_mapping < backup_file.sql
   ```

3. **Revert to previous Git commit** (if code was updated)
   ```bash
   git log  # Find previous commit hash
   git checkout <previous-commit-hash>
   pnpm install
   pnpm build
   ```

4. **Restart with previous version**
   ```bash
   pnpm start
   ```

---

## Maintenance Schedule

Recommended maintenance tasks:

**Daily:**
- [ ] Check application logs for errors
- [ ] Verify automated backups completed

**Weekly:**
- [ ] Review disk space usage
- [ ] Check database performance
- [ ] Test backup restoration

**Monthly:**
- [ ] Update dependencies (`pnpm update`)
- [ ] Review security patches
- [ ] Test disaster recovery procedures
- [ ] Review and archive old logs

**Quarterly:**
- [ ] Performance audit
- [ ] Security audit
- [ ] Update documentation
- [ ] Review and update backup retention policy

---

## Support & Resources

- **Installation Guide**: `INSTALLATION.md`
- **Database Setup**: `docs/DATABASE_SETUP.md`
- **GitHub Repository**: https://github.com/agastli/plo-ga-mapping-system
- **Issue Tracker**: https://github.com/agastli/plo-ga-mapping-system/issues

---

**Last Updated**: February 2026  
**Version**: 1.0.0
