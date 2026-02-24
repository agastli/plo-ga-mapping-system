# Git Operations and Daily Maintenance Guide

## Overview

This guide covers Git operations, pulling updates from GitHub, and day-to-day maintenance tasks for the PLO-GA Mapping System. This complements the main DEPLOYMENT_GUIDE.md with practical commands for regular operations.

---

## Quick Start: Pulling Updates from GitHub

### Basic Update Procedure

```bash
# 1. Navigate to project directory
cd /home/agastli/htdocs/plo-ga.gastli.org

# 2. Stop the application
pm2 stop plo-ga-mapping

# 3. Pull latest changes
git pull origin main

# 4. Install any new dependencies
npm install

# 5. Restart the application
pm2 restart plo-ga-mapping

# 6. Check logs
pm2 logs plo-ga-mapping --lines 20
```

### Safe Update with Backup

```bash
# 1. Backup database first
mysqldump -u root -p plo_ga_mapping > /home/agastli/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Check what will be updated
git fetch origin
git log HEAD..origin/main --oneline

# 3. Pull updates
git pull origin main

# 4. Install dependencies
npm install

# 5. Restart application
pm2 restart plo-ga-mapping
```

---

## Git Operations

### Checking Status

```bash
# View current status
git status

# View what branch you're on
git branch

# View recent commits
git log --oneline -10

# View remote repositories
git remote -v
```

### Pulling Changes

```bash
# Pull from main branch
git pull origin main

# Pull and show what changed
git pull origin main --verbose

# Pull specific branch
git pull origin development
```

### Viewing Changes Before Pulling

```bash
# Fetch updates without applying them
git fetch origin

# See what commits will be pulled
git log HEAD..origin/main --oneline

# See detailed changes
git diff HEAD..origin/main

# See files that changed
git diff --name-only HEAD..origin/main
```

### Handling Local Changes

If you have local changes when pulling:

```bash
# Option 1: Stash changes temporarily
git stash                    # Save local changes
git pull origin main         # Pull updates
git stash pop               # Reapply your changes

# Option 2: Commit local changes first
git add .
git commit -m "Local changes before pull"
git pull origin main

# Option 3: Discard local changes (⚠️ WARNING: Loses changes!)
git reset --hard HEAD
git pull origin main
```

### Resolving Merge Conflicts

If you encounter conflicts during pull:

```bash
# 1. Git will show conflicted files
git status

# 2. Open conflicted files and look for:
#    <<<<<<< HEAD
#    Your changes
#    =======
#    Incoming changes
#    >>>>>>> origin/main

# 3. Edit files to resolve conflicts

# 4. Mark as resolved
git add conflicted_file.js

# 5. Complete the merge
git commit -m "Resolved merge conflicts"

# 6. Restart application
pm2 restart plo-ga-mapping
```

### Viewing Commit History

```bash
# Last 10 commits
git log --oneline -10

# Detailed log
git log -5

# Visual tree
git log --graph --oneline --all

# Commits by specific author
git log --author="username"

# Commits in date range
git log --since="2 weeks ago"

# Changes in specific file
git log --follow -- path/to/file.js
```

### Checking Differences

```bash
# Uncommitted changes
git diff

# Changes in specific file
git diff path/to/file.js

# Compare with specific commit
git diff abc1234

# Compare two commits
git diff abc1234 def5678

# Compare with remote
git diff origin/main
```

---

## Common Update Scenarios

### Scenario 1: Simple Update (No Local Changes)

```bash
cd /home/agastli/htdocs/plo-ga.gastli.org
pm2 stop plo-ga-mapping
git pull origin main
npm install
pm2 start plo-ga-mapping
pm2 logs plo-ga-mapping
```

### Scenario 2: Update with Database Changes

```bash
# Backup database
mysqldump -u root -p plo_ga_mapping > /home/agastli/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Pull changes
cd /home/agastli/htdocs/plo-ga.gastli.org
pm2 stop plo-ga-mapping
git pull origin main
npm install

# Run migrations if needed
npm run db:push

# Restart
pm2 start plo-ga-mapping
pm2 logs plo-ga-mapping
```

### Scenario 3: Update with Python Dependencies

```bash
cd /home/agastli/htdocs/plo-ga.gastli.org
pm2 stop plo-ga-mapping
git pull origin main
npm install
pip3 install -r requirements.txt  # If requirements.txt exists
pm2 start plo-ga-mapping
```

### Scenario 4: Emergency Rollback

```bash
# View recent commits
git log --oneline -10

# Rollback to previous commit
git reset --hard abc1234  # Replace with actual commit hash

# Reinstall dependencies
npm install

# Restart
pm2 restart plo-ga-mapping
```

---

## PM2 Process Management

### Basic Commands

```bash
# View status
pm2 status

# Start application
pm2 start plo-ga-mapping

# Stop application
pm2 stop plo-ga-mapping

# Restart application
pm2 restart plo-ga-mapping

# Delete from PM2
pm2 delete plo-ga-mapping

# View logs
pm2 logs plo-ga-mapping

# View last 50 lines
pm2 logs plo-ga-mapping --lines 50

# View only errors
pm2 logs plo-ga-mapping --err

# Clear logs
pm2 flush plo-ga-mapping

# Monitor resources
pm2 monit
```

### Advanced PM2 Operations

```bash
# Reload with zero downtime
pm2 reload plo-ga-mapping

# Restart with delay
pm2 restart plo-ga-mapping --wait-ready

# View detailed info
pm2 show plo-ga-mapping

# Save current process list
pm2 save

# Resurrect saved processes
pm2 resurrect
```

---

## Database Operations

### Quick Backup

```bash
# Backup with timestamp
mysqldump -u root -p plo_ga_mapping > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup to specific directory
mysqldump -u root -p plo_ga_mapping > /home/agastli/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
mysqldump -u root -p plo_ga_mapping | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Quick Restore

```bash
# Stop application
pm2 stop plo-ga-mapping

# Restore from backup
mysql -u root -p plo_ga_mapping < backup_20260224_150000.sql

# Restart application
pm2 start plo-ga-mapping
```

### Database Checks

```bash
# View all tables
mysql -u root -p plo_ga_mapping -e "SHOW TABLES;"

# Count records
mysql -u root -p plo_ga_mapping -e "SELECT COUNT(*) FROM programs;"

# Check database size
mysql -u root -p -e "
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM 
    information_schema.tables
WHERE 
    table_schema = 'plo_ga_mapping';
"
```

---

## Monitoring and Logs

### Application Logs

```bash
# Real-time logs
pm2 logs plo-ga-mapping

# Last 100 lines
pm2 logs plo-ga-mapping --lines 100

# Filter for errors
pm2 logs plo-ga-mapping | grep -i error

# Save logs to file
pm2 logs plo-ga-mapping --lines 1000 > app_logs_$(date +%Y%m%d).txt
```

### System Logs

```bash
# MySQL error log
sudo tail -f /var/log/mysql/error.log

# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# System log
sudo journalctl -f
```

### Resource Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU and processes
top
# or
htop

# Check port usage
sudo netstat -tulpn | grep 3001

# Check running Node processes
ps aux | grep node
```

---

## Troubleshooting Common Issues

### Issue: "Permission denied" during git pull

```bash
# Fix file ownership
sudo chown -R agastli:agastli /home/agastli/htdocs/plo-ga.gastli.org

# Verify permissions
ls -la /home/agastli/htdocs/plo-ga.gastli.org
```

### Issue: "Port already in use"

```bash
# Find process using port
sudo lsof -i :3001

# Kill process
kill -9 <PID>

# Or restart PM2
pm2 restart plo-ga-mapping
```

### Issue: "Module not found" after pull

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
pm2 restart plo-ga-mapping
```

### Issue: Application won't start

```bash
# Check PM2 logs
pm2 logs plo-ga-mapping --err

# Check if database is accessible
mysql -u root -p plo_ga_mapping -e "SELECT 1;"

# Check environment variables
cat .env

# Restart with verbose logging
pm2 delete plo-ga-mapping
pm2 start npm --name "plo-ga-mapping" -- start
pm2 logs plo-ga-mapping
```

### Issue: Git conflicts during pull

```bash
# See conflicted files
git status

# Option 1: Keep remote version
git checkout --theirs conflicted_file.js
git add conflicted_file.js

# Option 2: Keep local version
git checkout --ours conflicted_file.js
git add conflicted_file.js

# Option 3: Manually resolve
nano conflicted_file.js
# Edit and save
git add conflicted_file.js

# Complete merge
git commit -m "Resolved conflicts"
```

---

## Automated Update Script

Create `/home/agastli/scripts/update_app.sh`:

```bash
#!/bin/bash

# PLO-GA Mapping System Update Script
set -e

PROJECT_DIR="/home/agastli/htdocs/plo-ga.gastli.org"
BACKUP_DIR="/home/agastli/backups"
PM2_NAME="plo-ga-mapping"

echo "=========================================="
echo "PLO-GA Mapping System Update"
echo "Started at: $(date)"
echo "=========================================="

# Backup database
echo "Backing up database..."
mysqldump -u root -p plo_ga_mapping > $BACKUP_DIR/pre_update_$(date +%Y%m%d_%H%M%S).sql
echo "✓ Database backed up"

# Navigate to project
cd $PROJECT_DIR

# Check for updates
echo "Checking for updates..."
git fetch origin
UPDATES=$(git log HEAD..origin/main --oneline)

if [ -z "$UPDATES" ]; then
    echo "No updates available"
    exit 0
fi

echo "Updates found:"
echo "$UPDATES"
echo ""

# Pull updates
echo "Pulling updates..."
git pull origin main
echo "✓ Code updated"

# Install dependencies
echo "Installing dependencies..."
npm install
echo "✓ Dependencies installed"

# Restart application
echo "Restarting application..."
pm2 restart $PM2_NAME
echo "✓ Application restarted"

# Check status
echo "Checking status..."
sleep 3
pm2 status

echo ""
echo "=========================================="
echo "Update completed at: $(date)"
echo "=========================================="
```

Make executable:
```bash
chmod +x /home/agastli/scripts/update_app.sh
```

Run:
```bash
/home/agastli/scripts/update_app.sh
```

---

## Daily Maintenance Checklist

### Morning Check (5 minutes)

```bash
# 1. Check application status
pm2 status

# 2. Check for errors in logs
pm2 logs plo-ga-mapping --lines 50 --err

# 3. Check disk space
df -h

# 4. Check database connectivity
mysql -u root -p plo_ga_mapping -e "SELECT COUNT(*) FROM programs;"
```

### Weekly Maintenance (15 minutes)

```bash
# 1. Check for updates
cd /home/agastli/htdocs/plo-ga.gastli.org
git fetch origin
git log HEAD..origin/main --oneline

# 2. Review logs
pm2 logs plo-ga-mapping --lines 500 > weekly_logs_$(date +%Y%m%d).txt

# 3. Backup database
mysqldump -u root -p plo_ga_mapping | gzip > /home/agastli/backups/weekly_backup_$(date +%Y%m%d).sql.gz

# 4. Clean old backups (keep last 30 days)
find /home/agastli/backups -name "*.sql" -mtime +30 -delete
find /home/agastli/backups -name "*.sql.gz" -mtime +30 -delete

# 5. Check system resources
free -h
df -h
```

### Monthly Maintenance (30 minutes)

```bash
# 1. Update system packages
sudo apt update
sudo apt upgrade -y

# 2. Update Node.js packages
cd /home/agastli/htdocs/plo-ga.gastli.org
npm outdated
npm update

# 3. Optimize database
mysql -u root -p plo_ga_mapping -e "OPTIMIZE TABLE programs, plos, plo_ga_mappings, justifications;"

# 4. Review and archive old logs
pm2 flush plo-ga-mapping

# 5. Check SSL certificate expiry
sudo certbot certificates

# 6. Review security updates
sudo apt list --upgradable
```

---

## Quick Reference

### Most Common Commands

```bash
# Update application
cd /home/agastli/htdocs/plo-ga.gastli.org && git pull origin main && npm install && pm2 restart plo-ga-mapping

# Backup database
mysqldump -u root -p plo_ga_mapping > backup_$(date +%Y%m%d_%H%M%S).sql

# View logs
pm2 logs plo-ga-mapping

# Check status
pm2 status

# Restart application
pm2 restart plo-ga-mapping

# Rollback to previous commit
git reset --hard HEAD~1 && npm install && pm2 restart plo-ga-mapping
```

---

## Related Documentation

- `DEPLOYMENT_GUIDE.md` - Complete deployment procedures for Windows and Linux
- `DATABASE_MANAGEMENT.md` - Detailed database operations and SQL commands
- `TROUBLESHOOTING.md` - Common issues and solutions
- `README.md` - Application overview and setup

---

*Last updated: 2026-02-24*
