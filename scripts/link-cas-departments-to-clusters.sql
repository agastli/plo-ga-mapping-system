-- ============================================================================
-- Link CAS Departments to Clusters - Based on QU Organizational Structure
-- ============================================================================
-- This script updates the clusterId field in the departments table
-- to properly link CAS departments to their respective clusters
--
-- College of Arts and Sciences (CAS) has 3 clusters:
-- 1. LCT - Languages, Communication and Translation
-- 2. SSH - Social Sciences and Humanities  
-- 3. SAS - Sciences and Applied Sciences
--
-- INSTRUCTIONS:
-- 1. First, verify your cluster IDs by running the SELECT query below
-- 2. Adjust cluster IDs in UPDATE statements if they differ from 1,2,3
-- 3. Run this script on your local WAMP database
-- 4. Verify the results using the final SELECT query
-- ============================================================================

-- Step 1: Verify cluster IDs
SELECT id, nameEn, code FROM clusters WHERE collegeId = 1 ORDER BY id;
-- Expected results:
-- id | nameEn                                  | code
-- ---|----------------------------------------|------
-- 1  | Social Sciences & Humanities            | SSH
-- 2  | Languages, Communication and Translation| LCT
-- 3  | Sciences and Applied Sciences           | SAS

-- Step 2: View current departments before update
SELECT id, nameEn, code, clusterId 
FROM departments 
WHERE collegeId = 1 
ORDER BY nameEn;

-- ============================================================================
-- Step 3: UPDATE STATEMENTS - Link departments to clusters
-- ============================================================================

-- LCT Cluster (Languages, Communication and Translation) - Cluster ID = 2
UPDATE departments SET clusterId = 2 
WHERE collegeId = 1 AND nameEn IN (
  'Arabic Language Department',
  'Arabic language Department',
  'English Literature and Linguistics Department',
  'English Literature and Linguistics',
  'Mass Communication Department',
  'Mass Communication',
  'Arabic for Non-Native Speakers Center',
  'Arabic for Non-Native speakers Center'
);

-- SSH Cluster (Social Sciences and Humanities) - Cluster ID = 1
UPDATE departments SET clusterId = 1 
WHERE collegeId = 1 AND nameEn IN (
  'Humanities Department',
  'Humanities',
  'International Affairs Department',
  'International Affairs',
  'Social Science Department',
  'Social Science',
  'Gulf Studies Center'
);

-- SAS Cluster (Sciences and Applied Sciences) - Cluster ID = 3
UPDATE departments SET clusterId = 3 
WHERE collegeId = 1 AND nameEn IN (
  'Biological and Environmental Sciences Department',
  'Biological and Environmental Sciences',
  'Chemistry and Earth Department',
  'Chemistry and Earth',
  'Mathematics, Statistics and Physics Department',
  'Mathematics, Statistics and Physics',
  'Mathematics and Statistics Department',
  'Mathematics and Statistics',
  'Physics Department',
  'Physics',
  'Sport Science Program',
  'Sport Science',
  'Sustainable Development Center'
);

-- ============================================================================
-- Step 4: Verification - Check the results
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
-- Step 5: Count departments per cluster
-- ============================================================================
SELECT 
  c.nameEn as cluster,
  COUNT(d.id) as department_count
FROM clusters c
LEFT JOIN departments d ON c.id = d.clusterId
WHERE c.collegeId = 1
GROUP BY c.id, c.nameEn
ORDER BY c.id;

-- Expected results:
-- cluster                                  | department_count
-- -----------------------------------------|------------------
-- Social Sciences & Humanities             | 4
-- Languages, Communication and Translation | 4
-- Sciences and Applied Sciences            | 6

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. The UPDATE statements include variations of department names to handle
--    potential differences in naming (with/without "Department" suffix)
-- 2. If a department name doesn't match exactly, it won't be updated
-- 3. You can check which departments were NOT updated by running:
--    SELECT id, nameEn FROM departments WHERE collegeId = 1 AND clusterId IS NULL;
-- 4. For any unmatched departments, you can manually update them:
--    UPDATE departments SET clusterId = X WHERE id = Y;
-- ============================================================================
