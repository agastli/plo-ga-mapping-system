# PLOs–GAs Mapping System

**A comprehensive web application for mapping Program Learning Outcomes to Qatar University Graduate Attributes and Competencies**

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-orange)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## Overview

The PLOs–GAs Mapping System is a full-stack web application developed for **Qatar University** to support the systematic alignment of Program Learning Outcomes (PLOs) with the university's five Graduate Attributes (GAs) and their 21 associated competencies. The system enables academic program coordinators to record, visualize, and export PLO–GA mapping data in compliance with institutional quality assurance requirements.

The application is currently deployed at **[plo-ga.gastli.org](https://plo-ga.gastli.org)** and serves the Academic Planning and Quality Assurance Office.

---

## Key Features

| Feature | Description |
|---|---|
| **Bilingual Support** | Full English and Arabic content throughout, including RTL layout for Arabic programs |
| **Document Import** | Upload Word documents (`.docx`) and automatically extract PLOs |
| **Interactive Mapping** | Assign percentage weights (0–100%) to each PLO–competency pair via an interactive matrix |
| **Analytics Dashboards** | University, college, department, GA, and competency-level analytics with charts |
| **Export Engine** | Generate mapping reports in Word, Excel, and PDF formats with QU branding |
| **Data Quality Tools** | Completeness dashboard and validation tool to identify gaps and anomalies |
| **Role-Based Access** | Three-tier access control (Admin, Editor, Viewer) with program-level assignments |
| **Audit Trail** | Full audit log of all create, update, and delete operations |

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React + Vite | 19 / 6.x |
| **UI Components** | shadcn/ui + Tailwind CSS | 4.x |
| **API Layer** | tRPC | 11.x |
| **Backend** | Express.js | 4.x |
| **Runtime** | Node.js | 22.x |
| **ORM** | Drizzle ORM | 0.30.x |
| **Database** | MySQL | 8.x |
| **Authentication** | JWT + bcrypt | — |
| **Report Generation** | Python (python-docx, openpyxl, reportlab) | 3.11+ |
| **Process Manager** | PM2 | 5.x |
| **Web Server** | Nginx | 1.24.x |

---

## Project Structure

```
plo-ga-mapping-system/
├── client/                     # React frontend (Vite)
│   ├── public/                 # Static assets (QU logo, favicon)
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── contexts/           # React contexts (auth)
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # tRPC client setup
│       └── pages/              # 34 page components
├── server/                     # Express backend
│   ├── _core/                  # Framework plumbing (OAuth, context, LLM)
│   ├── db.ts                   # Database query helpers
│   ├── email.ts                # SMTP email service
│   ├── routers.ts              # tRPC procedures (all API endpoints)
│   └── storage.ts              # S3 file storage helpers
├── drizzle/                    # Database schema and migrations
│   └── schema.ts               # Table definitions (14 tables)
├── scripts/                    # Python report generation scripts
│   ├── export-to-word.py       # Word document export
│   ├── export-to-excel.py      # Excel export
│   ├── export-to-pdf.py        # PDF export
│   ├── parse-docx.py           # PLO extraction from Word documents
│   └── create-admin-user.mjs   # Admin account setup script
├── docs/                       # Documentation
│   ├── DEPLOYMENT.md           # Full deployment guide
│   ├── ARCHITECTURE.md         # System architecture reference
│   ├── DATABASE_SCHEMA.md      # Database schema reference
│   └── ENVIRONMENT_VARIABLES.md # Environment configuration guide
├── CHANGELOG.md                # Version history
├── CONTRIBUTING.md             # Contribution guidelines
└── README.md                   # This file
```

---

## Quick Start (Local Development)

### Prerequisites

Ensure the following are installed on your development machine:

- Node.js 22.x (`node --version`)
- pnpm 10.x (`pnpm --version`)
- MySQL 8.x (running locally)
- Python 3.11+ with pip

### Setup

**1. Clone the repository:**

```bash
git clone https://github.com/agastli/plo-ga-mapping-system.git
cd plo-ga-mapping-system
```

**2. Install Node.js dependencies:**

```bash
pnpm install
```

**3. Install Python dependencies:**

```bash
pip3 install python-docx openpyxl reportlab pillow pandas
```

**4. Create the database:**

```bash
mysql -u root -p -e "CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**5. Configure environment variables:**

Create a `.env` file in the project root. See [`docs/ENVIRONMENT_VARIABLES.md`](docs/ENVIRONMENT_VARIABLES.md) for the complete template and description of all variables.

**6. Run database migrations:**

```bash
pnpm db:push
```

**7. Create the first admin account:**

```bash
node scripts/create-admin-user.mjs
```

**8. Start the development server:**

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

---

## Deployment

For production deployment on an Ubuntu VPS, refer to the comprehensive [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) guide, which covers:

- Server requirements and initial setup
- Node.js, Python, and MySQL installation
- Application configuration and database migration
- PM2 process management
- Nginx reverse proxy configuration
- SSL/TLS certificate setup with Let's Encrypt
- Firewall configuration
- Update procedures
- Backup strategy
- Troubleshooting guide with documented solutions for every known deployment issue

---

## Documentation

| Document | Description |
|---|---|
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Complete server installation and deployment guide |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture, technology choices, and design decisions |
| [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) | Full database schema with column descriptions and ER diagram |
| [`docs/ENVIRONMENT_VARIABLES.md`](docs/ENVIRONMENT_VARIABLES.md) | Environment variable reference and configuration template |
| [`CHANGELOG.md`](CHANGELOG.md) | Version history and release notes |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Development workflow, coding standards, and PR process |

---

## Graduate Attributes Framework

The system implements Qatar University's five Graduate Attributes and 21 competencies as defined in the institutional quality assurance framework:

| GA | Name | Competencies |
|---|---|---|
| GA1 | Knowledgeable | Subject-matter mastery, Critical-thinking skills, Problem-solving skills, Research and Novel Thinking |
| GA2 | Lifelong Learner | Self-awareness, Adaptability, Adaptive Thinking, Desire for life-long learning |
| GA3 | Effective Communicator | Cultured, Effective communication skills, Awareness of local and international issues |
| GA4 | Ethically & Socially Responsible | Arabic-Islamic identity, Embrace diversity, Professional and ethical conduct, Civically engaged, Community and Global Engagement |
| GA5 | Entrepreneurial | Creativity and innovation, Collaborative, Management, Interpersonal, Leadership |

---

## User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full system access: user management, organizational structure, all programs, system settings |
| **Editor** | Create and edit programs, upload documents, manage PLOs and mappings for assigned programs |
| **Viewer** | Read-only access to programs and analytics for assigned programs |

---

## License

This software is proprietary and developed exclusively for Qatar University. Unauthorized reproduction, distribution, or use is prohibited.

---

## Contact

For technical support or questions about the system, contact the Academic Planning and Quality Assurance Office at Qatar University.

---

*Version 1.0.0 — February 2026*
*Deployed at [plo-ga.gastli.org](https://plo-ga.gastli.org)*
