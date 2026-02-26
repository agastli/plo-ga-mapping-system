# PLO-GA Mapping System - Development TODO

## Current Sprint: User Roles & Permissions System

### Backend - Role-based Procedures & Middleware
- [x] Create adminProcedure middleware in server/routers.ts
- [x] Create editorProcedure middleware in server/routers.ts
- [x] Add users.list endpoint (admin only)
- [x] Add users.updateRole endpoint (admin only)
- [x] Add users.createAssignment endpoint (admin only)
- [x] Add users.deleteAssignment endpoint (admin only)
- [x] Add users.getAccessiblePrograms endpoint (for editors/viewers)
- [ ] Update existing endpoints to use role-based access control
- [ ] Add users.update endpoint for editing user information (admin only)
- [ ] Add users.delete endpoint for deleting users (admin only)
- [ ] Implement email notification system for new user creation
- [ ] Send welcome email with login credentials and password change instructions

### Frontend - Admin User Management Interface
- [x] Create UserManagement.tsx page component
- [x] Add user list table with role badges
- [x] Add role change dropdown (admin only)
- [x] Add assignment management UI (assign users to colleges/departments)
- [ ] Add user search and filtering
- [ ] Add navigation link to User Management (admin only)
- [ ] Add edit user functionality (update name, email, password, role)
- [ ] Add delete user functionality with confirmation dialog
- [ ] Add logout button to navigation header

### Frontend - Role-based Access Control
- [x] Create useRole() hook to check current user role
- [ ] Hide/show features based on user role (admin/editor/viewer)
- [ ] Restrict edit/delete buttons for viewers
- [ ] Restrict program creation for viewers
- [ ] Show appropriate error messages for unauthorized actions
- [ ] Update navigation menu based on role

### Password Reset & Username Recovery
- [ ] Add password reset token to users table
- [ ] Add auth.forgotPassword endpoint (generate reset token)
- [ ] Add auth.resetPassword endpoint (validate token and update password)
- [ ] Add auth.recoverUsername endpoint (find username by email)
- [ ] Create ForgotPassword.tsx page component
- [ ] Create ResetPassword.tsx page component
- [ ] Add "Forgot Password?" link to Login page
- [ ] Add "Forgot Username?" link to Login page

### Testing & Deployment
- [ ] Test admin role: can manage users, full access
- [ ] Test editor role: can edit assigned programs
- [ ] Test viewer role: can only view assigned programs
- [ ] Create test users with different roles
- [ ] Deploy to VPS and verify all roles work correctly
- [ ] Document user roles system in README

## Completed Features
- [x] Database schema (users.role enum, userAssignments table)
- [x] Backend functions (getAllUsers, updateUserRole, access control helpers)
- [x] Database migration script ready (0006_colorful_metal_master.sql)

### Frontend - Home Page Updates
- [x] Add "User Management" button to home page (admin-only visibility)
- [x] Use useRole() hook to conditionally show admin features

## Custom Authentication System (Self-Hosted VPS)

### Database Schema Updates
- [x] Add password field to users table (hashed with bcrypt)
- [x] Add username field (unique identifier for login)
- [x] Remove dependency on openId field for password users
- [x] Create database migration script

### Backend Authentication
- [x] Install bcrypt package for password hashing
- [x] Create password hashing utility functions (passwordAuth.ts)
- [x] Implement auth.ts module with authenticateUser function
- [x] Implement auth.login endpoint (validate credentials, create session)
- [x] Implement auth.logout endpoint (clear session)
- [x] Update SDK authenticateRequest to support password-based users
- [x] Create JWT session token generation for password users
- [x] Add getUserByUsername and createUser to db.ts
- [ ] Implement auth.register endpoint (admin-only UI)

### Frontend Authentication UI
- [x] Create Login.tsx page component
- [x] Add form validation for login/register
- [x] Add error handling and user feedback
- [x] Login route configured in App.tsx
- [ ] Create Register.tsx page component (admin-only)
- [ ] Update navigation to show login/logout based on auth state
- [ ] Add route protection (redirect to /login if not authenticated)

### Testing & Deployment
- [ ] Test login flow with username/password
- [ ] Test session persistence across page refreshes
- [ ] Test role-based access control with password auth
- [ ] Deploy to VPS and verify authentication works
- [ ] Document authentication system in README

## User Assignment Improvements

### Cascading Dropdown for Department/Program Assignment
- [x] Update user assignment UI: when "Department" is selected, show cascading dropdowns
- [x] First dropdown: Select College
- [x] Second dropdown: Select Department (filtered by selected college)
- [x] Third section: Show list of programs from selected department with checkboxes
- [x] Allow admin to select multiple programs from the same department
- [x] Update backend schema to support multiple program assignments per user
- [x] Add programId field to userAssignments table and 'program' to assignmentType enum
- [x] Update access control functions to check program-level permissions
- [x] Update createAssignment endpoint to accept program assignments
- [x] Update getAssignmentDisplay to show program assignments
- [x] Update userHasAccessToProgram to check program-level assignments
- [x] Update getAccessiblePrograms to include program-level assignments

## Role-Based Dashboards & Authentication Routing

### Authentication Guard & Routing
- [x] Create ProtectedRoute component to guard authenticated routes
- [x] Redirect unauthenticated users from / to /login
- [x] Redirect authenticated users from /login to their dashboard
- [x] Implement role-based redirect logic on homepage

### Admin Dashboard
- [x] Create AdminDashboard.tsx with full system access
- [x] Show statistics: total programs, users, mappings, recent activity
- [x] Quick links to: User Management, Program Management, Analytics, Upload Documents
- [x] Display system-wide overview and admin-only features

### Editor Dashboard
- [x] Create EditorDashboard.tsx with assigned program access
- [x] Show list of assigned programs with edit capabilities
- [x] Quick links to: My Programs, Upload Documents, View Analytics (for assigned programs)
- [x] Filter all features to show only assigned programs

### Viewer Dashboard
- [x] Create ViewerDashboard.tsx with read-only access
- [x] Show list of assigned programs (read-only)
- [x] Quick links to: My Programs (view only), View Analytics (for assigned programs)
- [x] Disable all edit/delete/upload functionality

### Route Configuration
- [x] Update App.tsx with role-based route protection
- [x] Add redirect logic: / → /login (if not authenticated)
- [x] Add redirect logic: / → /admin-dashboard (if admin)
- [x] Add redirect logic: / → /editor-dashboard (if editor)
- [x] Add redirect logic: / → /viewer-dashboard (if viewer)
- [ ] Protect all management routes (require admin role)
- [ ] Protect program edit routes (require editor or admin role)
