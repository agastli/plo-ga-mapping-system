# PLO-GA Mapping Management System — User Manual

**Qatar University | Academic Planning & Quality Assurance**
Version 1.0 — February 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
   - 2.1 [Logging In](#21-logging-in)
   - 2.2 [Recovering Your Username or Password](#22-recovering-your-username-or-password)
   - 2.3 [Role-Based Access](#23-role-based-access)
3. [Dashboards](#3-dashboards)
   - 3.1 [Admin Dashboard](#31-admin-dashboard)
   - 3.2 [Editor Dashboard](#32-editor-dashboard)
   - 3.3 [Viewer Dashboard](#33-viewer-dashboard)
4. [Programs Management](#4-programs-management)
   - 4.1 [Programs Directory](#41-programs-directory)
   - 4.2 [Adding a Program](#42-adding-a-program)
   - 4.3 [Program Detail Page](#43-program-detail-page)
   - 4.4 [Deleting a Program](#44-deleting-a-program)
5. [PLO Management](#5-plo-management)
   - 5.1 [Adding PLOs Manually](#51-adding-plos-manually)
   - 5.2 [Bulk CSV Import](#52-bulk-csv-import)
   - 5.3 [Importing from a Document](#53-importing-from-a-document)
6. [PLO-to-GA Mapping](#6-plo-to-ga-mapping)
   - 6.1 [Mapping Matrix](#61-mapping-matrix)
   - 6.2 [Weighting Factors](#62-weighting-factors)
   - 6.3 [Justifications](#63-justifications)
   - 6.4 [Help Tooltips](#64-help-tooltips)
7. [Mapping Completeness Tracker](#7-mapping-completeness-tracker)
8. [Mapping Audit Log (Change History)](#8-mapping-audit-log-change-history)
9. [Analytics Dashboards](#9-analytics-dashboards)
   - 9.1 [University-Level Analytics](#91-university-level-analytics)
   - 9.2 [GA-Level Analytics](#92-ga-level-analytics)
   - 9.3 [Competency-Level Analytics](#93-competency-level-analytics)
   - 9.4 [College-Level Analytics](#94-college-level-analytics)
   - 9.5 [Department-Level Analytics](#95-department-level-analytics)
   - 9.6 [Unified GA & Competencies Analytics](#96-unified-ga--competencies-analytics)
   - 9.7 [Analytics Guides](#97-analytics-guides)
10. [Admin Tools](#10-admin-tools)
    - 10.1 [User Management](#101-user-management)
    - 10.2 [Organizational Structure](#102-organizational-structure)
    - 10.3 [Cluster Management](#103-cluster-management)
    - 10.4 [Data Completeness Dashboard](#104-data-completeness-dashboard)
    - 10.5 [Data Validation Tool](#105-data-validation-tool)
    - 10.6 [Report Templates](#106-report-templates)
    - 10.7 [User Login Tracking](#107-user-login-tracking)
11. [User Profile](#11-user-profile)
12. [Email Notifications](#12-email-notifications)
13. [Database Backup](#13-database-backup)
14. [Roles and Permissions Reference](#14-roles-and-permissions-reference)
15. [Glossary](#15-glossary)

---

## 1. Introduction

The **PLO-GA Mapping Management System** is a web-based platform developed for Qatar University to support the systematic mapping of Program Learning Outcomes (PLOs) to the five Graduate Attributes (GAs) and their associated competencies, as defined by the Qatar University Academic Planning & Quality Assurance framework.

The system enables academic departments and colleges to:

- Define and manage PLOs for each bachelor's and graduate program.
- Map each PLO to one or more GAs and competencies using a weighted scoring approach.
- Provide written justifications for every mapping decision to support accreditation evidence.
- Track mapping completeness across all programs in real time.
- Analyse alignment scores at the program, department, college, and university levels.
- Maintain a full audit trail of all changes for quality assurance purposes.

The system is designed for three user roles — **Admin**, **Editor**, and **Viewer** — each with distinct access rights as described in Section 14.

---

## 2. Getting Started

### 2.1 Logging In

Navigate to the system URL (e.g., `https://plo-ga.gastli.org`) in any modern web browser. Enter your **username** and **password** on the login screen and click **Sign In**. After a successful login, you will be redirected to the dashboard corresponding to your role.

### 2.2 Recovering Your Username or Password

If you have forgotten your username, click **Forgot Username?** on the login page. Enter the email address associated with your account and the system will send your username by email.

If you have forgotten your password, click **Forgot Password?**, enter your email address, and follow the link in the reset email to set a new password.

> **Note:** These features require that your account has a valid email address on file. Contact your system administrator if you do not receive the email within a few minutes.

### 2.3 Role-Based Access

The system enforces three roles:

| Role | Description |
|------|-------------|
| **Admin** | Full access to all programs, users, analytics, and administrative tools. |
| **Editor** | Can add and edit PLOs and mappings for programs they are explicitly assigned to. |
| **Viewer** | Read-only access to programs and analytics. Cannot make any changes. |

---

## 3. Dashboards

### 3.1 Admin Dashboard

The Admin Dashboard is the central control panel for system administrators. It displays:

- **System statistics** — total programs, PLOs, mappings, and registered users.
- **Mapping Completeness Tracker** — a real-time widget showing per-program mapping progress, sorted from least to most complete, with configurable warning and danger threshold alerts (see Section 7).
- **Quick action links** — shortcuts to User Management, Organizational Structure, Data Completeness, and Data Validation.
- **Recent activity** — a summary of the most recent changes made across the system.

### 3.2 Editor Dashboard

The Editor Dashboard is the starting point for faculty members and curriculum coordinators who are responsible for entering mapping data. It shows:

- **Assigned programs** — the list of programs the editor has been assigned to by an administrator.
- **Mapping Completeness Tracker** — filtered to show only the editor's assigned programs, helping them prioritise which programs need attention.
- **Quick links** — direct access to each assigned program's detail page.

### 3.3 Viewer Dashboard

The Viewer Dashboard provides read-only users with a summary of the system's current state, including total programs, PLOs, and mappings, as well as links to the analytics dashboards and the program browser.

---

## 4. Programs Management

### 4.1 Programs Directory

The Programs Directory (`/programs`) lists all academic programs in the system. Each entry shows the program code, name, college, department, number of PLOs, and current mapping completeness percentage. Use the search bar to filter by program name or code, and use the college and department dropdowns to narrow the list.

### 4.2 Adding a Program

Administrators can add a new program by clicking **Add New Program** on the Programs Directory page. The form requires:

- Program code (unique identifier, e.g., `EE-BS`)
- Program name in English and Arabic
- College and department assignment
- Program level (Bachelor, Master, PhD)
- Credit hours and duration

After saving, the new program will appear in the directory and can be opened for PLO entry.

### 4.3 Program Detail Page

The Program Detail page (`/programs/:id`) is the primary workspace for PLO and mapping management. It is divided into three main sections:

**PLO List** — displays all PLOs defined for the program. Each PLO shows its code, English description, Arabic description, and current mapping status. From here, editors can add new PLOs individually, edit existing ones, or use the Bulk CSV Import tool (see Section 5.2).

**Mapping Matrix** — a grid where each row is a PLO and each column is a GA or competency. Editors enter a weighting factor (0–100) in each cell to indicate the degree to which the PLO addresses that competency. Cells with a non-zero weight turn maroon to provide a visual overview of coverage. Click any cell to open the justification editor for that specific PLO–competency pair.

**Change History (Audit Log)** — a collapsible panel at the bottom of the page that records every change made to PLOs, mapping weights, and justifications, including the name of the user who made the change and the timestamp (see Section 8).

### 4.4 Deleting a Program

Only administrators can delete programs. Navigate to **Programs → Delete Program** and select the program to remove. Deletion is permanent and will remove all associated PLOs, mappings, and justifications. A confirmation prompt is shown before the deletion is executed.

---

## 5. PLO Management

### 5.1 Adding PLOs Manually

On the Program Detail page, click **Add New PLO** to open the PLO entry form. Enter the PLO code (e.g., `PLO1`), the English description, and optionally the Arabic description. Click **Save** to add the PLO to the program's list.

### 5.2 Bulk CSV Import

For programs with many PLOs, use the **Bulk Import PLOs (CSV)** button on the Program Detail page to upload multiple PLOs in a single step.

**Workflow:**

1. Click **Bulk Import PLOs (CSV)** to open the import panel.
2. Click **Download CSV Template** to get a pre-formatted template file.
3. Fill in the template with your PLO data. The three columns are: `code`, `description_en`, `description_ar`. Only `code` is required.
4. Save the file as CSV and upload it using the file picker.
5. The system will validate each row and display a preview showing valid rows and any errors.
6. PLO codes that already exist in the program are automatically skipped to prevent duplicates.
7. Click **Import X PLOs** to confirm and save the valid rows.

### 5.3 Importing from a Document

The system can extract PLOs from an uploaded Word or PDF document. On the Program Detail page, use the **Import from Document** option and upload the program specification file. The system will attempt to identify and extract PLO statements automatically. Review the extracted PLOs before confirming the import.

---

## 6. PLO-to-GA Mapping

### 6.1 Mapping Matrix

The mapping matrix on the Program Detail page presents a grid where:

- **Rows** represent the program's PLOs.
- **Columns** represent the five Graduate Attributes (GA1–GA5) and their associated competencies.

Each cell accepts a **weighting factor** between 0 and 100, representing the percentage contribution of that PLO to the corresponding competency. A value of 0 means no alignment; 100 means full alignment.

### 6.2 Weighting Factors

Weighting factors should be assigned thoughtfully based on the degree to which a PLO directly addresses the knowledge, skill, or disposition described by the competency. The following scale is recommended as a guide:

| Weight Range | Interpretation |
|---|---|
| 0 | No alignment |
| 1–25 | Marginal or indirect alignment |
| 26–50 | Partial alignment |
| 51–75 | Substantial alignment |
| 76–99 | Strong alignment |
| 100 | Full and direct alignment |

### 6.3 Justifications

Every non-zero mapping cell should be accompanied by a written justification explaining why the PLO is aligned to that competency at the assigned weight. Click any non-zero cell in the mapping matrix to open the justification editor. Justifications are stored alongside the weight and are included in exported reports.

Justifications are critical for accreditation purposes. Reviewers from APQA and external accreditation bodies will examine these explanations as evidence of a deliberate and well-reasoned curriculum design process.

### 6.4 Help Tooltips

Small **?** icons appear next to the column headers in the mapping matrix. Clicking or hovering over these icons displays a brief explanation of the GA or competency, helping editors understand what each column represents before assigning weights.

---

## 7. Mapping Completeness Tracker

The Mapping Completeness Tracker widget appears at the top of both the Admin Dashboard and the Editor Dashboard. It provides a real-time overview of how many PLOs in each program have been mapped to at least one GA/competency.

**Reading the widget:**

- Each program is shown as a row with a progress bar and a count of mapped vs. total PLOs (e.g., `7/10`).
- Programs are sorted from least complete to most complete so the ones requiring the most attention appear first.
- The overall completeness percentage (across all programs) is shown as a badge in the header.
- Summary badges show the count of fully complete programs, partially mapped programs, and programs with no PLOs yet.

**Configuring alert thresholds:**

Click the **⚙ settings icon** in the widget header to open the threshold configuration panel. You can set two thresholds:

- **Warning threshold (%)** — programs and the overall rate below this value are highlighted in yellow.
- **Danger threshold (%)** — programs and the overall rate below this value are highlighted in red.

The default thresholds are 50% (warning) and 25% (danger). These settings are saved in your browser session and persist until you change them or clear your browser data.

---

## 8. Mapping Audit Log (Change History)

The Change History panel is located at the bottom of every Program Detail page. It is collapsed by default to keep the page clean; click the panel header or the chevron icon to expand it.

The audit log records every change made to:

- PLO additions, edits, and deletions
- Mapping weight changes (showing the old and new value)
- Justification additions and edits

Each entry shows the **action type**, the **field changed**, the **old and new values**, the **name of the user** who made the change, and the **date and time** of the change.

This log is read-only and cannot be edited or deleted. It provides a complete, tamper-evident history of all mapping decisions for accreditation evidence and internal quality assurance reviews.

---

## 9. Analytics Dashboards

All analytics dashboards are accessible from the **Analytics** menu. They are read-only and available to all authenticated users. Charts can be exported as PNG, PDF, Word, or Excel files using the export buttons on each dashboard.

### 9.1 University-Level Analytics

The University-Level Analytics dashboard (`/analytics`) provides a bird's-eye view of PLO-GA alignment across the entire university. It shows:

- Total counts of colleges, programs, PLOs, and mappings.
- A bar chart comparing average alignment scores across colleges.
- A competency coverage table showing the average weight assigned to each competency across all programs.

### 9.2 GA-Level Analytics

The GA-Level Analytics dashboard (`/analytics/ga`) focuses on how well the five Graduate Attributes are addressed across all programs. It includes:

- A bar chart of average GA scores across all programs.
- A radar chart showing the GA profile of the university.
- A detailed table of per-program GA scores.

### 9.3 Competency-Level Analytics

The Competency-Level Analytics dashboard (`/analytics/competencies`) drills down to the individual competency level. It shows average weights and coverage rates for all 22 competencies across all programs, with charts and a sortable table.

### 9.4 College-Level Analytics

The College-Level Analytics dashboard (`/analytics/college/:id`) focuses on a specific college. It shows department-level comparisons, a GA radar chart for the college, and a table of program-level scores within the college.

### 9.5 Department-Level Analytics

The Department-Level Analytics dashboard (`/analytics/department/:id`) drills down to individual programs within a department, showing program-level alignment scores and coverage rates.

### 9.6 Unified GA & Competencies Analytics

The Unified Analytics dashboard provides a combined view of GA and competency alignment across all programs, with cross-program comparison charts and a full heatmap of GA-by-college and competency-by-program scores.

### 9.7 Analytics Guides

Each analytics dashboard has a companion **Guide** page (accessible via the "Guide" button on the dashboard) that explains how to interpret the charts, how alignment scores are calculated, and how to use the data for quality assurance and accreditation reporting.

---

## 10. Admin Tools

All admin tools are accessible from the **Admin** menu and are restricted to users with the Admin role.

### 10.1 User Management

The User Management page (`/admin/users`) allows administrators to:

- View all registered users with their roles, email addresses, and last login times.
- Search and filter users by name, username, email, or role.
- Change a user's role (Admin, Editor, Viewer).
- Assign programs to Editor-role users, controlling which programs they can edit.
- Deactivate or delete user accounts.

When a program is assigned to an editor, the editor automatically receives an email notification informing them of the assignment (see Section 12).

### 10.2 Organizational Structure

The Organizational Structure page (`/admin/structure`) is used to manage the university's college and department hierarchy. Administrators can add, edit, and delete colleges and departments. Programs are linked to departments, so this hierarchy must be set up before programs can be created.

### 10.3 Cluster Management

The Cluster Management page (`/admin/clusters`) allows administrators to group programs into custom clusters for reporting purposes. Clusters can represent accreditation groups, strategic planning units, or any other logical grouping.

### 10.4 Data Completeness Dashboard

The Data Completeness Dashboard (`/admin/completeness`) provides a detailed view of mapping completeness across all programs. It shows which programs have no PLOs, which have PLOs but no mappings, and which are fully mapped. Use this dashboard to identify gaps before an accreditation review.

### 10.5 Data Validation Tool

The Data Validation Tool (`/admin/validation`) checks the mapping data for common quality issues, such as:

- PLOs with no mappings.
- Mappings with no justifications.
- Programs with fewer PLOs than expected.
- Competencies with no coverage across a program's PLOs.

Each issue is listed with a direct link to the affected program or PLO for quick remediation.

### 10.6 Report Templates

The Report Templates page (`/templates`) provides downloadable Word and Excel templates for generating formal PLO-GA mapping reports. These templates are pre-formatted for submission to APQA and external accreditation bodies.

### 10.7 User Login Tracking

The User Login Tracking page (`/login-tracking`) shows a log of all user login events, including the username, IP address, browser, and timestamp. This is useful for security auditing and for identifying inactive accounts.

---

## 11. User Profile

Every user can access their profile page (`/profile`) from the navigation bar. From the profile page, users can:

- Update their display name.
- Change their email address.
- Change their password.
- View their assigned programs (for Editor-role users).

---

## 12. Email Notifications

The system sends automated email notifications in the following situations:

| Trigger | Recipient | Content |
|---|---|---|
| Program assigned to editor | Editor | Notification that a program has been assigned, with a direct link to the program. |
| Forgot password request | Requesting user | A password reset link valid for 1 hour. |
| Forgot username request | Requesting user | The username associated with the email address. |

Email delivery requires the `SMTP_PASSWORD` environment variable to be set on the server. See the Deployment Guide (`docs/DEPLOYMENT.md`) for configuration instructions.

---

## 13. Database Backup

The system includes an automated backup script (`scripts/backup-db.sh`) that creates a compressed MySQL dump of the entire database. The script:

- Automatically reads the database credentials from the `DATABASE_URL` environment variable — no manual configuration required.
- Saves backups to `/var/backups/plo-ga/` with a timestamped filename.
- Retains the 7 most recent backups and deletes older ones automatically.

**Setting up the nightly cron job on the VPS:**

```bash
# Test the script first
chmod +x /path/to/scripts/backup-db.sh
/path/to/scripts/backup-db.sh

# Add to crontab (runs at 2:00 AM every night)
crontab -e
# Add this line:
0 2 * * * /home/agastli/htdocs/plo-ga.gastli.org/scripts/backup-db.sh >> /var/log/plo-ga-backup.log 2>&1
```

---

## 14. Roles and Permissions Reference

| Feature | Admin | Editor | Viewer |
|---|:---:|:---:|:---:|
| View programs and PLOs | ✓ | ✓ | ✓ |
| View analytics dashboards | ✓ | ✓ | ✓ |
| View mapping matrix | ✓ | ✓ | ✓ |
| View audit log | ✓ | ✓ | ✗ |
| Add / edit PLOs | ✓ | Assigned only | ✗ |
| Bulk import PLOs (CSV) | ✓ | Assigned only | ✗ |
| Edit mapping weights | ✓ | Assigned only | ✗ |
| Edit justifications | ✓ | Assigned only | ✗ |
| Add / edit programs | ✓ | ✗ | ✗ |
| Delete programs | ✓ | ✗ | ✗ |
| Manage users | ✓ | ✗ | ✗ |
| Assign programs to editors | ✓ | ✗ | ✗ |
| Manage organizational structure | ✓ | ✗ | ✗ |
| Manage clusters | ✓ | ✗ | ✗ |
| View data completeness dashboard | ✓ | ✗ | ✗ |
| Run data validation | ✓ | ✗ | ✗ |
| View login tracking | ✓ | ✗ | ✗ |
| Export reports | ✓ | ✓ | ✓ |

---

## 15. Glossary

| Term | Definition |
|---|---|
| **PLO** | Program Learning Outcome — a statement describing what students are expected to know, be able to do, or value upon completing a program. |
| **GA** | Graduate Attribute — one of five broad qualities that Qatar University expects all graduates to demonstrate: (GA1) Knowledge & Thinking, (GA2) Personal & Professional Skills, (GA3) Social Responsibility, (GA4) Communication & Information Literacy, (GA5) Innovation & Entrepreneurship. |
| **Competency** | A specific, measurable sub-skill or disposition that falls under a Graduate Attribute. Each GA has between 4 and 5 competencies. |
| **Weighting Factor** | A numeric value (0–100) indicating the degree to which a PLO addresses a specific competency. |
| **Mapping** | The association between a PLO and a competency, characterised by a weighting factor and a written justification. |
| **Alignment Score** | An aggregated metric calculated from the weighting factors, used to compare programs, departments, and colleges. |
| **Completeness Rate** | The percentage of a program's PLOs that have at least one non-zero mapping to a GA/competency. |
| **APQA** | Academic Planning & Quality Assurance — the Qatar University office responsible for accreditation and quality assurance. |
| **Audit Log** | A tamper-evident record of all changes made to PLOs, mappings, and justifications, including who made the change and when. |

---

*For technical support or system access issues, contact the system administrator or submit a request to the APQA office.*
