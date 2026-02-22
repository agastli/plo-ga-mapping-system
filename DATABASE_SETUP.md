# Database Setup Guide

This guide explains how to set up the MySQL database for the PLO-GA Mapping System.

---

## Quick Setup (Using Included SQL File)

The repository includes a pre-configured database export in `database/plo_ga_mapping.sql` with sample data and the complete schema.

### Option 1: Import the SQL File (Recommended)

1. **Create the database:**
   ```bash
   mysql -u root -p -e "CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

2. **Import the SQL file:**
   ```bash
   mysql -u root -p plo_ga_mapping < database/plo_ga_mapping.sql
   ```

3. **Verify the import:**
   ```bash
   mysql -u root -p plo_ga_mapping -e "SHOW TABLES;"
   ```

   You should see 11 tables:
   - users
   - colleges
   - departments
   - programs
   - graduateAttributes
   - competencies
   - plos
   - mappings
   - justifications
   - auditLog
   - reportTemplates

4. **Update your `.env` file:**
   ```env
   DATABASE_URL=mysql://root:your_password@localhost:3306/plo_ga_mapping
   ```

5. **Start the application:**
   ```bash
   pnpm dev
   ```

---

## Option 2: Fresh Database (Using Drizzle Migrations)

If you prefer to start with an empty database:

1. **Create the database:**
   ```bash
   mysql -u root -p -e "CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

2. **Update your `.env` file:**
   ```env
   DATABASE_URL=mysql://root:your_password@localhost:3306/plo_ga_mapping
   ```

3. **Run Drizzle migrations:**
   ```bash
   pnpm db:push
   ```

4. **Start the application:**
   ```bash
   pnpm dev
   ```

---

## Updating the Database Export

If you've made changes to the database and want to update the SQL export file:

1. **Export the current database:**
   ```bash
   mysqldump -u root -p plo_ga_mapping > database/plo_ga_mapping.sql
   ```

2. **Commit the updated file:**
   ```bash
   git add database/plo_ga_mapping.sql
   git commit -m "Updated database export"
   git push
   ```

---

## Database Configuration

### Connection String Format

```
DATABASE_URL=mysql://username:password@host:port/database_name
```

### Examples

**Local Development (WAMP/XAMPP):**
```env
DATABASE_URL=mysql://root:@localhost:3306/plo_ga_mapping
```

**Local Development (with password):**
```env
DATABASE_URL=mysql://root:mypassword@localhost:3306/plo_ga_mapping
```

**Production (with SSL):**
```env
DATABASE_URL=mysql://username:password@host:3306/plo_ga_mapping?ssl=true
```

---

## Troubleshooting

### Error: Access denied for user 'root'@'localhost'

**Solution:** Check your MySQL password and update the DATABASE_URL in `.env`

```bash
# Test your MySQL connection
mysql -u root -p
```

### Error: Unknown database 'plo_ga_mapping'

**Solution:** Create the database first

```bash
mysql -u root -p -e "CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Error: Table doesn't exist

**Solution:** Run migrations or import the SQL file

```bash
# Option 1: Import SQL file
mysql -u root -p plo_ga_mapping < database/plo_ga_mapping.sql

# Option 2: Run migrations
pnpm db:push
```

### Error: Connection timeout

**Solution:** Ensure MySQL server is running

```bash
# Windows (WAMP)
# Start WAMP and ensure MySQL service is green

# Linux
sudo systemctl status mysql
sudo systemctl start mysql

# macOS
brew services start mysql
```

---

## Database Management Tools

### Drizzle Studio (Recommended)

Built-in database GUI:

```bash
pnpm db:studio
```

Opens at: http://localhost:4983

### phpMyAdmin (WAMP/XAMPP)

If using WAMP/XAMPP, access phpMyAdmin at:
```
http://localhost/phpmyadmin
```

### MySQL Workbench

Download from: https://dev.mysql.com/downloads/workbench/

---

## Schema Overview

### Core Tables

1. **users** - User accounts and authentication
2. **colleges** - Academic colleges (e.g., College of Business)
3. **departments** - Academic departments (e.g., Accounting)
4. **programs** - Academic programs (e.g., Bachelor of Accounting)

### Graduate Attributes & Competencies

5. **graduateAttributes** - 5 Graduate Attributes (GA1-GA5)
6. **competencies** - 21 Competencies (C1-1 to C5-3, 3-5 per GA)

### Program Learning Outcomes

7. **plos** - Program Learning Outcomes for each program
8. **mappings** - PLO-to-Competency mappings with weights (0.0-1.0)
9. **justifications** - Justification text for each competency

### System Tables

10. **auditLog** - Change tracking and audit trail
11. **reportTemplates** - Custom export templates

---

## Backup Strategy

### Daily Backups (Recommended)

Create a backup script:

**Windows (backup-db.bat):**
```batch
@echo off
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
mysqldump -u root -p plo_ga_mapping > backups\plo_ga_mapping_%TIMESTAMP%.sql
```

**Linux/macOS (backup-db.sh):**
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p plo_ga_mapping > backups/plo_ga_mapping_$TIMESTAMP.sql
```

### Automated Backups

**Linux (cron):**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-db.sh
```

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (daily at 2 AM)
4. Set action: Run backup-db.bat

---

## Security Best Practices

1. **Use strong passwords** for database users
2. **Limit remote access** to trusted IPs only
3. **Enable SSL/TLS** for production connections
4. **Regular backups** with off-site storage
5. **Principle of least privilege** - create app-specific database users

### Create Application User (Production)

```sql
-- Create dedicated user
CREATE USER 'plo_ga_app'@'localhost' IDENTIFIED BY 'strong_password_here';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON plo_ga_mapping.* TO 'plo_ga_app'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;
```

Update `.env`:
```env
DATABASE_URL=mysql://plo_ga_app:strong_password_here@localhost:3306/plo_ga_mapping
```

---

## Support

For database-related issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review MySQL error logs
3. Open an issue on GitHub with error details

---

**Last Updated:** February 2026
