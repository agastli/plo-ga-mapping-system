# Deploying PLO-GA Mapping System on Hostinger

## Overview

Yes, you can deploy the PLO-GA Mapping System on Hostinger, but you need the right hosting plan. This guide explains your options and provides step-by-step deployment instructions.

---

## Hostinger Plan Requirements

### ✅ Compatible Plans

The PLO-GA Mapping System requires Node.js support. The following Hostinger plans support Node.js applications:

1. **Business Shared Hosting** (Recommended for small-medium usage)
   - Supports up to 5 Node.js web apps
   - Includes MySQL database
   - GitHub integration for automatic deployment
   - Easier setup with web interface
   - **Price**: ~$3.99/month

2. **Cloud Hosting**
   - Supports up to 10 Node.js web apps
   - Better performance and resources
   - **Price**: ~$9.99/month

3. **VPS Hosting** (Recommended for production/high traffic)
   - Full server control
   - Unlimited Node.js apps
   - Better performance and customization
   - Requires more technical knowledge
   - **Price**: Starting at ~$5.99/month

### ❌ Incompatible Plans

- **Premium Shared Hosting**: Does NOT support Node.js
- **Basic Shared Hosting**: Does NOT support Node.js

**Important**: Verify your current Hostinger plan supports Node.js before proceeding.

---

## Deployment Option 1: Business/Cloud Hosting (Easiest)

This method uses Hostinger's built-in Node.js hosting feature with GitHub integration.

### Prerequisites

- Hostinger Business or Cloud hosting plan
- GitHub account with your repository
- MySQL database access

### Step 1: Prepare Your GitHub Repository

Your code is already on GitHub at `https://github.com/agastli/plo-ga-mapping-system`, so this step is complete.

### Step 2: Create MySQL Database in Hostinger

1. Log in to Hostinger hPanel
2. Go to **Databases** → **MySQL Databases**
3. Click **Create New Database**
4. Database name: `plo_ga_mapping`
5. Create a database user with a strong password
6. Note down the database credentials:
   - Database name
   - Username
   - Password
   - Hostname (usually `localhost` or specific server)

### Step 3: Deploy Node.js Application

1. In hPanel, go to **Hosting** → **Node.js**
2. Click **Deploy Your Node.js Web App**
3. Connect your GitHub account
4. Select repository: `agastli/plo-ga-mapping-system`
5. Select branch: `main`
6. Configure deployment settings:
   - **Application Root**: `/` (root directory)
   - **Application Startup File**: `server/_core/index.ts`
   - **Node.js Version**: Select 18.x or higher
   - **Application URL**: Choose your subdomain (e.g., `plo-mapping.yourdomain.com`)

### Step 4: Configure Environment Variables

In the Node.js app settings, add these environment variables:

```
DATABASE_URL=mysql://username:password@hostname:3306/plo_ga_mapping
NODE_ENV=production
PORT=3000
JWT_SECRET=your-random-32-character-secret-key
OWNER_NAME=Qatar University
OWNER_OPEN_ID=admin@qu.edu.qa
VITE_APP_TITLE=PLO-GA Mapping System
VITE_APP_LOGO=/qu-logo.png
```

Replace:
- `username`, `password`, `hostname` with your MySQL credentials from Step 2
- `your-random-32-character-secret-key` with a secure random string

### Step 5: Install Dependencies and Build

Hostinger will automatically:
1. Run `pnpm install` to install Node.js dependencies
2. Run `pnpm build` to build the application

**Note**: Python dependencies need to be installed manually via SSH (see Step 6).

### Step 6: Install Python Dependencies via SSH

1. In hPanel, go to **Advanced** → **SSH Access**
2. Enable SSH access
3. Connect via SSH:
   ```bash
   ssh username@your-server.hostinger.com
   ```
4. Navigate to your application directory:
   ```bash
   cd domains/yourdomain.com/public_html/plo-ga-mapping-system
   ```
5. Install Python packages:
   ```bash
   pip3 install --user python-docx openpyxl reportlab
   ```

### Step 7: Initialize Database

1. Still in SSH, run database migrations:
   ```bash
   pnpm db:push
   ```

2. This will create all necessary tables in your MySQL database.

### Step 8: Start the Application

1. In hPanel, go back to your Node.js application
2. Click **Start** or **Restart**
3. Wait for the application to start (usually 30-60 seconds)

### Step 9: Access Your Application

Visit your configured URL (e.g., `https://plo-mapping.yourdomain.com`)

You should see the PLO-GA Mapping System homepage.

---

## Deployment Option 2: VPS Hosting (Advanced)

For better performance and full control, use Hostinger VPS.

### Prerequisites

- Hostinger VPS plan
- Basic Linux command line knowledge
- SSH access

### Step 1: Connect to VPS

```bash
ssh root@your-vps-ip
```

### Step 2: Update System

```bash
apt update && apt upgrade -y
```

### Step 3: Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 4: Install pnpm

```bash
npm install -g pnpm
```

### Step 5: Install Python

```bash
apt install -y python3 python3-pip
pip3 install python-docx openpyxl reportlab
```

### Step 6: Install MySQL

```bash
apt install -y mysql-server
mysql_secure_installation
```

Follow the prompts to secure your MySQL installation.

### Step 7: Create Database

```bash
mysql -u root -p

# In MySQL prompt:
CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'plo_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON plo_ga_mapping.* TO 'plo_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 8: Clone Repository

```bash
cd /var/www
git clone https://github.com/agastli/plo-ga-mapping-system.git
cd plo-ga-mapping-system
```

### Step 9: Install Dependencies

```bash
pnpm install
```

### Step 10: Configure Environment

```bash
cp .env.example .env
nano .env
```

Update the `.env` file with your database credentials and other settings.

### Step 11: Run Database Migrations

```bash
pnpm db:push
```

### Step 12: Build Application

```bash
pnpm build
```

### Step 13: Install PM2 Process Manager

```bash
npm install -g pm2
```

### Step 14: Start Application with PM2

```bash
pm2 start npm --name "plo-ga-mapping" -- start
pm2 save
pm2 startup
```

### Step 15: Install and Configure Nginx

```bash
apt install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/plo-ga-mapping
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/plo-ga-mapping /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 16: Install SSL Certificate (Optional but Recommended)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 17: Configure Firewall

```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

Your application should now be accessible at `https://yourdomain.com`

---

## Important Considerations

### File Upload Limits

Hostinger shared hosting has file upload limits (typically 128MB). If you need to upload larger Word documents:

1. Increase PHP upload limits in hPanel
2. Or use VPS hosting for more control

### Python Script Execution

The application uses Python scripts for document parsing and export. Ensure:

1. Python 3.8+ is installed
2. Required packages are installed: `python-docx`, `openpyxl`, `reportlab`
3. Python is accessible from Node.js (check PATH)

### Database Connection

If using Hostinger's remote MySQL:
- Use the provided hostname (not `localhost`)
- Enable remote MySQL access in hPanel if needed
- Use SSL connection for security

### Performance Optimization

For better performance on shared hosting:

1. Enable Node.js application caching
2. Use a CDN for static assets
3. Optimize database queries
4. Consider upgrading to VPS for high traffic

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
1. Verify MySQL hostname in `.env` (may not be `localhost`)
2. Check database user has correct permissions
3. Enable remote MySQL access in hPanel if needed

### Issue: "Python module not found"

**Solution:**
```bash
# Connect via SSH
pip3 install --user python-docx openpyxl reportlab
```

### Issue: "Application won't start"

**Solution:**
1. Check Node.js version (must be 18.x+)
2. Verify all environment variables are set
3. Check application logs in hPanel
4. Ensure `pnpm install` completed successfully

### Issue: "Port already in use"

**Solution:**
Change PORT in environment variables to an available port (e.g., 3001, 3002)

---

## Maintenance

### Updating the Application

**For Business/Cloud Hosting:**
1. Push changes to GitHub
2. In hPanel, go to Node.js app settings
3. Click **Redeploy** to pull latest changes

**For VPS Hosting:**
```bash
cd /var/www/plo-ga-mapping-system
git pull origin main
pnpm install
pnpm build
pm2 restart plo-ga-mapping
```

### Database Backups

**Via hPanel:**
1. Go to **Databases** → **MySQL Databases**
2. Click **Manage** next to your database
3. Use **phpMyAdmin** to export database

**Via SSH:**
```bash
mysqldump -u plo_user -p plo_ga_mapping > backup_$(date +%Y%m%d).sql
```

---

## Cost Estimate

### Business Hosting
- **Monthly**: $3.99/month
- **Suitable for**: Small to medium usage (up to 100 users)

### Cloud Hosting
- **Monthly**: $9.99/month
- **Suitable for**: Medium usage (up to 500 users)

### VPS Hosting
- **Monthly**: $5.99 - $29.99/month (depending on resources)
- **Suitable for**: High traffic, production environment

---

## Recommendation

**For Qatar University deployment:**

I recommend **VPS Hosting** for the following reasons:

1. **Full Control**: Complete control over server configuration
2. **Better Performance**: Dedicated resources for database and application
3. **Scalability**: Easy to upgrade resources as usage grows
4. **Security**: Better isolation and security controls
5. **Python Support**: Easier to install and manage Python dependencies
6. **Cost-Effective**: Starting at $5.99/month with better performance than shared hosting

**Alternative**: If you prefer easier management, start with **Business Hosting** ($3.99/month) and upgrade to VPS if you need better performance later.

---

## Support

For Hostinger-specific issues:
- Hostinger Support: [https://www.hostinger.com/contacts](https://www.hostinger.com/contacts)
- Live Chat: Available 24/7 in hPanel

For application issues:
- GitHub Issues: [https://github.com/agastli/plo-ga-mapping-system/issues](https://github.com/agastli/plo-ga-mapping-system/issues)

---

**Last Updated**: February 2026  
**Tested On**: Hostinger Business Hosting, Hostinger VPS
