# Environment Variables Reference

**PLOs–GAs Mapping System — Environment Configuration**

This document provides a complete reference for all environment variables required by the application. When deploying, create a file named `.env` in the project root directory and populate it with the values described below.

> **Security:** The `.env` file contains sensitive credentials. It is listed in `.gitignore` and must never be committed to version control.

---

## Required Variables

The following variables must be set for the application to start successfully.

### `DATABASE_URL`

The full MySQL connection string. Replace all placeholder values with your actual database credentials.

```
DATABASE_URL="mysql://plo_user:YourStrongPassword@localhost:3306/plo_ga_mapping"
```

| Part | Example | Description |
|---|---|---|
| `plo_user` | Your DB username | MySQL user created for this application |
| `YourStrongPassword` | A secure password | The MySQL user's password |
| `localhost` | `127.0.0.1` | Database host (use `localhost` for same-server deployments) |
| `3306` | `3306` | MySQL port (default) |
| `plo_ga_mapping` | Your DB name | The database created for this application |

### `JWT_SECRET`

A secret key used to sign and verify JWT session cookies. This must be a cryptographically random string of at least 32 characters.

Generate a secure value with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```
JWT_SECRET="a1b2c3d4e5f6...64-character-hex-string"
```

> **Warning:** If this value changes after deployment, all existing user sessions will be invalidated and users will be logged out.

---

## Email Configuration

These variables are required for the password reset, username recovery, and welcome email features.

| Variable | Example Value | Description |
|---|---|---|
| `SMTP_HOST` | `smtp.hostinger.com` | SMTP server hostname |
| `SMTP_PORT` | `587` | SMTP port (587 for STARTTLS, 465 for SSL) |
| `SMTP_USER` | `no-reply@yourdomain.com` | SMTP authentication username |
| `SMTP_PASSWORD` | `your-smtp-password` | SMTP authentication password |
| `SMTP_FROM` | `PLO-GA System <no-reply@yourdomain.com>` | Display name and address for outgoing emails |
| `ADMIN_EMAIL` | `admin@yourdomain.com` | Administrator email for system notifications |

The original deployment uses Hostinger's SMTP service at `smtp.hostinger.com:587` with STARTTLS.

---

## Application Configuration

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_TITLE` | `PLOs-GAs Mapping System` | Application title shown in the browser tab |
| `NODE_ENV` | `development` | Set to `production` on the server. Do not set in `.env`; use PM2 or system environment instead. |

---

## Manus Platform Variables

The following variables are only required when the application is deployed on the **Manus hosting platform**. For self-hosted VPS deployments, these can be left empty or omitted entirely — the application will function normally without them.

| Variable | Description |
|---|---|
| `VITE_APP_ID` | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend base URL |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL (frontend) |
| `OWNER_OPEN_ID` | Manus platform owner identifier |
| `OWNER_NAME` | Manus platform owner display name |
| `BUILT_IN_FORGE_API_URL` | Manus built-in API base URL (server-side) |
| `BUILT_IN_FORGE_API_KEY` | Manus built-in API bearer token (server-side) |
| `VITE_FRONTEND_FORGE_API_KEY` | Manus built-in API bearer token (frontend) |
| `VITE_FRONTEND_FORGE_API_URL` | Manus built-in API URL (frontend) |
| `VITE_ANALYTICS_ENDPOINT` | Manus analytics tracking endpoint |
| `VITE_ANALYTICS_WEBSITE_ID` | Manus analytics website identifier |

---

## Complete `.env` Template

Create a file named `.env` in the project root with the following content, replacing all placeholder values:

```
DATABASE_URL="mysql://plo_user:YourStrongPassword@localhost:3306/plo_ga_mapping"
JWT_SECRET="your-64-character-random-hex-string-here"
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="587"
SMTP_USER="no-reply@yourdomain.com"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="PLO-GA System <no-reply@yourdomain.com>"
ADMIN_EMAIL="admin@yourdomain.com"
VITE_APP_TITLE="PLOs-GAs Mapping System"
VITE_APP_ID=""
OAUTH_SERVER_URL=""
VITE_OAUTH_PORTAL_URL=""
OWNER_OPEN_ID=""
OWNER_NAME=""
BUILT_IN_FORGE_API_URL=""
BUILT_IN_FORGE_API_KEY=""
VITE_FRONTEND_FORGE_API_KEY=""
VITE_FRONTEND_FORGE_API_URL=""
VITE_ANALYTICS_ENDPOINT=""
VITE_ANALYTICS_WEBSITE_ID=""
```

---

*Last updated: February 2026*
