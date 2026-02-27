# Contributing Guidelines

**PLOs–GAs Mapping System**

Thank you for contributing to the PLOs–GAs Mapping System. This document describes the standards, workflows, and conventions that all contributors must follow to maintain code quality and consistency.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Development Environment Setup](#development-environment-setup)
3. [Branching Strategy](#branching-strategy)
4. [Commit Message Convention](#commit-message-convention)
5. [Code Style Guidelines](#code-style-guidelines)
6. [Testing Requirements](#testing-requirements)
7. [Pull Request Process](#pull-request-process)
8. [Reporting Issues](#reporting-issues)
9. [Feature Requests](#feature-requests)

---

## Code of Conduct

All contributors are expected to maintain a professional and respectful working environment. Contributions that are disrespectful, discriminatory, or harmful will not be accepted.

---

## Development Environment Setup

Before contributing, ensure your local environment matches the requirements described in the [Quick Start](README.md#quick-start) section of the README. All development should be done against a local MySQL database — never against the production database.

---

## Branching Strategy

The repository follows a simplified Git Flow:

| Branch | Purpose |
|---|---|
| `main` | Production-ready code. All deployments are made from this branch. |
| `develop` | Integration branch for completed features before merging to `main`. |
| `feature/short-description` | Individual feature branches, branched from `develop`. |
| `fix/short-description` | Bug fix branches, branched from `main` for hotfixes or `develop` for regular fixes. |

Create a new branch for every change, no matter how small. Direct commits to `main` are not permitted.

```bash
# Start a new feature
git checkout develop
git pull origin develop
git checkout -b feature/add-export-csv

# Start a hotfix
git checkout main
git pull origin main
git checkout -b fix/footer-width-analytics
```

---

## Commit Message Convention

All commit messages must follow the **Conventional Commits** specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:**

| Type | When to Use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Code formatting, missing semicolons — no logic changes |
| `refactor` | Code restructuring without adding features or fixing bugs |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates, tooling changes |

**Examples:**

```
feat(analytics): add competency coverage heatmap to program dashboard
fix(footer): correct width alignment on analytics pages
docs(deployment): add troubleshooting section for PM2 process conflicts
refactor(db): extract GA query helpers into separate module
```

---

## Code Style Guidelines

### TypeScript

All code must be written in TypeScript with strict type checking enabled. The `pnpm check` command must pass with zero errors before submitting a pull request.

- Prefer `const` over `let`; avoid `var`
- Use explicit return types on all exported functions
- Avoid `any` types; use `unknown` and type guards instead
- Use Zod for all runtime input validation in tRPC procedures

### React Components

- Use functional components with hooks exclusively; no class components
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks in `client/src/hooks/`
- Use `shadcn/ui` components for all interactive elements before writing custom ones
- All pages must follow the established layout pattern: amber-50 background, maroon header, maroon footer with rounded corners

### Database

- All schema changes must be made in `drizzle/schema.ts` and applied with `pnpm db:push`
- Never write raw SQL in `routers.ts`; all queries belong in `server/db.ts`
- New tables must use `utf8mb4` character set and include `createdAt` and `updatedAt` timestamp columns

### Python Scripts

- All Python scripts must be compatible with Python 3.11+
- Use type hints for all function signatures
- Handle file I/O errors gracefully and return meaningful error messages to the Node.js caller

---

## Testing Requirements

Every pull request must include appropriate tests. The project uses **Vitest** for unit testing.

Run the test suite with:

```bash
pnpm test
```

All tests must pass before a pull request can be merged. New tRPC procedures must have corresponding test files in `server/*.test.ts`, following the pattern established in `server/auth.logout.test.ts`.

---

## Pull Request Process

1. Ensure your branch is up to date with `develop` (or `main` for hotfixes)
2. Run `pnpm check` and fix all TypeScript errors
3. Run `pnpm test` and ensure all tests pass
4. Run `pnpm format` to apply consistent code formatting
5. Open a pull request using the provided template
6. Describe the changes clearly, including the motivation and any relevant screenshots
7. Request a review from at least one other contributor
8. Address all review comments before merging

---

## Reporting Issues

Use the [GitHub Issue Tracker](https://github.com/agastli/plo-ga-mapping-system/issues) to report bugs. Before opening a new issue, search existing issues to avoid duplicates. Use the **Bug Report** template and provide as much detail as possible, including browser version, steps to reproduce, and expected vs. actual behavior.

---

## Feature Requests

Feature requests are welcome. Use the **Feature Request** template in the issue tracker. Describe the problem the feature would solve, the proposed solution, and any alternatives considered.

---

*Last updated: February 2026*
