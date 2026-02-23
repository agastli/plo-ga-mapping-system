-- ============================================================================
-- Assign CAS Departments to Clusters by Department ID
-- ============================================================================
-- This script uses subqueries to dynamically get cluster IDs based on codes
-- and updates departments by their IDs (confirmed from your screenshot)
--
-- INSTRUCTIONS:
-- 1. Verify your department IDs match the ones below
-- 2. Run each UPDATE statement separately to ensure accuracy
-- 3. Check the verification queries at the end
-- ============================================================================

-- Step 1: Verify cluster IDs and codes
SELECT id, nameEn, code FROM clusters WHERE collegeId = 1 ORDER BY code;

-- Step 2: View current department IDs and names
SELECT id, nameEn, code, clusterId FROM departments WHERE collegeId = 1 ORDER BY id;

-- ============================================================================
-- CAS-LCT (Languages, Communication and Translation)
-- ============================================================================
-- Department IDs: 1, 12, 15
-- - Arabic Language Department
-- - English Literature and Linguistics Department  
-- - Mass Communication Department
-- - Arabic for Non-Native Speakers Center

UPDATE departments 
SET clusterId = (SELECT id FROM clusters WHERE code='CAS-LCT' AND collegeId=1)
WHERE id IN (1,12,15);

-- ============================================================================
-- CAS-SSH (Social Sciences & Humanities) 
-- ============================================================================
-- Department IDs: 2, 3, 4, 13, 14, 16, 17, 18
-- - Humanities Department
-- - International Affairs Department
-- - Social Science Department
-- - Gulf Studies Center

UPDATE departments 
SET clusterId = (SELECT id FROM clusters WHERE code='CAS-SSH' AND collegeId=1)
WHERE id IN (2,3,4,13,14,16,17,18);

-- ============================================================================
-- CAS-SAS (Sciences and Applied Sciences)
-- ============================================================================
-- Department IDs: 5, 6, 7, 8, 9, 10, 11
-- - Biological and Environmental Sciences Department
-- - Chemistry and Earth Department
-- - Mathematics and Statistics Department
-- - Physics Department
-- - Sport Science Program
-- - Sustainable Development Center

UPDATE departments 
SET clusterId = (SELECT id FROM clusters WHERE code='CAS-SAS' AND collegeId=1)
WHERE id IN (5,6,7,8,9,10,11);

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check all CAS departments with their cluster assignments
SELECT 
  d.id,
  d.nameEn as department,
  d.code as deptCode,
  c.nameEn as cluster,
  c.code as clusterCode
FROM departments d
LEFT JOIN clusters c ON d.clusterId = c.id
WHERE d.collegeId = 1
ORDER BY c.code, d.id;

-- Count departments per cluster
SELECT 
  c.code as clusterCode,
  c.nameEn as cluster,
  COUNT(d.id) as department_count
FROM clusters c
LEFT JOIN departments d ON c.id = d.clusterId
WHERE c.collegeId = 1
GROUP BY c.id, c.code, c.nameEn
ORDER BY c.code;

-- Expected results:
-- clusterCode | cluster                                  | department_count
-- ------------|------------------------------------------|------------------
-- CAS-LCT     | Languages, Communication and Translation | 3-4
-- CAS-SAS     | Sciences and Applied Sciences            | 6-7
-- CAS-SSH     | Social Sciences & Humanities             | 4-8

-- Check for any CAS departments without cluster assignment
SELECT id, nameEn, code 
FROM departments 
WHERE collegeId = 1 AND clusterId IS NULL;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. The department IDs shown above are based on your screenshot
-- 2. Adjust the IDs if they differ in your actual database
-- 3. The subquery approach ensures the correct cluster ID is used even if
--    cluster IDs change
-- 4. Run verification queries after each UPDATE to confirm results
-- ============================================================================
