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

## [1.1.0] — 2026-03-04

### Added

- **Deactivate/Activate Account** — Admins can now deactivate user accounts from the User Management page. Deactivated users are blocked from logging in and shown a clear error message. A red "Deactivated" badge appears on their user card. Admins cannot deactivate their own account. Implemented via a new `isActive` boolean column in the `users` table (default `true`) and a `users.toggleActive` tRPC mutation.
- **Breadcrumb navigation** — Added breadcrumb trails to all main content pages: Admin Dashboard, Editor Dashboard, Viewer Dashboard, Programs Directory, Upload Document, and Program Browser.
- **User Manual page** — Redesigned with a standard QU header (logo, Back button, Home button, Download Manual button), breadcrumb, page title card with BookOpen icon, and proper footer — matching the style of all other pages in the system. Includes a sticky left-sidebar table of contents with active-section highlighting via IntersectionObserver.
- **PDF download for User Manual** — The Download Manual button opens the browser's print dialog with a styled print stylesheet (maroon cover page, formatted section headings, tables, and code blocks). No server-side processing required.
- **Session duration tracking** — `logoutAt`, `tokenExpiresAt`, and `lastActiveAt` columns added to `loginHistory`. A heartbeat hook (`useSessionHeartbeat`) updates `lastActiveAt` every 5 minutes. Sessions expire after 2 hours of inactivity. A "Duration" column appears in the Login Tracking table.
- **Session expiry warning** — A dismissible banner warns users 5 minutes before their session expires, with a "Stay Logged In" button.
- **Mapping Guide page** — A dedicated guide page for the PLO-to-GA mapping workflow, accessible from the Program Detail page, with an embedded YouTube video popup.
- **Bulk PLO import via CSV** — Editors can import multiple PLOs at once from a CSV file on the Program Detail page. Duplicate codes are skipped automatically. A downloadable CSV template is provided.
- **Programs Directory filter order** — Filters reordered to College → Cluster → Department → Search for a more logical workflow.
- **Multi-college assignment display** — Editor and Viewer dashboards now show all assigned colleges as pill badges, not just the first one.

### Fixed

- **Duplicate assignment error** — Creating a second college or program assignment for a user no longer throws a unique-constraint error. The `createUserAssignment` helper now checks for an existing identical assignment before inserting.
- **VPS login failure** — Login was failing on the production VPS because the `isActive` column did not exist in the deployed database. A manual SQL migration resolves this (see Deployment Guide, Section 24).
- **User Manual Table of Contents duplication** — The inline Table of Contents that was rendering inside the main content area has been removed. The left sidebar is now the only navigation panel.
- **Back buttons site-wide** — All Back buttons across the application now use `window.history.back()` so they return to the actual previous page. Previously, several buttons navigated to hardcoded routes (e.g., always going to `/analytics` or `/admin`) regardless of where the user came from. Pages fixed: User Manual, Analytics Guide, Competency Analytics Guide, GA Analytics Guide, College Analytics, Department Analytics, Delete Program, Add Program.
- **`@tailwindcss/typography` plugin registration** — Registered via the `@plugin` directive in `index.css` (required for Tailwind CSS v4) so that `prose` classes correctly render headings, bullet lists, tables, blockquotes, and bold text in the User Manual.

### Changed

- **Programs Directory filter order** changed from College → Department → Search to College → Cluster → Department → Search.
- **Editor/Viewer Dashboard access scope card** now displays all assigned colleges as pill badges instead of only the first assignment.

---

## [Unreleased]

### Planned for v1.2.0

- Fix TypeScript errors in `OrganizationalStructure.tsx` and `ProgramDetail.tsx`
- Implement route-based code splitting to reduce initial bundle size
- Add `update` procedures for clusters and departments in the organizational structure
- Mobile responsiveness improvements for analytics dashboards
- Reset Department filter when Cluster changes (prevent stale filter combinations)
- "Clear filters" button on Programs Directory
- Bulk program assignment with multi-select checkboxes

---

[1.1.0]: https://github.com/agastli/plo-ga-mapping-system/compare/v1.0.0...main
[1.0.0]: https://github.com/agastli/plo-ga-mapping-system/releases/tag/v1.0.0
