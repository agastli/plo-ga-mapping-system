# Database Management Guide

## Overview

This guide provides step-by-step instructions for managing the MySQL database for the PLO-GA Mapping System, including backup, restore, import, and export operations.

---

## Database Connection Information

### Default Configuration
- **Host:** localhost (or your MySQL server IP)
- **Port:** 3306
- **Database Name:** `plo_ga_mapping` (check your `.env` file for actual name)
- **Username:** Check your environment configuration
- **Password:** Check your environment configuration

### Finding Your Database Credentials

Your database credentials are stored in the environment configuration. To view them:

```bash
cd /home/agastli/htdocs/plo-ga.gastli.org
cat .env | grep DATABASE
```

Or check the `DATABASE_URL` variable which follows this format:
```
DATABASE_URL=mysql://username:password@host:port/database_name
```

---

## Exporting the Database to SQL File

### Method 1: Export Entire Database (Recommended for Backup)

```bash
# Export entire database with structure and data
mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Example:
mysqldump -u root -p plo_ga_mapping > backup_20260224_150000.sql
```

**What this includes:**
- All table structures (CREATE TABLE statements)
- All data (INSERT statements)
- Indexes and constraints
- Triggers and stored procedures (if any)

### Method 2: Export Specific Tables Only

```bash
# Export specific tables
mysqldump -u username -p database_name table1 table2 table3 > specific_tables.sql

# Example: Export only programs and PLOs
mysqldump -u root -p plo_ga_mapping programs plos > programs_plos_backup.sql
```

### Method 3: Export Structure Only (No Data)

```bash
# Export only table structures without data
mysqldump -u username -p --no-data database_name > structure_only.sql
```

### Method 4: Export Data Only (No Structure)

```bash
# Export only data without table structures
mysqldump -u username -p --no-create-info database_name > data_only.sql
```

### Method 5: Export with Compression (For Large Databases)

```bash
# Export and compress in one command
mysqldump -u username -p database_name | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# To extract later:
gunzip backup_20260224_150000.sql.gz
```

### Best Practices for Exports

1. **Always include timestamp in filename** for version tracking
2. **Store backups in a separate directory:**
   ```bash
   mkdir -p /home/agastli/backups/database
   mysqldump -u root -p plo_ga_mapping > /home/agastli/backups/database/backup_$(date +%Y%m%d_%H%M%S).sql
   ```
3. **Keep multiple backup versions** (daily, weekly, monthly)
4. **Test your backups** by restoring to a test database periodically

---

## Importing SQL File to Database

### Method 1: Import Using mysql Command (Recommended)

```bash
# Import SQL file into existing database
mysql -u username -p database_name < backup_file.sql

# Example:
mysql -u root -p plo_ga_mapping < backup_20260224_150000.sql
```

### Method 2: Import Compressed SQL File

```bash
# Import gzipped SQL file directly
gunzip < backup_20260224_150000.sql.gz | mysql -u username -p database_name
```

### Method 3: Import from MySQL Command Line

```bash
# First, connect to MySQL
mysql -u username -p

# Then inside MySQL prompt:
USE database_name;
SOURCE /path/to/backup_file.sql;
EXIT;
```

### Method 4: Import Specific Tables

If your SQL file contains multiple tables but you only want to import specific ones:

```bash
# Extract specific table from backup
sed -n '/CREATE TABLE `table_name`/,/UNLOCK TABLES/p' backup.sql > specific_table.sql

# Import the specific table
mysql -u username -p database_name < specific_table.sql
```

### Important Notes for Importing

⚠️ **WARNING:** Importing will overwrite existing data in the database!

**Before importing:**

1. **Create a backup of current database:**
   ```bash
   mysqldump -u root -p plo_ga_mapping > before_import_backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Stop the application to prevent conflicts:**
   ```bash
   pm2 stop plo-ga-mapping
   ```

3. **Verify the SQL file is not corrupted:**
   ```bash
   head -n 20 backup_file.sql  # Check first 20 lines
   tail -n 20 backup_file.sql  # Check last 20 lines
   ```

4. **After successful import, restart the application:**
   ```bash
   pm2 start plo-ga-mapping
   ```

---

## Creating a New Database from SQL File

If you need to create a fresh database from a backup:

```bash
# 1. Create the database
mysql -u root -p -e "CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Import the SQL file
mysql -u root -p plo_ga_mapping < backup_file.sql

# 3. Verify import
mysql -u root -p plo_ga_mapping -e "SHOW TABLES;"
```

---

## Database Backup Automation

### Create Automated Daily Backup Script

Create a file: `/home/agastli/scripts/backup_database.sh`

```bash
#!/bin/bash

# Configuration
DB_USER="root"
DB_NAME="plo_ga_mapping"
BACKUP_DIR="/home/agastli/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"
DAYS_TO_KEEP=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
echo "Starting backup at $(date)"
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Delete old backups (older than DAYS_TO_KEEP)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$DAYS_TO_KEEP -delete

echo "Backup completed: $BACKUP_FILE.gz"
echo "Old backups (>$DAYS_TO_KEEP days) deleted"
```

Make it executable:
```bash
chmod +x /home/agastli/scripts/backup_database.sh
```

### Schedule Automated Backups with Cron

```bash
# Edit crontab
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /home/agastli/scripts/backup_database.sh >> /home/agastli/logs/backup.log 2>&1

# Or for weekly backup every Sunday at 3 AM
0 3 * * 0 /home/agastli/scripts/backup_database.sh >> /home/agastli/logs/backup.log 2>&1
```

---

## Common Database Operations

### View All Tables

```bash
mysql -u root -p plo_ga_mapping -e "SHOW TABLES;"
```

### Count Records in Each Table

```bash
mysql -u root -p plo_ga_mapping -e "
SELECT 
    table_name AS 'Table',
    table_rows AS 'Rows'
FROM 
    information_schema.tables
WHERE 
    table_schema = 'plo_ga_mapping'
ORDER BY 
    table_rows DESC;
"
```

### Check Database Size

```bash
mysql -u root -p -e "
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM 
    information_schema.tables
WHERE 
    table_schema = 'plo_ga_mapping'
GROUP BY 
    table_schema;
"
```

### Optimize Database Tables

```bash
# Optimize all tables (recommended after large imports/deletes)
mysql -u root -p plo_ga_mapping -e "
SELECT CONCAT('OPTIMIZE TABLE ', table_name, ';') 
FROM information_schema.tables 
WHERE table_schema='plo_ga_mapping';
" | grep OPTIMIZE | mysql -u root -p plo_ga_mapping
```

### Reset Auto-Increment Values

```bash
# Reset auto-increment for a specific table
mysql -u root -p plo_ga_mapping -e "ALTER TABLE programs AUTO_INCREMENT = 1;"
```

---

## Database Migration Between Environments

### From Development to Production

1. **Export from development:**
   ```bash
   # On development machine
   mysqldump -u root -p plo_ga_mapping > dev_export_$(date +%Y%m%d).sql
   ```

2. **Transfer to production:**
   ```bash
   # Using SCP
   scp dev_export_20260224.sql user@production-server:/home/agastli/backups/
   
   # Or using FileManager/FTP
   ```

3. **Import to production:**
   ```bash
   # On production server
   pm2 stop plo-ga-mapping
   mysql -u root -p plo_ga_mapping < /home/agastli/backups/dev_export_20260224.sql
   pm2 start plo-ga-mapping
   ```

### From Production to Development

Same process but in reverse. **Important:** Make sure to backup production first!

---

## Troubleshooting Database Issues

### Error: "Access denied for user"

```bash
# Reset MySQL root password if needed
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
EXIT;
```

### Error: "Database does not exist"

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Error: "Table doesn't exist" after import

```bash
# Verify import completed successfully
mysql -u root -p plo_ga_mapping -e "SHOW TABLES;"

# Check for errors in SQL file
grep -i "error" backup_file.sql
```

### Error: "Disk full" during import

```bash
# Check disk space
df -h

# Clean up old files if needed
rm -rf /tmp/*
rm -rf /var/log/*.log.gz

# Or import to a different location with more space
```

### Connection Issues

```bash
# Check if MySQL is running
sudo systemctl status mysql

# Restart MySQL if needed
sudo systemctl restart mysql

# Check MySQL error log
sudo tail -f /var/log/mysql/error.log
```

---

## Database Schema Information

### Main Tables in PLO-GA Mapping System

1. **colleges** - College/Faculty information
2. **clusters** - Cluster subdivisions within colleges (e.g., CAS clusters)
3. **departments** - Academic departments
4. **programs** - Academic programs
5. **plos** - Program Learning Outcomes
6. **graduate_attributes** - Graduate Attributes (GAs)
7. **competencies** - Competencies under each GA
8. **plo_ga_mappings** - Mappings between PLOs and competencies with weights
9. **justifications** - Justifications for each mapping
10. **users** - System users
11. **audit_logs** - Audit trail of all changes

### View Schema for a Specific Table

```bash
mysql -u root -p plo_ga_mapping -e "DESCRIBE programs;"
```

### Export Schema Documentation

```bash
# Generate schema documentation
mysqldump -u root -p --no-data plo_ga_mapping > schema_documentation.sql
```

---

## Security Best Practices

1. **Never commit database credentials to Git**
   - Keep `.env` file in `.gitignore`
   - Use environment variables for sensitive data

2. **Restrict database user permissions**
   ```sql
   -- Create application-specific user with limited permissions
   CREATE USER 'plo_app'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT SELECT, INSERT, UPDATE, DELETE ON plo_ga_mapping.* TO 'plo_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Regular backups**
   - Automate daily backups
   - Store backups in multiple locations
   - Test restore procedures regularly

4. **Secure backup files**
   ```bash
   # Set proper permissions on backup directory
   chmod 700 /home/agastli/backups/database
   chmod 600 /home/agastli/backups/database/*.sql
   ```

5. **Enable MySQL binary logging** for point-in-time recovery
   ```bash
   # Edit MySQL config
   sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
   
   # Add these lines:
   log_bin = /var/log/mysql/mysql-bin.log
   expire_logs_days = 10
   max_binlog_size = 100M
   
   # Restart MySQL
   sudo systemctl restart mysql
   ```

---

## Quick Reference Commands

### Backup Commands
```bash
# Full backup
mysqldump -u root -p plo_ga_mapping > backup.sql

# Compressed backup
mysqldump -u root -p plo_ga_mapping | gzip > backup.sql.gz

# Structure only
mysqldump -u root -p --no-data plo_ga_mapping > structure.sql
```

### Restore Commands
```bash
# Restore from backup
mysql -u root -p plo_ga_mapping < backup.sql

# Restore from compressed
gunzip < backup.sql.gz | mysql -u root -p plo_ga_mapping
```

### Monitoring Commands
```bash
# Show tables
mysql -u root -p plo_ga_mapping -e "SHOW TABLES;"

# Count records
mysql -u root -p plo_ga_mapping -e "SELECT COUNT(*) FROM programs;"

# Check database size
mysql -u root -p -e "SELECT table_schema, SUM(data_length + index_length) / 1024 / 1024 AS 'Size (MB)' FROM information_schema.tables WHERE table_schema = 'plo_ga_mapping';"
```

---

## Related Documentation

- See `DEPLOYMENT_GUIDE.md` for Git operations and deployment procedures
- See `TROUBLESHOOTING.md` for common issues and solutions
- See `README.md` for application setup and configuration

---

*Last updated: 2026-02-24*
