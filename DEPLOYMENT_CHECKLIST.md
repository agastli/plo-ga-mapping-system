# PLO-GA Mapping System - Deployment Checklist

## Pre-Deployment

### Backup Current State
- [ ] Backup database: `mysqldump -u root -p plo_ga_mapping > backup_$(date +%Y%m%d_%H%M%S).sql`
- [ ] Backup code: `tar -czf code_backup_$(date +%Y%m%d).tar.gz /home/agastli/htdocs/plo-ga.gastli.org/`
- [ ] Note current application version: `git log --oneline -1`
- [ ] Document current PM2 status: `pm2 status`

### Verify System Resources
- [ ] Check disk space: `df -h` (need at least 2GB free)
- [ ] Check memory: `free -h` (need at least 1GB free)
- [ ] Check database size: `du -sh /var/lib/mysql/plo_ga_mapping`

### Review Changes
- [ ] Check what will be pulled: `git fetch origin && git log HEAD..origin/main --oneline`
- [ ] Review commit messages for breaking changes
- [ ] Check if database migrations are needed
- [ ] Check if new dependencies are required

---

## Deployment Steps

### 1. Stop Application
- [ ] Stop PM2 process: `pm2 stop plo-ga-mapping`
- [ ] Verify stopped: `pm2 status`

### 2. Pull Latest Code
- [ ] Navigate to project: `cd /home/agastli/htdocs/plo-ga.gastli.org`
- [ ] Check current branch: `git branch`
- [ ] Pull updates: `git pull origin main`
- [ ] Verify pull successful: `git log --oneline -3`

### 3. Install Dependencies
- [ ] Install Node.js packages: `npm install`
- [ ] Install Python packages (if needed): `pip3 install -r requirements.txt`
- [ ] Verify installations: `npm list --depth=0`

### 4. Run Database Migrations (if applicable)
- [ ] Check for schema changes: Review migration files
- [ ] Run migrations: `npm run db:push` or manual SQL
- [ ] Verify migrations: `mysql -u root -p plo_ga_mapping -e "SHOW TABLES;"`

### 5. Test Configuration
- [ ] Verify `.env` file exists and is correct
- [ ] Check database credentials: `cat .env | grep DATABASE`
- [ ] Verify Python path: `which python`

### 6. Start Application
- [ ] Start PM2 process: `pm2 start plo-ga-mapping`
- [ ] Verify started: `pm2 status`
- [ ] Check for errors: `pm2 logs plo-ga-mapping --lines 20`

---

## Post-Deployment Verification

### Application Health
- [ ] Check application is running: `pm2 status`
- [ ] Test health endpoint: `curl http://localhost:3001/api/trpc/health.check`
- [ ] Check logs for errors: `pm2 logs plo-ga-mapping --err --lines 50`

### Functional Testing
- [ ] Access website: https://plo-ga.gastli.org
- [ ] Test login functionality
- [ ] Test program listing page
- [ ] Upload a test document
- [ ] View program mapping matrix
- [ ] Test export functionality (PDF, Word, Excel)
- [ ] Test analytics dashboard

### Database Verification
- [ ] Check database connectivity: `mysql -u root -p plo_ga_mapping -e "SELECT COUNT(*) FROM programs;"`
- [ ] Verify data integrity: Check program counts match expected
- [ ] Test database queries: Run sample queries

### Performance Check
- [ ] Monitor CPU usage: `top` or `htop`
- [ ] Monitor memory usage: `free -h`
- [ ] Check response times: Test page load speeds
- [ ] Monitor PM2 metrics: `pm2 monit`

---

## Rollback Procedure (If Issues Occur)

### Quick Rollback
- [ ] Stop application: `pm2 stop plo-ga-mapping`
- [ ] Rollback code: `git reset --hard HEAD~1`
- [ ] Reinstall dependencies: `npm install`
- [ ] Restore database: `mysql -u root -p plo_ga_mapping < backup_file.sql`
- [ ] Start application: `pm2 start plo-ga-mapping`
- [ ] Verify rollback: Test application functionality

### Document Issues
- [ ] Note error messages: `pm2 logs plo-ga-mapping --err > deployment_errors.log`
- [ ] Document steps taken
- [ ] Create issue in GitHub if needed

---

## Post-Deployment Tasks

### Monitoring
- [ ] Monitor logs for 15 minutes: `pm2 logs plo-ga-mapping`
- [ ] Check for any unusual errors or warnings
- [ ] Monitor system resources: `pm2 monit`

### Documentation
- [ ] Update deployment log with date, version, and any issues
- [ ] Document any configuration changes made
- [ ] Update README if deployment process changed

### Communication
- [ ] Notify team of successful deployment
- [ ] Document any known issues or limitations
- [ ] Update status page if applicable

### Cleanup
- [ ] Remove old backup files (older than 30 days): `find /home/agastli/backups -name "*.sql" -mtime +30 -delete`
- [ ] Clear PM2 old logs: `pm2 flush plo-ga-mapping`
- [ ] Clean temporary files: `rm -rf /tmp/plo-ga-*`

---

## Emergency Contacts

### System Access
- **SSH:** `ssh agastli@your-server-ip`
- **CloudPanel:** https://your-server-ip:8443
- **hPanel:** https://hpanel.hostinger.com

### Support Resources
- **Hostinger Support:** 24/7 live chat
- **GitHub Repository:** https://github.com/agastli/plo-ga-mapping-system
- **Documentation:** See TROUBLESHOOTING.md, DATABASE_MANAGEMENT.md, GIT_OPERATIONS.md

---

## Quick Commands Reference

```bash
# Check application status
pm2 status

# View logs
pm2 logs plo-ga-mapping

# Restart application
pm2 restart plo-ga-mapping

# Check disk space
df -h

# Check memory
free -h

# Backup database
mysqldump -u root -p plo_ga_mapping > backup_$(date +%Y%m%d_%H%M%S).sql

# Pull latest code
cd /home/agastli/htdocs/plo-ga.gastli.org && git pull origin main

# Install dependencies
npm install

# Check health
curl http://localhost:3001/api/trpc/health.check
```

---

## Notes

- Always backup before deployment
- Test in staging environment if available
- Deploy during low-traffic periods
- Have rollback plan ready
- Monitor for at least 15 minutes post-deployment
- Document any issues encountered

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version Deployed:** _______________  
**Issues Encountered:** _______________  
**Resolution:** _______________  

---

*Last updated: 2026-02-24*
