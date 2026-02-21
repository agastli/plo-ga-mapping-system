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
- [ ] Test all three export formats
- [ ] Push changes to GitHub
