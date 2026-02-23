# PLO-GA Mapping System - Deployment Guide

Complete guide for deploying the PLO-GA Mapping System on Windows and Unix (Linux/macOS) servers.

---

## Table of Contents

1. [Overview](#overview)
2. [Windows Deployment](#windows-deployment)
3. [Unix Deployment](#unix-deployment)
4. [Database Configuration](#database-configuration)
5. [Production Configuration](#production-configuration)
6. [Security Hardening](#security-hardening)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Deployment Options

The PLO-GA Mapping System can be deployed on:

1. **Windows Server** (2016, 2019, 2022)
   - IIS with Node.js integration
   - WAMP/XAMPP stack
   - Standalone Node.js with PM2

2. **Linux Server** (Ubuntu, Debian, CentOS, RHEL)
   - Nginx reverse proxy + Node.js
   - Apache reverse proxy + Node.js
   - Docker containers

3. **Cloud Platforms**
   - AWS EC2, Azure VMs, Google Cloud Compute
   - Shared hosting (Hostinger, cPanel)
   - Platform-as-a-Service (Heroku, Render, Railway)

### Architecture

```
┌─────────────────┐
│   Web Browser   │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Reverse Proxy  │ ← Nginx/IIS/Apache
│   (Port 80/443) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Node.js App   │ ← Express + tRPC
│   (Port 3000)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ MySQL/MariaDB   │ ← Database
│   (Port 3306)   │
└─────────────────┘
```

---

## Windows Deployment

### Prerequisites

**Software Requirements:**
- Windows Server 2016+ or Windows 10/11
- Node.js 18.x or higher
- Python 3.8 or higher
- MySQL 8.0+ or MariaDB 10.5+
- Git for Windows

**Hardware Requirements:**
- CPU: 2+ cores
- RAM: 4GB minimum, 8GB recommended
- Disk: 10GB free space
- Network: Static IP or domain name

### Method 1: IIS + Node.js (Recommended for Windows Server)

#### Step 1: Install Prerequisites

1. **Install Node.js**
   ```powershell
   # Download from https://nodejs.org/
   # Run installer and verify
   node --version
   npm --version
   ```

2. **Install pnpm**
   ```powershell
   npm install -g pnpm
   ```

3. **Install Python**
   ```powershell
   # Download from https://www.python.org/downloads/
   # Check "Add Python to PATH" during installation
   python --version
   ```

4. **Install MySQL**
   ```powershell
   # Download MySQL Installer from https://dev.mysql.com/downloads/installer/
   # Choose "Server only" or "Full" installation
   # Set root password during installation
   ```

5. **Install IIS**
   ```powershell
   # Open PowerShell as Administrator
   Install-WindowsFeature -name Web-Server -IncludeManagementTools
   ```

6. **Install IIS Node Module**
   - Download iisnode from: https://github.com/Azure/iisnode/releases
   - Run the installer (iisnode-full-v0.2.26-x64.msi)

#### Step 2: Clone and Setup Application

```powershell
# Navigate to web root
cd C:\inetpub\wwwroot

# Clone repository
git clone https://github.com/agastli/plo-ga-mapping-system.git
cd plo-ga-mapping-system

# Install dependencies
pnpm install

# Install Python packages
pip install python-docx openpyxl reportlab

# Create C:\tmp directory (required for exports)
mkdir C:\tmp
```

#### Step 3: Configure Application

1. **Create `.env` file:**
   ```powershell
   copy .env.example .env
   notepad .env
   ```

2. **Edit `.env` with production values:**
   ```env
   DATABASE_URL=mysql://plo_user:password@localhost:3306/plo_ga_mapping
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=your-secure-32-character-secret
   VITE_APP_TITLE=PLO-GA Mapping System
   VITE_APP_LOGO=/qu-logo.png
   ```

3. **Build application:**
   ```powershell
   pnpm build
   ```

#### Step 4: Configure IIS

1. **Create web.config:**
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <configuration>
     <system.webServer>
       <handlers>
         <add name="iisnode" path="server/_core/index.js" verb="*" modules="iisnode" />
       </handlers>
       <rewrite>
         <rules>
           <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
             <match url="^server/_core/index.js\/debug[\/]?" />
           </rule>
           <rule name="StaticContent">
             <action type="Rewrite" url="public{REQUEST_URI}"/>
           </rule>
           <rule name="DynamicContent">
             <conditions>
               <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
             </conditions>
             <action type="Rewrite" url="server/_core/index.js"/>
           </rule>
         </rules>
       </rewrite>
       <security>
         <requestFiltering>
           <hiddenSegments>
             <add segment="node_modules" />
           </hiddenSegments>
         </requestFiltering>
       </security>
       <iisnode node_env="production" />
     </system.webServer>
   </configuration>
   ```

2. **Create IIS Site:**
   - Open IIS Manager
   - Right-click "Sites" → "Add Website"
   - Site name: `PLO-GA-Mapping`
   - Physical path: `C:\inetpub\wwwroot\plo-ga-mapping-system`
   - Binding: HTTP, Port 80, hostname: `plo-ga.yourdomain.com`
   - Click OK

3. **Set Application Pool:**
   - Select the new site
   - Click "Basic Settings" → "Application Pool"
   - Select "DefaultAppPool" or create new pool
   - Set ".NET CLR version" to "No Managed Code"

4. **Set Permissions:**
   ```powershell
   icacls "C:\inetpub\wwwroot\plo-ga-mapping-system" /grant "IIS_IUSRS:(OI)(CI)F" /T
   icacls "C:\tmp" /grant "IIS_IUSRS:(OI)(CI)F" /T
   ```

#### Step 5: Configure Firewall

```powershell
# Allow HTTP
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Allow HTTPS
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

#### Step 6: Setup SSL Certificate

1. **Using Let's Encrypt (Free):**
   - Install win-acme: https://www.win-acme.com/
   - Run: `wacs.exe`
   - Follow prompts to create certificate
   - Certificate auto-renews

2. **Using Existing Certificate:**
   - Open IIS Manager
   - Select site → "Bindings" → "Add"
   - Type: HTTPS, Port: 443
   - Select SSL certificate
   - Click OK

### Method 2: WAMP Stack (Development/Testing)

#### Step 1: Install WAMP

1. Download WAMP from: https://www.wampserver.com/
2. Run installer and complete setup
3. Start WAMP services

#### Step 2: Setup Application

```powershell
# Navigate to WAMP www directory
cd C:\wamp\www

# Clone repository
git clone https://github.com/agastli/plo-ga-mapping-system.git
cd plo-ga-mapping-system

# Install dependencies
pnpm install
pip install python-docx openpyxl reportlab

# Create C:\tmp
mkdir C:\tmp

# Configure .env
copy .env.example .env
notepad .env
```

#### Step 3: Run Application

```powershell
# Start development server
pnpm dev

# Or build and run production
pnpm build
pnpm start
```

Access at: http://localhost:3000

### Method 3: PM2 Process Manager (Recommended for Production)

#### Step 1: Install PM2

```powershell
npm install -g pm2
npm install -g pm2-windows-service
```

#### Step 2: Setup Application

```powershell
cd C:\inetpub\wwwroot\plo-ga-mapping-system

# Build application
pnpm build

# Start with PM2
pm2 start pnpm --name "plo-ga-system" -- start

# Save PM2 configuration
pm2 save

# Install as Windows service
pm2-service-install
```

#### Step 3: Configure PM2 Service

```powershell
# Set service to auto-start
pm2 startup

# Monitor application
pm2 status
pm2 logs plo-ga-system
pm2 monit
```

---

## Unix Deployment

### Prerequisites

**Software Requirements:**
- Ubuntu 20.04+, Debian 11+, CentOS 8+, or macOS 11+
- Node.js 18.x or higher
- Python 3.8 or higher
- MySQL 8.0+ or MariaDB 10.5+
- Nginx or Apache
- Git

**Hardware Requirements:**
- CPU: 2+ cores
- RAM: 4GB minimum, 8GB recommended
- Disk: 10GB free space
- Network: Static IP or domain name

### Method 1: Nginx + Node.js + PM2 (Recommended)

#### Step 1: Install Prerequisites

**Ubuntu/Debian:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
sudo npm install -g pnpm

# Install Python 3 and pip
sudo apt install -y python3 python3-pip

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

**CentOS/RHEL:**
```bash
# Update system
sudo yum update -y

# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install pnpm
sudo npm install -g pnpm

# Install Python 3 and pip
sudo yum install -y python3 python3-pip

# Install MySQL
sudo yum install -y mysql-server

# Install Nginx
sudo yum install -y nginx

# Install Git
sudo yum install -y git
```

**macOS:**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@18

# Install pnpm
npm install -g pnpm

# Install Python 3
brew install python@3.11

# Install MySQL
brew install mysql

# Install Nginx
brew install nginx

# Install Git
brew install git
```

#### Step 2: Setup MySQL

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p << EOF
CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'plo_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON plo_ga_mapping.* TO 'plo_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF
```

#### Step 3: Setup Application

```bash
# Create application directory
sudo mkdir -p /var/www
cd /var/www

# Clone repository
sudo git clone https://github.com/agastli/plo-ga-mapping-system.git
cd plo-ga-mapping-system

# Set ownership
sudo chown -R $USER:$USER /var/www/plo-ga-mapping-system

# Install dependencies
pnpm install

# Install Python packages
pip3 install python-docx openpyxl reportlab

# Create .env file
cp .env.example .env
nano .env
```

**Edit `.env`:**
```env
DATABASE_URL=mysql://plo_user:secure_password_here@localhost:3306/plo_ga_mapping
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-32-character-secret
VITE_APP_TITLE=PLO-GA Mapping System
VITE_APP_LOGO=/qu-logo.png
```

#### Step 4: Build Application

```bash
# Build for production
pnpm build

# Run database migrations
pnpm db:push
```

#### Step 5: Setup PM2

```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start pnpm --name "plo-ga-system" -- start

# Configure auto-start on boot
pm2 startup systemd
# Copy and run the command PM2 outputs

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs plo-ga-system
```

#### Step 6: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/plo-ga-mapping
```

**Add configuration:**
```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name plo-ga.yourdomain.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name plo-ga.yourdomain.com;

    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/plo-ga.yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/plo-ga.yourdomain.com/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 10m;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/plo-ga-access.log;
    error_log /var/log/nginx/plo-ga-error.log;

    # Max upload size
    client_max_body_size 50M;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Disable caching for dynamic content
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable site:**
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/plo-ga-mapping /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### Step 7: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d plo-ga.yourdomain.com

# Follow prompts and choose to redirect HTTP to HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

#### Step 8: Configure Firewall

**Ubuntu/Debian (UFW):**
```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow MySQL (if remote access needed)
sudo ufw allow 3306/tcp

# Check status
sudo ufw status
```

**CentOS/RHEL (firewalld):**
```bash
# Start firewall
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow services
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=mysql
sudo firewall-cmd --reload

# Check status
sudo firewall-cmd --list-all
```

### Method 2: Apache + Node.js + PM2

#### Step 1: Install Apache

```bash
# Ubuntu/Debian
sudo apt install -y apache2

# CentOS/RHEL
sudo yum install -y httpd
```

#### Step 2: Enable Required Modules

```bash
# Enable proxy modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod ssl
sudo a2enmod rewrite

# Restart Apache
sudo systemctl restart apache2
```

#### Step 3: Configure Apache

```bash
# Create virtual host
sudo nano /etc/apache2/sites-available/plo-ga-mapping.conf
```

**Add configuration:**
```apache
<VirtualHost *:80>
    ServerName plo-ga.yourdomain.com
    ServerAdmin admin@yourdomain.com

    # Redirect to HTTPS
    Redirect permanent / https://plo-ga.yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName plo-ga.yourdomain.com
    ServerAdmin admin@yourdomain.com

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/plo-ga.yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/plo-ga.yourdomain.com/privkey.pem

    # Proxy to Node.js
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:3000/$1" [P,L]

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/plo-ga-error.log
    CustomLog ${APACHE_LOG_DIR}/plo-ga-access.log combined
</VirtualHost>
```

**Enable site:**
```bash
sudo a2ensite plo-ga-mapping
sudo systemctl reload apache2
```

---

## Database Configuration

### MySQL Optimization for Production

**Edit MySQL configuration:**
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

**Add/modify settings:**
```ini
[mysqld]
# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Performance
max_connections = 200
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# Query cache
query_cache_type = 1
query_cache_size = 128M

# Logging
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2

# Binary logging (for backups)
log_bin = /var/log/mysql/mysql-bin.log
expire_logs_days = 7
max_binlog_size = 100M
```

**Restart MySQL:**
```bash
sudo systemctl restart mysql
```

### Database Backup Strategy

**Automated Daily Backups:**
```bash
# Create backup script
sudo nano /usr/local/bin/backup-plo-ga.sh
```

**Add script:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/plo-ga"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="plo_ga_mapping"
DB_USER="plo_user"
DB_PASS="your_password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/plo-ga-$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "plo-ga-*.sql.gz" -mtime +30 -delete

echo "Backup completed: plo-ga-$DATE.sql.gz"
```

**Make executable:**
```bash
sudo chmod +x /usr/local/bin/backup-plo-ga.sh
```

**Add to cron:**
```bash
sudo crontab -e
```

**Add line:**
```cron
0 2 * * * /usr/local/bin/backup-plo-ga.sh >> /var/log/plo-ga-backup.log 2>&1
```

---

## Production Configuration

### Environment Variables

**Production `.env` template:**
```env
# Database
DATABASE_URL=mysql://plo_user:STRONG_PASSWORD@localhost:3306/plo_ga_mapping?ssl=true

# Server
NODE_ENV=production
PORT=3000

# Security
JWT_SECRET=GENERATE_SECURE_32_CHAR_SECRET

# Application
VITE_APP_TITLE=PLO-GA Mapping System
VITE_APP_LOGO=/qu-logo.png
OWNER_NAME=Qatar University
OWNER_OPEN_ID=admin@qu.edu.qa

# OAuth (if using)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=your_app_id

# Analytics (optional)
VITE_ANALYTICS_WEBSITE_ID=your_analytics_id
VITE_ANALYTICS_ENDPOINT=https://analytics.yourdomain.com

# Email (optional)
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=smtp_password
```

### Generate Secure Secrets

**JWT_SECRET:**
```bash
# Linux/macOS
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## Security Hardening

### Application Security

1. **Use HTTPS Only**
   - Obtain SSL certificate (Let's Encrypt)
   - Redirect all HTTP to HTTPS
   - Enable HSTS headers

2. **Secure Environment Variables**
   ```bash
   # Set proper permissions on .env
   chmod 600 .env
   chown www-data:www-data .env  # or appropriate user
   ```

3. **Enable Rate Limiting**
   - Configure in Nginx/Apache
   - Use application-level rate limiting

4. **Disable Directory Listing**
   ```nginx
   # Nginx
   autoindex off;
   ```
   
   ```apache
   # Apache
   Options -Indexes
   ```

### Database Security

1. **Use Strong Passwords**
   - Minimum 16 characters
   - Mix of uppercase, lowercase, numbers, symbols

2. **Limit Database Access**
   ```sql
   -- Create user with limited privileges
   CREATE USER 'plo_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT SELECT, INSERT, UPDATE, DELETE ON plo_ga_mapping.* TO 'plo_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Enable SSL for Database Connections**
   ```env
   DATABASE_URL=mysql://user:pass@host:3306/db?ssl={"rejectUnauthorized":true}
   ```

4. **Disable Remote Root Access**
   ```sql
   DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
   FLUSH PRIVILEGES;
   ```

### Server Security

1. **Keep System Updated**
   ```bash
   # Ubuntu/Debian
   sudo apt update && sudo apt upgrade -y
   
   # CentOS/RHEL
   sudo yum update -y
   ```

2. **Configure Firewall** (see above sections)

3. **Disable Unused Services**
   ```bash
   sudo systemctl disable <service_name>
   ```

4. **Setup Fail2Ban** (brute force protection)
   ```bash
   # Install
   sudo apt install -y fail2ban
   
   # Configure
   sudo nano /etc/fail2ban/jail.local
   ```

5. **Regular Security Audits**
   ```bash
   # Check for vulnerabilities
   npm audit
   pnpm audit
   ```

---

## Monitoring & Maintenance

### Application Monitoring

**PM2 Monitoring:**
```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs plo-ga-system

# View metrics
pm2 show plo-ga-system

# Restart on high memory usage
pm2 start plo-ga-system --max-memory-restart 500M
```

### Log Management

**Setup Log Rotation:**
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/plo-ga
```

**Add configuration:**
```
/var/log/nginx/plo-ga-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}

/var/log/plo-ga-backup.log {
    weekly
    missingok
    rotate 4
    compress
    notifempty
}
```

### Performance Monitoring

**Install monitoring tools:**
```bash
# htop - system monitoring
sudo apt install -y htop

# iotop - disk I/O monitoring
sudo apt install -y iotop

# nethogs - network monitoring
sudo apt install -y nethogs
```

### Health Checks

**Create health check script:**
```bash
sudo nano /usr/local/bin/health-check-plo-ga.sh
```

**Add script:**
```bash
#!/bin/bash

# Check if application is running
if ! pm2 status | grep -q "plo-ga-system.*online"; then
    echo "Application is down! Restarting..."
    pm2 restart plo-ga-system
    echo "Application restarted at $(date)" >> /var/log/plo-ga-health.log
fi

# Check if database is accessible
if ! mysqladmin ping -h localhost -u plo_user -p'password' &> /dev/null; then
    echo "Database is down! Alert sent at $(date)" >> /var/log/plo-ga-health.log
    # Send alert email or notification
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "Disk usage is above 90%! $(date)" >> /var/log/plo-ga-health.log
fi
```

**Make executable and add to cron:**
```bash
sudo chmod +x /usr/local/bin/health-check-plo-ga.sh

# Add to cron (every 5 minutes)
sudo crontab -e
```

**Add line:**
```cron
*/5 * * * * /usr/local/bin/health-check-plo-ga.sh
```

---

## Troubleshooting

### Common Issues

#### Issue: Application won't start

**Check logs:**
```bash
pm2 logs plo-ga-system
```

**Common causes:**
- Database connection failure
- Port already in use
- Missing environment variables
- Permission issues

**Solutions:**
```bash
# Check database connection
mysql -u plo_user -p -h localhost plo_ga_mapping

# Check if port is in use
sudo netstat -tulpn | grep :3000

# Verify .env file exists and is readable
ls -la .env

# Check file permissions
sudo chown -R $USER:$USER /var/www/plo-ga-mapping-system
```

#### Issue: 502 Bad Gateway (Nginx)

**Causes:**
- Node.js application not running
- Wrong proxy_pass port
- Firewall blocking internal connections

**Solutions:**
```bash
# Check if app is running
pm2 status

# Restart application
pm2 restart plo-ga-system

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Test Nginx configuration
sudo nginx -t
```

#### Issue: Database connection errors

**Check MySQL status:**
```bash
sudo systemctl status mysql
```

**Test connection:**
```bash
mysql -u plo_user -p -h localhost plo_ga_mapping
```

**Check MySQL logs:**
```bash
sudo tail -f /var/log/mysql/error.log
```

#### Issue: Export functionality fails

**Windows:**
```powershell
# Verify C:\tmp exists
dir C:\tmp

# Create if missing
mkdir C:\tmp

# Check Python packages
pip list | findstr "python-docx openpyxl reportlab"
```

**Unix:**
```bash
# Check /tmp permissions
ls -ld /tmp

# Verify Python packages
pip3 list | grep -E "python-docx|openpyxl|reportlab"

# Test Python import
python3 -c "import docx, openpyxl, reportlab"
```

#### Issue: High memory usage

**Check memory:**
```bash
free -h
pm2 show plo-ga-system
```

**Solutions:**
```bash
# Restart application
pm2 restart plo-ga-system

# Set memory limit
pm2 start plo-ga-system --max-memory-restart 500M

# Check for memory leaks in logs
pm2 logs plo-ga-system | grep -i "memory"
```

#### Issue: Slow performance

**Check system resources:**
```bash
htop
iotop
```

**Check database:**
```bash
# MySQL slow query log
sudo tail -f /var/log/mysql/slow-query.log

# Check database size
mysql -u root -p -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.TABLES GROUP BY table_schema;"
```

**Optimize database:**
```bash
mysql -u root -p plo_ga_mapping -e "OPTIMIZE TABLE programs, plos, mappings, justifications;"
```

### Getting Help

1. **Check Documentation**
   - README.md
   - INSTALLATION.md
   - This guide

2. **Check Logs**
   - Application: `pm2 logs plo-ga-system`
   - Nginx: `/var/log/nginx/plo-ga-error.log`
   - MySQL: `/var/log/mysql/error.log`
   - System: `journalctl -xe`

3. **GitHub Issues**
   - https://github.com/agastli/plo-ga-mapping-system/issues

4. **Contact Support**
   - Academic Planning & Quality Assurance Office
   - Qatar University

---

## Deployment Checklist

### Pre-Deployment

- [ ] Server provisioned with adequate resources
- [ ] Domain name configured and DNS propagated
- [ ] All prerequisites installed (Node.js, Python, MySQL, Nginx/Apache)
- [ ] Application cloned and dependencies installed
- [ ] Database created and migrations run
- [ ] `.env` file configured with production values
- [ ] Application builds successfully (`pnpm build`)
- [ ] SSL certificate obtained and configured

### Deployment

- [ ] Application started with PM2
- [ ] PM2 configured for auto-restart on boot
- [ ] Reverse proxy (Nginx/Apache) configured
- [ ] Firewall rules configured
- [ ] SSL/HTTPS working correctly
- [ ] All HTTP traffic redirects to HTTPS

### Post-Deployment

- [ ] Application accessible via domain name
- [ ] All features tested (upload, export, analytics)
- [ ] Database backups configured and tested
- [ ] Log rotation configured
- [ ] Monitoring and health checks configured
- [ ] Security hardening completed
- [ ] Performance benchmarks met
- [ ] Documentation updated with production details

---

**Last Updated**: February 23, 2026  
**Version**: 1.0.0  
**Repository**: https://github.com/agastli/plo-ga-mapping-system
