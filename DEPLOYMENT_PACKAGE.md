# Authentication System Deployment Package

## Overview

This package contains all the changes needed to deploy the traditional username/password authentication system to your VPS at plo-ga.gastli.org.

## Changed Files

### 1. Database Schema
- **File:** `drizzle/schema.ts`
- **Changes:** Added `username` and `password` fields to users table, made `openId` optional

### 2. Authentication Logic
- **File:** `server/auth.ts` (NEW)
- **Purpose:** Password hashing and authentication functions using bcrypt

### 3. API Endpoints
- **File:** `server/routers.ts`
- **Changes:** Added login endpoint to auth router

### 4. Frontend Pages
- **File:** `client/src/pages/Login.tsx` (NEW)
- **Purpose:** Login page with username/password form

- **File:** `client/src/pages/UserManagement.tsx` (NEW)
- **Purpose:** Admin page to manage users and roles

### 5. Routing
- **File:** `client/src/App.tsx`
- **Changes:** Added /login and /admin/users routes

### 6. Dependencies
- **File:** `package.json`
- **Changes:** Added bcryptjs and @types/bcryptjs

### 7. Database Migration
- **File:** `migrations/add-username-password.sql` (NEW)
- **Purpose:** SQL script to add username/password columns

### 8. Admin User Script
- **File:** `scripts/create-admin-user.js` (NEW)
- **Purpose:** Node.js script to create admin user with correct password hash

### 9. Deployment Guide
- **File:** `VPS_AUTH_DEPLOYMENT.md` (NEW)
- **Purpose:** Step-by-step deployment instructions

## How to Deploy to VPS

Since your VPS uses a separate GitHub repository, you have two options:

### Option A: Manual File Upload via SSH

1. **Connect to VPS:**
   ```bash
   ssh root@76.13.210.6
   cd /home/agastli/plo-ga-mapping
   ```

2. **Create backup:**
   ```bash
   cp -r /home/agastli/plo-ga-mapping /home/agastli/plo-ga-mapping-backup-$(date +%Y%m%d)
   ```

3. **Download files from this Manus project:**
   - I'll provide download links for all changed files
   - Upload them to VPS using SCP or SFTP

4. **Follow VPS_AUTH_DEPLOYMENT.md instructions**

### Option B: Push to Your GitHub Repository

1. **Clone your VPS GitHub repository locally:**
   ```bash
   git clone https://github.com/agastli/plo-ga-mapping.git
   cd plo-ga-mapping
   ```

2. **Copy changed files from this Manus project to your local clone**

3. **Commit and push:**
   ```bash
   git add -A
   git commit -m "feat: Add username/password authentication system"
   git push origin main
   ```

4. **Pull on VPS:**
   ```bash
   ssh root@76.13.210.6
   cd /home/agastli/plo-ga-mapping
   git pull origin main
   ```

5. **Follow VPS_AUTH_DEPLOYMENT.md instructions**

## Quick Start Commands for VPS

Once files are on the VPS:

```bash
# 1. Install dependencies
pnpm install

# 2. Run migration (update with your DB credentials)
mysql -h localhost -u your_db_user -p your_db_name < migrations/add-username-password.sql

# 3. Create admin user
node scripts/create-admin-user.js

# 4. Build application
pnpm run build

# 5. Restart PM2
pm2 restart plo-ga-mapping

# 6. Test login
# Open: https://plo-ga.gastli.org/login
# Username: admin
# Password: AdelJapan@1987
```

## Files to Download

I'll create a ZIP package with all the files you need. The package will include:

1. All changed source files
2. New migration scripts
3. Admin user creation script
4. Deployment guide
5. Updated package.json

## Verification Checklist

After deployment:

- [ ] Login page accessible at /login
- [ ] Can login with admin/AdelJapan@1987
- [ ] Redirects to home page after login
- [ ] User management page accessible at /admin/users
- [ ] Can create new users
- [ ] Can assign roles to users
- [ ] PM2 shows app running without errors
- [ ] No errors in PM2 logs

## Rollback Plan

If something goes wrong:

```bash
# Stop PM2
pm2 stop plo-ga-mapping

# Restore backup
rm -rf /home/agastli/plo-ga-mapping
cp -r /home/agastli/plo-ga-mapping-backup-YYYYMMDD /home/agastli/plo-ga-mapping

# Restart PM2
cd /home/agastli/plo-ga-mapping
pm2 restart plo-ga-mapping
```

## Support

If you encounter issues:

1. Check PM2 logs: `pm2 logs plo-ga-mapping`
2. Check Nginx logs: `tail -f /home/agastli/logs/nginx/error.log`
3. Check database: `mysql -h localhost -u user -p db_name -e "DESCRIBE users;"`
4. Verify admin user: `mysql -h localhost -u user -p db_name -e "SELECT * FROM users WHERE username='admin';"`

## Next Steps

1. I'll create a downloadable ZIP package with all files
2. You download the ZIP
3. Upload to VPS or push to your GitHub
4. Follow VPS_AUTH_DEPLOYMENT.md
5. Test the system
6. Report any issues

Let me know when you're ready and I'll prepare the download package!
