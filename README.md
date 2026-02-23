# PLO-GA Mapping Management System

A comprehensive web-based system for managing Program Learning Outcomes (PLOs) mapping to Graduate Attributes (GAs) and Competencies for academic programs at Qatar University.

![Qatar University Logo](client/public/qu-logo.png)

---

## Overview

The PLO-GA Mapping Management System is a full-featured web application designed to streamline the management, analysis, and reporting of Program Learning Outcomes mappings to Graduate Attributes and Competencies across academic programs. The system supports the entire lifecycle from document import to analytics and export.

### Key Capabilities

The system enables academic departments and quality assurance offices to efficiently manage assessment data through an intuitive interface that supports:

- **Comprehensive Program Management** - Add, edit, delete, and organize academic programs with hierarchical college/cluster/department structure
- **Document Import & Parsing** - Automatically extract PLO-GA mappings from Word documents with bilingual support
- **Interactive Mapping Management** - Visual matrix interface for managing PLO-to-Competency weight assignments
- **Multi-Level Analytics** - University, college, cluster, department, and program-level dashboards with interactive visualizations
- **Professional Export** - Generate reports in PDF, Word, Excel, and CSV formats with QU branding
- **Audit Trail** - Complete change tracking and version history for accountability

---

## Features

### 🎯 Program Management

**Admin Dashboard**
- Centralized control panel with four main functions:
  - Add New Program
  - Delete Existing Program (with cascading data removal)
  - Update Existing Program
  - Upload Document

**Program Operations**
- Create programs with bilingual names (English/Arabic)
- Assign programs to colleges, clusters (for CAS), and departments
- Edit program information including language settings
- Delete programs with automatic cleanup of related data (PLOs, mappings, justifications)
- View complete program directory with filtering by college and cluster

**PLO Management**
- Add new PLOs directly in program edit page
- Edit existing PLO descriptions inline
- Delete PLOs with confirmation dialog
- Automatic sort ordering and code assignment
- Support for bilingual PLO descriptions

**Hierarchical Organization**
- **Colleges** - Top-level academic units
- **Clusters** - Groupings within College of Arts and Sciences (CAS):
  - Humanities and Social Sciences (HSS)
  - Languages, Communication and Translation (LCT)
  - Sciences and Applied Sciences (SAS)
- **Departments** - Academic departments within colleges/clusters
- **Programs** - Individual degree programs

### 📄 Document Management

**Import Functionality**
- Upload Word documents (.docx) containing PLO-GA mappings
- Automatic parsing of program information, PLOs, mapping matrices, and justifications
- Support for both English and Arabic documents with RTL detection
- Bilingual content management with language-specific field handling
- Validation and error reporting during import

**Document Structure Recognition**
- Program metadata extraction (name, code, college, department)
- PLO list parsing with code and description
- Mapping matrix extraction with weight values (0.0-1.0)
- Justification text extraction for each competency
- Automatic data normalization and validation

### 📊 Analytics & Dashboards

**Multi-Level Analysis**
- **University Level** - Overview of all colleges with comparative metrics
- **College Level** - Department breakdowns with cluster filtering (for CAS)
- **Cluster Level** - Programs within CAS clusters
- **Department Level** - Program-level details and comparisons
- **Program Level** - Detailed PLO-Competency mapping matrix

**Interactive Visualizations**
- Bar charts for Graduate Attribute alignment scores
- Radar charts for competency coverage profiles
- Heatmaps for mapping weight distributions
- Trend analysis and comparative views
- Real-time calculation updates

**Filtering & Navigation**
- Filter by college, cluster, and department
- Drill-down navigation from university to program level
- Breadcrumb navigation for easy backtracking
- Search functionality for programs and departments

#### Calculation Methodology

The system uses a hierarchical sum-based approach for calculating alignment scores:

**Program Level:**
- **Competency Score** = SUM of all mapping weights for that competency (0.0 to 1.0)
- **GA Score** = AVERAGE of its competency scores × 100 (percentage)

**College/University Level:**
- **Competency Score** = AVERAGE of competency scores across all programs
- **GA Score** = AVERAGE of its competency scores × 100 (percentage)

**Example (Mechanical Engineering):**
- C1-1 mappings: PLO1 (0.52) + PLO2 (0.20) + PLO7 (0.28) = **1.00**
- C1-2 mappings: PLO6 (1.00) = **1.00**
- C1-3 mappings: PLO1 (1.00) = **1.00**
- C1-4 mappings: PLO7 (1.00) = **1.00**
- **GA1 Score** = (1.00 + 1.00 + 1.00 + 1.00) / 4 × 100 = **100%**

### 📤 Multi-Format Export

**Export Formats**
- **PDF** - Professional reports with QU branding and formatting
- **Word** - Editable documents matching original templates
- **Excel** - Structured data in multiple sheets with formulas
- **CSV** - Raw data for further analysis and integration

**Export Features**
- Single program export from program detail page
- Batch export of multiple programs as ZIP archive
- Analytics export from dashboard views
- Custom template support for institutional branding
- Bilingual export based on program language setting

**Export Customization**
- Include/exclude specific sections
- Choose language (English/Arabic/Both)
- Select data range and filters
- Apply custom templates

### 🎨 Professional Design

**User Interface**
- Qatar University branding and maroon color scheme (#8B1538)
- Responsive design for desktop, tablet, and mobile devices
- Bilingual interface with RTL support for Arabic
- Accessible and WCAG compliant
- Intuitive navigation and clear visual hierarchy

**Visual Elements**
- QU logo integration throughout the application
- Consistent color palette and typography
- Professional charts and data visualizations
- Loading states and progress indicators
- Toast notifications for user feedback

### 🔒 Security & Audit

**Authentication & Authorization**
- User authentication system
- Role-based access control (admin/user)
- Session management with secure cookies
- Password hashing and secure storage

**Audit Trail**
- Comprehensive logging of all data changes
- User action tracking
- Timestamp recording for all operations
- Change history for accountability
- Rollback capability for critical operations

---

## Technology Stack

### Frontend
- **React 19** - Modern UI framework with concurrent features
- **TypeScript** - Type-safe development and better IDE support
- **Tailwind CSS 4** - Utility-first styling with custom theming
- **shadcn/ui** - High-quality, accessible component library
- **Recharts** - Composable charting library for data visualization
- **tRPC Client** - Type-safe API client with automatic type inference
- **Wouter** - Lightweight routing library
- **Vite 7** - Fast build tool and development server

### Backend
- **Node.js 22** - JavaScript runtime environment
- **Express 4** - Minimalist web framework
- **tRPC 11** - End-to-end typesafe APIs without code generation
- **Drizzle ORM** - Lightweight TypeScript ORM with excellent type inference
- **MySQL 8 / MariaDB 10.5+** - Relational database with full Unicode support
- **Superjson** - Automatic serialization of complex types (Date, Map, Set)

### Document Processing
- **Python 3.8+** - Script runtime for document operations
- **python-docx** - Word document parsing and generation
- **openpyxl** - Excel file generation with formatting
- **reportlab** - PDF generation with custom layouts
- **pandas** - Data manipulation for CSV export

### Development Tools
- **pnpm** - Fast, disk space efficient package manager
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework
- **Git** - Version control

---

## Quick Start

### Prerequisites

**Required Software:**
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **pnpm** 8.x or higher (install via `npm install -g pnpm`)
- **Python** 3.8 or higher ([Download](https://www.python.org/))
- **MySQL** 8.0+ or **MariaDB** 10.5+ ([MySQL](https://dev.mysql.com/downloads/), [MariaDB](https://mariadb.org/download/))
- **Git** ([Download](https://git-scm.com/))

**System Requirements:**
- **Windows** 10/11 or **Linux** (Ubuntu 20.04+, Debian 11+, CentOS 8+) or **macOS** 11+
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB for application and dependencies
- **Network**: Internet connection for initial setup and package downloads

**Windows-Specific Requirement:**
The application requires a `C:\tmp` directory for temporary export files. The setup script creates this automatically, or create it manually:
```cmd
mkdir C:\tmp
```

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/agastli/plo-ga-mapping-system.git
cd plo-ga-mapping-system
```

#### 2. Run Automated Setup

The setup scripts will install all dependencies (Node.js packages and Python packages) and configure the environment.

**Windows:**
```cmd
setup-windows.bat
```

**Linux/macOS:**
```bash
chmod +x setup-unix.sh
./setup-unix.sh
```

The setup script will:
- Check for required software (Node.js, Python, MySQL)
- Install pnpm if not present
- Install Node.js dependencies
- Install Python dependencies
- Create `.env` file from template
- Create `C:\tmp` directory (Windows only)
- Display next steps

#### 3. Create Database

**Using MySQL Command Line:**
```bash
mysql -u root -p -e "CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Using phpMyAdmin (Windows/WAMP):**
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Click "New" in the left sidebar
3. Database name: `plo_ga_mapping`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

**Using MySQL Workbench:**
1. Connect to your MySQL server
2. Click "Create New Schema" icon
3. Schema name: `plo_ga_mapping`
4. Charset: `utf8mb4`, Collation: `utf8mb4_unicode_ci`
5. Click "Apply"

#### 4. Configure Environment

Edit the `.env` file in the project root with your database credentials:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/plo_ga_mapping"

# Security
JWT_SECRET="your-secure-random-string-here"

# Application
NODE_ENV="development"
PORT=3000
```

**Generate a secure JWT_SECRET:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Python
python -c "import secrets; print(secrets.token_hex(32))"

# Online
# Visit: https://generate-secret.vercel.app/32
```

#### 5. Run Database Migrations

This command creates all necessary tables in the database:

```bash
pnpm db:push
```

#### 6. Initialize Base Data (Optional)

If you want to start with sample colleges, departments, and graduate attributes:

```bash
# Run the SQL scripts in the database/ folder
mysql -u root -p plo_ga_mapping < database/01-colleges.sql
mysql -u root -p plo_ga_mapping < database/02-departments.sql
mysql -u root -p plo_ga_mapping < database/03-graduate-attributes.sql
mysql -u root -p plo_ga_mapping < database/04-competencies.sql
```

#### 7. Start the Application

```bash
pnpm dev
```

The application will start on http://localhost:3000

**Expected Output:**
```
> plo-ga-mapping-system@1.0.0 dev
> cross-env NODE_ENV=development tsx watch server/_core/index.ts

[OAuth] Initialized with baseURL: http://localhost:3000
Server running on http://localhost:3000/
```

#### 8. Open in Browser

Navigate to:
```
http://localhost:3000
```

You should see the PLO-GA Mapping System home page with the QU logo and maroon theme.

---

## Documentation

### Getting Started
- **[Installation Guide](INSTALLATION.md)** - Detailed step-by-step installation instructions
- **[Database Setup](DATABASE_SETUP.md)** - Database configuration, schema, and management
- **[Quick Start Guide](QUICK_START.md)** - 30-minute setup guide for new installations

### Deployment
- **[Hostinger Deployment](HOSTINGER_DEPLOYMENT.md)** - Deploy to Hostinger shared hosting
- **[Production Deployment](#production-deployment)** - General production deployment guide

### User Guides
- **[User Manual](docs/USER_MANUAL.md)** - Complete user guide with screenshots
- **[Admin Guide](docs/ADMIN_GUIDE.md)** - Administrative functions and management

---

## Windows Setup Notes

### Critical: C:\tmp Directory Requirement

The application uses Python scripts for document parsing and export functionality. These scripts write temporary files to `/tmp/` which on Windows translates to `C:\tmp`.

**If you encounter "File not found" or "Permission denied" errors during export:**

1. **Create the directory:**
   ```cmd
   mkdir C:\tmp
   ```

2. **Verify it exists:**
   ```cmd
   dir C:\tmp
   ```

3. **Restart the application** after creating the directory

The automated setup script (`setup-windows.bat`) creates this directory automatically, but if you're setting up manually or the directory was deleted, you'll need to recreate it.

### Why This Is Needed

The Python export scripts (`export-to-pdf.py`, `export-to-word.py`, `export-to-excel.py`) use `/tmp/` paths for cross-platform compatibility. On Unix/Linux/macOS, `/tmp/` exists by default. On Windows, we create `C:\tmp` to match this behavior.

**Alternative Solutions:**

- Use Windows Subsystem for Linux (WSL) where `/tmp/` exists natively
- Deploy to a Linux server (recommended for production)
- Modify Python scripts to use `tempfile.gettempdir()` for dynamic temp directory detection

---

## Project Structure

```
plo-ga-mapping-system/
├── client/                  # Frontend React application
│   ├── public/             # Static assets (logos, images)
│   │   ├── qu-logo.png     # Qatar University logo
│   │   └── qu-log-white-transparent.png
│   └── src/
│       ├── components/     # Reusable UI components
│       │   ├── ui/         # shadcn/ui components
│       │   └── ...         # Custom components
│       ├── pages/          # Page components
│       │   ├── Home.tsx    # Landing page
│       │   ├── AdminDashboard.tsx  # Admin control panel
│       │   ├── Programs.tsx        # Program directory
│       │   ├── ProgramDetail.tsx   # Program detail/edit
│       │   ├── AddProgram.tsx      # Add new program wizard
│       │   ├── DeleteProgram.tsx   # Delete program interface
│       │   ├── UnifiedAnalytics.tsx # Analytics dashboard
│       │   └── UploadDocument.tsx  # Document upload
│       ├── lib/            # Utilities and tRPC client
│       │   └── trpc.ts     # tRPC client configuration
│       ├── App.tsx         # Main app component with routing
│       └── main.tsx        # Application entry point
├── server/                  # Backend Express application
│   ├── _core/              # Core server functionality
│   │   ├── index.ts        # Server entry point
│   │   ├── context.ts      # tRPC context
│   │   └── oauth.ts        # Authentication
│   ├── db.ts               # Database query helpers
│   └── routers.ts          # tRPC API routes
├── drizzle/                 # Database schema and migrations
│   └── schema.ts           # Database table definitions
├── scripts/                 # Python scripts for parsing/export
│   ├── parse-docx.py       # Word document parser
│   ├── export-to-pdf.py    # PDF export generator
│   ├── export-to-excel.py  # Excel export generator
│   ├── export-to-word.py   # Word export generator
│   └── export-to-csv.py    # CSV export generator
├── database/                # SQL scripts for initialization
│   ├── 01-colleges.sql     # College data
│   ├── 02-departments.sql  # Department data
│   ├── 03-graduate-attributes.sql  # GA definitions
│   └── 04-competencies.sql # Competency definitions
├── docs/                    # Additional documentation
├── setup-windows.bat        # Windows automated setup script
├── setup-unix.sh            # Linux/macOS automated setup script
├── .env.example             # Environment variable template
├── package.json             # Node.js dependencies and scripts
├── drizzle.config.ts        # Drizzle ORM configuration
├── vite.config.ts           # Vite build configuration
├── tsconfig.json            # TypeScript configuration
├── INSTALLATION.md          # Installation guide
├── DATABASE_SETUP.md        # Database setup guide
├── README.md                # This file
└── todo.md                  # Development task tracking
```

---

## Database Schema

The system uses 12 main tables with full Unicode support (utf8mb4):

### Core Tables

1. **users** - User accounts and authentication
   - `id`, `openId`, `name`, `email`, `role` (admin/user)

2. **colleges** - Academic colleges
   - `id`, `nameEn`, `nameAr`, `code`

3. **clusters** - Groupings within College of Arts and Sciences
   - `id`, `collegeId`, `nameEn`, `nameAr`, `code`, `description`

4. **departments** - Academic departments
   - `id`, `collegeId`, `clusterId`, `nameEn`, `nameAr`, `code`

5. **programs** - Academic programs
   - `id`, `departmentId`, `nameEn`, `nameAr`, `code`, `language`

### Assessment Tables

6. **graduateAttributes** - 5 Graduate Attributes (GA1-GA5)
   - `id`, `code`, `nameEn`, `nameAr`, `descriptionEn`, `descriptionAr`

7. **competencies** - 21 Competencies (C1-1 to C5-3)
   - `id`, `gaId`, `code`, `nameEn`, `nameAr`, `descriptionEn`, `descriptionAr`

8. **plos** - Program Learning Outcomes
   - `id`, `programId`, `code`, `descriptionEn`, `descriptionAr`, `sortOrder`

9. **mappings** - PLO-to-Competency weight mappings
   - `id`, `programId`, `ploId`, `competencyId`, `weight` (0.0-1.0)

10. **justifications** - Competency justifications
    - `id`, `programId`, `gaId`, `competencyId`, `justificationEn`, `justificationAr`

### System Tables

11. **auditLog** - Change tracking and audit trail
    - `id`, `userId`, `action`, `entityType`, `entityId`, `changes`, `timestamp`

12. **reportTemplates** - Custom export templates
    - `id`, `name`, `type`, `content`, `isDefault`

**Relationships:**
- Colleges → Clusters (1:many, only for CAS)
- Colleges/Clusters → Departments (1:many)
- Departments → Programs (1:many)
- Programs → PLOs (1:many)
- Graduate Attributes → Competencies (1:many, 3-5 per GA)
- Programs + PLOs + Competencies → Mappings (many:many with weights)
- Programs + GAs + Competencies → Justifications (many:many)

---

## Usage

### Importing PLO-GA Mappings

1. Navigate to the **Admin Dashboard** (click "Manage Programs" on home page)
2. Click **"Upload Document"**
3. Select College from dropdown
4. If College of Arts and Sciences, select Cluster
5. Select Department from dropdown
6. Select Program (or create new)
7. Upload a Word document (.docx) containing PLO-GA mappings
8. System automatically parses and saves data to database
9. Review imported data in program detail page

### Managing Programs

**Adding a New Program:**
1. Go to Admin Dashboard → **"Add New Program"**
2. Fill in program information (English/Arabic names, code, language)
3. Select College, Cluster (if CAS), and Department
4. Click **"Create Program"** or **"Add PLOs"** to continue
5. Add PLOs manually or upload document later

**Editing a Program:**
1. Navigate to **Programs** page
2. Filter by college/cluster if needed
3. Click **"View Details"** on program card
4. Click **"Edit"** button in Program Information section
5. Modify fields (name, code, language, college, department)
6. Click **"Save"** to update

**Managing PLOs:**
1. In program detail page, scroll to **Program Learning Outcomes** section
2. **Edit PLO**: Hover over PLO → Click edit icon → Modify description → Save
3. **Delete PLO**: Hover over PLO → Click trash icon → Confirm deletion
4. **Add PLO**: Click **"Add New PLO"** button → Enter code and description → Save

**Deleting a Program:**
1. Go to Admin Dashboard → **"Delete Existing Program"**
2. Select College, Cluster (if CAS), and Department
3. Select Program to delete
4. Review warning about data deletion (PLOs, mappings, justifications)
5. Click **"Delete Program"** → Confirm in dialog
6. All related data is permanently removed

### Viewing Analytics

1. Navigate to the **Analytics** page from home
2. **University Level**: View overall statistics and college comparisons
3. **College Level**: Select college → View department breakdowns
   - For CAS: Select cluster first → View programs in cluster
4. **Department Level**: Select department → View program details
5. **Program Level**: Click on program → View detailed mapping matrix
6. Use filters to narrow down data by college, cluster, or department

### Managing Mappings

1. Open a program's detail page
2. Scroll to **PLO-Competency Mapping Matrix**
3. **Add/Edit Mapping**: Click on cell → Enter weight (0.0-1.0) → Save
4. **Remove Mapping**: Click on cell → Clear value → Save
5. **Add Justification**: Click **"Add Justification"** under competency → Enter text → Save
6. **Edit Justification**: Click edit icon → Modify text → Save
7. Changes are saved immediately and reflected in analytics

### Exporting Data

**Single Program Export:**
1. Navigate to program's detail page
2. Click the **"Export"** button in header
3. Select format (PDF, Word, Excel, or CSV)
4. File downloads automatically

**Batch Export:**
1. Navigate to **Analytics** dashboard
2. Select programs using checkboxes
3. Click **"Export Selected"** button
4. Choose format
5. ZIP file downloads with all selected programs

**Analytics Export:**
1. On analytics dashboard, click **"Export Analytics"**
2. Choose format (Excel or CSV)
3. Current view data exports with charts and tables

---

## Development

### Available Scripts

```bash
# Development
pnpm dev                    # Start development server with hot-reload (port 3000)
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm test                   # Run Vitest unit tests
pnpm lint                   # Run ESLint code linting
pnpm format                 # Format code with Prettier

# Database
pnpm db:push                # Push schema changes to database
pnpm db:studio              # Open Drizzle Studio (database GUI on port 4983)
pnpm db:generate            # Generate migration files
pnpm db:migrate             # Run pending migrations

# Git
git pull origin main        # Pull latest changes from GitHub
git add .                   # Stage all changes
git commit -m "message"     # Commit changes with message
git push github main        # Push to GitHub repository
```

### Development Workflow

1. **Pull latest changes**: `git pull origin main`
2. **Install dependencies** (if package.json changed): `pnpm install`
3. **Start dev server**: `pnpm dev`
4. **Make changes** and test in browser (http://localhost:3000)
5. **Run tests**: `pnpm test`
6. **Commit and push**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push github main
   ```

### Adding New Features

1. **Database Changes**:
   - Edit `drizzle/schema.ts`
   - Run `pnpm db:push` to apply changes
   - Update `server/db.ts` with new query functions

2. **Backend API**:
   - Add procedures to `server/routers.ts`
   - Use `publicProcedure` or `protectedProcedure`
   - Define input validation with Zod schemas
   - Return typed data

3. **Frontend**:
   - Create page component in `client/src/pages/`
   - Add route in `client/src/App.tsx`
   - Use `trpc.*.useQuery()` for data fetching
   - Use `trpc.*.useMutation()` for data updates
   - Add navigation links

4. **Testing**:
   - Write unit tests in `server/*.test.ts`
   - Run `pnpm test` to verify
   - Test manually in browser

---

## Production Deployment

### Deployment Checklist

- [ ] **Environment Setup**
  - [ ] Production server provisioned (Linux recommended)
  - [ ] Node.js 18+ installed
  - [ ] Python 3.8+ installed
  - [ ] MySQL/MariaDB installed and configured
  - [ ] Firewall configured (allow ports 80, 443, 3306)
  - [ ] SSL/TLS certificates obtained (Let's Encrypt)

- [ ] **Application Setup**
  - [ ] Repository cloned to server
  - [ ] Dependencies installed (`pnpm install`)
  - [ ] Python packages installed (`pip3 install -r requirements.txt`)
  - [ ] `.env` file configured with production values
  - [ ] `NODE_ENV=production` set
  - [ ] Strong `JWT_SECRET` generated
  - [ ] Database created and migrated (`pnpm db:push`)

- [ ] **Security**
  - [ ] Database user with limited privileges created
  - [ ] SSL/TLS enabled for database connections
  - [ ] Application running as non-root user
  - [ ] Sensitive files protected (`.env`, database credentials)
  - [ ] CORS configured for production domain
  - [ ] Rate limiting enabled
  - [ ] Security headers configured

- [ ] **Performance**
  - [ ] Application built for production (`pnpm build`)
  - [ ] Process manager configured (PM2, systemd)
  - [ ] Reverse proxy configured (Nginx, Apache)
  - [ ] Static assets served with caching headers
  - [ ] Database indexes optimized
  - [ ] Connection pooling configured

- [ ] **Monitoring & Backup**
  - [ ] Application logs configured
  - [ ] Error tracking enabled (Sentry, etc.)
  - [ ] Uptime monitoring configured
  - [ ] Database backup strategy implemented
  - [ ] Automated backup verification
  - [ ] Disaster recovery plan documented

- [ ] **Testing**
  - [ ] Application accessible via production URL
  - [ ] All features tested in production environment
  - [ ] Performance benchmarks met
  - [ ] Security scan completed
  - [ ] Load testing performed

### Production Environment Variables

```env
# Production Configuration
NODE_ENV="production"
PORT=3000

# Database (use production credentials)
DATABASE_URL="mysql://prod_user:secure_password@localhost:3306/plo_ga_mapping?ssl=true"

# Security (generate new secret for production)
JWT_SECRET="production-secret-at-least-32-characters-long"

# Application
FRONTEND_URL="https://plo-ga.qu.edu.qa"
API_URL="https://plo-ga.qu.edu.qa/api"

# Optional: External Services
SMTP_HOST="smtp.qu.edu.qa"
SMTP_PORT=587
SMTP_USER="noreply@qu.edu.qa"
SMTP_PASS="secure_smtp_password"
```

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name plo-ga.qu.edu.qa;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name plo-ga.qu.edu.qa;

    ssl_certificate /etc/letsencrypt/live/plo-ga.qu.edu.qa/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/plo-ga.qu.edu.qa/privkey.pem;

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
    }
}
```

### PM2 Process Management

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start pnpm --name "plo-ga-system" -- start

# Configure auto-restart on server reboot
pm2 startup
pm2 save

# Monitor application
pm2 status
pm2 logs plo-ga-system
pm2 monit

# Restart after updates
pm2 restart plo-ga-system
```

---

## Troubleshooting

### Common Issues

**Issue: Database connection fails**
- **Solution**: Check DATABASE_URL in `.env`, verify MySQL is running, test connection with `mysql -u username -p`

**Issue: Port 3000 already in use**
- **Solution**: Change PORT in `.env` or stop conflicting application

**Issue: Python scripts fail on Windows**
- **Solution**: Ensure `C:\tmp` directory exists, check Python is in PATH

**Issue: Export generates empty files**
- **Solution**: Verify Python packages installed (`pip3 list`), check `/tmp/` permissions

**Issue: Build fails with TypeScript errors**
- **Solution**: Run `pnpm install` to update dependencies, check `tsconfig.json`

**Issue: Hot reload not working**
- **Solution**: Restart dev server, clear browser cache, check file watcher limits (Linux)

### Getting Help

- **GitHub Issues**: https://github.com/agastli/plo-ga-mapping-system/issues
- **Documentation**: See `docs/` folder for detailed guides
- **Email**: Academic Planning & Quality Assurance Office, Qatar University

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** with clear commit messages
4. **Test thoroughly** - run `pnpm test` and manual testing
5. **Update documentation** if adding new features
6. **Commit changes**: `git commit -m "Add: description of feature"`
7. **Push to branch**: `git push origin feature/your-feature-name`
8. **Open a Pull Request** with detailed description

### Code Style

- Follow existing code patterns and conventions
- Use TypeScript for type safety
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use Prettier for code formatting (`pnpm format`)

### Commit Message Format

```
Type: Brief description (50 chars or less)

Detailed explanation if needed (wrap at 72 chars)

- Bullet points for multiple changes
- Reference issue numbers: #123
```

**Types**: Add, Update, Fix, Remove, Refactor, Docs, Test

---

## License

This project is proprietary software developed for Qatar University.  
© 2026 Qatar University. All rights reserved.

**Restrictions:**
- Internal use only within Qatar University
- No redistribution without permission
- No modification without authorization
- All rights reserved by Qatar University

---

## Acknowledgments

This system was developed by the **Academic Planning & Quality Assurance Office** at Qatar University to support academic program assessment and quality assurance processes across all colleges and departments.

**Development Team:**
- Dr. Adel Gastli - Project Lead & System Architect
- Academic Planning & Quality Assurance Office Staff

**Special Thanks:**
- College Deans and Department Heads for requirements and feedback
- Faculty members for testing and validation
- IT Department for infrastructure support

---

## Version History

**Version 1.0.0** (February 2026)
- Initial release with full feature set
- Program management (add, edit, delete)
- PLO management (add, edit, delete)
- Document import and parsing
- Multi-level analytics dashboards
- Multi-format export (PDF, Word, Excel, CSV)
- Cluster-based organization for CAS
- Admin dashboard
- Bilingual support (English/Arabic)
- Audit trail and change tracking

---

**Last Updated**: February 23, 2026  
**Repository**: https://github.com/agastli/plo-ga-mapping-system  
**Documentation**: See `docs/` folder for additional guides
