# System Architecture

**PLOs–GAs Mapping System — Technical Architecture Reference**

---

## Overview

The PLOs–GAs Mapping System is a full-stack TypeScript monorepo following a clean three-tier architecture: a React single-page application (SPA) on the frontend, an Express.js API server on the backend, and a MySQL relational database for persistence. The frontend and backend communicate exclusively through **tRPC**, which provides end-to-end type safety without code generation or manual schema maintenance.

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                             │
│   React 19 SPA  ──tRPC Client──►  /api/trpc  (HTTP/JSON)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Server (Node.js 22)            │
│                                                             │
│   tRPC Router  ──►  Procedures  ──►  db.ts helpers          │
│                                         │                   │
│                                    Drizzle ORM              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MySQL 8.x Database                      │
│                    (14 tables, utf8mb4)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Choices

The frontend is built with **React 19** and bundled with **Vite 6**. All UI components are sourced from **shadcn/ui**, a collection of accessible, unstyled components built on Radix UI primitives and styled with **Tailwind CSS 4**. Client-side routing is handled by **Wouter**, a lightweight alternative to React Router that adds minimal bundle overhead. Data visualization uses **Recharts**, a composable charting library built on D3.

### State Management

The application does not use a global state management library (such as Redux or Zustand). All server state is managed by **tRPC's React Query integration**, which provides automatic caching, background refetching, and optimistic updates. Local UI state (form inputs, modal visibility, selected filters) is managed with React's built-in `useState` and `useReducer` hooks.

### Page Structure

The application has 34 page components organized by user role and function:

| Category | Pages |
|---|---|
| **Public** | Home, Login, ForgotPassword, RecoverUsername, NotFound |
| **Admin** | AdminDashboard, UserManagement, OrganizationalStructure, ClusterManagement, UserLoginTracking, UserProfile, ReportTemplates |
| **Editor** | EditorDashboard, AddProgram, ManualEntry, Upload, ProgramDetail, DeleteProgram |
| **Viewer** | ViewerDashboard, ProgramBrowser, Programs |
| **Analytics** | Analytics, UnifiedAnalytics, CollegeAnalytics, DepartmentAnalytics, GAAnalytics, CompetencyAnalytics |
| **Analytics Guides** | AnalyticsGuide, GAAnalyticsGuide, CompetencyAnalyticsGuide |
| **Data Quality** | DataCompletenessDashboard, DataValidationTool |

### Authentication Flow

Authentication uses a custom JWT-based system (not Manus OAuth). The flow is:

1. User submits credentials to `trpc.auth.login`
2. Server validates credentials with bcrypt, generates a JWT signed with `JWT_SECRET`
3. JWT is stored in an HTTP-only cookie
4. Every subsequent tRPC request includes the cookie automatically
5. `server/_core/context.ts` decodes the JWT and attaches `ctx.user` to the request context
6. Protected procedures check `ctx.user`; admin procedures additionally check `ctx.user.role === 'admin'`

---

## Backend Architecture

### tRPC Router Structure

All API logic is defined as tRPC procedures in `server/routers.ts`. The router is organized into named sub-routers:

| Router | Procedures | Description |
|---|---|---|
| `auth` | `login`, `logout`, `me`, `changePassword`, `forgotPassword`, `resetPassword`, `recoverUsername` | Authentication and account management |
| `users` | `list`, `create`, `update`, `delete`, `getById`, `updateRole`, `assignPrograms` | User management (admin only) |
| `colleges` | `list`, `create`, `update`, `delete` | College management |
| `clusters` | `list`, `listByCollege`, `create`, `update`, `delete` | Cluster management |
| `departments` | `list`, `listByCollege`, `create`, `update`, `delete` | Department management |
| `programs` | `list`, `getById`, `create`, `update`, `delete`, `getByUser` | Program management |
| `graduateAttributes` | `list`, `getById` | Read-only GA access |
| `competencies` | `list`, `listByGA` | Read-only competency access |
| `plos` | `list`, `listByProgram`, `create`, `update`, `delete`, `bulkCreate` | PLO management |
| `mappings` | `getByProgram`, `upsert`, `bulkUpsert`, `delete` | Mapping weight management |
| `analytics` | `university`, `college`, `department`, `program`, `ga`, `competency` | Analytics calculations |
| `reports` | `exportWord`, `exportExcel`, `exportPdf`, `exportBatch` | Report generation (invokes Python) |
| `system` | `notifyOwner`, `getStats`, `getLoginHistory` | System administration |
| `health` | `ping` | Health check endpoint |

### Database Query Layer

All database interactions are abstracted into helper functions in `server/db.ts`. Procedures in `routers.ts` call these helpers rather than writing raw SQL directly. This separation ensures that:

- Database logic is testable in isolation
- Procedures remain concise and focused on business logic
- Query patterns are reusable across multiple procedures

### Python Integration

Report generation is handled by Python scripts invoked as child processes from within tRPC procedures. The Node.js server calls `python3 scripts/export-to-word.py` (or the relevant script) with JSON-encoded data passed via stdin. The Python script processes the data, generates the file, and writes it to a temporary path. The Node.js server then reads the file and streams it to the client as a download.

This architecture was chosen because Python's `python-docx`, `openpyxl`, and `reportlab` libraries provide significantly richer document formatting capabilities than equivalent Node.js libraries, particularly for generating reports that must match Qatar University's official templates.

---

## Database Architecture

### Schema Design Principles

The database schema follows standard relational normalization principles. Key design decisions include:

- All text fields use `utf8mb4` character set to support Arabic script and emoji
- Timestamps are stored as MySQL `datetime` columns (UTC)
- Soft deletes are not used; records are hard-deleted with cascading constraints
- The `mappings` table uses a composite unique key on `(ploId, competencyId)` to prevent duplicate mappings

### Entity Relationship Summary

```
colleges ──┬── clusters ──── departments ──── programs
           └── departments ──────────────────────┘
                                                 │
                                               plos
                                                 │
                                            mappings ──── competencies ──── graduateattributes
                                                 │
                                          justifications

users ──── userAssignments ──── (programs | departments | colleges)
users ──── loginHistory
```

### Key Tables

**`programs`** — Central entity. Contains `nameEn`, `nameAr`, `code`, `language` (en/ar/both), `collegeId`, `clusterId`, `departmentId`.

**`plos`** — Program Learning Outcomes. Contains `code`, `descriptionEn`, `descriptionAr`, `sortOrder`, `programId`.

**`mappings`** — The core mapping data. Contains `ploId`, `competencyId`, `weight` (decimal 0.0–1.0). Unique constraint on `(ploId, competencyId)`.

**`justifications`** — Text justifications for mappings. Contains `ploId`, `competencyId`, `justificationText`, `language`.

**`users`** — User accounts. Contains `username`, `email`, `passwordHash`, `role` (admin/editor/viewer), `nameEn`, `nameAr`.

**`userAssignments`** — Role assignments. Contains `userId`, `assignmentType` (college/department/program), `assignmentId`.

---

## Security Architecture

### Authentication

Passwords are hashed using **bcrypt** with a cost factor of 12. The application does not store plaintext passwords at any point. Session tokens are **JWT** (JSON Web Tokens) signed with `HS256` and the `JWT_SECRET` environment variable. Tokens are stored in **HTTP-only cookies**, making them inaccessible to JavaScript and protecting against XSS attacks.

### Authorization

Three-tier role-based access control is enforced at the tRPC procedure level:

- `publicProcedure` — No authentication required (login, health check)
- `protectedProcedure` — Valid JWT required; injects `ctx.user`
- `adminProcedure` — Valid JWT required AND `ctx.user.role === 'admin'`

Program-level access for Editor and Viewer roles is enforced by checking `userAssignments` in the relevant procedures.

### Input Validation

All tRPC procedure inputs are validated using **Zod** schemas defined inline in `routers.ts`. Invalid inputs are rejected before reaching any database or business logic.

---

## Deployment Architecture

In production, the application runs behind an **Nginx** reverse proxy on a Ubuntu 22.04 VPS. The Node.js process is managed by **PM2**, which provides automatic restart on crashes and startup on server reboot. SSL/TLS termination is handled by Nginx using certificates issued by **Let's Encrypt** via Certbot.

```
Internet
    │
    ▼
Nginx (port 443, SSL termination)
    │
    ▼
PM2 → Node.js (port 3000, internal only)
    │
    ▼
MySQL (port 3306, localhost only)
```

The MySQL database is only accessible from localhost; no external database port is exposed. Nginx is configured with `client_max_body_size 50M` to support document uploads.

---

## Build System

The production build is a two-step process:

1. **Vite** compiles the React frontend into static assets in `dist/public/`. Asset filenames include content hashes (e.g., `index-CmiLqEhW.js`) for cache-busting.

2. **esbuild** bundles the Express backend into a single `dist/index.js` file. External npm packages are not bundled (they are resolved from `node_modules` at runtime).

The Express server in production serves the Vite-built static files directly from `dist/public/` and handles all API requests under `/api/trpc`.

---

*Last updated: February 2026*
