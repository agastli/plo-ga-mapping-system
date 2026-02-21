# Database Setup Guide

This guide provides detailed instructions for setting up the database for the PLO-GA Mapping System.

## Table of Contents

1. [Database Requirements](#database-requirements)
2. [Local MySQL Setup](#local-mysql-setup)
3. [Cloud Database Setup](#cloud-database-setup)
4. [Running Migrations](#running-migrations)
5. [Seeding Initial Data](#seeding-initial-data)
6. [Backup and Restore](#backup-and-restore)

---

## Database Requirements

The PLO-GA Mapping System requires a MySQL-compatible database with the following specifications:

- **Database Engine**: MySQL 8.0+ or MariaDB 10.5+
- **Character Set**: UTF8MB4
- **Collation**: utf8mb4_unicode_ci
- **Storage**: Minimum 100MB, recommended 1GB for production
- **Connections**: Minimum 10 concurrent connections

**Supported Databases:**
- MySQL 8.0+
- MariaDB 10.5+
- TiDB (MySQL-compatible)
- PlanetScale
- AWS RDS for MySQL
- Azure Database for MySQL
- Google Cloud SQL for MySQL

---

## Local MySQL Setup

### Step 1: Install MySQL

**Windows:**
1. Download MySQL Installer from: https://dev.mysql.com/downloads/installer/
2. Run the installer and choose "Developer Default"
3. Set a root password during installation (remember this!)
4. Complete the installation wizard

**macOS (using Homebrew):**
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### Step 2: Create Database

Connect to MySQL:
```bash
mysql -u root -p
```

Create the database:
```sql
CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 3: Create Database User (Recommended)

For security, create a dedicated user instead of using root:

```sql
CREATE USER 'plo_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON plo_ga_mapping.* TO 'plo_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 4: Configure Connection

Update your `.env` file with the database connection string:

```env
DATABASE_URL=mysql://plo_user:your_secure_password@localhost:3306/plo_ga_mapping
```

**Connection String Format:**
```
mysql://[username]:[password]@[host]:[port]/[database]
```

---

## Cloud Database Setup

### Option 1: TiDB Cloud (Recommended)

TiDB is a MySQL-compatible cloud database with excellent performance and scalability.

1. Sign up at: https://tidbcloud.com/
2. Create a new cluster (Free tier available)
3. Wait for cluster provisioning (5-10 minutes)
4. Get the connection string from the dashboard
5. Update `.env`:

```env
DATABASE_URL=mysql://user.root:password@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/plo_ga_mapping?ssl={"rejectUnauthorized":true}
```

### Option 2: PlanetScale

1. Sign up at: https://planetscale.com/
2. Create a new database
3. Create a branch (e.g., "main")
4. Get connection string from "Connect" tab
5. Update `.env` with the connection string

### Option 3: AWS RDS

1. Go to AWS RDS Console
2. Create a new MySQL database instance
3. Choose instance size and storage
4. Configure security group to allow connections
5. Get endpoint and credentials
6. Update `.env`:

```env
DATABASE_URL=mysql://admin:password@database-1.abc123.us-east-1.rds.amazonaws.com:3306/plo_ga_mapping
```

---

## Running Migrations

After configuring the database connection, run migrations to create all necessary tables.

### Step 1: Verify Connection

Test that the database is accessible:
```bash
mysql -h hostname -u username -p database_name
```

### Step 2: Run Migrations

Execute the migration command:
```bash
pnpm db:push
```

This command will:
1. Read the schema from `drizzle/schema.ts`
2. Generate SQL migration files
3. Execute migrations to create tables
4. Display success or error messages

**Expected Output:**
```
Reading config file 'drizzle.config.ts'
Reading schema files: drizzle/schema.ts

11 tables
auditLog 7 columns 0 indexes 1 fks
colleges 6 columns 0 indexes 0 fks
competencies 6 columns 0 indexes 1 fks
departments 7 columns 0 indexes 1 fks
graduateAttributes 5 columns 0 indexes 0 fks
justifications 8 columns 0 indexes 3 fks
mappings 6 columns 0 indexes 2 fks
plos 8 columns 0 indexes 1 fks
programs 8 columns 0 indexes 1 fks
reportTemplates 9 columns 0 indexes 1 fks
users 9 columns 0 indexes 0 fks

[✓] Your SQL migration file ➜ drizzle/0001_xxxxx.sql 🚀
[✓] Migrations applied successfully
```

### Step 3: Verify Tables

Check that all tables were created:
```bash
mysql -u username -p -e "USE plo_ga_mapping; SHOW TABLES;"
```

Expected tables:
- auditLog
- colleges
- competencies
- departments
- graduateAttributes
- justifications
- mappings
- plos
- programs
- reportTemplates
- users

---

## Seeding Initial Data

The system requires initial data for Graduate Attributes and Competencies.

### Graduate Attributes (5 GAs)

The system uses 5 Graduate Attributes defined by Qatar University:

1. **GA1**: Knowledge and Understanding
2. **GA2**: Skills
3. **GA3**: Autonomy and Responsibility
4. **GA4**: Role in Context
5. **GA5**: Self-Development

### Competencies (21 Competencies)

Each Graduate Attribute has associated competencies (total: 21):

- **GA1** (Knowledge): C1-1, C1-2, C1-3, C1-4
- **GA2** (Skills): C2-1, C2-2, C2-3, C2-4, C2-5, C2-6
- **GA3** (Autonomy): C3-1, C3-2, C3-3, C3-4
- **GA4** (Role): C4-1, C4-2, C4-3
- **GA5** (Self-Development): C5-1, C5-2, C5-3

### Seeding Methods

**Method 1: Using SQL Script** (Recommended)

Create a file `seed-data.sql`:

```sql
-- Insert Graduate Attributes
INSERT INTO graduateAttributes (id, code, nameEn, nameAr) VALUES
(1, 'GA1', 'Knowledge and Understanding', 'المعرفة والفهم'),
(2, 'GA2', 'Skills', 'المهارات'),
(3, 'GA3', 'Autonomy and Responsibility', 'الاستقلالية والمسؤولية'),
(4, 'GA4', 'Role in Context', 'الدور في السياق'),
(5, 'GA5', 'Self-Development', 'التطوير الذاتي');

-- Insert Competencies for GA1
INSERT INTO competencies (code, titleEn, titleAr, gaId) VALUES
('C1-1', 'Demonstrate knowledge of...', 'إظهار المعرفة بـ...', 1),
('C1-2', 'Understand concepts of...', 'فهم مفاهيم...', 1),
('C1-3', 'Apply theoretical knowledge...', 'تطبيق المعرفة النظرية...', 1),
('C1-4', 'Analyze and synthesize...', 'تحليل وتركيب...', 1);

-- Insert Competencies for GA2
INSERT INTO competencies (code, titleEn, titleAr, gaId) VALUES
('C2-1', 'Apply technical skills...', 'تطبيق المهارات التقنية...', 2),
('C2-2', 'Use appropriate tools...', 'استخدام الأدوات المناسبة...', 2),
('C2-3', 'Solve complex problems...', 'حل المشكلات المعقدة...', 2),
('C2-4', 'Communicate effectively...', 'التواصل بفعالية...', 2),
('C2-5', 'Work collaboratively...', 'العمل بشكل تعاوني...', 2),
('C2-6', 'Demonstrate creativity...', 'إظهار الإبداع...', 2);

-- Insert Competencies for GA3
INSERT INTO competencies (code, titleEn, titleAr, gaId) VALUES
('C3-1', 'Work independently...', 'العمل بشكل مستقل...', 3),
('C3-2', 'Take responsibility...', 'تحمل المسؤولية...', 3),
('C3-3', 'Make informed decisions...', 'اتخاذ قرارات مستنيرة...', 3),
('C3-4', 'Manage time effectively...', 'إدارة الوقت بفعالية...', 3);

-- Insert Competencies for GA4
INSERT INTO competencies (code, titleEn, titleAr, gaId) VALUES
('C4-1', 'Understand professional context...', 'فهم السياق المهني...', 4),
('C4-2', 'Apply ethical principles...', 'تطبيق المبادئ الأخلاقية...', 4),
('C4-3', 'Contribute to society...', 'المساهمة في المجتمع...', 4);

-- Insert Competencies for GA5
INSERT INTO competencies (code, titleEn, titleAr, gaId) VALUES
('C5-1', 'Engage in lifelong learning...', 'الانخراط في التعلم مدى الحياة...', 5),
('C5-2', 'Reflect on practice...', 'التفكير في الممارسة...', 5),
('C5-3', 'Adapt to change...', 'التكيف مع التغيير...', 5);
```

Execute the script:
```bash
mysql -u username -p plo_ga_mapping < seed-data.sql
```

**Method 2: Using the Web Interface**

After starting the application, you can manually add Graduate Attributes and Competencies through the admin interface (if available).

---

## Backup and Restore

### Creating Backups

**Full Database Backup:**
```bash
mysqldump -u username -p plo_ga_mapping > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Backup Specific Tables:**
```bash
mysqldump -u username -p plo_ga_mapping colleges departments programs plos mappings justifications > data_backup.sql
```

**Automated Daily Backups (Linux/macOS):**

Create a cron job:
```bash
crontab -e
```

Add this line (runs daily at 2 AM):
```
0 2 * * * mysqldump -u username -ppassword plo_ga_mapping > /path/to/backups/backup_$(date +\%Y\%m\%d).sql
```

### Restoring from Backup

**Restore Full Database:**
```bash
mysql -u username -p plo_ga_mapping < backup_20260221_140000.sql
```

**Restore Specific Tables:**
```bash
mysql -u username -p plo_ga_mapping < data_backup.sql
```

---

## Troubleshooting

### Issue: "Access denied for user"

**Solution:**
- Verify username and password in `.env`
- Check user privileges: `SHOW GRANTS FOR 'username'@'localhost';`
- Grant necessary privileges if missing

### Issue: "Unknown database 'plo_ga_mapping'"

**Solution:**
```sql
CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Issue: "Can't connect to MySQL server"

**Solutions:**
1. Check if MySQL is running:
   ```bash
   # Windows
   net start MySQL80
   
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status mysql
   ```

2. Check firewall settings
3. Verify host and port in connection string

### Issue: Migration fails with "Table already exists"

**Solution:**
```bash
# Drop all tables and re-run migrations
mysql -u username -p -e "DROP DATABASE plo_ga_mapping; CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
pnpm db:push
```

---

## Best Practices

1. **Use dedicated database user** (not root) for the application
2. **Enable SSL/TLS** for database connections in production
3. **Regular backups**: Daily automated backups recommended
4. **Monitor disk space**: Ensure sufficient storage for growth
5. **Index optimization**: Monitor slow queries and add indexes as needed
6. **Connection pooling**: Configured automatically by Drizzle ORM
7. **Security**: Never commit `.env` file with credentials to Git

---

**Last Updated**: February 2026
