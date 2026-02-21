# PLO-GA Mapping Management System

A comprehensive web-based system for managing Program Learning Outcomes (PLOs) mapping to Graduate Attributes (GAs) and Competencies for academic programs at Qatar University.

![Qatar University Logo](client/public/qu-logo.png)

---

## Overview

The PLO-GA Mapping Management System enables academic departments to:

- **Import** PLO-GA mappings from Word documents
- **Manage** programs, PLOs, and competency mappings
- **Analyze** alignment scores across university, college, department, and program levels
- **Export** mapping data in multiple formats (PDF, Word, Excel, CSV)
- **Visualize** analytics through interactive dashboards
- **Track** changes with comprehensive audit logging

---

## Features

### 📄 Document Management
- Import PLO-GA mappings from Word documents (.docx)
- Automatic parsing of program information, PLOs, mapping matrices, and justifications
- Support for both English and Arabic documents with RTL detection
- Bilingual content management

### 📊 Analytics & Dashboards
- University-level analytics with college comparisons
- College-level analytics with department breakdowns
- Department-level analytics with program details
- Interactive charts and visualizations
- Real-time alignment score calculations
- Coverage rate analysis

### 📤 Multi-Format Export
- **PDF**: Professional reports with QU branding
- **Word**: Editable documents matching original templates
- **Excel**: Structured data in multiple sheets
- **CSV**: Raw data for further analysis
- **Batch Export**: Export multiple programs at once in ZIP format

### 🎨 Professional Design
- Qatar University branding and color scheme (maroon theme)
- Responsive design for desktop and mobile
- Bilingual interface (English/Arabic)
- Accessible and user-friendly

### 🔒 Security & Audit
- User authentication and authorization
- Role-based access control (admin/user)
- Comprehensive audit logging
- Change tracking for all modifications

---

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Styling and theming
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **Vite** - Build tool and dev server

### Backend
- **Node.js** - Runtime environment
- **Express 4** - Web server
- **tRPC 11** - End-to-end typesafe APIs
- **Drizzle ORM** - Database ORM
- **MySQL/TiDB** - Database

### Document Processing
- **Python 3.8+** - Script runtime
- **python-docx** - Word document parsing/generation
- **openpyxl** - Excel generation
- **reportlab** - PDF generation

---

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- Python 3.8 or higher
- MySQL 8.0+ or MariaDB 10.5+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/agastli/plo-ga-mapping-system.git
   cd plo-ga-mapping-system
   ```

2. **Run automated setup**
   ```bash
   # Windows
   setup-windows.bat
   
   # macOS/Linux
   chmod +x setup-unix.sh
   ./setup-unix.sh
   ```

3. **Create database**
   ```bash
   mysql -u root -p -e "CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

4. **Configure environment**
   - Edit `.env` file with your database credentials
   - Generate a secure JWT_SECRET

5. **Run database migrations**
   ```bash
   pnpm db:push
   ```

6. **Start the application**
   ```bash
   pnpm dev
   ```

7. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## Documentation

- **[Installation Guide](INSTALLATION.md)** - Detailed installation instructions
- **[Database Setup](docs/DATABASE_SETUP.md)** - Database configuration and management
- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment guide

---

## Project Structure

```
plo-ga-mapping-system/
├── client/                  # Frontend React application
│   ├── public/             # Static assets (logos, images)
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       ├── lib/            # Utilities and tRPC client
│       └── App.tsx         # Main app component
├── server/                  # Backend Express application
│   ├── _core/              # Core server functionality
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
├── docs/                    # Documentation
├── setup-windows.bat        # Windows setup script
├── setup-unix.sh            # Linux/macOS setup script
├── INSTALLATION.md          # Installation guide
├── README.md                # This file
└── package.json             # Node.js dependencies
```

---

## Database Schema

The system uses 11 main tables:

1. **users** - User accounts and authentication
2. **colleges** - Academic colleges
3. **departments** - Academic departments
4. **programs** - Academic programs
5. **graduateAttributes** - 5 Graduate Attributes (GA1-GA5)
6. **competencies** - 21 Competencies (C1-1 to C5-3)
7. **plos** - Program Learning Outcomes
8. **mappings** - PLO-to-Competency weight mappings (0.0-1.0)
9. **justifications** - Competency justifications
10. **auditLog** - Change tracking and audit trail
11. **reportTemplates** - Custom export templates

---

## Usage

### Importing PLO-GA Mappings

1. Navigate to the **Upload** page
2. Select College, Department, and Program from dropdowns
3. Upload a Word document (.docx) containing PLO-GA mappings
4. System automatically parses and saves data to database

### Viewing Analytics

1. Navigate to the **Analytics** page
2. View university-level statistics and charts
3. Click on colleges or departments to drill down
4. View program-level details and mapping matrices

### Exporting Data

1. Navigate to a program's detail page or analytics dashboard
2. Click the **Export** button
3. Select format (PDF, Word, Excel, or CSV)
4. For batch export, select multiple programs and export as ZIP

---

## Development

### Available Scripts

```bash
# Development
pnpm dev                    # Start development server with hot-reload
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm test                   # Run tests

# Database
pnpm db:push                # Run database migrations
pnpm db:studio              # Open Drizzle Studio (database GUI)

# Git
git pull origin main        # Pull latest changes
git add .                   # Stage all changes
git commit -m "message"     # Commit changes
git push origin main        # Push to GitHub
```

### Development Workflow

1. Pull latest changes: `git pull origin main`
2. Install dependencies: `pnpm install`
3. Start dev server: `pnpm dev`
4. Make changes and test
5. Commit and push: `git add . && git commit -m "..." && git push`

---

## Deployment

### Production Checklist

- [ ] All dependencies installed
- [ ] Database created and migrated
- [ ] Environment variables configured
- [ ] `NODE_ENV=production` set
- [ ] Strong JWT_SECRET configured
- [ ] SSL/TLS enabled for database
- [ ] Application built: `pnpm build`
- [ ] Firewall configured
- [ ] Backup strategy in place
- [ ] Monitoring and logging configured

See [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) for detailed instructions.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is proprietary software developed for Qatar University.  
© 2026 Qatar University. All rights reserved.

---

## Support

For issues, questions, or support:

- **GitHub Issues**: https://github.com/agastli/plo-ga-mapping-system/issues
- **Email**: Academic Planning & Quality Assurance Office, Qatar University
- **Documentation**: See `docs/` folder for detailed guides

---

## Acknowledgments

Developed by the Academic Planning & Quality Assurance Office at Qatar University to support academic program assessment and quality assurance processes.

---

**Version**: 1.0.0  
**Last Updated**: February 2026
