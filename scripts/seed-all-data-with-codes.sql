-- Complete SQL script to seed all colleges, departments, and programs
-- with unique codes for the PLO-GA Mapping System
-- Run this in phpMyAdmin SQL tab

USE plo_ga_mapping;

-- ============================================
-- STEP 1: Insert Colleges with unique codes
-- ============================================

INSERT INTO colleges (nameEn, nameAr, code, createdAt, updatedAt) VALUES
('College of Business and Economics', 'كلية إدارة الأعمال والاقتصاد', 'CBE', NOW(), NOW()),
('College of Sport Sciences', 'كلية علوم الرياضة', 'CSS', NOW(), NOW()),
('College of Law', 'كلية القانون', 'LAW', NOW(), NOW()),
('Deanship of General Studies', 'عمادة الدراسات العامة', 'DGS', NOW(), NOW());

-- Get college IDs
SET @cbe_id = (SELECT id FROM colleges WHERE code = 'CBE' LIMIT 1);
SET @sport_id = (SELECT id FROM colleges WHERE code = 'CSS' LIMIT 1);
SET @law_id = (SELECT id FROM colleges WHERE code = 'LAW' LIMIT 1);
SET @general_id = (SELECT id FROM colleges WHERE code = 'DGS' LIMIT 1);

-- ============================================
-- STEP 2: Insert Departments with unique codes
-- ============================================

-- College of Business and Economics Departments
INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Department of Accounting', 'قسم المحاسبة', @cbe_id, 'CBE-ACC', NOW(), NOW()),
('Department of Economics', 'قسم الاقتصاد', @cbe_id, 'CBE-ECO', NOW(), NOW()),
('Department of Finance', 'قسم المالية', @cbe_id, 'CBE-FIN', NOW(), NOW()),
('Department of Management', 'قسم الإدارة', @cbe_id, 'CBE-MGT', NOW(), NOW()),
('Department of Management Information Systems', 'قسم نظم المعلومات الإدارية', @cbe_id, 'CBE-MIS', NOW(), NOW()),
('Department of Marketing', 'قسم التسويق', @cbe_id, 'CBE-MKT', NOW(), NOW());

-- College of Sport Sciences Departments
INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Department of Sport Coaching', 'قسم التدريب الرياضي', @sport_id, 'CSS-SCH', NOW(), NOW()),
('Department of Sport Management', 'قسم الإدارة الرياضية', @sport_id, 'CSS-SMG', NOW(), NOW()),
('Department of Physical Education', 'قسم التربية البدنية', @sport_id, 'CSS-PED', NOW(), NOW());

-- College of Law Department
INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Department of Law', 'قسم القانون', @law_id, 'LAW-LAW', NOW(), NOW());

-- Deanship of General Studies Departments
INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Honors Program', 'برنامج الشرف', @general_id, 'DGS-HON', NOW(), NOW()),
('Foundation Program', 'البرنامج التأسيسي', @general_id, 'DGS-FND', NOW(), NOW()),
('Core Curriculum Program', 'برنامج المناهج الأساسية', @general_id, 'DGS-CCP', NOW(), NOW());

-- Get department IDs
SET @accounting_dept = (SELECT id FROM departments WHERE code = 'CBE-ACC' LIMIT 1);
SET @economics_dept = (SELECT id FROM departments WHERE code = 'CBE-ECO' LIMIT 1);
SET @finance_dept = (SELECT id FROM departments WHERE code = 'CBE-FIN' LIMIT 1);
SET @management_dept = (SELECT id FROM departments WHERE code = 'CBE-MGT' LIMIT 1);
SET @mis_dept = (SELECT id FROM departments WHERE code = 'CBE-MIS' LIMIT 1);
SET @marketing_dept = (SELECT id FROM departments WHERE code = 'CBE-MKT' LIMIT 1);
SET @sport_coaching_dept = (SELECT id FROM departments WHERE code = 'CSS-SCH' LIMIT 1);
SET @sport_mgmt_dept = (SELECT id FROM departments WHERE code = 'CSS-SMG' LIMIT 1);
SET @pe_dept = (SELECT id FROM departments WHERE code = 'CSS-PED' LIMIT 1);
SET @law_dept = (SELECT id FROM departments WHERE code = 'LAW-LAW' LIMIT 1);
SET @honors_dept = (SELECT id FROM departments WHERE code = 'DGS-HON' LIMIT 1);
SET @foundation_dept = (SELECT id FROM departments WHERE code = 'DGS-FND' LIMIT 1);
SET @ccp_dept = (SELECT id FROM departments WHERE code = 'DGS-CCP' LIMIT 1);

-- ============================================
-- STEP 3: Insert Programs with unique codes
-- ============================================

-- College of Business and Economics Programs
INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Bachelor of Business Administration in Accounting', 'بكالوريوس إدارة الأعمال في المحاسبة', @accounting_dept, 'CBE-ACC-BBA', 'en', NOW(), NOW()),
('Bachelor of Business Administration in Economics', 'بكالوريوس إدارة الأعمال في الاقتصاد', @economics_dept, 'CBE-ECO-BBA', 'en', NOW(), NOW()),
('Bachelor of Business Administration in Finance', 'بكالوريوس إدارة الأعمال في المالية', @finance_dept, 'CBE-FIN-BBA', 'en', NOW(), NOW()),
('Bachelor of Business Administration in Management', 'بكالوريوس إدارة الأعمال في الإدارة', @management_dept, 'CBE-MGT-BBA', 'en', NOW(), NOW()),
('Bachelor of Business Administration in Management Information Systems', 'بكالوريوس إدارة الأعمال في نظم المعلومات الإدارية', @mis_dept, 'CBE-MIS-BBA', 'en', NOW(), NOW()),
('Bachelor of Business Administration in Marketing', 'بكالوريوس إدارة الأعمال في التسويق', @marketing_dept, 'CBE-MKT-BBA', 'en', NOW(), NOW());

-- College of Sport Sciences Programs
INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Bachelor of Science in Sport Coaching', 'بكالوريوس العلوم في التدريب الرياضي', @sport_coaching_dept, 'CSS-SCH-BSC', 'en', NOW(), NOW()),
('Bachelor of Science in Sport Management', 'بكالوريوس العلوم في الإدارة الرياضية', @sport_mgmt_dept, 'CSS-SMG-BSC', 'en', NOW(), NOW()),
('Bachelor of Science in Physical Education', 'بكالوريوس العلوم في التربية البدنية', @pe_dept, 'CSS-PED-BSC', 'en', NOW(), NOW());

-- College of Law Program
INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Bachelor of Law', 'بكالوريوس القانون', @law_dept, 'LAW-LAW-LLB', 'ar', NOW(), NOW());

-- Deanship of General Studies Programs
INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Honors Program', 'برنامج الشرف', @honors_dept, 'DGS-HON-PRG', 'en', NOW(), NOW()),
('Foundation Program', 'البرنامج التأسيسي', @foundation_dept, 'DGS-FND-PRG', 'en', NOW(), NOW()),
('Core Curriculum Program', 'برنامج المناهج الأساسية', @ccp_dept, 'DGS-CCP-PRG', 'both', NOW(), NOW());

-- ============================================
-- STEP 4: Display Summary
-- ============================================

SELECT 
    '=== SUMMARY ===' as Info,
    (SELECT COUNT(*) FROM colleges) as Colleges,
    (SELECT COUNT(*) FROM departments) as Departments,
    (SELECT COUNT(*) FROM programs) as Programs;

-- Display all colleges
SELECT '=== COLLEGES ===' as Info;
SELECT id, nameEn, code FROM colleges ORDER BY id;

-- Display all departments with their colleges
SELECT '=== DEPARTMENTS ===' as Info;
SELECT 
    d.id,
    c.nameEn as College,
    d.nameEn as Department,
    d.code
FROM departments d
JOIN colleges c ON d.collegeId = c.id
ORDER BY c.nameEn, d.nameEn;

-- Display all programs with their departments and colleges
SELECT '=== PROGRAMS ===' as Info;
SELECT 
    p.id,
    c.nameEn as College,
    d.nameEn as Department,
    p.nameEn as Program,
    p.code,
    p.language
FROM programs p
JOIN departments d ON p.departmentId = d.id
JOIN colleges c ON d.collegeId = c.id
ORDER BY c.nameEn, d.nameEn, p.nameEn;
