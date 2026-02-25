# VPS Authentication System Deployment Guide

Quick guide for deploying the new username/password authentication system to plo-ga.gastli.org VPS.

## What's New
- ✅ Traditional username/password login (replaces Manus OAuth)
- ✅ Admin user: `admin` / `AdelJapan@1987`
- ✅ Login page at `/login`
- ✅ User management at `/admin/users`
- ✅ Bcrypt password hashing
- ✅ Role-based access control (admin/editor/viewer)

## Prerequisites
- SSH access to VPS: `76.13.210.6`
- Database credentials
- PM2 running the application

## Deployment Steps

### 1. Connect to VPS
```bash
ssh root@76.13.210.6
# Or: ssh agastli@76.13.210.6
```

### 2. Navigate to Project
```bash
cd /home/agastli/plo-ga-mapping
```

### 3. Pull Latest Code
```bash
git pull origin main
```

### 4. Install Dependencies
```bash
pnpm install
```

This installs:
- `bcryptjs` - Password hashing
- `@types/bcryptjs` - TypeScript types

### 5. Run Database Migration

**Check your database credentials first:**
```bash
cat .env | grep DATABASE_URL
```

**Run the migration:**
```bash
# If DATABASE_URL is set in .env:
node scripts/create-admin-user.js

# Or manually run SQL:
mysql -h localhost -u your_db_user -p your_db_name < migrations/add-username-password.sql
```

The migration adds:
- `username` column (VARCHAR 64, UNIQUE)
- `password` column (VARCHAR 255 for bcrypt hash)
- Makes `openId` optional

### 6. Create Admin User
```bash
node scripts/create-admin-user.js
```

Creates:
- Username: `admin`
- Password: `AdelJapan@1987`
- Email: `adel.gastli@gmail.com`
- Role: `admin`

### 7. Build Application
```bash
pnpm run build
```

### 8. Restart PM2
```bash
pm2 restart plo-ga-mapping

# Check status
pm2 status
pm2 logs plo-ga-mapping --lines 50
```

### 9. Verify Deployment

**Test login:**
1. Open: https://plo-ga.gastli.org/login
2. Username: `admin`
3. Password: `AdelJapan@1987`
4. Should redirect to home page

**Check database:**
```bash
mysql -h localhost -u your_db_user -p your_db_name -e "SELECT id, username, email, role FROM users WHERE username='admin';"
```

## Troubleshooting

### Migration Error: "Duplicate column"
Columns already exist. Check with:
```bash
mysql -h localhost -u your_db_user -p your_db_name -e "DESCRIBE users;"
```

### PM2 Won't Restart
```bash
pm2 delete plo-ga-mapping
pm2 start ecosystem.config.js
```

### Can't Login
1. Check admin user exists:
```bash
mysql -h localhost -u your_db_user -p your_db_name -e "SELECT * FROM users WHERE username='admin';"
```

2. Recreate admin user:
```bash
node scripts/create-admin-user.js
```

3. Check PM2 logs:
```bash
pm2 logs plo-ga-mapping
```

### DNS Not Resolved
Check DNS propagation:
```bash
dig +short @8.8.8.8 plo-ga.gastli.org A
```

Should return: `76.13.210.6`

## Post-Deployment

**User Management:**
- Access: https://plo-ga.gastli.org/admin/users
- Create users with roles
- Assign users to departments/colleges/clusters

**Security:**
- Change admin password after first login
- Create separate admin accounts for each administrator
- Assign viewer/editor roles to regular users

## Rollback

If needed:
```bash
git reset --hard HEAD~1
pnpm install
pnpm run build
pm2 restart plo-ga-mapping
```

## Support

Check logs:
```bash
# PM2 logs
pm2 logs plo-ga-mapping

# Nginx logs
tail -f /home/agastli/logs/nginx/error.log
tail -f /home/agastli/logs/nginx/access.log

# Database connection
mysql -h localhost -u your_db_user -p your_db_name -e "SELECT 1;"
```
