# Changelog

All notable changes to the PLOs–GAs Mapping System are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions. Version numbers follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-02-27

### Initial Production Release

This is the first production release of the PLOs–GAs Mapping System, deployed at [plo-ga.gastli.org](https://plo-ga.gastli.org).

#### Added

**Core Application**
- Full-stack TypeScript monorepo with React 19 frontend and Express 4 backend
- End-to-end type-safe API layer using tRPC 11 with Superjson serialization
- MySQL 8.x database with Drizzle ORM and 9 migration files (14 tables total)
- Custom JWT authentication with bcrypt password hashing
- Role-based access control with three roles: Admin, Editor, Viewer
- Program-level user assignment for fine-grained access control

**Program Management**
- Add, edit, and delete academic programs with bilingual names (English/Arabic)
- Hierarchical organizational structure: Colleges → Clusters → Departments → Programs
- PLO management with inline editing, sort ordering, and bilingual descriptions
- Support for CAS clusters (Humanities & Social Sciences, Languages Communication & Translation, Sciences & Applied Sciences)

**Document Processing**
- Word document (`.docx`) upload and automated PLO extraction
- Python-powered parser (`parse-docx.py`) supporting English and Arabic documents
- Bilingual content detection and language-specific field handling
- Validation and error reporting during import

**PLO–GA Mapping Engine**
- Interactive mapping matrix for assigning percentage weights (0–100%) to each PLO–competency pair
- Support for all 5 Qatar University Graduate Attributes and 21 competencies
- Per-competency justification text storage
- Bulk mapping operations for efficiency

**Analytics Dashboards**
- University-level overview with college comparison bar charts
- College-level dashboard with department breakdowns and GA radar charts
- Department-level dashboard with program comparisons
- GA-specific analytics with cross-program competency heatmaps
- Competency-specific analytics with detailed weight distributions
- Unified analytics dashboard combining all levels

**Data Quality Tools**
- Data Completeness Dashboard identifying programs with missing mappings
- Data Validation Tool detecting anomalies and outliers

**Export Engine**
- Program mapping reports in Word (`.docx`), Excel (`.xlsx`), and PDF formats
- Analytics exports in Word, Excel, PDF, and PNG (chart images)
- Batch export of multiple programs as a ZIP archive
- Qatar University branding applied to all exported documents

**User Management (Admin)**
- User creation with role assignment
- Program/department/college access assignment
- Login history tracking with IP address and user agent
- User profile management with bilingual name support

**Email System**
- Welcome email on account creation
- Password reset via email link
- Username recovery via email
- Hostinger SMTP integration (`smtp.hostinger.com:587`)

**Design System**
- Qatar University maroon color scheme (`#8B1538`) throughout
- Amber-50 (`#FFFBEB`) background for all content pages
- Responsive design supporting desktop, tablet, and mobile
- RTL (right-to-left) support for Arabic content
- Consistent footer design with rounded corners and QU logo

**Documentation**
- Comprehensive README with quick-start guide
- Full deployment guide for Ubuntu VPS (`docs/DEPLOYMENT.md`)
- System architecture reference (`docs/ARCHITECTURE.md`)
- Database schema reference (`docs/DATABASE_SCHEMA.md`)
- Contributing guidelines (`CONTRIBUTING.md`)
- GitHub issue and pull request templates

#### Fixed (during development)

- Footer width alignment: all 21 pages corrected to match content container width
- Duplicate footers removed from 6 analytics and guide pages
- Header button styling standardized to maroon background with white text across all pages
- Background color standardized to amber-50 across all pages

#### Known Issues

- TypeScript errors in `OrganizationalStructure.tsx` (missing `update` procedures for clusters and departments) — functional workaround in place; full fix scheduled for v1.1.0
- TypeScript warning in `ProgramDetail.tsx` (possible undefined object) — guarded at runtime; fix scheduled for v1.1.0
- Large JavaScript bundle (~1.6 MB) — route-based code splitting planned for v1.1.0

---

## [Unreleased]

### Planned for v1.1.0

- Fix TypeScript errors in `OrganizationalStructure.tsx` and `ProgramDetail.tsx`
- Implement route-based code splitting to reduce initial bundle size
- Add shared `Footer` component to eliminate inline footer duplication
- Add breadcrumb navigation to all nested pages
- Mobile responsiveness improvements for analytics dashboards
- Add `update` procedures for clusters and departments in the organizational structure

---

[1.0.0]: https://github.com/agastli/plo-ga-mapping-system/releases/tag/v1.0.0
