-- ============================================================================
-- Link CAS Departments to Clusters
-- ============================================================================
-- This script updates the clusterId field in the departments table
-- to properly link departments to their respective clusters
--
-- INSTRUCTIONS:
-- 1. First, get the cluster IDs from your database:
--    SELECT id, nameEn, code FROM clusters WHERE collegeId = 1;
--
-- 2. Get your department IDs and names:
--    SELECT id, nameEn, code FROM departments WHERE collegeId = 1;
--
-- 3. Update the department IDs below based on your actual data
-- 4. Run this script on your local WAMP database
-- ============================================================================

-- Step 1: Get cluster IDs (run this first to see the IDs)
SELECT id, nameEn, code FROM clusters WHERE collegeId = 1;
-- Expected results:
-- id | nameEn                              | code
-- ---|-------------------------------------|------
-- 1  | Social Sciences & Humanities        | SSH
-- 2  | Languages, Communications & Translation | LCT
-- 3  | Sciences & Applied Sciences         | SAS

-- Step 2: View current departments (to see which need cluster assignment)
SELECT id, nameEn, code, clusterId FROM departments WHERE collegeId = 1;

-- ============================================================================
-- Step 3: UPDATE STATEMENTS - Customize based on your departments
-- ============================================================================

-- SSH Cluster (Social Sciences & Humanities) - Cluster ID = 1
-- Examples: History, Political Science, Sociology, Psychology, etc.
UPDATE departments SET clusterId = 1 
WHERE collegeId = 1 AND nameEn IN (
  'History',
  'Political Science',
  'Sociology',
  'Psychology',
  'Social Work',
  'International Affairs'
  -- Add more SSH departments here
);

-- LCT Cluster (Languages, Communications & Translation) - Cluster ID = 2
-- Examples: English, Arabic, Translation, Mass Communication, etc.
UPDATE departments SET clusterId = 2 
WHERE collegeId = 1 AND nameEn IN (
  'English Literature',
  'Arabic Language',
  'Translation',
  'Mass Communication',
  'Applied Linguistics'
  -- Add more LCT departments here
);

-- SAS Cluster (Sciences & Applied Sciences) - Cluster ID = 3
-- Examples: Mathematics, Physics, Chemistry, Biology, Computer Science, etc.
UPDATE departments SET clusterId = 3 
WHERE collegeId = 1 AND nameEn IN (
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biological Sciences',
  'Computer Science',
  'Statistics'
  -- Add more SAS departments here
);

-- ============================================================================
-- Alternative: Update by department ID (if you know the specific IDs)
-- ============================================================================

-- Example: Update specific departments by ID
-- UPDATE departments SET clusterId = 1 WHERE id IN (1, 2, 3);  -- SSH departments
-- UPDATE departments SET clusterId = 2 WHERE id IN (4, 5, 6);  -- LCT departments
-- UPDATE departments SET clusterId = 3 WHERE id IN (7, 8, 9);  -- SAS departments

-- ============================================================================
-- Verification: Check the results
-- ============================================================================
SELECT 
  d.id,
  d.nameEn as department,
  d.code as deptCode,
  c.nameEn as cluster,
  c.code as clusterCode
FROM departments d
LEFT JOIN clusters c ON d.clusterId = c.id
WHERE d.collegeId = 1
ORDER BY c.id, d.nameEn;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Departments without a cluster assignment will have clusterId = NULL
-- 2. This is intentional for colleges that don't use clusters
-- 3. Only CAS (College ID = 1) should have cluster assignments
-- 4. Other colleges should keep clusterId = NULL
-- ============================================================================
