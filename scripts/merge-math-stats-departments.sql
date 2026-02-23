-- Merge Mathematics and Statistics Departments
-- This script will:
-- 1. Show current Mathematics and Statistics departments with their programs
-- 2. Move Statistics program to Mathematics department
-- 3. Rename Mathematics department to "Mathematics and Statistics"
-- 4. Delete the Statistics department

-- Step 1: View current departments and their programs
SELECT 
    d.id AS dept_id,
    d.nameEn AS department_name,
    d.code AS dept_code,
    p.id AS program_id,
    p.nameEn AS program_name,
    p.code AS program_code
FROM departments d
LEFT JOIN programs p ON p.departmentId = d.id
WHERE d.nameEn LIKE '%Mathematics%' OR d.nameEn LIKE '%Statistics%'
ORDER BY d.nameEn;

-- Step 2: Find the department IDs (you'll need to note these)
SET @math_dept_id = (SELECT id FROM departments WHERE nameEn = 'Mathematics' LIMIT 1);
SET @stats_dept_id = (SELECT id FROM departments WHERE nameEn = 'Statistics' LIMIT 1);

-- Display the IDs for verification
SELECT @math_dept_id AS 'Mathematics Dept ID', @stats_dept_id AS 'Statistics Dept ID';

-- Step 3: Move Statistics program to Mathematics department
UPDATE programs 
SET departmentId = @math_dept_id 
WHERE departmentId = @stats_dept_id;

-- Step 4: Rename Mathematics department to "Mathematics and Statistics"
UPDATE departments 
SET 
    nameEn = 'Mathematics and Statistics',
    nameAr = 'الرياضيات والإحصاء',
    code = 'CAS-MATH-STAT'
WHERE id = @math_dept_id;

-- Step 5: Delete the Statistics department (now empty)
DELETE FROM departments WHERE id = @stats_dept_id;

-- Step 6: Verify the merge
SELECT 
    d.id AS dept_id,
    d.nameEn AS department_name,
    d.code AS dept_code,
    COUNT(p.id) AS program_count,
    GROUP_CONCAT(p.nameEn SEPARATOR ', ') AS programs
FROM departments d
LEFT JOIN programs p ON p.departmentId = d.id
WHERE d.id = @math_dept_id
GROUP BY d.id, d.nameEn, d.code;

SELECT 'Department merge completed successfully!' AS Status;
