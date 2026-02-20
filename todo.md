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
