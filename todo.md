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

## Header and Footer Standardization

- [x] Fix Admin Dashboard header to include Home button
- [x] Fix Admin Dashboard header to match standard layout (logo, title, role badge, logout)
- [x] Add footer to Admin Dashboard page
- [x] Fix Organizational Structure header to include role badge and logout button
- [x] Add footer to Organizational Structure page
- [x] Update User Management footer to match standard maroon format
- [x] Test all three pages to ensure consistent branding

## Viewer and Editor Dashboard Simplification

- [x] Remove Quick Actions section from ViewerDashboard (redundant)
- [x] Remove Quick Actions section from EditorDashboard (redundant)
- [x] Add college and cluster filtering to ViewerDashboard for users with broad access
- [x] Add college and cluster filtering to EditorDashboard for users with broad access
- [x] Filter dropdowns show only assigned colleges/clusters (not all system data)
- [x] Keep only statistics cards, filters, and assigned programs list
- [x] Test both dashboards to ensure clean layout and functional filtering

## Analytics Access Restoration

- [x] Add "View Analytics" button to ViewerDashboard filter section
- [x] Add "View Analytics" button to EditorDashboard filter section
- [x] Ensure analytics remains easily accessible without redundant Quick Actions card
- [ ] Test analytics navigation from both dashboards

## Analytics Access Control Security Fix

- [ ] Modify analytics page to filter all data based on user's accessible programs
- [ ] Restrict Analysis Level dropdown to show only levels user has access to
- [ ] Viewers/editors with single program: show only that program's analytics
- [ ] Viewers/editors with college access: show college and program levels only
- [ ] Admins: show all levels (university-wide, college, program)
- [ ] Test with viewer account assigned to single program
- [ ] Verify university-wide data is not accessible to non-admin users

## Dashboard Welcome Headers

- [x] Restore "Viewer Dashboard" title to ViewerDashboard page
- [x] Restore "Welcome, [Username]" message to ViewerDashboard
- [x] Restore "Editor Dashboard" title to EditorDashboard page  
- [x] Restore "Welcome, [Username]" message to EditorDashboard
- [x] Ensure consistent header format across all dashboard types

## Dashboard Filter-Based Design

- [x] Keep college/cluster filters in ViewerDashboard (filters show only assigned colleges/clusters)
- [x] Keep college/cluster filters in EditorDashboard (filters show only assigned colleges/clusters)
- [x] Filters automatically limited based on user assignments
- [x] Admin sees all colleges/clusters/programs in filters
- [x] Viewer/Editor sees only their assigned colleges/clusters/programs in filters
- [x] Fix analytics page to respect user's accessible programs only
- [x] Ensure analytics doesn't show university-wide data to non-admin users
- [x] Change all analytics endpoints from publicProcedure to protectedProcedure
- [x] Add access control checks to all analytics endpoints
- [ ] Test analytics with viewer account to verify access restrictions

## Dashboard UX Flow Redesign - New Approach

- [ ] Redesign ViewerDashboard: Remove filters and program cards, add two large action buttons
- [ ] Redesign EditorDashboard: Remove filters and program cards, add two large action buttons
- [ ] Action Button 1: "Browse Programs" → navigates to /program-browser page
- [ ] Action Button 2: "View Analytics" → navigates to /analytics page
- [ ] Create new ProgramBrowser.tsx page component
- [ ] ProgramBrowser: Show college/cluster filters (limited to user's accessible colleges/clusters)
- [ ] ProgramBrowser: Display filtered program cards below filters
- [ ] ProgramBrowser: Each program card links to program detail page
- [ ] Add /program-browser route to App.tsx

## Analytics Page Access Control Fix

- [ ] Fix gaByCollegeAnalytics to filter data based on user's accessible colleges
- [ ] Fix competencyByDepartmentAnalytics to filter data based on user's accessible departments
- [ ] Change completenessStats and validateData from publicProcedure to protectedProcedure
- [ ] Ensure analytics page respects user access levels (university/college/cluster/program)
- [ ] Test analytics page loads without 403 Forbidden errors for viewers/editors

## Analytics Page Default View Fix

- [x] Fix UnifiedAnalytics to detect user role on page load
- [x] For viewers/editors: Default to first accessible program instead of university-wide view
- [x] For admins: Keep university-wide view as default
- [x] Prevent 403 Forbidden errors when non-admins access /analytics without filters
- [ ] Test analytics page loads successfully for viewers/editors

## Header/Footer Width Consistency Fix

- [x] Find all pages with full-width headers/footers
- [x] Update headers to match main container width (max-w-7xl)
- [x] Update footers to match main container width (max-w-7xl)
- [x] Ensure consistent padding and alignment across all pages
- [ ] Test visual consistency on all pages

## Analytics Filter Access Control Fix

- [x] Fix analytics page to show only accessible colleges in College filter dropdown
- [x] Derive accessible colleges from user's assigned programs
- [x] Ensure filters update when user assignments change
- [ ] Test filter behavior after changing user assignments

## Analysis Level Switching Fix

- [x] Fix Analysis Level dropdown onChange to clear program selection when switching to college level
- [x] Ensure college-level analytics display when "By College" is selected
- [ ] Test switching between college and program levels

## Smart Default Analysis Level Based on Access Breadth

- [x] Detect if user has access to all programs in a college (full college access)
- [x] If full college access: default to College level
- [x] If partial program access: default to Program level
- [x] If admin (all colleges): default to University level (already implemented)
- [ ] Test with user assigned to full college vs specific programs

## Cascading Filter Dropdowns for Analytics

- [x] Add Department dropdown filter to analytics page (omitted per user request)
- [x] Add Program dropdown filter (cascades from College)
- [x] Cluster dropdown shows only when college has clusters
- [x] Set 'Select' as placeholder for unselected lower-level filters
- [x] Ensure filters cascade properly (College → Cluster → Program)
- [x] Auto-update analysis level based on filter selections
- [ ] Test drill-down from college level to program level using filters

## Add Standard Header and Footer to All Pages

### Header Status
- [x] All 28 pages have QU logo headers (verified)

### Footer Addition Tasks
- [x] Add maroon footer to UnifiedAnalytics page
- [x] Add footer to ClusterManagement page  
- [x] Add footer to analytics guide pages (AnalyticsGuide, CompetencyAnalyticsGuide, GAAnalyticsGuide)
- [x] Add footer to analytics pages (CollegeAnalytics, CompetencyAnalytics, DepartmentAnalytics, GAAnalytics, Analytics)
- [x] Add footer to dashboard pages (Dashboard, DataCompletenessDashboard, DataValidationTool, ReportTemplates)
- [x] Add footer to program management pages (AddProgram, DeleteProgram, ManualEntry)
- [x] Add footer to auth pages (Login, ForgotPassword, RecoverUsername, NotFound)
- [x] Ensure all footers match container width (max-w-7xl)
- [x] Use consistent footer content (QU logo, copyright, version)
- [x] All 21 pages now have standard maroon footers

## Email Sending Implementation (SMTP)

- [x] Install nodemailer package
- [x] Create email service module (server/email.ts)
- [x] Configure Hostinger SMTP settings (smtp.hostinger.com:465)
- [x] SMTP credentials use database password (no additional secrets needed)
- [x] Update forgot password endpoint to send recovery emails
- [x] Update forgot username endpoint to send username reminder emails
- [ ] Test email sending functionality on VPS
- [ ] Verify emails are received successfully

## Welcome Email for New Users

- [x] Create sendWelcomeEmail function in server/email.ts
- [x] Include user credentials (username and initial password) in email
- [x] Add role-specific information (Admin/Viewer/Editor responsibilities)
- [x] Include system overview and purpose of PLO-GA Mapping System
- [x] Add instructions to change password after first login
- [x] Include login link and getting started guide
- [x] Update user creation endpoint to send welcome email
- [ ] Test welcome email with different user roles on VPS

## SMTP Email Fix - Port 587 and Error Handling

- [x] Update SMTP configuration to use port 587 with STARTTLS instead of port 465
- [x] Add comprehensive try-catch error handling to prevent server crashes
- [x] Make email sending completely non-blocking
- [x] Add detailed error logging for SMTP issues
- [ ] Test email sending with new configuration on VPS

## Email Template Fixes

- [x] Change blue text color to white in email maroon box for better contrast
- [x] Fix login URL in emails from localhost:3000 to production domain (plo-ga.gastli.org)
- [ ] Test forgot password email with corrected styling and URL

## Login Page UI Improvement

- [x] Remove the maroon info box from the login page (desktop view)

## Email BCC to Admin

- [x] Add BCC to admin email address for all outgoing system emails (welcome, password reset, username recovery)

## User Profile & Password Change

- [x] Create backend endpoint for updating user profile (name, email)
- [x] Create backend endpoint for changing password (requires current password verification)
- [x] Create UserProfile.tsx page component
- [x] Add profile form with fields: name, email, current password, new password
- [x] Add "Profile" navigation link to all dashboard headers
- [x] Add /profile route to App.tsx
- [x] Test password change functionality

## Password Visibility & Login Tracking

- [x] Add password visibility toggle (eye icon) to login page password field
- [x] Add password visibility toggles to profile page (current, new, confirm password fields)
- [x] Modify profile page password fields with visibility toggles
- [x] Create backend endpoint to retrieve user login history
- [x] Create UserLoginTracking.tsx admin dashboard page
- [x] Add navigation link to login tracking dashboard in admin menu
- [x] Display login history table with: username, login time, IP address, user agent

## Header Button Styling

- [x] Update Profile and Logout buttons in ViewerDashboard to maroon background with white text
- [x] Update Profile and Logout buttons in EditorDashboard to maroon background with white text
- [x] Update Profile and Logout buttons in AdminDashboard to maroon background with white text

## Login Tracking Page Styling

- [x] Change background from white/gradient to amber-50 to match other dashboards
- [x] Add standard footer with QU logo and copyright information

## Header and Footer Width Alignment

- [ ] Fix UserProfile.tsx header and footer to match content width
- [ ] Fix UserLoginTracking.tsx header and footer to match content width
- [ ] Check and fix all other pages with headers/footers for consistent width alignment

## Header and Footer Width Alignment & Button Styling

- [x] Fix UserProfile.tsx header/footer to match content container width (max-w-4xl)
- [x] Fix UserLoginTracking.tsx header/footer to match content container width
- [x] Fix ViewerDashboard.tsx header/footer to match content container width (already aligned at max-w-7xl)
- [x] Fix EditorDashboard.tsx header/footer to match content container width (already aligned at max-w-7xl)
- [x] Fix AdminDashboard.tsx header/footer to match content container width (already aligned at max-w-7xl)
- [x] Update all header buttons (Back to Dashboard, Home, etc.) to maroon background with white text

## Login Page Title Update

- [x] Change title from "PLO-GA Mapping System" to "PLOs-GAs Mapping System" in Login.tsx

## Design System Improvements (High Priority)

### Button Standardization
- [ ] Audit all buttons across pages and standardize variants
- [ ] Ensure all primary action buttons use maroon background with white text
- [ ] Ensure all secondary buttons use consistent outline style
- [ ] Standardize button sizes (use size="default" for primary, size="sm" for secondary)

### Loading States
- [ ] Replace default gray spinners with maroon-colored spinners
- [ ] Add skeleton loaders for data tables and cards
- [ ] Implement progress bars for file uploads and long operations

### Breadcrumb Navigation
- [ ] Add breadcrumb component to deep pages (ProgramDetail, Analytics, etc.)
- [ ] Show clear navigation path from dashboard → current page
- [ ] Make breadcrumbs clickable for easy navigation back

### Mobile Responsiveness
- [ ] Fix table overflow on mobile devices (add horizontal scroll)
- [ ] Improve mobile menu/navigation
- [ ] Test all forms on mobile and fix layout issues
- [ ] Ensure cards stack properly on small screens

### Empty States
- [ ] Design and implement empty state component with icon and CTA
- [ ] Replace generic "No data" messages with helpful empty states
- [ ] Add actionable buttons to empty states (e.g., "Add First Program")

### Form Field Improvements
- [ ] Standardize label positioning (always above input)
- [ ] Add consistent error message styling (red text with icon)
- [ ] Improve focus states for better keyboard navigation
- [ ] Add helper text for complex fields

### Accessibility
- [ ] Audit color contrast ratios (aim for WCAG AA compliance)
- [ ] Add visible focus indicators to all interactive elements
- [ ] Review and improve alt text for all images
- [ ] Test keyboard navigation across all pages

## Layout and Styling Fixes (Critical)

- [x] Fix UserProfile page header/footer width - currently full-width but content is max-w-4xl
- [x] Fix Login Tracking page footer width - doesn't match content container
- [x] Fix IP address display in Login Tracking - showing "::ffff:127.0.0.1" instead of clean format
- [x] Remove duplicate footer from Report Templates (System Settings) page
- [x] Fix Organizational Structure page header buttons - need maroon background with white text
- [x] Fix Analytics/View Program page footer width - currently full-width but should match content

## Comprehensive Design Review - All Pages

- [x] Review all remaining pages for header/footer width consistency - Fixed 16 pages total
- [x] Review all pages for button styling consistency (maroon background, white text) - All verified
- [x] Review all pages for background color consistency (amber-50) - All verified
- [x] Check all pages for duplicate elements - All verified
- [x] Verify all pages have proper spacing and alignment - All verified

### Footer Width Fixes Applied (16 pages):
- UnifiedAnalytics, AddProgram, ManualEntry, DeleteProgram, ClusterManagement
- DataCompletenessDashboard, DataValidationTool, Analytics, CollegeAnalytics
- DepartmentAnalytics, GAAnalytics, CompetencyAnalytics, AnalyticsGuide
- GAAnalyticsGuide, CompetencyAnalyticsGuide
- Plus 5 previously fixed: UserProfile, UserLoginTracking, ReportTemplates, OrganizationalStructure, ViewProgram

## Production Deployment Issues (Feb 27, 2026)

- [x] Fix duplicate footer on Analytics Guide pages (removed from AnalyticsGuide, GAAnalyticsGuide, CompetencyAnalyticsGuide)
- [ ] Stop old PM2 process (plo-ga-mapping) to avoid running 2 processes
- [ ] Verify footer width fixes are visible on production after proper PM2 restart

## Admin Dashboard Enhancement (Feb 27, 2026)

- [ ] Add backend query to count total Graduate Attributes (GAs)
- [ ] Add backend query to count total Competencies
- [ ] Add GA count card to Admin Dashboard statistics section
- [ ] Add Competency count card to Admin Dashboard statistics section

## Footer Width Fine-Tuning & Deployment Documentation (Feb 27, 2026)

- [ ] Fix analytics footer width to exactly match header/content container (remove max-w-7xl, use same px-6 container as content)
- [ ] Write comprehensive DEPLOYMENT.md with installation, configuration, and troubleshooting guide

## TypeScript Fixes & Shared Footer Component (Feb 27, 2026)

- [ ] Fix TypeScript errors in OrganizationalStructure.tsx (missing update procedures for clusters/departments)
- [ ] Fix TypeScript error in ProgramDetail.tsx (Object is possibly undefined)
- [ ] Fix TypeScript error in UnifiedAnalytics.tsx (type comparison overlap)
- [ ] Create shared Footer component in client/src/components/PageFooter.tsx
- [ ] Replace all inline footer definitions across all pages with shared component

## TypeScript & Shared Footer - Completed (Feb 27, 2026)

- [x] Fix TypeScript errors in OrganizationalStructure.tsx - added updateCluster, updateDepartment, updateCollege procedures
- [x] Fix TypeScript error in ProgramDetail.tsx - added optional chaining for undefined objects
- [x] Fix TypeScript error in UnifiedAnalytics.tsx - fixed type narrowing with includes()
- [x] Fix TypeScript errors in AddProgram.tsx - replaced descriptionEn/Ar with nameEn/Ar, fixed ploId → programId+gaId
- [x] Fix TypeScript error in App.tsx - requiredRole → requireRole
- [x] Fix TypeScript error in use-toast.ts - added open and onOpenChange to ToasterToast type
- [x] Create shared PageFooter component in client/src/components/PageFooter.tsx
- [x] Replace all inline Footer definitions with PageFooter (10 pages: Analytics, AnalyticsGuide, CollegeAnalytics, DepartmentAnalytics, ReportTemplates, GAAnalytics, CompetencyAnalytics, UnifiedAnalytics, GAAnalyticsGuide, CompetencyAnalyticsGuide)
- [x] Zero TypeScript errors confirmed with npx tsc --noEmit
- [x] Add GA and Competency count cards to Admin Dashboard
- [x] Add updateCluster, updateDepartment, updateCollege to db.ts and routers.ts

## Phase: Email, User Search & Backend Access Control (Feb 27, 2026)

### Email Notifications for Password Reset
- [x] Check existing email.ts configuration and SMTP setup - fully implemented with Nodemailer + Hostinger SMTP
- [x] Implement sendPasswordResetEmail function using Nodemailer - already exists in email.ts
- [x] Connect auth.forgotPassword backend endpoint to send actual email - already wired
- [x] Add SMTP_PASSWORD to env.ts for proper environment variable access

### User Search & Filtering in User Management
- [x] Add search input field to filter users by name, username, or email
- [x] Add role filter dropdown (All, Admin, Editor, Viewer)
- [x] Implement client-side filtering logic with useMemo
- [x] Show result count and empty state when no users match

### Backend Access Control Enforcement
- [x] Add requireProgramAccess helper function to routers.ts
- [x] Add requireEditorOrAdmin helper for admin-only operations
- [x] Add access check to programs.update and programs.delete procedures
- [x] Add access check to plos.create, plos.update, plos.delete procedures
- [x] Add access check to mappings.upsert and justifications.upsert procedures
- [x] Add access check to document.import procedure
- [x] Fix frontend callers (AddProgram.tsx, ProgramDetail.tsx) to pass programId
- [x] Zero TypeScript errors confirmed after all access control changes

## Three Enhancements Sprint (Feb 27, 2026)

### 1. VPS Deployment Guide with SMTP Setup
- [x] Update docs/DEPLOYMENT.md with step-by-step SMTP_PASSWORD configuration
- [x] Add section: "Updating an Existing Deployment" (git pull, build, pm2 restart)
- [x] Add section: "Email Configuration" with Hostinger SMTP details and test command
- [x] Add section: "Stopping Old PM2 Process" to handle dual-process issue

### 2. Breadcrumb Navigation
- [x] Create shared Breadcrumb component in client/src/components/Breadcrumb.tsx
- [x] Add breadcrumbs to ProgramDetail page (Home > Programs > [Program Name])
- [x] Add breadcrumbs to ViewProgram page (Home > Programs > [Program Name] > View)
- [x] Add breadcrumbs to AddProgram page (Home > Programs > Add Program)
- [x] Add breadcrumbs to DeleteProgram page (Home > Programs > Delete Program)
- [x] Add breadcrumbs to ManualEntry page (Home > Programs > [Program] > Manual Entry)
- [x] Add breadcrumbs to Analytics sub-pages (Home > Analytics > [Type])
- [x] Add breadcrumbs to Admin sub-pages (Home > Admin > [Page])

### 3. Mobile Responsiveness for Analytics Dashboards
- [x] Make analytics chart containers horizontally scrollable on small screens
- [x] Add responsive breakpoints to stat cards (stack vertically on mobile)
- [x] Make data tables horizontally scrollable with sticky first column
- [x] Improve sidebar/header for mobile (collapsible or hamburger menu)
- [ ] Test on 375px (mobile) and 768px (tablet) widths (manual verification needed)

## Dashboard Intro Text (Feb 27, 2026)
- [ ] Add intro panel to AdminDashboard explaining admin capabilities
- [ ] Add intro panel to EditorDashboard explaining editor capabilities
- [ ] Add intro panel to ViewerDashboard explaining viewer capabilities
- [ ] Add intro panel to Programs page
- [ ] Add intro panel to Analytics/UnifiedAnalytics page
- [ ] Add intro panel to UserManagement page

## Six-Feature Sprint (Feb 2026)

### 1. Mapping Completeness Tracker
- [ ] Add tRPC procedure to compute per-program completeness (PLOs mapped / total PLOs)
- [ ] Add completeness widget to AdminDashboard (table of programs with progress bars)
- [ ] Add completeness widget to EditorDashboard (only assigned programs)

### 2. Mapping Audit Log
- [ ] Add mappingAuditLog table to drizzle/schema.ts
- [ ] Run pnpm db:push for audit log table
- [ ] Write to audit log on every mapping upsert and delete
- [ ] Add tRPC procedure to fetch audit log for a program
- [ ] Add Audit Log tab/panel to ProgramDetail page

### 3. Email Notification on Program Assignment
- [ ] Detect newly added program assignments in assignPrograms procedure
- [ ] Send email to editor/viewer when a new program is assigned
- [ ] Include program name, college, and direct link in the email

### 4. In-App Help Tooltips
- [ ] Create reusable HelpTooltip component
- [ ] Add tooltip to weighting factor input (0-100% scale explanation)
- [ ] Add tooltip to GA selector (Graduate Attribute descriptions)
- [ ] Add tooltip to competency selector (competency descriptions)

### 5. Automated DB Backup Script
- [ ] Create scripts/backup-db.sh with mysqldump, timestamped filename, 7-day retention
- [ ] Add backup cron setup instructions to docs/DEPLOYMENT.md

### 6. Bulk CSV Import for PLOs
- [ ] Add CSV upload button to ProgramDetail PLOs tab
- [ ] Add server-side CSV parsing and bulk insert procedure
- [ ] Skip duplicate PLOs by code, show import summary
- [ ] Provide downloadable CSV template link

## Three Improvements Sprint (Feb 28, 2026)
- [x] Update DEPLOYMENT.md section 22 with detailed cron job setup steps
- [x] Make MappingAuditLog panel collapsible (collapsed by default, expand on click)
- [x] Add configurable threshold alerts to MappingCompletenessWidget (warn below 50%, danger below 25%)

## Documentation & Intro Text Sprint (Feb 28, 2026)
- [ ] Add intro text to MappingCompletenessWidget (explain purpose and threshold controls)
- [ ] Add intro text to MappingAuditLog (explain what is tracked and how to use)
- [ ] Add intro text to PLOBulkImport (explain CSV format and workflow)
- [ ] Write comprehensive docs/USER_MANUAL.md covering all system features
- [ ] Create UserManual.tsx page in the app rendering the manual inline
- [ ] Add "User Manual" link to admin navigation

## Login History Management

- [x] Add backend tRPC procedures: loginHistory.deleteMany (deleteLoginHistoryByIds, deleteLoginHistoryOlderThan)
- [x] Build UserLoginTracking.tsx page with selectable rows, username/method filters, and bulk delete
- [x] Add "Delete older than N days" quick-action button
- [x] Add explanatory card at top of Login Tracking page
- [ ] Register /login-history route in App.tsx (admin only)
- [ ] Add Login History link to Admin sidebar navigation

## Analytics Scope Bug

- [x] Fix: viewer assigned university-wide scope cannot see "University-wide" analysis level in Analytics page — only sees college-by-college options
- [x] Fix: Program dropdown in Analytics shows all college programs instead of only cluster programs when a cluster is selected
- [x] Fix: Program selector in Analytics filters should only appear when "By Program" is selected, not for By Cluster or By College
- [x] Fix: backend analytics procedures throw 403 "Only admins can access university-wide analytics" for viewers with university-level assignment

## Access Scope Improvements

- [x] Verify and fix collegeAnalytics, clusterAnalytics, departmentAnalytics, programAnalytics backend access for university-level assigned viewers
- [x] Add "Your Access Scope" badge/card to viewer home/dashboard page showing assigned scope with icon and entity name

## Editor Dashboard Text Fix
- [x] Replace "Upload Documents" bullet with "Edit Justifications" in EditorDashboard intro panel

## Three Dashboard & Analytics Improvements (Mar 1, 2026)
- [x] Add Access Scope badge to Editor Dashboard (same as Viewer Dashboard)
- [x] Show scope-aware default filter on Analytics page for college/cluster-assigned users
- [x] Add Assigned Programs quick-list table to Viewer Dashboard (program name, college, completeness %)
- [x] Add Assigned Programs quick-list table to Editor Dashboard (program name, college, completeness %)

## Assigned Programs Table & Editor Dashboard Improvements (Mar 1, 2026)
- [ ] Make Assigned Programs table rows clickable (navigate to program detail page)
- [ ] Add "Last Modified" column to Assigned Programs table in Viewer and Editor Dashboards
- [ ] Fix "Map PLOs to GAs" bullet in Editor Dashboard intro to focus on weighting only (remove overlap with "Edit Justifications")

## Three New Features Sprint (Mar 2, 2026)
- [x] Add "Last Login" column to User Management table (backend: include lastSignedIn in users.list, frontend: display in user card)
- [x] Add Completeness Threshold alert banner to Admin Dashboard (fetch threshold + programCompleteness, show warning when avg below threshold)
- [x] Add Quick Jump search bar to Editor Dashboard Assigned Programs table
- [x] Add Quick Jump search bar to Viewer Dashboard Assigned Programs table

## Three New Features Sprint #2 (Mar 2, 2026)
- [x] Add sortable column headers (Program, College, Completeness, Last Modified) to Assigned Programs table in Editor Dashboard
- [x] Add sortable column headers (Program, College, Completeness, Last Modified) to Assigned Programs table in Viewer Dashboard
- [x] Add Programs Below Threshold summary table to Admin Dashboard (below the alert banner, shows name, college, completeness %)
- [x] Add Last Login summary view to Login Tracking page (per-user most-recent-login table alongside the event log)

## Sprint #3 (Mar 2, 2026)
- [x] Fix Login Tracking discrepancy: derive Last Login per User from loginHistory records (not users.lastSignedIn)
- [ ] Add Export to CSV button for Programs Below Threshold table on Admin Dashboard
- [ ] Add "Days Since Last Login" inactivity filter to Login Tracking page
- [ ] Persist sort preference in localStorage for Assigned Programs tables (Editor + Viewer Dashboards)
- [x] Merge the two Login Tracking tables into one unified per-user last-login table (username, role, last login, method, IP, device, status)

## Session Warning & Login History Drawer Sprint
- [x] Add 5-minute countdown warning banner before session expiry with "Stay logged in" button
- [x] Add Login History detail drawer per user on Login Tracking page

## Mapping Guide Page
- [x] Create MappingGuide.tsx page with written guide and YouTube video popup
- [x] Add Mapping Guide button to ProgramDetail header
- [x] Register /programs/guide route in App.tsx

## Deactivate Account Feature (Mar 4, 2026)
- [x] Add `isActive` boolean column to users table in schema (drizzle/schema.ts)
- [x] Run db:push to migrate isActive column to database
- [x] Implement `toggleUserActive(userId, isActive)` helper in server/db.ts
- [x] Add `users.toggleActive` tRPC mutation (admin-only, blocks self-deactivation)
- [x] Block deactivated users from logging in (server/auth.ts)
- [x] Add Activate/Deactivate toggle button to user cards in UserManagement.tsx
- [x] Add red "Deactivated" badge to user card title for inactive accounts
- [x] Write vitest tests for toggleActive (4 tests: deactivate, activate, self-block, non-admin)

## Breadcrumb Navigation & User Manual Redesign (Mar 4, 2026)
- [x] Redesign UserManual.tsx with standard QU header/footer, Back/Home buttons, icons, and proper formatting
- [x] Add breadcrumb to AdminDashboard
- [x] Add breadcrumb to EditorDashboard
- [x] Add breadcrumb to ViewerDashboard
- [x] Add breadcrumb to Programs (Programs Directory)
- [x] Add breadcrumb to Upload page
- [x] Add breadcrumb to ProgramBrowser
- [x] Add breadcrumb to ForgotPassword page (skipped — auth-flow centered card, no header)
- [x] Add breadcrumb to RecoverUsername page (skipped — auth-flow centered card, no header)

## Bug Fix: Duplicate Assignment Error (Mar 4, 2026)
- [x] Fix createAssignment failing with duplicate key error when assigning a second college or program to a user

## Bug Fixes (Mar 4, 2026)
- [x] Fix VPS login failure: isActive column missing from users table on VPS database (provide SQL migration)
- [x] Fix duplicate key error when assigning a second college or program to a user (add duplicate check in createUserAssignment)

## Bug Fix: Editor Dashboard Access Card (Mar 4, 2026)
- [x] Fix Editor Dashboard "College Access" card showing only one college when multiple are assigned (also fixed ViewerDashboard — both now show all assigned colleges as pill badges)

## Programs Directory Filter Order Fix (Mar 4, 2026)
- [x] Reorder filters on Programs page: College → Cluster → Department → Search (was College → Department → Cluster → Search)

## User Manual Content Formatting (Mar 4, 2026)
- [x] Register @tailwindcss/typography plugin in index.css (Tailwind v4 @plugin directive) — prose classes now render headings, lists, tables, blockquotes correctly
- [x] Fix User Manual Download button: replaced Markdown download with browser print-to-PDF (styled print stylesheet with maroon cover page, formatted sections)
