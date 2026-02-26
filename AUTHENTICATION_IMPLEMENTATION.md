# Authentication System Implementation Guide

**Date:** February 25, 2026  
**System:** PLO-GA Mapping System  
**VPS:** plo-ga.gastli.org (76.13.210.6)

## Overview

This document details the complete implementation of a dual authentication system supporting both traditional username/password login and Manus OAuth SSO.

---

## 1. Database Schema Changes

### Migration File: `migrations/add-username-password.sql`

**Successfully Applied Changes:**
```sql
-- Add username and password columns
ALTER TABLE users 
ADD COLUMN username VARCHAR(255) UNIQUE,
ADD COLUMN password VARCHAR(255);

-- Make openId optional (for non-OAuth users)
ALTER TABLE users 
MODIFY COLUMN openId VARCHAR(255) NULL;

-- Add index for faster username lookups
CREATE INDEX idx_username ON users(username);
```

**Execution Method:**
```bash
mysql -u root -p'AdelJapan@1987' plo_ga_mapping < migrations/add-username-password.sql
```

**Result:** ✅ Successfully added username/password support to users table

---

## 2. Admin User Creation

### Challenge: ES Module vs CommonJS Conflict

**Problem:** Project configured as ES module (`"type": "module"` in package.json), but scripts used CommonJS syntax (`require()`).

**Failed Approaches:**
- ❌ Running Node.js script with `require()` syntax
- ❌ SQL INSERT with bcrypt hash directly (prepared statement syntax issues)

**Successful Solution:** Two-step process

#### Step 1: Generate Password Hash
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('AdelJapan@1987', 10).then(hash => console.log(hash));"
```

**Output:** `$2b$10$gTscZoJXSAypKql8Wp/UPo.ZscwYfu8Gph1z8jUHDSI61.HyyKpb9q`

#### Step 2: Insert Admin User via MySQL
```bash
mysql -u root -p'AdelJapan@1987' plo_ga_mapping << 'EOF'
INSERT INTO users (username, password, email, name, role, createdAt) 
VALUES ('admin', '$2b$10$gTscZoJXSAypKql8Wp/UPo.ZscwYfu8Gph1z8jUHDSI61.HyyKpb9q', 'adel.gastli@gmail.com', 'Administrator', 'admin', NOW())
ON DUPLICATE KEY UPDATE 
  password = '$2b$10$gTscZoJXSAypKql8Wp/UPo.ZscwYfu8Gph1z8jUHDSI61.HyyKpb9q',
  email = 'adel.gastli@gmail.com',
  role = 'admin';

SELECT username, email, role FROM users WHERE username = 'admin';
EOF
```

**Result:** ✅ Admin user created successfully
- Username: `admin`
- Password: `AdelJapan@1987`
- Email: `adel.gastli@gmail.com`
- Role: `admin`

---

## 3. Frontend Components

### Login Page: `client/src/pages/Login.tsx`

**Status:** ✅ Created and rendering correctly

**Features:**
- Qatar University branding
- Username/password input fields
- Sign In button
- Responsive design with Tailwind CSS

**URL:** https://plo-ga.gastli.org/login

---

## 4. Build System Issues and Solutions

### Issue 1: Missing `use-toast` Hook

**Error:**
```
Could not load /home/agastli/htdocs/plo-ga.gastli.org/client/src/hooks/use-toast
```

**Root Cause:** UserManagement.tsx imported from `@/hooks/use-toast` but file didn't exist

**Solution 1:** Fix import path
```bash
sed -i "s|from '@/hooks/use-toast'|from '@/components/ui/use-toast'|g" client/src/pages/UserManagement.tsx
```

**Solution 2:** Create the missing hook file

Created `client/src/components/ui/use-toast.ts` with complete shadcn/ui toast implementation (150+ lines).

**Result:** ✅ Build completed successfully (2416 modules, 7.05s)

---

## 5. Deployment Workflow

### Standard Git-Based Deployment

**From Development (Manus Sandbox):**
```bash
cd /home/ubuntu/plo-ga-mapping-system
git add .
git commit -m "Add authentication system"
git push https://agastli:YOUR_GITHUB_TOKEN@github.com/agastli/plo-ga-mapping-system.git main
```

**On VPS:**
```bash
cd /home/agastli/htdocs/plo-ga.gastli.org
git reset --hard origin/main
git pull origin main
pnpm install  # If new dependencies added
pnpm run build
pm2 restart all
pm2 logs --lines 30
```

---

## 6. Dependencies Installed

### Backend Dependencies
```bash
pnpm add bcryptjs mysql2
pnpm add -D @types/bcryptjs
```

**Purpose:**
- `bcryptjs`: Password hashing and verification
- `mysql2`: MySQL database driver (required for VPS)
- `@types/bcryptjs`: TypeScript type definitions

---

## 7. Key Files Created/Modified

### Created Files:
1. `migrations/add-username-password.sql` - Database schema changes
2. `scripts/create-admin-user.js` - Admin user creation script (not used due to ES module issues)
3. `server/auth.ts` - Authentication helper functions
4. `client/src/pages/Login.tsx` - Login page component
5. `client/src/pages/UserManagement.tsx` - User management interface
6. `client/src/components/ui/use-toast.ts` - Toast notification hook

### Modified Files:
1. `drizzle/schema.ts` - Updated users table schema
2. `server/routers.ts` - Will need authentication routes (PENDING)
3. `client/src/App.tsx` - Will need login route (PENDING)

---

## 8. Current Status

### ✅ Completed:
1. Database schema updated with username/password fields
2. Admin user created in database
3. Frontend login page created and displaying correctly
4. Build system configured and working
5. Dependencies installed
6. Authentication helper functions created

### ⏳ Pending:
1. **Backend authentication routes** - Need to add to `server/routers.ts`:
   - `auth.login` - Username/password authentication
   - `auth.logout` - Logout functionality
   - `auth.me` - Get current user
   - User management routes (CRUD operations)

2. **Frontend routing** - Add `/login` route to `client/src/App.tsx`

3. **Session management** - Implement JWT token handling

4. **Testing** - Verify complete authentication flow

---

## 9. Common Issues and Solutions

### Issue: ES Module Error with require()
**Solution:** Use direct MySQL commands or ensure scripts use ES module syntax (`import` instead of `require`)

### Issue: Build fails with missing dependencies
**Solution:** Always run `pnpm install` after pulling changes, then `pnpm run build`

### Issue: PM2 not reflecting changes
**Solution:** Always rebuild (`pnpm run build`) before restarting PM2

### Issue: Database connection fails
**Solution:** Verify credentials in `.env` file match MySQL root password

---

## 10. Environment Configuration

### Database Connection (VPS)
```
DATABASE_URL=mysql://root:AdelJapan@1987@localhost:3306/plo_ga_mapping
```

### Admin Credentials
```
Username: admin
Password: AdelJapan@1987
Email: adel.gastli@gmail.com
```

---

## 11. Next Steps

1. Add authentication routes to `server/routers.ts`
2. Implement JWT token generation and verification
3. Add protected route middleware
4. Test complete login flow
5. Implement user management interface
6. Add role-based access control
7. Test OAuth SSO integration alongside new auth system

---

## 12. References

- **GitHub Repository:** https://github.com/agastli/plo-ga-mapping-system
- **VPS Domain:** https://plo-ga.gastli.org
- **CloudPanel:** https://76.13.210.6:8443
- **Database:** MySQL 8.0 on localhost:3306

---

**Document Version:** 1.0  
**Last Updated:** February 25, 2026  
**Maintained By:** Development Team
