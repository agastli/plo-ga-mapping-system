-- Seed Sample Colleges, Departments, and Programs for PLO-GA Mapping System
-- This version uses INSERT IGNORE to skip existing records
-- Run this in phpMyAdmin or MySQL command line

USE plo_ga_mapping;

-- Insert Colleges (skip if already exists)
INSERT IGNORE INTO colleges (nameEn, nameAr, createdAt, updatedAt) VALUES
('College of Business and Economics', 'كلية إدارة الأعمال والاقتصاد', NOW(), NOW()),
('College of Sport Sciences', 'كلية علوم الرياضة', NOW(), NOW()),
('College of Law', 'كلية القانون', NOW(), NOW()),
('Deanship of General Studies', 'عمادة الدراسات العامة', NOW(), NOW());

-- Get college IDs
SET @cbe_id = (SELECT id FROM colleges WHERE nameEn = 'College of Business and Economics' LIMIT 1);
SET @sport_id = (SELECT id FROM colleges WHERE nameEn = 'College of Sport Sciences' LIMIT 1);
SET @law_id = (SELECT id FROM colleges WHERE nameEn = 'College of Law' LIMIT 1);
SET @general_id = (SELECT id FROM colleges WHERE nameEn = 'Deanship of General Studies' LIMIT 1);

-- Insert Departments for College of Business and Economics
INSERT IGNORE INTO departments (nameEn, nameAr, collegeId, createdAt, updatedAt) VALUES
('Department of Accounting', 'قسم المحاسبة', @cbe_id, NOW(), NOW()),
('Department of Economics', 'قسم الاقتصاد', @cbe_id, NOW(), NOW()),
('Department of Finance', 'قسم المالية', @cbe_id, NOW(), NOW()),
('Department of Management', 'قسم الإدارة', @cbe_id, NOW(), NOW()),
('Department of Management Information Systems', 'قسم نظم المعلومات الإدارية', @cbe_id, NOW(), NOW()),
('Department of Marketing', 'قسم التسويق', @cbe_id, NOW(), NOW());

-- Insert Departments for College of Sport Sciences
INSERT IGNORE INTO departments (nameEn, nameAr, collegeId, createdAt, updatedAt) VALUES
('Department of Sport Coaching', 'قسم التدريب الرياضي', @sport_id, NOW(), NOW()),
('Department of Sport Management', 'قسم الإدارة الرياضية', @sport_id, NOW(), NOW()),
('Department of Physical Education', 'قسم التربية البدنية', @sport_id, NOW(), NOW());

-- Insert Department for College of Law
INSERT IGNORE INTO departments (nameEn, nameAr, collegeId, createdAt, updatedAt) VALUES
('Department of Law', 'قسم القانون', @law_id, NOW(), NOW());

-- Insert Departments for General Studies
INSERT IGNORE INTO departments (nameEn, nameAr, collegeId, createdAt, updatedAt) VALUES
('Honors Program', 'برنامج الشرف', @general_id, NOW(), NOW()),
('Foundation Program', 'البرنامج التأسيسي', @general_id, NOW(), NOW()),
('Core Curriculum Program', 'برنامج المناهج الأساسية', @general_id, NOW(), NOW());

-- Get department IDs
SET @accounting_dept = (SELECT id FROM departments WHERE nameEn = 'Department of Accounting' LIMIT 1);
SET @economics_dept = (SELECT id FROM departments WHERE nameEn = 'Department of Economics' LIMIT 1);
SET @finance_dept = (SELECT id FROM departments WHERE nameEn = 'Department of Finance' LIMIT 1);
SET @management_dept = (SELECT id FROM departments WHERE nameEn = 'Department of Management' LIMIT 1);
SET @mis_dept = (SELECT id FROM departments WHERE nameEn = 'Department of Management Information Systems' LIMIT 1);
SET @marketing_dept = (SELECT id FROM departments WHERE nameEn = 'Department of Marketing' LIMIT 1);
SET @sport_coaching_dept = (SELECT id FROM departments WHERE nameEn = 'Department of Sport Coaching' LIMIT 1);
SET @sport_mgmt_dept = (SELECT id FROM departments WHERE nameEn = 'Department of Sport Management' LIMIT 1);
SET @pe_dept = (SELECT id FROM departments WHERE nameEn = 'Department of Physical Education' LIMIT 1);
SET @law_dept = (SELECT id FROM departments WHERE nameEn = 'Department of Law' LIMIT 1);
SET @honors_dept = (SELECT id FROM departments WHERE nameEn = 'Honors Program' LIMIT 1);
SET @foundation_dept = (SELECT id FROM departments WHERE nameEn = 'Foundation Program' LIMIT 1);
SET @ccp_dept = (SELECT id FROM departments WHERE nameEn = 'Core Curriculum Program' LIMIT 1);

-- Insert Programs for College of Business and Economics
INSERT IGNORE INTO programs (nameEn, nameAr, departmentId, language, createdAt, updatedAt) VALUES
('Bachelor of Business Administration in Accounting', 'بكالوريوس إدارة الأعمال في المحاسبة', @accounting_dept, 'en', NOW(), NOW()),
('Bachelor of Business Administration in Economics', 'بكالوريوس إدارة الأعمال في الاقتصاد', @economics_dept, 'en', NOW(), NOW()),
('Bachelor of Business Administration in Finance', 'بكالوريوس إدارة الأعمال في المالية', @finance_dept, 'en', NOW(), NOW()),
('Bachelor of Business Administration in Management', 'بكالوريوس إدارة الأعمال في الإدارة', @management_dept, 'en', NOW(), NOW()),
('Bachelor of Business Administration in Management Information Systems', 'بكالوريوس إدارة الأعمال في نظم المعلومات الإدارية', @mis_dept, 'en', NOW(), NOW()),
('Bachelor of Business Administration in Marketing', 'بكالوريوس إدارة الأعمال في التسويق', @marketing_dept, 'en', NOW(), NOW());

-- Insert Programs for College of Sport Sciences
INSERT IGNORE INTO programs (nameEn, nameAr, departmentId, language, createdAt, updatedAt) VALUES
('Bachelor of Science in Sport Coaching', 'بكالوريوس العلوم في التدريب الرياضي', @sport_coaching_dept, 'en', NOW(), NOW()),
('Bachelor of Science in Sport Management', 'بكالوريوس العلوم في الإدارة الرياضية', @sport_mgmt_dept, 'en', NOW(), NOW()),
('Bachelor of Science in Physical Education', 'بكالوريوس العلوم في التربية البدنية', @pe_dept, 'en', NOW(), NOW());

-- Insert Program for College of Law
INSERT IGNORE INTO programs (nameEn, nameAr, departmentId, language, createdAt, updatedAt) VALUES
('Bachelor of Law', 'بكالوريوس القانون', @law_dept, 'ar', NOW(), NOW());

-- Insert Programs for General Studies
INSERT IGNORE INTO programs (nameEn, nameAr, departmentId, language, createdAt, updatedAt) VALUES
('Honors Program', 'برنامج الشرف', @honors_dept, 'en', NOW(), NOW()),
('Foundation Program', 'البرنامج التأسيسي', @foundation_dept, 'en', NOW(), NOW()),
('Core Curriculum Program', 'برنامج المناهج الأساسية', @ccp_dept, 'both', NOW(), NOW());

-- Display summary
SELECT 
    'Summary' as Info,
    (SELECT COUNT(*) FROM colleges) as Colleges,
    (SELECT COUNT(*) FROM departments) as Departments,
    (SELECT COUNT(*) FROM programs) as Programs;

-- Display all programs with their departments and colleges
SELECT 
    c.nameEn as College,
    d.nameEn as Department,
    p.nameEn as Program,
    p.language as Language
FROM programs p
JOIN departments d ON p.departmentId = d.id
JOIN colleges c ON d.collegeId = c.id
ORDER BY c.nameEn, d.nameEn, p.nameEn;
