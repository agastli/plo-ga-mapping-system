# Database Schema Reference

**PLOs–GAs Mapping System — Database Schema v1.0**

---

## Overview

The database uses **MySQL 8.x** with the `utf8mb4` character set to support both English and Arabic text. All tables include `createdAt` and `updatedAt` timestamp columns. The schema is managed through **Drizzle ORM** with migrations stored in the `drizzle/` directory. To apply migrations, run `pnpm db:push`.

---

## Entity Relationship Diagram

```
colleges ──────────────────────────────────────────────────────────────────────┐
    │                                                                           │
    ├── clusters ──────────────────────────────────────────────────────────┐   │
    │       │                                                              │   │
    └── departments ─────────────────────────────────────────────────┐    │   │
                │                                                     │    │   │
              programs ◄───────────────────────────────────────────┘    │   │
                │                                                         │   │
                ├── plos ──────────────────────────────────────────┐     │   │
                │       │                                          │     │   │
                │   mappings ──── competencies ──── graduateattributes  │   │
                │       │                                               │   │
                │   justifications                                      │   │
                │                                                       │   │
                └── (programs also link to clusters & departments) ────┘   │
                                                                            │
users ──── userAssignments ──── (colleges | departments | programs) ────────┘
users ──── loginHistory
auditLog (standalone, references any entity by id + type)
reportTemplates (standalone configuration)
```

---

## Tables

### `colleges`

Represents a college (faculty) within Qatar University.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `nameEn` | VARCHAR(255) | NOT NULL | College name in English |
| `nameAr` | VARCHAR(255) | NOT NULL | College name in Arabic |
| `code` | VARCHAR(50) | UNIQUE | Short code (e.g., `CAS`, `CEN`) |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp (UTC) |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp (UTC) |

---

### `clusters`

Represents a cluster within a college. Used primarily by the College of Arts and Sciences (CAS).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `collegeId` | INT | FK → colleges.id | Parent college |
| `nameEn` | VARCHAR(255) | NOT NULL | Cluster name in English |
| `nameAr` | VARCHAR(255) | NOT NULL | Cluster name in Arabic |
| `code` | VARCHAR(50) | | Short code |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp (UTC) |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp (UTC) |

---

### `departments`

Represents an academic department within a college.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `collegeId` | INT | FK → colleges.id | Parent college |
| `clusterId` | INT | FK → clusters.id, NULLABLE | Parent cluster (optional) |
| `nameEn` | VARCHAR(255) | NOT NULL | Department name in English |
| `nameAr` | VARCHAR(255) | NOT NULL | Department name in Arabic |
| `code` | VARCHAR(50) | | Short code |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp (UTC) |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp (UTC) |

---

### `programs`

Represents an academic program (degree program).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `nameEn` | VARCHAR(255) | NOT NULL | Program name in English |
| `nameAr` | VARCHAR(255) | | Program name in Arabic |
| `code` | VARCHAR(100) | | Program code |
| `language` | ENUM | NOT NULL | `en`, `ar`, or `both` |
| `collegeId` | INT | FK → colleges.id | Parent college |
| `clusterId` | INT | FK → clusters.id, NULLABLE | Parent cluster |
| `departmentId` | INT | FK → departments.id, NULLABLE | Parent department |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp (UTC) |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp (UTC) |

---

### `graduateattributes`

Stores the 5 Qatar University Graduate Attributes. This table is seeded at installation and is read-only during normal operation.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `code` | VARCHAR(20) | UNIQUE, NOT NULL | GA code (e.g., `GA1`) |
| `nameEn` | VARCHAR(255) | NOT NULL | GA name in English |
| `nameAr` | VARCHAR(255) | NOT NULL | GA name in Arabic |
| `descriptionEn` | TEXT | | Description in English |
| `descriptionAr` | TEXT | | Description in Arabic |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp (UTC) |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp (UTC) |

**Seeded data:**

| Code | Name |
|---|---|
| GA1 | Knowledgeable |
| GA2 | Lifelong Learner |
| GA3 | Effective Communicator |
| GA4 | Ethically and Socially Responsible |
| GA5 | Entrepreneurial |

---

### `competencies`

Stores the 21 competencies mapped to the 5 Graduate Attributes. This table is seeded at installation and is read-only during normal operation.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `gaId` | INT | FK → graduateattributes.id | Parent GA |
| `code` | VARCHAR(20) | UNIQUE, NOT NULL | Competency code (e.g., `C1-1`) |
| `nameEn` | VARCHAR(255) | NOT NULL | Competency name in English |
| `nameAr` | VARCHAR(255) | NOT NULL | Competency name in Arabic |
| `descriptionEn` | TEXT | | Description in English |
| `descriptionAr` | TEXT | | Description in Arabic |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp (UTC) |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp (UTC) |

---

### `plos`

Stores Program Learning Outcomes for each program.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `programId` | INT | FK → programs.id, CASCADE DELETE | Parent program |
| `code` | VARCHAR(50) | NOT NULL | PLO code (e.g., `PLO1`) |
| `descriptionEn` | TEXT | | PLO description in English |
| `descriptionAr` | TEXT | | PLO description in Arabic |
| `sortOrder` | INT | DEFAULT 0 | Display order within program |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp (UTC) |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp (UTC) |

---

### `mappings`

The core table storing the weight assigned to each PLO–competency pair.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `ploId` | INT | FK → plos.id, CASCADE DELETE | Source PLO |
| `competencyId` | INT | FK → competencies.id | Target competency |
| `weight` | DECIMAL(5,2) | NOT NULL | Weight percentage (0.00–100.00) |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp (UTC) |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp (UTC) |

**Unique constraint:** `(ploId, competencyId)` — one weight per PLO–competency pair.

---

### `justifications`

Stores the textual justification for a mapping.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `ploId` | INT | FK → plos.id, CASCADE DELETE | Source PLO |
| `competencyId` | INT | FK → competencies.id | Target competency |
| `justificationText` | TEXT | NOT NULL | Justification narrative |
| `language` | ENUM | NOT NULL | `en` or `ar` |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp (UTC) |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp (UTC) |

---

### `users`

Stores user accounts.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `username` | VARCHAR(100) | UNIQUE, NOT NULL | Login username |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| `passwordHash` | VARCHAR(255) | NOT NULL | bcrypt hash (cost factor 12) |
| `role` | ENUM | NOT NULL | `admin`, `editor`, or `viewer` |
| `nameEn` | VARCHAR(255) | | Full name in English |
| `nameAr` | VARCHAR(255) | | Full name in Arabic |
| `isActive` | BOOLEAN | DEFAULT TRUE | Account active status |
| `lastLoginAt` | DATETIME | NULLABLE | Last successful login (UTC) |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp (UTC) |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp (UTC) |

---

### `userAssignments`

Defines which programs, departments, or colleges a user (Editor/Viewer) can access.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `userId` | INT | FK → users.id, CASCADE DELETE | Assigned user |
| `assignmentType` | ENUM | NOT NULL | `college`, `department`, or `program` |
| `assignmentId` | INT | NOT NULL | ID of the assigned entity |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp (UTC) |

---

### `loginHistory`

Tracks every login attempt for security auditing.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `userId` | INT | FK → users.id, NULLABLE | User (null for failed attempts) |
| `username` | VARCHAR(100) | | Username attempted |
| `ipAddress` | VARCHAR(45) | | Client IP address (supports IPv6) |
| `userAgent` | TEXT | | Browser user agent string |
| `success` | BOOLEAN | NOT NULL | Whether login succeeded |
| `createdAt` | DATETIME | NOT NULL | Attempt timestamp (UTC) |

---

### `auditLog`

Records all create, update, and delete operations for compliance and traceability.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `userId` | INT | FK → users.id, NULLABLE | User who performed the action |
| `action` | VARCHAR(50) | NOT NULL | Action type (e.g., `CREATE`, `UPDATE`, `DELETE`) |
| `entityType` | VARCHAR(50) | NOT NULL | Entity type (e.g., `program`, `mapping`) |
| `entityId` | INT | | ID of the affected entity |
| `details` | TEXT | | JSON-encoded change details |
| `createdAt` | DATETIME | NOT NULL | Action timestamp (UTC) |

---

### `reportTemplates`

Stores administrator-configured report template settings.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Template name |
| `type` | ENUM | NOT NULL | `word`, `excel`, or `pdf` |
| `config` | TEXT | | JSON-encoded template configuration |
| `isDefault` | BOOLEAN | DEFAULT FALSE | Whether this is the default template |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp (UTC) |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp (UTC) |

---

## Seeded Reference Data

The following data is seeded into the database during initial setup and must not be modified, as the entire mapping system depends on these specific codes and IDs.

### Graduate Attributes and Competencies

| GA Code | GA Name | Competency Code | Competency Name |
|---|---|---|---|
| GA1 | Knowledgeable | C1-1 | Subject-matter mastery |
| GA1 | Knowledgeable | C1-2 | Critical-thinking skills |
| GA1 | Knowledgeable | C1-3 | Problem-solving skills |
| GA1 | Knowledgeable | C1-4 | Research, and Novel and Adaptive Thinking |
| GA2 | Lifelong Learner | C2-1 | Self-awareness |
| GA2 | Lifelong Learner | C2-2 | Adaptability |
| GA2 | Lifelong Learner | C2-3 | Adaptive Thinking |
| GA2 | Lifelong Learner | C2-4 | Desire for life-long learning |
| GA3 | Effective Communicator | C3-1 | Cultured |
| GA3 | Effective Communicator | C3-2 | Effective communication skills |
| GA3 | Effective Communicator | C3-3 | Awareness of local and international issues |
| GA4 | Ethically & Socially Responsible | C4-1 | Embody the Arabic-Islamic identity |
| GA4 | Ethically & Socially Responsible | C4-2 | Embrace diversity |
| GA4 | Ethically & Socially Responsible | C4-3 | Professional and ethical conduct |
| GA4 | Ethically & Socially Responsible | C4-4 | Civically engaged |
| GA4 | Ethically & Socially Responsible | C4-5 | Community and Global Engagement |
| GA5 | Entrepreneurial | C5-1 | Creativity and innovation |
| GA5 | Entrepreneurial | C5-2 | Collaborative |
| GA5 | Entrepreneurial | C5-3 | Management |
| GA5 | Entrepreneurial | C5-4 | Interpersonal |
| GA5 | Entrepreneurial | C5-5 | Leadership |

---

*Last updated: February 2026*
