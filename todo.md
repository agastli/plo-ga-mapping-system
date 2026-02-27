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

## User Management Page Improvements

### Missing Features
- [x] Add standard header with QU logo and logout button (consistent with other admin pages)
- [x] Add "Edit User Information" button for each user (to change name, email, password)
- [x] Add "Remove User" button for each user (with confirmation dialog)
- [x] Add edit user dialog with form fields (name, email, password)
- [x] Add delete confirmation dialog before removing users
- [x] Update backend to support user update and delete operations (already exists)
- [x] Ensure admin cannot delete themselves (implemented in backend)
- [x] Add success/error toast notifications for user operations

## Viewer/Editor Dashboard and Analytics Bug Fixes

### Critical Bugs
- [x] ViewerDashboard showing all 54 programs instead of only assigned programs
- [x] EditorDashboard should also filter to show only assigned programs
- [x] Analytics page showing "No data available" with API errors (ERR_TOO_MANY_REDIRECTS, TRPCClientError) - Added ProtectedRoute wrapper
- [x] Fix statistics on ViewerDashboard to reflect only assigned programs (My Programs count, Total Mappings, Total PLOs)
- [x] Fix "My Programs" link on ViewerDashboard to show only assigned programs
- [x] Fix "View Analytics" link to work correctly for viewers/editors
- [x] Updated getAccessiblePrograms backend function to return enriched program data with counts

## User Management Page Header/Footer Fix

- [x] Add Home/Back button to User Management page header
- [x] Add footer to User Management page (consistent with other admin pages)

## Viewer/Editor Access Control Fixes

### ViewerDashboard Footer
- [x] Add footer to ViewerDashboard page (matching User Management footer)
- [x] Add footer to EditorDashboard page (matching User Management footer)

### Programs Directory Access Control
- [x] Filter Programs Directory (/programs) to show only assigned programs for viewers/editors
- [x] Updated Programs.tsx to use getAccessiblePrograms for viewers/editors
- [x] Admins continue to see all programs

### Analytics Access Control
- [x] Filter Analytics page data to show only assigned programs for viewers/editors
- [x] Updated UnifiedAnalytics.tsx to use getAccessiblePrograms for viewers/editors
- [x] Viewers/editors now see only analytics for their assigned programs

## Standard Header/Footer Design Consistency

- [x] Update ViewerDashboard to use Programs page header/footer design
- [x] Update EditorDashboard to use Programs page header/footer design
- [x] Header includes: QU logo, "PLO-GA Mapping System" title, subtitle, role badge, and logout button
- [x] Footer has: full-width maroon background, white QU logo, copyright text

## Analytics Page Loading Issues

- [x] Fix ERR_TOO_MANY_REDIRECTS errors on analytics page for admin users
- [x] Ensure tRPC queries wait for authentication confirmation before executing
- [x] Add proper loading states to prevent race conditions
- [ ] Test analytics page loads cleanly without redirect errors

## Report Templates Page Header

- [x] Add Home button to Report Templates page header
- [x] Ensure consistent navigation across all pages

## Forgot Password & Username Recovery

- [x] Add "Forgot Password?" link to login page
- [x] Add "Forgot Username?" link to login page
- [x] Create ForgotPassword.tsx page component
- [x] Create RecoverUsername.tsx page component
- [x] Add password reset token field to users table (already existed in schema)
- [x] Implement auth.forgotPassword backend endpoint
- [x] Implement auth.recoverUsername backend endpoint
- [x] Add getUserByEmail and updateUserResetToken database functions
- [x] Test complete forgot password flow
- [x] Test complete username recovery flow
- [ ] Add email notification for password reset (TODO: requires email service integration)
- [ ] Add email notification for username recovery (TODO: requires email service integration)
- [ ] Implement auth.resetPassword endpoint with token validation (future enhancement)
