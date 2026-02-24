# PLO-GA Mapping System - Documentation Index

## Overview

This document provides an index of all available documentation for the PLO-GA Mapping System.

---

## Documentation Files

### 1. TROUBLESHOOTING.md
**Purpose:** Comprehensive troubleshooting guide covering all issues encountered during deployment and operation.

**Contents:**
- Database connectivity issues
- MySQL decimal type cross-platform differences
- Export file download failures
- Word export type mismatch errors
- Python environment dependencies
- Cross-platform compatibility checklist
- Debugging techniques
- Performance considerations

**When to use:** When encountering errors, deployment issues, or cross-platform compatibility problems.

---

### 2. DATABASE_MANAGEMENT.md
**Purpose:** Complete guide for database operations, backup, and restore procedures.

**Contents:**
- Exporting database to SQL file (full, partial, compressed)
- Importing SQL files to database
- Creating new database from backup
- Automated backup scripts
- Common database operations
- Database migration between environments
- Troubleshooting database issues
- Security best practices

**When to use:** For database backups, restores, imports, exports, and maintenance.

---

### 3. GIT_OPERATIONS.md
**Purpose:** Day-to-day Git operations and maintenance procedures.

**Contents:**
- Pulling updates from GitHub
- Handling merge conflicts
- Viewing commit history and differences
- PM2 process management
- Quick database operations
- Monitoring and logs
- Troubleshooting common issues
- Automated update scripts
- Daily/weekly/monthly maintenance checklists

**When to use:** For regular updates, Git operations, and daily maintenance tasks.

---

### 4. DEPLOYMENT_GUIDE.md
**Purpose:** Complete deployment procedures for Windows and Linux servers.

**Contents:**
- Windows deployment (IIS, WAMP, PM2)
- Linux deployment (Nginx, Apache)
- Database configuration
- SSL certificate setup
- Security hardening
- Production configuration
- Monitoring and maintenance

**When to use:** For initial deployment or setting up new servers.

---

## Quick Reference by Task

### Pulling Updates from GitHub

**See:** GIT_OPERATIONS.md → "Quick Start: Pulling Updates from GitHub"

```bash
cd /home/agastli/htdocs/plo-ga.gastli.org
pm2 stop plo-ga-mapping
git pull origin main
npm install
pm2 restart plo-ga-mapping
```

---

### Backing Up Database

**See:** DATABASE_MANAGEMENT.md → "Exporting the Database to SQL File"

```bash
mysqldump -u root -p plo_ga_mapping > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

### Restoring Database

**See:** DATABASE_MANAGEMENT.md → "Importing SQL File to Database"

```bash
pm2 stop plo-ga-mapping
mysql -u root -p plo_ga_mapping < backup_file.sql
pm2 start plo-ga-mapping
```

---

### Troubleshooting Export Issues

**See:** TROUBLESHOOTING.md → "Issue 4: Word Export Failure"

Common issues:
- PDF export working but Word fails
- Type mismatch errors
- File download 404 errors

---

### Troubleshooting Mapping Matrix Display

**See:** TROUBLESHOOTING.md → "Issue 2: Mapping Matrix Not Displaying"

Symptoms:
- Matrix shows empty on Linux but works on Windows
- Database has data but frontend shows nothing
- No console errors

---

### Checking Application Logs

**See:** GIT_OPERATIONS.md → "Monitoring and Logs"

```bash
pm2 logs plo-ga-mapping
pm2 logs plo-ga-mapping --lines 100
pm2 logs plo-ga-mapping --err
```

---

### Rolling Back Changes

**See:** GIT_OPERATIONS.md → "Scenario 4: Emergency Rollback"

```bash
git log --oneline -10
git reset --hard commit_hash
npm install
pm2 restart plo-ga-mapping
```

---

## Maintenance Schedules

### Daily (5 minutes)
**See:** GIT_OPERATIONS.md → "Daily Maintenance Checklist"

- Check application status
- Review error logs
- Check disk space
- Verify database connectivity

---

### Weekly (15 minutes)
**See:** GIT_OPERATIONS.md → "Weekly Maintenance"

- Check for updates
- Review logs
- Backup database
- Clean old backups
- Check system resources

---

### Monthly (30 minutes)
**See:** GIT_OPERATIONS.md → "Monthly Maintenance"

- Update system packages
- Update Node.js packages
- Optimize database
- Archive old logs
- Check SSL certificate expiry
- Review security updates

---

## Common Scenarios

### Scenario: New deployment on fresh server
**See:** DEPLOYMENT_GUIDE.md

Follow the complete deployment guide for your operating system (Windows or Linux).

---

### Scenario: Updating existing installation
**See:** GIT_OPERATIONS.md → "Common Update Scenarios"

Choose the appropriate scenario:
- Simple update (no local changes)
- Update with database changes
- Update with Python dependencies
- Emergency rollback

---

### Scenario: Application not starting after update
**See:** TROUBLESHOOTING.md + GIT_OPERATIONS.md → "Troubleshooting Common Issues"

Steps:
1. Check PM2 logs
2. Verify database connectivity
3. Check environment variables
4. Review recent changes
5. Consider rollback if needed

---

### Scenario: Export functionality broken
**See:** TROUBLESHOOTING.md → "Issue 3" and "Issue 4"

Common causes:
- File path encoding issues
- Type mismatch (string vs number)
- Missing Python dependencies
- Permission issues

---

### Scenario: Database corruption or data loss
**See:** DATABASE_MANAGEMENT.md → "Importing SQL File to Database"

Steps:
1. Stop application
2. Restore from most recent backup
3. Verify data integrity
4. Restart application
5. Test functionality

---

### Scenario: Cross-platform compatibility issues
**See:** TROUBLESHOOTING.md → "Cross-Platform Compatibility Checklist"

Common issues:
- Decimal type handling (Windows vs Linux)
- Path separators
- File permissions
- Line endings
- Case sensitivity

---

## Emergency Procedures

### Emergency: Application down
1. Check PM2 status: `pm2 status`
2. View error logs: `pm2 logs plo-ga-mapping --err`
3. Restart application: `pm2 restart plo-ga-mapping`
4. If still down, check TROUBLESHOOTING.md

---

### Emergency: Database inaccessible
1. Check MySQL status: `sudo systemctl status mysql`
2. Restart MySQL: `sudo systemctl restart mysql`
3. Check credentials in `.env` file
4. Review DATABASE_MANAGEMENT.md → "Troubleshooting Database Issues"

---

### Emergency: Disk full
1. Check disk space: `df -h`
2. Clean old backups: `find /home/agastli/backups -name "*.sql" -mtime +30 -delete`
3. Clear PM2 logs: `pm2 flush plo-ga-mapping`
4. Clean temp files: `rm -rf /tmp/*`

---

### Emergency: Need to rollback immediately
1. View recent commits: `git log --oneline -10`
2. Rollback: `git reset --hard previous_commit_hash`
3. Reinstall: `npm install`
4. Restart: `pm2 restart plo-ga-mapping`
5. See GIT_OPERATIONS.md for detailed rollback procedures

---

## File Locations

### Application Files
- **Project Directory:** `/home/agastli/htdocs/plo-ga.gastli.org`
- **Logs:** PM2 logs (view with `pm2 logs`)
- **Temp Files:** `/tmp` or project `/temp` directory
- **Environment Config:** `.env` file in project root

### Backup Files
- **Database Backups:** `/home/agastli/backups/`
- **Recommended naming:** `backup_YYYYMMDD_HHMMSS.sql`

### System Logs
- **MySQL:** `/var/log/mysql/error.log`
- **Nginx:** `/var/log/nginx/access.log` and `/var/log/nginx/error.log`
- **Apache:** `/var/log/apache2/error.log`

---

## Contact and Support

### Internal Documentation
All documentation is maintained in the GitHub repository:
- https://github.com/agastli/plo-ga-mapping-system

### Updating Documentation
When encountering new issues or procedures:
1. Document the issue and solution
2. Update the appropriate documentation file
3. Commit and push changes
4. Update this index if adding new documentation

---

## Version History

- **v1.0** (2026-02-24): Initial documentation compilation
  - TROUBLESHOOTING.md created
  - DATABASE_MANAGEMENT.md created
  - GIT_OPERATIONS.md created
  - requirements.txt added
  - README_DOCS.md created

---

*For the main application README, see README.md*
*Last updated: 2026-02-24*
