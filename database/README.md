# Database Seed File

## `plo_ga_mapping_seed.sql`

This file is the canonical seed database for the PLO-GA Mapping System. It contains the complete schema and all production data as of the date shown in the file header (generated via phpMyAdmin → Export → SQL format).

Importing this file into a fresh MySQL database gives a new installation the full organisational structure (colleges, clusters, departments, programs), all PLO-to-GA mappings, Graduate Attributes, competencies, and user accounts — identical to the live deployment.

---

## How to import on a fresh installation

```bash
# Create the database first (if it does not already exist)
mysql -u root -p -e "CREATE DATABASE plo_ga_mapping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import the seed file
mysql -u root -p plo_ga_mapping < database/plo_ga_mapping_seed.sql
```

After importing, skip the `pnpm db:push` step — the schema is already in place.

---

## Naming convention for future updates

When a new production export is available, rename the exported file to:

```
plo_ga_mapping_seed.sql
```

Replace the existing file in this directory with the new one before committing. Do **not** commit files with the original phpMyAdmin export name (e.g., `u187450368_plo_mapping.sql`) — always rename first.

---

## What the file contains

| Table | Contents |
|---|---|
| `colleges` | All QU colleges |
| `clusters` | CAS clusters and others |
| `departments` | All academic departments |
| `programs` | All bachelor and graduate programs |
| `graduateAttributes` | 5 QU Graduate Attributes |
| `competencies` | 21 competencies |
| `plos` | All Program Learning Outcomes |
| `mappings` | PLO-to-competency weight mappings |
| `justifications` | Mapping justification texts |
| `users` | User accounts (bcrypt-hashed passwords) |
| `userAssignments` | User-to-program/college/department assignments |
| `auditLog` | Change history |
| `loginHistory` | Login session records |
| `reportTemplates` | Custom export templates |
| `systemSettings` | System configuration |
| `__drizzle_migrations` | Drizzle ORM migration history |
