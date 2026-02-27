# Deployment Guide

**PLOs–GAs Mapping System — Production Deployment on Ubuntu VPS**

This guide covers the complete process for deploying the PLOs–GAs Mapping System on a fresh Ubuntu 22.04 LTS server. It documents every command, configuration file, and known issue encountered during the original deployment at `plo-ga.gastli.org`, serving as an authoritative reference for future re-installations on any server.

---

## Table of Contents

1. [Server Requirements](#1-server-requirements)
2. [Initial Server Setup](#2-initial-server-setup)
3. [Install System Dependencies](#3-install-system-dependencies)
4. [Install Node.js and pnpm](#4-install-nodejs-and-pnpm)
5. [Install Python and Report Dependencies](#5-install-python-and-report-dependencies)
6. [Install and Configure MySQL](#6-install-and-configure-mysql)
7. [Clone and Configure the Application](#7-clone-and-configure-the-application)
8. [Database Setup and Migrations](#8-database-setup-and-migrations)
9. [Build the Application](#9-build-the-application)
10. [Configure PM2 Process Manager](#10-configure-pm2-process-manager)
11. [Configure Nginx Reverse Proxy](#11-configure-nginx-reverse-proxy)
12. [SSL/TLS Certificate with Let's Encrypt](#12-ssltls-certificate-with-lets-encrypt)
13. [Firewall Configuration](#13-firewall-configuration)
14. [Post-Deployment Verification](#14-post-deployment-verification)
15. [Updating the Application](#15-updating-the-application)
16. [Backup Strategy](#16-backup-strategy)
17. [Troubleshooting Guide](#17-troubleshooting-guide)
18. [Environment Variables Reference](#18-environment-variables-reference)

---

## 1. Server Requirements

| Component | Minimum | Recommended |
|---|---|---|
| **OS** | Ubuntu 20.04 LTS | Ubuntu 22.04 LTS |
| **CPU** | 1 vCPU | 2 vCPU |
| **RAM** | 2 GB | 4 GB |
| **Disk** | 20 GB SSD | 40 GB SSD |
| **Network** | 100 Mbps | 1 Gbps |
| **Open Ports** | 22 (SSH), 80 (HTTP), 443 (HTTPS) | Same |

The application was originally deployed on a Hostinger VPS running Ubuntu 22.04 LTS. The domain `plo-ga.gastli.org` is a subdomain configured via Hostinger's DNS panel.

---

## 2. Initial Server Setup

Connect to your server via SSH:

```bash
ssh root@your-server-ip
```

Update the system and install essential tools:

```bash
apt update && apt upgrade -y
apt install -y curl wget git unzip build-essential software-properties-common
```

Create a dedicated application user (optional but recommended for security):

```bash
adduser appuser
usermod -aG sudo appuser
```

---

## 3. Install System Dependencies

```bash
apt install -y \
  nginx \
  certbot \
  python3-certbot-nginx \
  ufw \
  htop \
  net-tools
```

---

## 4. Install Node.js and pnpm

Install Node.js 22.x using the NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
```

Verify the installation:

```bash
node --version   # Should output: v22.x.x
npm --version
```

Install pnpm globally:

```bash
npm install -g pnpm
pnpm --version   # Should output: 10.x.x
```

Install PM2 process manager globally:

```bash
npm install -g pm2
pm2 --version
```

---

## 5. Install Python and Report Dependencies

The application uses Python 3 scripts for document parsing and report generation. Ubuntu 22.04 ships with Python 3.10+; install pip and the required packages:

```bash
apt install -y python3 python3-pip
pip3 install python-docx openpyxl reportlab pillow pandas
```

Verify the installation:

```bash
python3 --version
python3 -c "import docx, openpyxl, reportlab; print('All packages available')"
```

> **Known Issue:** If `pip3` is not found, install it with `apt install -y python3-pip`. On some minimal Ubuntu images, pip is not included by default.

---

## 6. Install and Configure MySQL

Install MySQL Server:

```bash
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql
```

Secure the MySQL installation:

```bash
mysql_secure_installation
```

Follow the prompts to:
- Set a strong root password
- Remove anonymous users
- Disallow remote root login
- Remove the test database
- Reload privilege tables

Create the application database and user:

```bash
mysql -u root -p
```

Inside the MySQL shell:

```sql
CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'plo_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON plo_ga_mapping.* TO 'plo_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Verify the connection:

```bash
mysql -u plo_user -p plo_ga_mapping -e "SELECT 1;"
```

> **Known Issue:** On some VPS providers, MySQL binds only to `127.0.0.1` by default. This is correct for local connections. If you need remote database access (not recommended for production), edit `/etc/mysql/mysql.conf.d/mysqld.cnf` and change `bind-address = 127.0.0.1` to `bind-address = 0.0.0.0`, then restart MySQL with `systemctl restart mysql`.

---

## 7. Clone and Configure the Application

Navigate to the web root directory and clone the repository:

```bash
cd /home/agastli/htdocs/
git clone https://github.com/agastli/plo-ga-mapping-system.git plo-ga.gastli.org
cd plo-ga.gastli.org
```

Install Node.js dependencies:

```bash
pnpm install
```

Create the environment configuration file:

```bash
nano .env
```

Paste the following content, replacing all placeholder values:

```env
# Database
DATABASE_URL="mysql://plo_user:YourStrongPassword123!@localhost:3306/plo_ga_mapping"

# Security — generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your-64-character-random-hex-string-here"

# Application
NODE_ENV="production"

# Email (Hostinger SMTP)
SMTP_PASSWORD="your-smtp-password"

# Manus Platform (leave empty for self-hosted deployments)
VITE_APP_ID=""
OAUTH_SERVER_URL=""
VITE_OAUTH_PORTAL_URL=""
OWNER_OPEN_ID=""
OWNER_NAME=""
BUILT_IN_FORGE_API_URL=""
BUILT_IN_FORGE_API_KEY=""
VITE_FRONTEND_FORGE_API_KEY=""
VITE_FRONTEND_FORGE_API_URL=""
VITE_ANALYTICS_ENDPOINT=""
VITE_ANALYTICS_WEBSITE_ID=""
```

> **Security Note:** The `.env` file contains sensitive credentials. Ensure it is never committed to version control. Verify it is listed in `.gitignore`:
> ```bash
> grep ".env" .gitignore
> ```

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as the value of `JWT_SECRET` in `.env`.

---

## 8. Database Setup and Migrations

Run the Drizzle ORM migrations to create all database tables:

```bash
pnpm db:push
```

Expected output:

```
[✓] Migrations applied successfully
```

This command runs `drizzle-kit generate && drizzle-kit migrate` and creates all 14 tables in the `plo_ga_mapping` database.

Verify the tables were created:

```bash
mysql -u plo_user -p plo_ga_mapping -e "SHOW TABLES;"
```

Expected output should list: `auditLog`, `clusters`, `colleges`, `competencies`, `departments`, `graduateattributes`, `justifications`, `loginHistory`, `mappings`, `plos`, `programs`, `reportTemplates`, `userAssignments`, `users`.

Create the first administrator account:

```bash
node scripts/create-admin-user.mjs
```

Follow the prompts to set the admin username, email, and password.

> **Known Issue:** If the script fails with `Cannot find module`, ensure you are in the project root directory and have run `pnpm install` first.

---

## 9. Build the Application

Build the production bundle:

```bash
pnpm run build
```

This command runs two parallel build processes:
1. **Vite** builds the React frontend into `dist/public/`
2. **esbuild** bundles the Express backend into `dist/index.js`

Expected output:

```
vite v6.x.x building for production...
✓ built in Xs
dist/index.js  XXX KB
```

> **Known Issue — Large Bundle Warning:** Vite may warn about a large JavaScript bundle (~1.6 MB). This is expected given the application's scope (34 pages, multiple chart libraries). The warning does not prevent deployment. To reduce bundle size in future versions, consider code splitting with `React.lazy()`.

> **Known Issue — NODE_ENV Warning:** During build, you may see `NODE_ENV=production is not supported in the .env file`. This is a Vite warning and does not affect the build. Set `NODE_ENV` as a system environment variable or in PM2's ecosystem file instead.

Verify the build output:

```bash
ls -lh dist/public/assets/
# Should show: index-[hash].css and index-[hash].js with today's timestamp
```

---

## 10. Configure PM2 Process Manager

PM2 keeps the Node.js application running as a background process and automatically restarts it on crashes or server reboots.

Start the application with PM2:

```bash
pm2 start dist/index.js --name plo-ga-mapping-system
```

Verify it is running:

```bash
pm2 list
```

Expected output:

```
┌────┬──────────────────────────┬─────────┬─────────┬──────────┬────────┬──────┐
│ id │ name                     │ version │ status  │ cpu      │ mem    │ ...  │
├────┼──────────────────────────┼─────────┼─────────┼──────────┼────────┼──────┤
│ 0  │ plo-ga-mapping-system    │ 1.0.0   │ online  │ 0%       │ 80mb   │ ...  │
└────┴──────────────────────────┴─────────┴─────────┴──────────┴────────┴──────┘
```

Save the PM2 process list so it survives server reboots:

```bash
pm2 save
pm2 startup
```

The `pm2 startup` command will output a command to run as root. Execute that command to register PM2 as a system service.

> **Known Issue — Duplicate PM2 Processes:** If you accidentally start the application twice (e.g., once as `plo-ga-mapping` and once as `plo-ga-mapping-system`), you will have two processes running on the same port, causing conflicts. Always check `pm2 list` before starting a new process. To remove a duplicate:
> ```bash
> pm2 delete plo-ga-mapping    # Remove by name
> pm2 save                     # Persist the change
> ```

---

## 11. Configure Nginx Reverse Proxy

Nginx acts as a reverse proxy, forwarding incoming HTTP/HTTPS requests to the Node.js application running on port 3000.

Create the Nginx site configuration:

```bash
nano /etc/nginx/sites-available/plo-ga.gastli.org
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name plo-ga.gastli.org;

    # Increase upload size limit for document uploads
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

Enable the site and test the configuration:

```bash
ln -s /etc/nginx/sites-available/plo-ga.gastli.org /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 12. SSL/TLS Certificate with Let's Encrypt

Obtain a free SSL certificate using Certbot:

```bash
certbot --nginx -d plo-ga.gastli.org
```

Follow the prompts:
- Enter your email address for renewal notifications
- Agree to the Terms of Service
- Choose whether to redirect HTTP to HTTPS (recommended: option 2)

Certbot will automatically modify the Nginx configuration to add SSL settings and set up automatic certificate renewal.

Verify automatic renewal is configured:

```bash
certbot renew --dry-run
```

> **Known Issue — DNS Propagation:** If Certbot fails with `DNS problem: NXDOMAIN looking up A for plo-ga.gastli.org`, the DNS record has not yet propagated. Wait 15–60 minutes after creating the DNS A record and try again.

> **Known Issue — Port 80 Blocked:** If Certbot fails with `Connection refused` on port 80, ensure Nginx is running (`systemctl status nginx`) and the firewall allows port 80 (`ufw allow 80`).

---

## 13. Firewall Configuration

Configure UFW (Uncomplicated Firewall) to allow only necessary traffic:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

Expected output:

```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

> **Important:** Always allow SSH before enabling the firewall to avoid locking yourself out of the server.

---

## 14. Post-Deployment Verification

After completing all steps, verify the deployment is working correctly:

**Check the application is running:**

```bash
pm2 list
curl -I http://localhost:3000
```

**Check Nginx is serving the site:**

```bash
curl -I https://plo-ga.gastli.org
# Should return: HTTP/2 200
```

**Check the database connection:**

```bash
mysql -u plo_user -p plo_ga_mapping -e "SELECT COUNT(*) FROM users;"
```

**Check application logs:**

```bash
pm2 logs plo-ga-mapping-system --lines 50
```

**Check Nginx error logs:**

```bash
tail -50 /var/log/nginx/error.log
```

**Verify SSL certificate:**

```bash
certbot certificates
```

---

## 15. Updating the Application

To deploy a new version of the application after code changes have been pushed to GitHub:

```bash
cd /home/agastli/htdocs/plo-ga.gastli.org

# 1. Pull the latest changes
git pull origin main

# 2. Install any new dependencies
pnpm install

# 3. Run any new database migrations
pnpm db:push

# 4. Clean and rebuild the production bundle
rm -rf dist/ node_modules/.vite
pnpm run build

# 5. Restart the application
pm2 restart plo-ga-mapping-system

# 6. Verify the restart
pm2 list
pm2 logs plo-ga-mapping-system --lines 20
```

> **Important:** Always run `rm -rf dist/ node_modules/.vite` before rebuilding after significant changes. Without this, Vite may serve cached build artifacts and changes may not appear in the browser even after a hard refresh.

> **Browser Cache:** After deploying, instruct users to perform a hard refresh (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on macOS) to clear their browser cache and load the new JavaScript bundle.

---

## 16. Backup Strategy

**Database Backup**

Create a daily automated database backup using cron:

```bash
# Create backup directory
mkdir -p /home/agastli/backups/mysql

# Create backup script
nano /home/agastli/backups/backup-db.sh
```

Paste the following:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/agastli/backups/mysql"
DB_NAME="plo_ga_mapping"
DB_USER="plo_user"
DB_PASS="YourStrongPassword123!"

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only the last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

Make it executable and schedule it:

```bash
chmod +x /home/agastli/backups/backup-db.sh
crontab -e
```

Add the following line to run daily at 2:00 AM:

```
0 2 * * * /home/agastli/backups/backup-db.sh >> /home/agastli/backups/backup.log 2>&1
```

**Restore from Backup**

```bash
gunzip -c /home/agastli/backups/mysql/backup_YYYYMMDD_HHMMSS.sql.gz | mysql -u plo_user -p plo_ga_mapping
```

---

## 17. Troubleshooting Guide

This section documents every significant issue encountered during the original deployment and its resolution.

---

### Issue: Footer appears full-width on analytics pages

**Symptom:** The maroon footer on analytics pages spans the full browser width instead of matching the content container width.

**Root Cause:** The Footer component was defined inline within each analytics page with the background color applied to the outer wrapper `<div>` rather than the inner container `<div>`. Since the outer div has no max-width constraint, it fills the full viewport.

**Resolution:** Restructure the Footer component so the background and rounded corners are applied to the inner `<div>`, and the outer `<div>` has only the `mt-8` margin class. Additionally, wrap the `<Footer />` call in its own `<div className="container mx-auto px-4 pb-6">` to match the content container width.

**Prevention:** Create a shared `Footer` component in `client/src/components/Footer.tsx` that all pages import, eliminating the possibility of inconsistent inline definitions.

---

### Issue: Duplicate footers on guide pages

**Symptom:** Analytics guide pages display two footers stacked at the bottom.

**Root Cause:** During refactoring, both the imported `<Footer />` component and a manually coded footer `<div>` were left in the same page component.

**Resolution:** Remove the manually coded footer block and keep only the `<Footer />` component call.

---

### Issue: PM2 process not found after deployment

**Symptom:** Running `pm2 restart plo-ga-mapping-system` returns `[PM2][ERROR] Process or Namespace plo-ga-mapping-system not found`.

**Root Cause:** The process was started with a different name (e.g., `plo-ga-mapping`) in a previous session, and PM2's process list was not saved.

**Resolution:**
```bash
pm2 list                              # Find the actual process name
pm2 restart <actual-name>             # Restart by correct name
pm2 save                              # Save the process list
```

---

### Issue: Changes not visible after deployment despite hard refresh

**Symptom:** After pulling new code, rebuilding, and restarting PM2, the browser still shows the old version.

**Root Cause:** Vite generates JavaScript bundles with content-hash filenames (e.g., `index-CmiLqEhW.js`). If the `dist/` directory is not cleaned before rebuilding, the old bundle file may persist and Nginx may serve it from its cache.

**Resolution:**
```bash
rm -rf dist/ node_modules/.vite
pnpm run build
pm2 restart plo-ga-mapping-system
```

Then instruct users to hard-refresh their browsers (Ctrl+Shift+R).

---

### Issue: NODE_ENV warning during build

**Symptom:** Build output shows `NODE_ENV=production is not supported in the .env file`.

**Root Cause:** Vite does not support `NODE_ENV` in `.env` files; it must be set as a system environment variable.

**Resolution:** This is a non-fatal warning. The build succeeds regardless. To suppress it, remove `NODE_ENV` from `.env` and set it in the PM2 startup command:
```bash
pm2 start dist/index.js --name plo-ga-mapping-system --env production
```

---

### Issue: Large JavaScript bundle warning

**Symptom:** Vite build warns: `Some chunks are larger than 500 kB after minification`.

**Root Cause:** The application has 34 pages and multiple charting libraries loaded in a single bundle.

**Resolution:** This is a warning, not an error. The application functions correctly. To resolve it in future versions, implement route-based code splitting using `React.lazy()` and `Suspense`.

---

### Issue: Database migration fails with "Access denied"

**Symptom:** `pnpm db:push` fails with `Access denied for user 'plo_user'@'localhost'`.

**Root Cause:** The database user does not have sufficient privileges, or the `DATABASE_URL` in `.env` contains incorrect credentials.

**Resolution:**
```bash
# Verify the DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Re-grant privileges in MySQL
mysql -u root -p
GRANT ALL PRIVILEGES ON plo_ga_mapping.* TO 'plo_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### Issue: Python export scripts fail with "No module named 'docx'"

**Symptom:** Exporting reports returns a server error; PM2 logs show `ModuleNotFoundError: No module named 'docx'`.

**Root Cause:** Python dependencies were not installed, or were installed in a virtual environment that is not active when the Node.js server invokes Python.

**Resolution:**
```bash
# Install globally (not in a virtual environment)
pip3 install python-docx openpyxl reportlab pillow pandas

# Verify
python3 -c "import docx; print('OK')"
```

---

### Issue: Application shows "Internal Server Error" on first load

**Symptom:** After deployment, the application returns a 500 error.

**Root Cause:** The `.env` file is missing or contains invalid values (especially `DATABASE_URL` or `JWT_SECRET`).

**Resolution:**
```bash
# Check PM2 logs for the specific error
pm2 logs plo-ga-mapping-system --lines 100

# Common fixes:
# 1. Verify .env exists and has correct values
cat .env

# 2. Verify database is running
systemctl status mysql

# 3. Verify database connection
mysql -u plo_user -p plo_ga_mapping -e "SELECT 1;"
```

---

### Issue: Nginx returns 502 Bad Gateway

**Symptom:** The browser shows `502 Bad Gateway` when accessing the site.

**Root Cause:** The Node.js application is not running, or it crashed on startup.

**Resolution:**
```bash
# Check if the application is running
pm2 list

# If stopped, check why it crashed
pm2 logs plo-ga-mapping-system --err --lines 50

# Restart it
pm2 restart plo-ga-mapping-system

# If it keeps crashing, check for port conflicts
netstat -tlnp | grep 3000
```

---

## 18. Environment Variables Reference

The following is a complete reference of all environment variables used by the application:

| Variable | Required | Where Used | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | Server | Full MySQL connection string. Format: `mysql://user:pass@host:port/dbname` |
| `JWT_SECRET` | ✅ | Server | Secret key for signing JWT session cookies. Must be at least 32 characters. |
| `SMTP_PASSWORD` | ✅ | Server | Password for the SMTP email account (`no-reply@gastli.org` on Hostinger) |
| `NODE_ENV` | ✅ | Server | Set to `production` in production; `development` for local dev |
| `VITE_APP_TITLE` | ⬜ | Frontend | Browser tab title. Default: `PLOs-GAs Mapping System` |
| `VITE_APP_LOGO` | ⬜ | Frontend | URL to the application logo shown in the browser tab |
| `VITE_APP_ID` | ⬜ | Frontend | Manus OAuth application ID (Manus platform only) |
| `OAUTH_SERVER_URL` | ⬜ | Server | Manus OAuth backend URL (Manus platform only) |
| `VITE_OAUTH_PORTAL_URL` | ⬜ | Frontend | Manus login portal URL (Manus platform only) |
| `OWNER_OPEN_ID` | ⬜ | Server | Manus platform owner ID (Manus platform only) |
| `OWNER_NAME` | ⬜ | Server | Manus platform owner name (Manus platform only) |
| `BUILT_IN_FORGE_API_URL` | ⬜ | Server | Manus built-in API URL (Manus platform only) |
| `BUILT_IN_FORGE_API_KEY` | ⬜ | Server | Manus built-in API key (Manus platform only) |
| `VITE_FRONTEND_FORGE_API_KEY` | ⬜ | Frontend | Manus frontend API key (Manus platform only) |
| `VITE_FRONTEND_FORGE_API_URL` | ⬜ | Frontend | Manus frontend API URL (Manus platform only) |
| `VITE_ANALYTICS_ENDPOINT` | ⬜ | Frontend | Analytics tracking endpoint (Manus platform only) |
| `VITE_ANALYTICS_WEBSITE_ID` | ⬜ | Frontend | Analytics website ID (Manus platform only) |

> **Note on Manus Platform Variables:** Variables marked "Manus platform only" are automatically injected when the application is deployed on the Manus hosting platform. For self-hosted VPS deployments, these variables can be left empty or omitted entirely — the application will function normally without them.

---

## 19. Email Configuration (SMTP)

The system sends automated emails for password reset, username recovery, and new user welcome notifications. These emails are delivered via Hostinger's SMTP service using the `no-reply@gastli.org` account.

### Setting the SMTP Password

Add `SMTP_PASSWORD` to the application's `.env` file on the VPS:

```bash
cd /home/agastli/htdocs/plo-ga.gastli.org
nano .env
```

Add or update the following line:

```
SMTP_PASSWORD=YourHostingerEmailPassword
```

Save and close the file, then restart the application:

```bash
pm2 restart plo-ga-mapping-system
pm2 logs plo-ga-mapping-system --lines 20
```

Look for the line `[Email] SMTP transporter created successfully` in the logs to confirm the email service initialised correctly.

### Testing Email Delivery

Use the following one-liner to test SMTP connectivity from the server:

```bash
curl -v --ssl-reqd \
  --mail-from "no-reply@gastli.org" \
  --mail-rcpt "your-test-email@example.com" \
  --url "smtps://smtp.hostinger.com:465" \
  -u "no-reply@gastli.org:YourHostingerEmailPassword" \
  -T /dev/null
```

Alternatively, trigger a password reset from the login page for a user with a known email address and verify delivery.

### SMTP Settings Reference

| Setting | Value |
|---|---|
| **Host** | `smtp.hostinger.com` |
| **Port** | `587` (STARTTLS) |
| **Security** | STARTTLS (`secure: false`) |
| **Username** | `no-reply@gastli.org` |
| **Password** | Set via `SMTP_PASSWORD` env var |
| **BCC** | All outgoing emails are BCC'd to `no-reply@gastli.org` |

> **Troubleshooting:** If emails are not delivered, check the PM2 logs for `[Email] Failed to send` messages. Common causes are an incorrect `SMTP_PASSWORD`, a firewall blocking outbound port 587, or the Hostinger email account being suspended.

---

## 20. Managing Multiple PM2 Processes

During the initial deployment, a PM2 process named `plo-ga-mapping` (without the `-system` suffix) may have been created. Running two processes simultaneously causes port conflicts and unpredictable behaviour. Resolve this as follows:

```bash
# List all running PM2 processes
pm2 list

# Stop and delete the old process (if it exists)
pm2 stop plo-ga-mapping
pm2 delete plo-ga-mapping

# Verify only the correct process remains
pm2 list

# Save the updated PM2 process list so it persists across reboots
pm2 save
```

After this cleanup, only `plo-ga-mapping-system` should appear in `pm2 list`.

---

## 21. Updating an Existing Deployment

Use this checklist every time new code is pushed to GitHub and needs to be deployed to the VPS:

```bash
cd /home/agastli/htdocs/plo-ga.gastli.org

# Step 1 — Pull the latest changes from GitHub
git pull origin main

# Step 2 — Install any new npm/pnpm dependencies
pnpm install

# Step 3 — Run any new database migrations
pnpm db:push

# Step 4 — Clean stale build artifacts and rebuild
rm -rf dist/ node_modules/.vite
pnpm run build

# Step 5 — Restart the application process
pm2 restart plo-ga-mapping-system

# Step 6 — Confirm the process is running and check for errors
pm2 list
pm2 logs plo-ga-mapping-system --lines 30
```

> **When to run `pnpm db:push`:** Only required when the database schema has changed (i.e., `drizzle/schema.ts` was modified in the pulled commit). It is safe to run on every deployment — it is idempotent.

> **Browser Cache:** After deploying, ask users to perform a hard refresh (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on macOS) to force the browser to load the new JavaScript bundle.

---

*Last updated: February 2026*
*Deployment target: Ubuntu 22.04 LTS, plo-ga.gastli.org*
