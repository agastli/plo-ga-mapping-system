# Hostinger Access Guide

## Overview

This guide provides step-by-step instructions for accessing and managing your Hostinger hosting environment, including SSH access, VPS management, CloudPanel, hPanel, and other essential services.

---

## Table of Contents

1. [Hostinger Account Access](#hostinger-account-access)
2. [hPanel Access](#hpanel-access)
3. [VPS Management](#vps-management)
4. [SSH Access](#ssh-access)
5. [CloudPanel Access](#cloudpanel-access)
6. [File Manager](#file-manager)
7. [Database Management](#database-management)
8. [Domain Management](#domain-management)
9. [Email Management](#email-management)
10. [Security and Backups](#security-and-backups)

---

## Hostinger Account Access

### Logging into Hostinger

1. **Navigate to Hostinger Login Page**
   - URL: https://www.hostinger.com/
   - Click "Login" in the top right corner

2. **Enter Your Credentials**
   - Email address associated with your account
   - Password
   - Click "Log In"

3. **Two-Factor Authentication (if enabled)**
   - Enter the 6-digit code from your authenticator app
   - Or enter the code sent to your email/phone

4. **Dashboard Overview**
   - After login, you'll see the main Hostinger dashboard
   - Shows all your hosting services, domains, and billing information

---

## hPanel Access

hPanel is Hostinger's custom control panel for managing shared hosting services.

### Accessing hPanel

1. **From Hostinger Dashboard**
   - Log into your Hostinger account
   - Click on "Hosting" in the left sidebar
   - Select your hosting plan
   - Click "Manage" button
   - This opens hPanel in a new tab

2. **Direct hPanel URL**
   - URL: https://hpanel.hostinger.com/
   - Login with your Hostinger credentials

### hPanel Features

#### Website Management
- **Website Builder** - Create websites with drag-and-drop builder
- **WordPress** - One-click WordPress installation
- **File Manager** - Web-based file management
- **FTP Accounts** - Create and manage FTP access

#### Domain Management
- **Domains** - Manage your domains
- **DNS Zone Editor** - Edit DNS records
- **Subdomains** - Create and manage subdomains
- **Redirects** - Set up domain redirects

#### Email Management
- **Email Accounts** - Create and manage email accounts
- **Webmail** - Access email through web interface
- **Email Forwarders** - Forward emails to other addresses
- **Auto Responders** - Set up automatic email responses

#### Database Management
- **MySQL Databases** - Create and manage databases
- **phpMyAdmin** - Web-based database administration
- **Remote MySQL** - Enable remote database access

#### Security
- **SSL Certificates** - Install and manage SSL certificates
- **Password Protection** - Protect directories with passwords
- **IP Blocker** - Block specific IP addresses
- **Hotlink Protection** - Prevent hotlinking of your files

---

## VPS Management

If you have a VPS (Virtual Private Server) plan with Hostinger:

### Accessing VPS Management

1. **From Hostinger Dashboard**
   - Log into your Hostinger account
   - Click on "VPS" in the left sidebar
   - Select your VPS plan
   - Click "Manage"

2. **VPS Dashboard Overview**
   - Server status and resource usage
   - Operating system information
   - IP address
   - Control panel access (if installed)

### VPS Control Options

#### Server Management
- **Start/Stop/Restart** - Control server power state
- **Reboot** - Restart the VPS
- **Reinstall OS** - Reinstall operating system (⚠️ destroys all data)
- **Upgrade** - Upgrade VPS resources

#### Operating System
- **OS Templates** - Choose from various Linux distributions
  - Ubuntu 20.04, 22.04
  - Debian 10, 11
  - CentOS 7, 8
  - AlmaLinux
  - Rocky Linux

#### Control Panels
- **CloudPanel** - Free control panel (recommended)
- **CyberPanel** - Alternative control panel
- **Webuzo** - Application installer
- **No Control Panel** - Manage via SSH only

#### Monitoring
- **CPU Usage** - Real-time CPU monitoring
- **RAM Usage** - Memory consumption
- **Disk Usage** - Storage space used
- **Bandwidth** - Network traffic statistics

#### Backups
- **Automated Backups** - Schedule automatic backups
- **Manual Backups** - Create backup snapshots
- **Restore** - Restore from backup

---

## SSH Access

SSH (Secure Shell) allows you to access your server via command line.

### Finding SSH Credentials

1. **For VPS:**
   - Go to VPS dashboard in Hostinger
   - Click "SSH Access" or "Server Details"
   - Note down:
     - IP Address
     - Port (usually 22)
     - Username (usually root)
     - Password (set during VPS setup)

2. **For Shared Hosting:**
   - Go to hPanel
   - Navigate to "Advanced" → "SSH Access"
   - Enable SSH access if not already enabled
   - Note down SSH credentials

### Connecting via SSH

#### Windows (Using PuTTY)

1. **Download PuTTY**
   - URL: https://www.putty.org/
   - Download and install PuTTY

2. **Configure Connection**
   - Open PuTTY
   - Host Name: Your server IP address
   - Port: 22 (or custom port)
   - Connection type: SSH
   - Click "Open"

3. **Login**
   - Enter username when prompted
   - Enter password (characters won't show while typing)
   - Press Enter

#### Windows (Using Windows Terminal or PowerShell)

```powershell
# Connect to server
ssh username@your-server-ip

# Example:
ssh root@123.45.67.89

# Or with custom port:
ssh -p 2222 username@your-server-ip
```

#### macOS/Linux

```bash
# Connect to server
ssh username@your-server-ip

# Example:
ssh root@123.45.67.89

# Or with custom port:
ssh -p 2222 username@your-server-ip
```

### SSH Key Authentication (More Secure)

#### Generate SSH Key Pair

**Windows (PowerShell):**
```powershell
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

**macOS/Linux:**
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

- Press Enter to accept default location
- Enter passphrase (optional but recommended)
- Keys saved to `~/.ssh/id_rsa` (private) and `~/.ssh/id_rsa.pub` (public)

#### Copy Public Key to Server

**Windows/macOS/Linux:**
```bash
ssh-copy-id username@your-server-ip
```

**Manual Method:**
```bash
# Copy public key content
cat ~/.ssh/id_rsa.pub

# SSH to server
ssh username@your-server-ip

# Add key to authorized_keys
mkdir -p ~/.ssh
echo "paste-your-public-key-here" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

#### Connect with SSH Key

```bash
# Now you can connect without password
ssh username@your-server-ip
```

### Common SSH Commands

```bash
# Check current directory
pwd

# List files
ls -la

# Change directory
cd /path/to/directory

# View file content
cat filename.txt

# Edit file
nano filename.txt

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux

# Check system info
uname -a

# Exit SSH session
exit
```

---

## CloudPanel Access

CloudPanel is a free, modern control panel for managing websites, databases, and applications.

### Installing CloudPanel on VPS

If CloudPanel is not installed:

1. **SSH into your VPS**
   ```bash
   ssh root@your-server-ip
   ```

2. **Install CloudPanel**
   ```bash
   # For Ubuntu 22.04
   curl -sS https://installer.cloudpanel.io/ce/v2/install.sh -o install.sh; \
   echo "85762db0edc00ce19a2cd5496d1627903e6198ad850bbbdefb2ceaa46bd20cbd install.sh" | \
   sha256sum -c && sudo bash install.sh
   ```

3. **Wait for installation** (takes 5-10 minutes)

4. **Access CloudPanel**
   - URL: https://your-server-ip:8443
   - Or: https://your-domain.com:8443

### Accessing CloudPanel

1. **Navigate to CloudPanel URL**
   - URL: https://your-server-ip:8443
   - Or: https://your-domain.com:8443
   - Accept the self-signed certificate warning (first time only)

2. **Login**
   - Username: admin (or username you created)
   - Password: (set during installation)

3. **Dashboard Overview**
   - Server resources (CPU, RAM, Disk)
   - Quick actions
   - Recent activities

### CloudPanel Features

#### Sites Management
- **Add Site** - Create new website
- **Manage Sites** - View all websites
- **SSL Certificates** - Install Let's Encrypt SSL
- **PHP Settings** - Configure PHP version and settings
- **Vhost Editor** - Edit virtual host configuration

#### Databases
- **Add Database** - Create new MySQL database
- **Manage Databases** - View all databases
- **phpMyAdmin** - Access database management tool
- **Database Users** - Manage database users

#### Users
- **Add User** - Create new CloudPanel user
- **Manage Users** - View and edit users
- **SSH Keys** - Manage SSH keys for users

#### Services
- **Nginx** - Web server management
- **MySQL** - Database server management
- **PHP-FPM** - PHP process manager
- **Redis** - Caching service (if installed)

#### Security
- **Firewall** - Manage firewall rules
- **Fail2Ban** - Intrusion prevention
- **SSL Certificates** - Manage SSL/TLS certificates
- **IP Blocking** - Block malicious IPs

### Creating a Website in CloudPanel

1. **Click "Sites" → "Add Site"**

2. **Enter Site Details**
   - Domain Name: your-domain.com
   - Site User: username (auto-generated or custom)
   - Site User Password: (auto-generated or custom)
   - PHP Version: Select version (7.4, 8.0, 8.1, 8.2)
   - Vhost Template: Generic, WordPress, Laravel, etc.

3. **Click "Create"**

4. **Configure DNS**
   - Point your domain's A record to your server IP
   - Wait for DNS propagation (up to 24 hours)

5. **Install SSL Certificate**
   - Go to "Sites" → Select your site
   - Click "SSL/TLS" tab
   - Click "Install Let's Encrypt Certificate"
   - Enable "Force HTTPS"

### Managing Databases in CloudPanel

1. **Click "Databases" → "Add Database"**

2. **Enter Database Details**
   - Database Name: your_database_name
   - Database User Name: your_user_name
   - Database User Password: secure_password

3. **Click "Create"**

4. **Access phpMyAdmin**
   - Click "Databases" → Select database
   - Click "phpMyAdmin" button
   - Login with database credentials

---

## File Manager

### hPanel File Manager (Shared Hosting)

1. **Access File Manager**
   - Login to hPanel
   - Click "Files" → "File Manager"

2. **Navigate Directories**
   - Double-click folders to open
   - Use breadcrumb navigation at top
   - Common directories:
     - `public_html` - Website files
     - `logs` - Server logs
     - `tmp` - Temporary files

3. **File Operations**
   - **Upload** - Click "Upload" button, select files
   - **Download** - Right-click file → Download
   - **Edit** - Right-click file → Edit
   - **Delete** - Right-click file → Delete
   - **Rename** - Right-click file → Rename
   - **Permissions** - Right-click → Change Permissions

4. **Create New**
   - **File** - Click "New File" button
   - **Folder** - Click "New Folder" button

### FTP Access

1. **Create FTP Account**
   - hPanel → "Files" → "FTP Accounts"
   - Click "Create FTP Account"
   - Enter username and password
   - Set directory (usually public_html)
   - Click "Create"

2. **FTP Credentials**
   - FTP Server: ftp.your-domain.com (or server IP)
   - FTP Username: username@your-domain.com
   - FTP Password: your-password
   - Port: 21 (FTP) or 22 (SFTP)

3. **Connect with FTP Client**
   - Download FileZilla: https://filezilla-project.org/
   - Open FileZilla
   - Enter FTP credentials
   - Click "Quickconnect"

### CloudPanel File Access

1. **Via SFTP**
   - Use FileZilla or similar FTP client
   - Protocol: SFTP
   - Host: your-server-ip
   - Port: 22
   - Username: site user (from CloudPanel)
   - Password: site user password

2. **Via SSH**
   - SSH into server
   - Navigate to site directory:
     ```bash
     cd /home/site-user/htdocs/your-domain.com
     ```

---

## Database Management

### phpMyAdmin Access

#### Via hPanel (Shared Hosting)

1. **Access phpMyAdmin**
   - hPanel → "Databases" → "phpMyAdmin"
   - Select database from left sidebar

2. **Common Operations**
   - **Browse** - View table data
   - **SQL** - Run SQL queries
   - **Export** - Backup database
   - **Import** - Restore database

#### Via CloudPanel (VPS)

1. **Access phpMyAdmin**
   - CloudPanel → "Databases" → Select database
   - Click "phpMyAdmin" button
   - Login with database credentials

### MySQL Command Line (VPS)

```bash
# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE database_name;

# Show tables
SHOW TABLES;

# Exit MySQL
EXIT;
```

### Remote Database Access

#### Enable Remote Access (CloudPanel)

1. **CloudPanel → "Databases"**
2. **Select database**
3. **Click "Remote Access" tab**
4. **Add allowed IP addresses**
5. **Save changes**

#### Connect Remotely

```bash
# From your local machine
mysql -h your-server-ip -u database_user -p database_name
```

---

## Domain Management

### Adding a Domain

#### Via hPanel

1. **hPanel → "Domains"**
2. **Click "Add Domain"**
3. **Enter domain name**
4. **Select domain type:**
   - Primary domain
   - Addon domain
   - Subdomain
5. **Click "Add"**

#### Via CloudPanel

1. **CloudPanel → "Sites" → "Add Site"**
2. **Enter domain name**
3. **Configure settings**
4. **Click "Create"**

### DNS Management

#### Via Hostinger Dashboard

1. **Hostinger Dashboard → "Domains"**
2. **Select domain**
3. **Click "DNS / Nameservers"**
4. **Click "Manage DNS Records"**

#### Common DNS Records

- **A Record** - Points domain to IP address
  ```
  Type: A
  Name: @ (or subdomain)
  Points to: 123.45.67.89
  TTL: 14400
  ```

- **CNAME Record** - Points subdomain to another domain
  ```
  Type: CNAME
  Name: www
  Points to: your-domain.com
  TTL: 14400
  ```

- **MX Record** - Mail server configuration
  ```
  Type: MX
  Name: @
  Points to: mail.your-domain.com
  Priority: 10
  TTL: 14400
  ```

- **TXT Record** - Text records (SPF, DKIM, verification)
  ```
  Type: TXT
  Name: @
  Value: "v=spf1 include:_spf.hostinger.com ~all"
  TTL: 14400
  ```

### SSL Certificate Installation

#### Via hPanel

1. **hPanel → "Security" → "SSL"**
2. **Select domain**
3. **Choose certificate type:**
   - Let's Encrypt (Free, recommended)
   - Custom SSL
4. **Click "Install"**

#### Via CloudPanel

1. **CloudPanel → "Sites" → Select site**
2. **Click "SSL/TLS" tab**
3. **Click "Install Let's Encrypt Certificate"**
4. **Enable "Force HTTPS"**

---

## Email Management

### Creating Email Accounts

#### Via hPanel

1. **hPanel → "Emails" → "Email Accounts"**
2. **Click "Create Email Account"**
3. **Enter email address** (e.g., info@your-domain.com)
4. **Set password**
5. **Set mailbox quota**
6. **Click "Create"**

### Accessing Webmail

1. **Navigate to Webmail**
   - URL: https://webmail.your-domain.com
   - Or: https://webmail.hostinger.com

2. **Login**
   - Email: your-email@your-domain.com
   - Password: your-email-password

3. **Choose Webmail Client**
   - Roundcube (recommended)
   - Horde

### Email Client Configuration

#### IMAP Settings (Recommended)
```
Incoming Server: imap.hostinger.com
Port: 993
Security: SSL/TLS
Username: your-email@your-domain.com
Password: your-email-password
```

#### SMTP Settings
```
Outgoing Server: smtp.hostinger.com
Port: 465 (SSL) or 587 (TLS)
Security: SSL/TLS
Username: your-email@your-domain.com
Password: your-email-password
```

---

## Security and Backups

### Enabling Two-Factor Authentication

1. **Hostinger Dashboard → Account Settings**
2. **Click "Security"**
3. **Enable "Two-Factor Authentication"**
4. **Scan QR code with authenticator app**
5. **Enter verification code**

### Creating Backups

#### Via hPanel

1. **hPanel → "Files" → "Backups"**
2. **Click "Create Backup"**
3. **Select what to backup:**
   - Website files
   - Databases
   - Email accounts
4. **Click "Create"**
5. **Download backup when ready**

#### Via CloudPanel

1. **CloudPanel → "Sites" → Select site**
2. **Click "Backups" tab**
3. **Click "Create Backup"**
4. **Download backup file**

#### Via SSH (VPS)

```bash
# Backup website files
tar -czf website_backup_$(date +%Y%m%d).tar.gz /home/site-user/htdocs/

# Backup database
mysqldump -u root -p database_name > database_backup_$(date +%Y%m%d).sql

# Backup with compression
mysqldump -u root -p database_name | gzip > database_backup_$(date +%Y%m%d).sql.gz
```

### Restoring Backups

#### Via hPanel

1. **hPanel → "Files" → "Backups"**
2. **Select backup**
3. **Click "Restore"**
4. **Confirm restoration**

#### Via SSH

```bash
# Restore website files
tar -xzf website_backup_20260224.tar.gz -C /home/site-user/htdocs/

# Restore database
mysql -u root -p database_name < database_backup_20260224.sql

# Restore compressed database
gunzip < database_backup_20260224.sql.gz | mysql -u root -p database_name
```

---

## Quick Reference

### Essential URLs

- **Hostinger Login:** https://www.hostinger.com/
- **hPanel:** https://hpanel.hostinger.com/
- **CloudPanel:** https://your-server-ip:8443
- **Webmail:** https://webmail.your-domain.com
- **phpMyAdmin:** Access via hPanel or CloudPanel

### Common Credentials

- **Hostinger Account:** Your email + password
- **hPanel:** Same as Hostinger account
- **CloudPanel:** Admin username + password (set during installation)
- **SSH (VPS):** root or site user + password
- **FTP:** FTP username + password (created in hPanel)
- **Database:** Database username + password (created in hPanel/CloudPanel)

### Support Resources

- **Hostinger Help Center:** https://support.hostinger.com/
- **Live Chat:** Available 24/7 from Hostinger dashboard
- **CloudPanel Documentation:** https://www.cloudpanel.io/docs/
- **Community Forum:** https://www.hostinger.com/forum/

---

## Troubleshooting

### Cannot Access hPanel

- Clear browser cache and cookies
- Try different browser
- Check if Hostinger is experiencing downtime: https://status.hostinger.com/
- Contact Hostinger support

### Cannot Connect via SSH

- Verify IP address and port
- Check if SSH is enabled (hPanel → SSH Access)
- Verify username and password
- Check firewall rules (VPS)
- Try from different network

### Cannot Access CloudPanel

- Verify URL: https://your-server-ip:8443
- Check if CloudPanel service is running:
  ```bash
  systemctl status cloudpanel
  ```
- Restart CloudPanel:
  ```bash
  systemctl restart cloudpanel
  ```
- Check firewall allows port 8443:
  ```bash
  ufw allow 8443/tcp
  ```

### Website Not Loading

- Check DNS propagation: https://dnschecker.org/
- Verify A record points to correct IP
- Check if website files exist in correct directory
- Check Nginx/Apache status (VPS)
- Review error logs

---

## Related Documentation

- See `GIT_OPERATIONS.md` for Git and deployment procedures
- See `DATABASE_MANAGEMENT.md` for database operations
- See `DEPLOYMENT_GUIDE.md` for complete deployment procedures
- See `TROUBLESHOOTING.md` for common issues and solutions

---

*Last updated: 2026-02-24*
