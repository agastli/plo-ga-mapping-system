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
