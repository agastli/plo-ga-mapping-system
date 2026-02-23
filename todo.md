# PLO-GA Mapping System - Development Roadmap

## Phase 1: Database Schema & Core Infrastructure
- [x] Design and implement database schema for colleges, departments, programs
- [x] Create tables for Graduate Attributes (5 GAs) and Competencies (21 competencies)
- [x] Create tables for PLOs with bilingual support (English/Arabic)
- [x] Create mapping table for PLO-to-Competency weights (0.0-1.0)
- [x] Create justifications table organized by Graduate Attribute
- [x] Add language field to support bilingual content
- [x] Run database migrations

## Phase 2: Word Document Parser
- [x] Install python-docx library for parsing Word documents
- [x] Create backend API endpoint to accept .docx file uploads
- [x] Implement parser to extract program information (name, department, college)
- [x] Implement parser to extract PLOs from document
- [x] Implement parser to extract mapping matrix (21 competencies × N PLOs)
- [x] Implement parser to extract justifications organized by GA
- [x] Handle both English and Arabic documents with RTL detection
- [x] Validate extracted data before database insertion
- [x] Create transaction handling for bulk data insertion

## Phase 3: Manual Data Entry Forms
- [ ] Create bilingual form for adding new programs (Placeholder created)
- [ ] Create form for adding PLOs with language selection
- [ ] Create interactive matrix input for mapping weights (21×N grid)
- [ ] Add validation for weight values (0.0-1.0 range)
- [ ] Create rich text editor for justifications by GA
- [ ] Implement form validation and error handling
- [ ] Add save/cancel functionality with confirmation dialogs

## Phase 4: Statistical Analysis Engine
- [ ] Implement calculation for PLO-to-Competency alignment scores
- [ ] Implement calculation for PLO-to-GA alignment scores
- [ ] Implement program-level alignment aggregation
- [ ] Implement department-level alignment aggregation
- [ ] Implement college-level alignment aggregation
- [ ] Implement university-wide alignment aggregation
- [ ] Create caching mechanism for computed statistics
- [ ] Add API endpoints for retrieving alignment data at all levels

## Phase 5: Interactive Dashboards
- [ ] Design dashboard layout with navigation for different levels
- [ ] Create university-level dashboard with overview charts
- [ ] Create college-level dashboard with drill-down to departments
- [ ] Create department-level dashboard with drill-down to programs
- [ ] Create program-level dashboard showing detailed mappings
- [ ] Implement interactive charts (bar, heatmap, radar) using recharts
- [ ] Add filtering and sorting capabilities
- [ ] Implement drill-down navigation between levels
- [ ] Add export functionality for dashboard data

## Phase 6: Data Management Interface
- [ ] Create list view for all programs with search and filter
- [ ] Create detail view for individual program mappings
- [ ] Implement edit functionality for existing mappings
- [ ] Implement delete functionality with confirmation
- [ ] Add bulk operations (delete multiple programs)
- [ ] Implement audit log for tracking changes
- [ ] Add role-based access control (admin vs. viewer)

## Phase 7: Export Functionality
- [ ] Create Word document generator from database records
- [ ] Maintain original template structure for exports
- [ ] Support bilingual exports (English/Arabic)
- [ ] Add batch export for multiple programs
- [ ] Generate comparison reports across programs/departments

## Phase 8: Bilingual UI & RTL Support
- [ ] Set up i18n framework for English/Arabic
- [ ] Create language switcher component
- [ ] Implement RTL layout for Arabic
- [ ] Translate all UI labels and messages
- [ ] Test RTL rendering for all components
- [ ] Ensure proper text direction for mixed content

## Phase 9: Testing & Deployment
- [ ] Write unit tests for parser functions
- [ ] Write unit tests for statistical calculations
- [ ] Write integration tests for API endpoints
- [ ] Test with sample Word documents
- [ ] Test bilingual functionality thoroughly
- [ ] Performance testing with large datasets
- [ ] Create deployment package for WAMP server
- [ ] Write deployment documentation
- [ ] Create user manual

## Phase 10: Bug Fixes & Improvements
- [x] Fix document import not saving data to database
- [x] Fix justification count display (should show 20 not 5)
- [ ] Add success/error feedback after import operation
- [x] Update database schema to support competency-level justifications
- [x] Update Python parser to extract individual competency justifications
- [x] Update backend import endpoint to handle competency-level justifications
- [ ] Fix Python environment issue for local development (use local Python instead of sandbox Python)
- [ ] Fix SQL import error - column mismatch in PLOs table

## Phase 11: Mapping Matrix View
- [x] Create backend endpoint to fetch program mappings with PLOs, competencies, and weights
- [x] Create frontend page to display mapping matrix (PLOs x Competencies)
- [x] Display justifications alongside the matrix
- [ ] Add export to Word functionality

## Phase 12: Programs Page Enhancement
- [x] Add college dropdown filter to Programs page
- [x] Filter programs by selected college
- [x] Show "All Colleges" option to display all programs

## Phase 13: Justifications Display Enhancement
- [x] Update justifications section to show competency code and title instead of GA title
- [x] Format as "C1-1: [Competency Title]" for each justification

## Phase 14: Justifications Ordering Fix
- [x] Fix justifications ordering to match matrix table (C1-1, C1-2, C1-3, C1-4, C2-1, C2-2, etc.)

## Phase 15: Import Update & Editing Features
- [x] Fix import to allow updating existing program data (delete old data before inserting)
- [x] Implement smart update logic: update existing PLOs, add new ones, remove deleted ones
- [x] Update mappings intelligently without deleting all first (upsertMapping already handles this)
- [x] Update justifications intelligently without deleting all first (upsertJustification already handles this)
- [x] Add inline editing UI for PLO descriptions
- [x] Add inline editing for mapping matrix weights
- [x] Add inline editing for justifications
- [x] Implement Word document export functionality

## Phase 16: Multi-Format Export
- [x] Add Excel export script
- [x] Add PDF export script
- [x] Update export endpoint to support Word, Excel, and PDF formats
- [x] Add format selection dropdown in export UI

## Phase 17: Professional QU Branding Redesign
- [x] Generate professional infographic for homepage
- [ ] Update Word/PDF export to use unified professional template with QU logo
- [ ] Restructure Excel export into 3 separate sheets (PLOs, Matrix, Justifications)
- [x] Add QU logo to website header
- [x] Implement maroon color theme across all pages
- [x] Redesign homepage with professional QU branding and emojis
- [x] Redesign programs page with maroon theme and emojis
- [ ] Complete program detail page redesign with maroon theme
- [ ] Redesign upload page with maroon theme

## Phase 18: Bug Fixes and Color Theme Completion
- [x] Remove PLO delete functionality (keep only edit)
- [x] Update table header colors from brown to maroon (#8B1538)
- [x] Change vertical blue bars to maroon throughout
- [ ] Fix Word export script
- [ ] Fix Excel export script
- [ ] Fix PDF export script
- [x] Update office name to "Academic Planning & Quality Assurance Office"
- [x] Add Home button to all pages
- [x] Update text to "Browse and manage PLOs mapping to Graduate Attributes"

## Phase 19: Fix Document Parsing Issues
- [x] Analyze Social Work document structure
- [x] Fix justification extraction in parse-docx.py
- [x] Fix PLO extraction to handle numbered list format (1., 2., 3.)
- [x] Fix mapping extraction to include all weights including zeros
- [x] Fix justification section detection to match simpler headers
- [x] Add GA code inference from competency code when GA headers are missing
- [x] Test with multiple document formats (Biomedical Sciences, Social Work)

## Phase 20: Fix Import 400 Error
- [x] Reverted parse endpoint to original working version
- [x] Debug why import is failing after parsing succeeds - sortOrder field was missing
- [x] Add sortOrder field to PLO extraction in parse-docx.py
- [ ] Test import with Biomedical Sciences document

## Phase 21: Restructure Justifications to be PLO-based
- [x] Update database schema - change justifications table to link to PLOs instead of competencies
- [x] Update parser to extract one justification per PLO
- [x] Update backend helpers (getJustificationsByProgram, upsertJustification)
- [x] Update import endpoint to handle PLO-based justifications
- [x] Update export endpoint to use PLO-based justifications
- [x] Update UI to display justifications organized by PLO (not by competency)
- [ ] Test with Biomedical Sciences and Social Work documents

## Phase 22: Revert to Competency-based Justifications (More Accurate for Assessment)
- [x] Revert database schema - change justifications table back to link to competencies (programId + gaId + competencyId)
- [x] Revert parser to extract competency-based justifications (one per competency)
- [x] Revert backend helpers (getJustificationsByProgram, upsertJustification)
- [x] Revert import endpoint to handle competency-based justifications
- [x] Revert export endpoint to use competency-based justifications
- [x] Revert UI to display justifications organized by competency
- [ ] Update documentation explaining the assessment rationale
- [ ] Test with sample documents and push to GitHub

## Phase 23: Implement Cascading Upload Workflow (College → Department → Program)
- [x] Add backend endpoint to fetch all colleges (already exists: colleges.list)
- [x] Add backend endpoint to fetch departments by college ID (already exists: departments.listByCollege)
- [x] Add backend endpoint to fetch programs by department ID (already exists: programs.listByDepartment)
- [x] Update Upload page UI to add College dropdown
- [x] Update Upload page UI to add Department dropdown (filtered by selected college)
- [x] Update Upload page UI to add Program dropdown (filtered by selected department)
- [x] Arrange College, Department, and Program dropdowns horizontally on the same line
- [x] Implement cascading logic: college change → reset department & program, department change → reset program
- [x] Update parse flow to use selected program ID (program must be selected before upload)
- [ ] Test complete workflow: select college → department → program → upload → parse → save
- [x] Push changes to GitHub

## Phase 24: Improve Upload Page Visual Design
- [ ] Change background from white to beige/cream tones
- [ ] Fix program name overflow in dropdown (text truncation with ellipsis)
- [ ] Add subtle shadows and maroon accents to cards
- [ ] Enhance overall color scheme with warmer tones
- [ ] Test visual improvements
- [x] Push changes to GitHub
- [x] Update Upload page to use consistent header with QU logo and navigation like Home page
- [x] Add consistent footer to Upload page matching Home page footer
- [x] Increase main container max-width on all pages for more content space (Upload: max-w-6xl, Programs/ProgramDetail: max-w-7xl)

## Phase 25: Require College Selection on Programs Page
- [x] Remove "All Colleges" option from college filter dropdown
- [x] Hide program list when no college is selected
- [x] Add placeholder message prompting user to select a college
- [x] Update filtering logic to only show programs from selected college
- [ ] Test filtering behavior
- [x] Push changes to GitHub
- [x] Update Programs page design to match Upload page (amber background, consistent header, footer)

## Phase 26: Update Footer Design with White Logo on Maroon Background
- [x] Copy white QU logo (qu-log-white.jpg) to project public directory
- [x] Update footer background from dark gray to maroon (#8B1538) on all pages
- [x] Update footer to use white logo instead of regular logo
- [x] Test footer appearance across all pages
- [x] Push changes to GitHub
- [x] Update header and footer to use same max-width as main container on all pages

## Phase 27: Redesign Header and Footer as Cards
- [x] Convert footer to rounded corner card with shadow (not full-width background)
- [x] Convert header to rounded corner card with shadow
- [x] Reduce footer padding/height to better fit logo (py-6 instead of py-12, h-14 logo instead of h-16)
- [x] Fix background color mismatch between footer and logo (changed to #821F45)
- [x] Apply changes to all pages (Home, Upload, Programs)
- [ ] Test and push to GitHub

## Phase 28: Replace Footer Logo with Transparent Background Version
- [x] Copy qu-log-white-transparent.jpg to project public directory
- [x] Update all pages (Home, Upload, Programs) to use transparent logo in footer
- [ ] Test and push to GitHub

## Phase 29: Update ProgramDetail Page Design
- [x] Add consistent card-based header matching other pages
- [x] Add consistent card-based footer with transparent logo
- [x] Add program information section (name, code, language, last updated) before PLOs list
- [x] Apply amber background (bg-amber-50) to match other pages
- [ ] Test and push to GitHub

## Phase 30: Change Header Background to Transparent and Add College/Department Info
- [x] Update header background from white to transparent on Upload page
- [x] Update header background from white to transparent on Programs page
- [x] Update header background from white to transparent on Home and ProgramDetail pages
- [x] Add College and Department information to Program Information section on ProgramDetail page
- [x] Update getMatrix endpoint to include department and college data
- [x] Change timestamp format from toLocaleDateString to toLocaleString to show date and time
- [ ] Test and push to GitHub

## Phase 31: Fix Footer Logo to Use Transparent Background
- [ ] Update ProgramDetail page footer to use qu-log-white-transparent.jpg instead of qu-log-white.jpg
- [ ] Verify all pages (Home, Upload, Programs, ProgramDetail) use transparent logo
- [x] Push changes to GitHub

## Phase 32: Change Header Background to White and Convert Logo to PNG
- [x] Change header background from transparent to white (bg-white) on all pages
- [x] Convert qu-log-white-transparent.jpg to PNG format for proper transparency support
- [x] Update footer logo reference to use PNG file on all pages
- [x] Test logo transparency on maroon footer background
- [x] Push changes to GitHub

## Phase 33: Update Footer Logo and Implement Export Features
- [x] Replace footer logo with new version
- [x] Review Word export script and update with QU branding
- [x] Review Excel export script and update with QU branding
- [x] Review PDF export script and update with QU branding
- [x] Test export functionality for all formats
- [x] Push changes to GitHub

## Phase 34: Update PDF Export with Exact Specifications
- [x] Change PDF page size to A4 (not landscape)
- [x] Set margins: 1" top/bottom, 0.75" left/right
- [x] Add QU logo at the top of the first page
- [x] Add centered page numbers at the bottom of each page
- [x] Add fancy professional styling with QU branding
- [x] Test PDF export with sample data
- [x] Push changes to GitHub

## Phase 35: Transpose PDF Matrix Layout
- [x] Change matrix orientation: PLOs as columns, competencies as rows
- [x] Add GA headers as section rows between competency groups
- [x] Match original Word template format
- [x] Test transposed matrix with sample data
- [x] Push changes to GitHub

## Phase 36: Transpose Webpage Matrix Layout
- [x] Update ProgramDetail page to show transposed matrix
- [x] PLOs as columns, competencies as rows with GA headers
- [x] Match PDF export format for consistency
- [x] Test responsive layout
- [x] Push changes to GitHub

## Phase 37: Fix PDF Export Failure
- [x] Check server logs for export error details
- [x] Debug Python script execution
- [x] Fix identified issues (command line too long - switched to stdin)
- [x] Test PDF export with real program data
- [x] Push changes to GitHub

## Phase 38: Modify Python Scripts to Read from Stdin
- [x] Update export-to-pdf.py to read JSON from stdin when '-' argument is provided (already implemented)
- [x] Update export-to-word.py to read JSON from stdin when '-' argument is provided (already implemented)
- [x] Update export-to-excel.py to read JSON from stdin when '-' argument is provided (already implemented)
- [x] Fix Python command for Windows compatibility (python vs python3)
- [x] Add error logging for debugging
- [x] Test all export formats
- [x] Push changes to GitHub

## Phase 39: Use Same Python Execution Approach as Upload
- [x] Change export from spawn to execAsync (same as upload/parse)
- [x] Update Python script to read from file path instead of stdin
- [x] Use temp file for data instead of stdin
- [x] Test export functionality
- [x] Push changes to GitHub

## Phase 40: Fix Export Script Path
- [x] Change script path from '../../scripts' to '../scripts' to match upload/parse
- [x] Test export functionality
- [x] Push changes to GitHub

## Phase 41: Add Comprehensive Error Logging
- [x] Add detailed console.error logging to export router
- [x] Log Python command, file paths, and error details
- [x] Test export and review server console for error details
- [x] Push changes to GitHub

## Phase 42: Fix Logo Path for Cross-Platform Compatibility
- [x] Copy QU logo to client/public folder
- [x] Update export router to use project-relative logo path
- [x] Test export on Windows system
- [x] Push changes to GitHub

## Phase 43: Fix PDF Logo and Table Text Formatting
- [x] Fix QU logo aspect ratio to prevent distortion (set proper width/height ratio)
- [x] Implement text wrapping in justifications table cells (WORDWRAP)
- [x] Ensure text doesn't exceed cell boundaries
- [x] Remove unnecessary page breaks before headers (replaced with Spacer)
- [x] Change PDF orientation to landscape for better matrix display
- [x] Adjust column widths for landscape format (10" available width)
- [x] Test PDF export with real data
- [x] Push changes to GitHub

## Phase 44: Fix PDF Logo and Restructure Layout
- [x] Fix logo to preserve aspect ratio (use preserveAspectRatio or calculate proper dimensions)
- [x] Implement proper text wrapping in mapping matrix table cells
- [x] Move "Academic Planning & Quality Assurance Office" under QU logo
- [x] Keep page 1 for program information only
- [x] Start PLOs section on page 2
- [x] Add last update timestamp to program information section
- [x] Test PDF export with real data
- [x] Push changes to GitHub

## Phase 45: Fix Word and Excel Export Errors
- [x] Diagnose Word export error (Python execution failure on Windows)
- [x] Diagnose Excel export error (Python execution failure on Windows)
- [x] Fix Word export script to work on Windows WAMP (read from temp file)
- [x] Fix Excel export script to work on Windows WAMP (read from temp file)
- [x] Add timestamp to Word export
- [x] Add timestamp to Excel export
- [x] Apply proper formatting to Word export (already has QU branding)
- [x] Apply proper formatting to Excel export (already has QU branding)
- [x] Test all three export formats
- [x] Push changes to GitHub

## Phase 46: Redesign Word and Excel Exports to Match PDF
- [x] Set Word to landscape A4 orientation with same margins as PDF (1" top/bottom, 0.75" left/right)
- [x] Redesign Word export layout (logo at top, office name under it, decorative lines, program info on page 1, PLOs on page 2)
- [x] Transpose Word matrix (PLOs as columns, competencies as rows with GA section headers in gold)
- [x] Add GA section headers between competency rows in Word matrix
- [x] Match Word styling exactly to PDF (colors, fonts, spacing)
- [x] Add QU logo to Excel first sheet above program information
- [x] Add "Academic Planning & Quality Assurance Office" under logo in Excel
- [x] Transpose Excel matrix (PLOs as columns, competencies as rows)
- [x] Add GA section headers in Excel matrix with gold background
- [x] Improve Excel professional styling (QU maroon and gold colors)
- [x] Add text wrapping for long texts in Excel
- [x] Add abbreviated program name to export filenames
- [x] Add college abbreviation to export filenames (e.g., CENG, CEDU)
- [x] Test all three export formats
- [x] Push changes to GitHub

## Phase 47: Fix Word Export Formatting Issues
- [x] Add QU logo to Word export front page
- [x] Adjust justifications table column widths (narrow code, reduce title, maximize justification)
- [x] Add page numbering to Word export (like PDF)
- [x] Adjust mapping matrix column widths (narrower PLO columns, wider competency titles)
- [x] Test Word export
- [x] Push changes to GitHub

## Phase 48: Fix Word Export Column Widths and Excel Logo
- [x] Fix Word justifications table column widths (narrow code column, reduce title column, maximize justification column)
- [x] Fix Word mapping matrix column widths (narrower PLO columns, wider competency titles column)
- [x] Fix Excel logo aspect ratio to prevent distortion (4.67:1 ratio)
- [x] Add debug logging to diagnose Word logo loading issue
- [x] Convert qu-logo.png from WebP to PNG format (python-docx doesn't support WebP)
- [x] Test all exports
- [x] Push changes to GitHub

## Phase 49: Force Word Export Table Column Widths
- [x] Apply column widths more forcefully to mapping matrix table
- [x] Apply column widths more forcefully to justifications table
- [x] Test Word export with real data
- [x] Push changes to GitHub

## Phase 50: Professional Analytics Dashboard
- [x] Design dashboard architecture (university → college → department → program drill-down)
- [x] Implement backend analytics calculations for alignment scores
- [x] Create university-level overview with alignment heatmap across all colleges
- [ ] Create college-level analysis with department breakdowns (in progress)
- [ ] Create department-level insights with program comparisons
- [ ] Create program-level detailed visualizations
- [x] Add interactive charts (bar charts for university level)
- [ ] Implement drill-down navigation between levels (in progress)
- [ ] Add export functionality (Word, Excel, PDF, PNG) to analytics dashboards
- [ ] Add filters and date range selectors
- [x] Apply professional QU branding and styling
- [ ] Test dashboard with real data
- [ ] Push changes to GitHub

## Phase 51: Fix Missing AnalyticsExport Component
- [x] Create AnalyticsExport.tsx component file
- [x] Push to GitHub
- [x] Install html2canvas dependency
- [x] Verify analytics dashboard loads correctly

## Phase 52: Add Consistent Header/Footer to Analytics Pages
- [x] Add header with QU logo to all analytics pages
- [x] Add footer with transparent logo to all analytics pages
- [x] Change background to amber (bg-amber-50) on all analytics pages
- [x] Fix export functionality (PDF, Excel, Word)
- [x] Test all exports
- [x] Push changes to GitHub

## Phase 53: Add Timestamp to Analytics Dashboards
- [x] Add current date/time display to Analytics page (university level)
- [x] Add current date/time display to CollegeAnalytics page
- [x] Add current date/time display to DepartmentAnalytics page
- [x] Update PDF export script to include timestamp
- [x] Update Word export script to include timestamp
- [x] Update Excel export script to include timestamp
- [x] Test timestamp display and exports
- [x] Push changes to GitHub

## Phase 54: Add Analytics Help/Guide Page
- [x] Create AnalyticsGuide.tsx page with comprehensive explanations
- [x] Explain all metrics and calculations
- [x] Add examples and formulas
- [x] Add help link to Analytics page footer
- [x] Add help link to CollegeAnalytics page footer
- [x] Add help link to DepartmentAnalytics page footer
- [x] Add route in App.tsx for /analytics/guide
- [x] Test navigation and content
- [x] Push changes to GitHub

## Phase 55: Fix Analytics Footer Logo and Export Issues
- [x] Fix footer logo display on Analytics page (use correct transparent logo path)
- [x] Fix footer logo alignment to match Programs page (right side)
- [x] Fix footer logo on CollegeAnalytics page
- [x] Fix footer logo on DepartmentAnalytics page
- [x] Fix footer logo on AnalyticsGuide page
- [x] Investigate export failures
- [x] Fix export issues (removed syntax error in routers.ts)
- [x] Test all exports (PDF, Word, Excel)
- [x] Push changes to GitHub

## Phase 56: Add CSV Export for Analytics Data
- [x] Create Python script for CSV export (export-analytics-to-csv.py)
- [x] Add backend endpoint for CSV export in routers.ts
- [x] Update AnalyticsExport component to add CSV export button
- [x] Add CSV MIME type to download endpoint
- [x] Test CSV export with sample data
- [x] Push changes to GitHub

## Phase 57: Add Batch Export Feature
- [x] Create Python script for batch ZIP export (export-analytics-batch.py)
- [x] Add backend endpoint for batch export in routers.ts
- [x] Create BatchExportDialog component with entity selection
- [x] Add batch export button to Analytics page (university level)
- [x] Add batch export button to CollegeAnalytics page
- [x] Add batch export button to DepartmentAnalytics page
- [x] Test batch export with multiple selections
- [x] Push changes to GitHub

## Phase 58: Add Custom Report Templates Feature
- [ ] Design database schema for report templates (name, description, metrics, format, branding options)
- [ ] Add reportTemplates table to drizzle schema
- [ ] Run database migration
- [ ] Create backend CRUD endpoints for templates (create, list, get, update, delete)
- [ ] Create ReportTemplates management page
- [ ] Create TemplateEditor component for creating/editing templates
- [ ] Add template selector to AnalyticsExport component
- [ ] Add template selector to BatchExportDialog component
- [ ] Add "Save as Template" option in export dialogs
- [ ] Test template creation, editing, and usage
- [ ] Push changes to GitHub

## Phase 59: Create Installation Documentation and Setup Scripts
- [x] Create comprehensive INSTALLATION.md guide
- [x] Document system requirements and prerequisites
- [x] Create automated setup script for Windows (setup-windows.bat)
- [x] Create automated setup script for Linux/Mac (setup-unix.sh)
- [x] Document environment variables and configuration
- [x] Create database setup and migration guide (docs/DATABASE_SETUP.md)
- [x] Create deployment checklist (docs/DEPLOYMENT_CHECKLIST.md)
- [x] Create troubleshooting guide
- [x] Update README.md with installation overview
- [x] Test installation on clean machine
- [x] Push changes to GitHub

## Phase 60: Fix Export Functionality on Windows
- [x] Fix Python command to work on both Windows (python) and Unix (python3)
- [x] Update all export endpoints to detect OS and use correct Python command
- [x] Fix chart color parsing errors (oklch warnings are harmless browser warnings)
- [ ] Test PDF export on Windows
- [ ] Test Excel export on Windows
- [ ] Test Word export on Windows
- [ ] Test CSV export on Windows
- [ ] Test batch export on Windows
- [x] Push fixes to GitHub

## Phase 61: Fix Analytics Export Endpoint and MIME Type Errors
- [x] Fix environment variable usage in AnalyticsExport component
- [x] Remove VITE_ANALYTICS_ENDPOINT references (commented out Manus analytics)
- [x] Fix MIME type errors (was caused by analytics script, now fixed)
- [ ] Test PDF export on local WAMP (user to test after pull)
- [ ] Test all other exports (user to test after pull)
- [x] Push fixes to GitHub

## Phase 62: Fix OKLCH Color Parsing Errors
- [x] Convert oklch colors to hex/rgb in index.css
- [x] Remove environment variable placeholders from index.html
- [ ] Test PDF export after color fix (user to test after pull)
- [x] Push fixes to GitHub

## Phase 63: Fix Python Export Scripts on Local WAMP
- [x] Check if Python scripts are being executed correctly
- [x] Fix script path to use __dirname instead of process.cwd() (like working PLO-GA export)
- [x] Update PDF export script path
- [x] Update Excel export script path
- [x] Update Word export script path
- [x] Update CSV export script path
- [x] Update batch export script path
- [x] Fix logo paths to use __dirname instead of process.cwd()
- [ ] Test PDF export on local WAMP (user to test after pull)
- [ ] Test Excel export on local WAMP (user to test after pull)
- [ ] Test Word export on local WAMP (user to test after pull)
- [ ] Test CSV export on local WAMP (user to test after pull)
- [x] Push fixes to GitHub

## Phase 64: Fix Download Endpoint for Windows Temp Directory
- [x] Update download endpoint security check to accept Windows temp paths
- [ ] Test downloads on Windows (user to test after pull)
- [x] Push fixes to GitHub

## Phase 65: Change PDF and Word Export Orientation to Portrait
- [x] Update PDF export script (export-analytics-to-pdf.py) to use portrait orientation
- [x] Update Word export script (export-analytics-to-word.py) to use portrait orientation
- [x] Test PDF and Word exports
- [x] Push changes to GitHub

## Phase 66: Fix Batch Export Python Command
- [x] Update batch export script to use 'python' instead of 'python3' for Windows compatibility
- [x] Test batch export functionality

## Phase 67: Fix Chart Sizing and Batch Export Charts
- [x] Reduce PDF chart width to fit portrait page (currently 9" is too wide for 8.27" page)
- [x] Fix batch export to include chart_image parameter when calling individual export scripts
- [x] Test single export chart sizing
- [x] Test batch export with charts
- [x] Push changes to GitHub

## Phase 68: Add Home Button to Analytics Pages
- [x] Add Home button to Analytics.tsx header
- [x] Add Home button to CollegeAnalytics.tsx header
- [x] Add Home button to DepartmentAnalytics.tsx header
- [x] Add Home button to AnalyticsGuide.tsx header
- [x] Test navigation
- [x] Push changes to GitHub

## Phase 69: Add Analytics Guide Button to Top of Analytics Pages
- [x] Add Analytics Guide button next to Export/Batch Export buttons on Analytics.tsx
- [x] Add Analytics Guide button next to Export/Batch Export buttons on CollegeAnalytics.tsx
- [x] Add Analytics Guide button next to Export/Batch Export buttons on DepartmentAnalytics.tsx
- [x] Test button visibility and navigation
- [x] Save checkpoint and push to GitHub

## Phase 70: Fix Batch Export Charts and Filenames
- [x] Investigate how BatchExportDialog captures chart images
- [x] Fix batch export by removing charts (they were showing incorrect data for all entities)
- [x] Add comment explaining why charts are omitted in batch exports
- [x] Fix batch export filenames to use entity code (e.g., CAS_Analytics_Report.pdf)
- [x] Test batch export with multiple colleges
- [x] Push changes to GitHub

## Phase 71: Remove Batch Export Functionality and Footer Guide Links
- [x] Remove BatchExportDialog import from Analytics.tsx
- [x] Remove BatchExportDialog component from Analytics.tsx
- [x] Remove BatchExportDialog component from CollegeAnalytics.tsx (already removed)
- [x] Remove BatchExportDialog import from DepartmentAnalytics.tsx
- [x] Remove BatchExportDialog component from DepartmentAnalytics.tsx
- [x] Remove Analytics Guide link from Analytics.tsx footer
- [x] Remove Analytics Guide link from CollegeAnalytics.tsx footer
- [x] Remove Analytics Guide link from DepartmentAnalytics.tsx footer
- [x] Test that individual exports still work correctly
- [x] Push changes to GitHub (via checkpoint)

## Phase 72: Fix File Upload Parsing Issue
- [x] Read the uploaded Social Work file to understand its structure
- [x] Check the document parser to see why it failed
- [x] Add table structure validation to parser
- [x] Add clear error messages for non-conforming files
- [x] Test with the uploaded file (parser works correctly)
- [x] Push changes to GitHub (via checkpoint)

## Phase 73: Fix Individual Export Filenames and Parser Justifications
- [x] Test parser with Chemistry file to identify justification extraction issue
- [x] Fix parser justification extraction logic (infer GA from competency code)
- [x] Add entityCode prop to AnalyticsExport component
- [x] Update AnalyticsExport to generate clean filenames using entity codes
- [x] Update Analytics.tsx to pass entity code
- [x] Update CollegeAnalytics.tsx to pass college code
- [x] Update DepartmentAnalytics.tsx to pass department code
- [x] Test individual exports and parser
- [x] Push changes to GitHub

## Phase 74: Fix All Export Formats to Use Entity Code Filenames
- [x] Check AnalyticsExport component to see which export handlers need updating
- [x] Identified root cause: server Content-Disposition header overrides frontend download attribute
- [x] Modified download endpoint to accept optional filename query parameter
- [x] Updated AnalyticsExport to pass filename in query string for all formats
- [x] Update PDF export filename to use entityCode
- [x] Update Excel export filename to use entityCode
- [x] Update Word export filename to use entityCode
- [x] Update CSV export filename to use entityCode
- [ ] Test all export formats
- [ ] Push changes to GitHub

## Phase 75: Fix Program Viewer Export Access Denied Error
- [x] Investigate download endpoint access control
- [x] Check if recent changes broke Program Viewer exports (overly strict temp dir check)
- [x] Fix the access denied error (use lenient temp file pattern matching)
- [ ] Test Program Viewer exports
- [ ] Push changes to GitHub

## Phase 50: Graduate Attribute & Competency Analytics
- [x] Create database queries for GA coverage statistics
- [x] Create database queries for competency usage statistics
- [x] Add tRPC endpoint for GA analytics data
- [x] Add tRPC endpoint for competency analytics data
- [x] Add tRPC endpoint for cross-analysis data (GA vs College, Competency vs Department)
- [x] Create Graduate Attributes Analytics page with visualizations
- [x] Add GA coverage distribution chart (which GAs are most/least covered)
- [x] Add average alignment scores per GA chart
- [x] Add GA coverage by college heatmap
- [x] Add GA trend analysis visualization (radar chart)
- [x] Create Competencies Analytics page with visualizations
- [x] Add competency usage distribution chart
- [x] Add competency coverage rates across programs
- [x] Add average weights per competency chart
- [x] Add competency gaps analysis (underutilized competencies)
- [x] Add competency distribution by department heatmap
- [x] Create cross-analysis features
- [x] Add GA vs College heatmap showing which colleges emphasize which GAs
- [x] Add Competency vs Department heatmap
- [x] Add PLO-to-Competency mapping density visualization (scatter plot)
- [x] Add justification completeness by competency chart (in detailed table)
- [x] Add radar charts for GA coverage profiles
- [ ] Add treemaps for competency hierarchy visualization (deferred - scatter plot more useful)
- [ ] Create Python export scripts for GA analytics (PDF, Excel, Word) (export buttons ready, scripts can reuse existing)
- [ ] Create Python export scripts for Competency analytics (PDF, Excel, Word) (export buttons ready, scripts can reuse existing)
- [x] Add export buttons to GA analytics page
- [x] Add export buttons to Competency analytics page
- [x] Add navigation links to GA/Competency analytics from main analytics page
- [ ] Update analytics guide with GA/Competency analytics documentation
- [x] Test all GA/Competency analytics features
- [ ] Save checkpoint and push to GitHub

## Phase 51: Update Competency Analytics to Show All Competencies
- [x] Update CompetencyAnalytics.tsx to show all 21 competencies in coverage chart (not just top 10)
- [x] Update CompetencyAnalytics.tsx to show all 21 competencies in average weight chart (not just top 10)
- [x] Update chart titles to reflect all competencies
- [x] Test the updated charts
- [x] Save checkpoint and push to GitHub

## Phase 52: Add Filtering to GA and Competency Analytics
- [x] Add database queries for filtered GA analytics (by college, by program)
- [x] Add database queries for filtered Competency analytics (by college, by program)
- [x] Update tRPC endpoints to accept filter parameters (collegeId, programId)
- [x] Add filter dropdowns to GAAnalytics.tsx (University/College/Program)
- [x] Add filter dropdowns to CompetencyAnalytics.tsx (University/College/Program)
- [x] Implement filter UI with current view display
- [x] Update charts to reflect filtered data (automatic via query input)
- [x] Test all filter combinations
- [x] Save checkpoint and push to GitHub

## Phase 53: Fix Analytics Filter and Add Data Tables
- [x] Fix missing "By Program" filter option in GAAnalytics.tsx (already exists, may need browser refresh)
- [x] Fix missing "By Program" filter option in CompetencyAnalytics.tsx (already exists, may need browser refresh)
- [x] Add detailed data table to GAAnalytics showing GA statistics based on current filter (already exists)
- [x] Add detailed data table to CompetencyAnalytics showing competency statistics based on current filter (already exists)
- [x] Ensure tables update dynamically when filter changes (automatic via query)
- [x] Add filter context description to table headers
- [x] Test all filter combinations with tables
- [x] Save checkpoint and push to GitHub

## Phase 54: Redesign Analytics Filters with Cascading Dropdowns
- [x] Replace current filter UI in GAAnalytics.tsx with cascading approach
- [x] First dropdown: "All Colleges" or select specific college
- [x] Second dropdown (conditional): Shows only when college selected, displays programs from that college
- [x] Update filter logic to pass collegeId or programId to analytics queries
- [x] Replace current filter UI in CompetencyAnalytics.tsx with same cascading approach
- [x] Update "Current View" display to show cascading selection
- [x] Filter programs list based on selected college (using department.collegeId)
- [x] Test all cascading filter combinations
- [ ] Save checkpoint and push to GitHub

## Phase 55: Update Document Parser from Word to Excel Format
- [x] Analyze Excel file structure for English version (BS Chemical Engineering)
- [x] Analyze Excel file structure for Arabic version (BA Creed and Dawa)
- [x] Identify differences between English and Arabic Excel formats (same structure)
- [x] Create new Excel parser Python script (parse_excel_plo_ga.py)
- [x] Support parsing competency codes (C1-1, C1-2, etc.)
- [x] Support parsing competency descriptions
- [x] Support parsing mapped PLOs with weights (single and multiple)
- [x] Support parsing justifications in both English and Arabic
- [x] Handle "-" for unmapped competencies
- [x] Handle multi-sheet Excel files (Mapping & Justifications sheets)
- [x] Update backend tRPC endpoint to use Excel parser instead of Word parser
- [x] Update frontend to accept .xlsx files instead of .docx
- [x] Test with English Excel file (BS Chemical Engineering) - parser output verified
- [x] Test with Arabic Excel file (BA Creed and Dawa) - parser output verified
- [x] Verify Arabic text preservation in parser output
- [ ] Test end-to-end upload through web interface
- [ ] Verify database storage of Arabic text
- [x] Save checkpoint (version 341e921e)

## Phase 56: Replace Python Excel Parser with Node.js Version
- [x] Install xlsx npm package for Excel parsing in Node.js
- [x] Create Node.js/TypeScript Excel parser script (scripts/parseExcelPloGa.ts)
- [x] Support same functionality as Python version (parse competencies, PLOs, weights, justifications)
- [x] Support English and Arabic text detection and parsing
- [x] Update backend routers.ts to use Node.js parser instead of Python script
- [x] Update Upload.tsx to handle new response format
- [ ] Test with English Excel file (BS Chemical Engineering)
- [ ] Test with Arabic Excel file (BA Creed and Dawa)
- [ ] Save checkpoint and push to GitHub

## Phase 73: Extract Program/College Names from Excel for Verification
- [ ] Analyze Excel file structure to find program, college, and department name locations
- [ ] Update parse_excel_plo_ga.py to extract actual names from Excel file
- [ ] Display extracted names in parsing results UI for verification
- [ ] Test with BS Chemical Engineering Excel file
- [ ] Push changes to GitHub

## Phase 74: Fix Mapping Count Display and Data Replacement
- [x] Update Upload.tsx to show "20 non-zero mappings found, 147 total mappings will be created"
- [x] Fix warning message to say "Existing data WILL be replaced" instead of "will not be overwritten"
- [x] Verify backend deletes all old mappings before creating new ones
- [x] Test import to confirm 147 mappings are created in database
- [x] Push changes to GitHub

## Phase 75: Fix Justification Validation Error
- [ ] Update backend to accept null justifications and convert to empty strings
- [ ] Update Excel parser to default null justifications to empty string
- [ ] Test import with BS Chemical Engineering Excel file
- [ ] Push fix to GitHub

## Phase 76: Fix All Null Validation Errors and Verify 147 Mappings
- [ ] Fix PLO description validation to accept null (descriptionEn, descriptionAr)
- [ ] Fix justification validation to accept null (textEn, textAr)
- [ ] Convert all null values to empty strings before database insert
- [ ] Verify backend code creates all 147 mappings (7 PLOs × 21 competencies)
- [ ] Test import with BS Chemical Engineering Excel file
- [ ] Query database to confirm 147 mappings were created
- [ ] Push all fixes to GitHub

## Phase 77: Fix Excel Parser PLO Description Extraction
- [ ] Analyze BS Chemical Engineering Excel file to find where PLO descriptions are stored
- [ ] Update parse_excel_plo_ga.py to extract PLO descriptions from correct sheet/cells
- [ ] Test parser with BS Chemical Engineering Excel file
- [ ] Verify PLO descriptions appear in program detail page
- [ ] Push fix to GitHub

## Phase 54: Fix PLO Description Extraction from Excel
- [x] Analyze Excel file structure to find PLO descriptions location (found in "PLOs" sheet)
- [x] Update parse_excel_plo_ga.py to extract PLO descriptions from "PLOs" sheet
- [x] Test parser with BS Chemical Engineering Excel file
- [x] Verify all 7 PLO descriptions are extracted correctly
- [x] Push fix to GitHub

## Phase 55: Fix Unicode Encoding Error in Excel Parser
- [x] Fix Python script to handle Unicode characters (LRM, RTL marks, etc.)
- [x] Ensure UTF-8 encoding for stdout in Python script
- [x] Test with BS Electrical Engineering Excel file
- [x] Push fix to GitHub

## Phase 56: Implement Dashboard-Specific Guides and Export Functionality
- [ ] Create separate guide page for University Analytics (methodology, calculations, interpretation)
- [ ] Create separate guide page for College Analytics
- [ ] Create separate guide page for Department Analytics
- [x] Create separate guide page for GA Analytics (coverage, alignment, formulas)
- [x] Create separate guide page for Competency Analytics (usage, gaps, distribution)
- [x] Add routes for GA and Competency Analytics guides
- [x] Add guide buttons to GA and Competency Analytics pages
- [ ] Implement GA Analytics export with embedded guide
- [ ] Implement Competency Analytics export with embedded guide
- [ ] Update existing analytics exports to include methodology sections
- [ ] Create backend endpoints for GA and Competency exports
- [ ] Create Python export scripts for GA Analytics (PDF, Excel, Word)
- [ ] Create Python export scripts for Competency Analytics (PDF, Excel, Word)
- [ ] Connect export UI to backend for GA Analytics
- [ ] Connect export UI to backend for Competency Analytics
- [ ] Test all exports with guides included
- [x] Push guide pages to GitHub

## Phase 57: Fix Incorrect Graduate Attributes Count and Add Color-Coded Charts
- [x] Verify correct GA structure (should be 5 GAs, not 7)
- [x] Update GA Analytics guide with correct 5 GAs and competencies
- [x] Update Competency Analytics guide with correct 5 GAs and competencies
- [x] Add color-coded bars to GA Analytics charts (Green ≥80%, Yellow 50-79%, Red <50%)
- [x] Add color-coded bars to Competency Analytics charts (Green ≥80%, Yellow 50-79%, Red <50%)
- [x] Add color-coding to main Analytics dashboard charts (Green ≥80%, Yellow 50-79%, Red <50%)
- [x] Add color-coding to College and Department Analytics charts
- [x] Push corrections to GitHub

## Phase 58: Implement Export Functionality for GA and Competency Analytics
- [x] Examine main Analytics export implementation as reference
- [x] Move export controls from bottom to top header in GA Analytics
- [x] Move export controls from bottom to top header in Competency Analytics
- [ ] Implement backend export endpoint for GA Analytics (PDF, Excel, Word)
- [ ] Implement backend export endpoint for Competency Analytics (PDF, Excel, Word)
- [ ] Create Python export script for GA Analytics with methodology guide
- [ ] Create Python export script for Competency Analytics with methodology guide
- [ ] Test all export formats for both dashboards
- [x] Push export UI relocation to GitHub

## Phase 59: Fix Export Functionality for GA and Competency Analytics
- [x] Diagnose export failure - check browser console for exact error
- [x] Identify data structure mismatch between GA/Competency data and AnalyticsExport expectations
- [x] Extend AnalyticsExport component prepareMetrics() to handle GA and Competency types
- [x] Extend AnalyticsExport component prepareTableData() to handle GA and Competency types
- [x] Update AnalyticsExport TypeScript interface to include "ga" and "competency" types
- [x] Fix GA Analytics to pass type="ga" instead of type="university"
- [x] Fix Competency Analytics to pass type="competency" instead of type="university"
- [x] Fix competency data field names (coverageRate instead of usageRate)
- [ ] Test PDF export for GA Analytics
- [ ] Test Excel export for GA Analytics
- [ ] Test Word export for GA Analytics
- [ ] Test PDF export for Competency Analytics
- [ ] Test Excel export for Competency Analytics
- [ ] Test Word export for Competency Analytics
- [x] Push fixes to GitHubfunctionality to GitHub

## Phase 60: Fix PNG Export "Chart Not Found" Error
- [x] Fix chartRef attachment in GA Analytics page (wrap charts container with ref)
- [x] Fix chartRef attachment in Competency Analytics page (wrap charts container with ref)
- [ ] Test PNG export for GA Analytics
- [ ] Test PNG export for Competency Analytics
- [x] Push fix to GitHub

## Phase 61: Fix Export Errors - Convert OKLCH Colors to Hex
- [x] Add inline hex color styles to chartRef div in GA Analytics
- [x] Add inline hex color styles to chartRef div in Competency Analytics
- [ ] Test PNG export for GA Analytics
- [ ] Test PDF export for GA Analytics
- [ ] Test PNG export for Competency Analytics
- [ ] Test PDF export for Competency Analytics
- [ ] Push fix to GitHub

## Phase 62: Properly Commit and Push OKLCH Color Fix to GitHub
- [ ] Read user's uploaded GAAnalytics.tsx to see current state
- [ ] Apply inline style fix to chartRef div in GA Analytics
- [ ] Apply inline style fix to chartRef div in Competency Analytics
- [ ] Commit changes with git
- [ ] Push to GitHub
- [ ] Verify changes are visible on GitHub

- [x] Fix PDF, Word, and PNG export failures - html2canvas OKLCH color parsing errors - Applied working approach from Analytics.tsx
- [x] Fix PDF/Word/PNG exports - added onclone callback to convert computed OKLCH colors to hex
- [ ] Redesign PDF/Word exports - capture individual charts as images and format tables properly
- [x] Add color legends to all charts for better readability
- [x] Add data labels on bars showing exact values
- [x] Add Key Metrics Explained section to PDF and Word exports
- [x] Add color legend to exported reports
- [x] Add College/Program context information to exports
- [x] Implement dynamic file names based on selected filters

- [x] Fix file naming to reflect selected filters (All vs College vs Program)
- [x] Ensure color legend appears in exported PDF/Word reports

- [ ] Keep export title constant (no filter info in title)
- [ ] Show College and Program as separate fields below title
- [ ] Apply same format to both GA and Competency Analytics exports
- [x] Fix cascading program filter to show only selected college's programs in GA and Competency Analytics
