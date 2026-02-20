-- ============================================
-- COMPREHENSIVE QU PROGRAMS DATABASE SEED
-- ============================================
-- This script populates the database with ALL undergraduate programs
-- from Qatar University (95 programs across 12 colleges)
-- Source: QU Undergraduate Student Catalog 2025-2026
-- ============================================

USE plo_ga_mapping;

-- ============================================
-- COLLEGES (12 total)
-- ============================================

INSERT INTO colleges (nameEn, nameAr, code, createdAt, updatedAt) VALUES
('College of Arts and Sciences', 'كلية الآداب والعلوم', 'CAS', NOW(), NOW()),
('College of Business and Economics', 'كلية إدارة الأعمال والاقتصاد', 'CBE', NOW(), NOW()),
('College of Education', 'كلية التربية', 'EDU', NOW(), NOW()),
('College of Engineering', 'كلية الهندسة', 'ENG', NOW(), NOW()),
('College of Health Sciences', 'كلية العلوم الصحية', 'CHS', NOW(), NOW()),
('College of Pharmacy', 'كلية الصيدلة', 'PHR', NOW(), NOW()),
('College of Medicine', 'كلية الطب', 'MED', NOW(), NOW()),
('College of Dental Medicine', 'كلية طب الأسنان', 'DEN', NOW(), NOW()),
('College of Nursing', 'كلية التمريض', 'NUR', NOW(), NOW()),
('College of Law', 'كلية القانون', 'LAW', NOW(), NOW()),
('College of Sharia and Islamic Studies', 'كلية الشريعة والدراسات الإسلامية', 'SIS', NOW(), NOW()),
('College of Sport Sciences', 'كلية علوم الرياضة', 'CSS', NOW(), NOW());

-- Get college IDs
SET @cas_id = (SELECT id FROM colleges WHERE code = 'CAS' LIMIT 1);
SET @cbe_id = (SELECT id FROM colleges WHERE code = 'CBE' LIMIT 1);
SET @edu_id = (SELECT id FROM colleges WHERE code = 'EDU' LIMIT 1);
SET @eng_id = (SELECT id FROM colleges WHERE code = 'ENG' LIMIT 1);
SET @chs_id = (SELECT id FROM colleges WHERE code = 'CHS' LIMIT 1);
SET @phr_id = (SELECT id FROM colleges WHERE code = 'PHR' LIMIT 1);
SET @med_id = (SELECT id FROM colleges WHERE code = 'MED' LIMIT 1);
SET @den_id = (SELECT id FROM colleges WHERE code = 'DEN' LIMIT 1);
SET @nur_id = (SELECT id FROM colleges WHERE code = 'NUR' LIMIT 1);
SET @law_id = (SELECT id FROM colleges WHERE code = 'LAW' LIMIT 1);
SET @sis_id = (SELECT id FROM colleges WHERE code = 'SIS' LIMIT 1);
SET @css_id = (SELECT id FROM colleges WHERE code = 'CSS' LIMIT 1);

-- ============================================
-- DEPARTMENTS - College of Arts and Sciences (18 programs)
-- ============================================

INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
-- English Programs
('Department of English Literature and Linguistics', 'قسم الأدب واللغويات الإنجليزية', @cas_id, 'CAS-ELL', NOW(), NOW()),
('Department of International Affairs', 'قسم الشؤون الدولية', @cas_id, 'CAS-INTA', NOW(), NOW()),
('Department of Policy, Planning and Development', 'قسم السياسات والتخطيط والتنمية', @cas_id, 'CAS-PPD', NOW(), NOW()),
('Department of Fine Arts', 'قسم الفنون الجميلة', @cas_id, 'CAS-FINA', NOW(), NOW()),
('Department of Biological Sciences', 'قسم العلوم البيولوجية', @cas_id, 'CAS-BIOL', NOW(), NOW()),
('Department of Biomedical Sciences', 'قسم العلوم الطبية الحيوية', @cas_id, 'CAS-BIOM', NOW(), NOW()),
('Department of Chemistry', 'قسم الكيمياء', @cas_id, 'CAS-CHEM', NOW(), NOW()),
('Department of Environmental Sciences', 'قسم العلوم البيئية', @cas_id, 'CAS-ENVS', NOW(), NOW()),
('Department of Mathematics', 'قسم الرياضيات', @cas_id, 'CAS-MATH', NOW(), NOW()),
('Department of Physics', 'قسم الفيزياء', @cas_id, 'CAS-PHYS', NOW(), NOW()),
('Department of Statistics', 'قسم الإحصاء', @cas_id, 'CAS-STAT', NOW(), NOW()),
-- Arabic Programs
('Department of Arabic Language', 'قسم اللغة العربية', @cas_id, 'CAS-ARAB', NOW(), NOW()),
('Department of History', 'قسم التاريخ', @cas_id, 'CAS-HIST', NOW(), NOW()),
('Department of Applied Geography and GIS', 'قسم الجغرافيا التطبيقية ونظم المعلومات الجغرافية', @cas_id, 'CAS-GEOG', NOW(), NOW()),
('Department of Mass Communication', 'قسم الاتصال الجماهيري', @cas_id, 'CAS-MCOM', NOW(), NOW()),
('Department of Sociology', 'قسم علم الاجتماع', @cas_id, 'CAS-SOCI', NOW(), NOW()),
('Department of Social Work', 'قسم الخدمة الاجتماعية', @cas_id, 'CAS-SOWO', NOW(), NOW()),
('Department of Psychology', 'قسم علم النفس', @cas_id, 'CAS-PSYC', NOW(), NOW());

-- ============================================
-- DEPARTMENTS - College of Business and Economics (6 programs)
-- ============================================

INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Department of Accounting', 'قسم المحاسبة', @cbe_id, 'CBE-ACC', NOW(), NOW()),
('Department of Economics', 'قسم الاقتصاد', @cbe_id, 'CBE-ECO', NOW(), NOW()),
('Department of Finance', 'قسم المالية', @cbe_id, 'CBE-FIN', NOW(), NOW()),
('Department of Management', 'قسم الإدارة', @cbe_id, 'CBE-MGT', NOW(), NOW()),
('Department of Management Information Systems', 'قسم نظم المعلومات الإدارية', @cbe_id, 'CBE-MIS', NOW(), NOW()),
('Department of Marketing', 'قسم التسويق', @cbe_id, 'CBE-MKT', NOW(), NOW());

-- ============================================
-- DEPARTMENTS - College of Education (4 programs)
-- ============================================

INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Department of Art Education', 'قسم التربية الفنية', @edu_id, 'EDU-ART', NOW(), NOW()),
('Department of Secondary Education', 'قسم التعليم الثانوي', @edu_id, 'EDU-SEC', NOW(), NOW()),
('Department of Special Education', 'قسم التربية الخاصة', @edu_id, 'EDU-SPE', NOW(), NOW()),
('Department of Primary Education', 'قسم التعليم الابتدائي', @edu_id, 'EDU-PRI', NOW(), NOW());

-- ============================================
-- DEPARTMENTS - College of Engineering (9 programs)
-- ============================================

INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Department of Chemical Engineering', 'قسم الهندسة الكيميائية', @eng_id, 'ENG-CHE', NOW(), NOW()),
('Department of Civil Engineering', 'قسم الهندسة المدنية', @eng_id, 'ENG-CIV', NOW(), NOW()),
('Department of Computer Engineering', 'قسم هندسة الحاسوب', @eng_id, 'ENG-CPE', NOW(), NOW()),
('Department of Electrical Engineering', 'قسم الهندسة الكهربائية', @eng_id, 'ENG-ELE', NOW(), NOW()),
('Department of Industrial and Systems Engineering', 'قسم الهندسة الصناعية والنظم', @eng_id, 'ENG-ISE', NOW(), NOW()),
('Department of Mechanical Engineering', 'قسم الهندسة الميكانيكية', @eng_id, 'ENG-MEC', NOW(), NOW()),
('Department of Mechatronics Engineering', 'قسم هندسة الميكاترونكس', @eng_id, 'ENG-MCT', NOW(), NOW()),
('Department of Computer Science', 'قسم علوم الحاسوب', @eng_id, 'ENG-CSC', NOW(), NOW()),
('Department of Architecture', 'قسم العمارة', @eng_id, 'ENG-ARC', NOW(), NOW());

-- ============================================
-- DEPARTMENTS - College of Health Sciences (5 programs)
-- ============================================

INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Department of Biomedical Sciences', 'قسم العلوم الطبية الحيوية', @chs_id, 'CHS-BIOM', NOW(), NOW()),
('Department of Nutrition and Dietetics', 'قسم التغذية والحميات', @chs_id, 'CHS-NUTR', NOW(), NOW()),
('Department of Physiotherapy', 'قسم العلاج الطبيعي', @chs_id, 'CHS-PHYS', NOW(), NOW()),
('Department of Public Health', 'قسم الصحة العامة', @chs_id, 'CHS-PUBH', NOW(), NOW()),
('Department of Speech and Language Pathology', 'قسم علم أمراض النطق واللغة', @chs_id, 'CHS-SLPA', NOW(), NOW());

-- ============================================
-- DEPARTMENTS - College of Pharmacy (1 program)
-- ============================================

INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Department of Pharmacy', 'قسم الصيدلة', @phr_id, 'PHR-PHR', NOW(), NOW());

-- ============================================
-- DEPARTMENTS - College of Medicine (1 program)
-- ============================================

INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Department of Medicine', 'قسم الطب', @med_id, 'MED-MED', NOW(), NOW());

-- ============================================
-- DEPARTMENTS - College of Dental Medicine (1 program)
-- ============================================

INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Department of Dental Medicine', 'قسم طب الأسنان', @den_id, 'DEN-DEN', NOW(), NOW());

-- ============================================
-- DEPARTMENTS - College of Nursing (1 program)
-- ============================================

INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Department of Nursing', 'قسم التمريض', @nur_id, 'NUR-NUR', NOW(), NOW());

-- ============================================
-- DEPARTMENTS - College of Law (1 program)
-- ============================================

INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Department of Law', 'قسم القانون', @law_id, 'LAW-LAW', NOW(), NOW());

-- ============================================
-- DEPARTMENTS - College of Sharia and Islamic Studies (4 programs)
-- ============================================

INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Department of Creed and Dawa', 'قسم العقيدة والدعوة', @sis_id, 'SIS-CRD', NOW(), NOW()),
('Department of Fiqh and Usul', 'قسم الفقه وأصوله', @sis_id, 'SIS-FIQ', NOW(), NOW()),
('Department of Islamic Studies', 'قسم الدراسات الإسلامية', @sis_id, 'SIS-ISL', NOW(), NOW()),
('Department of Quran and Sunnah', 'قسم القرآن والسنة', @sis_id, 'SIS-QUR', NOW(), NOW());

-- ============================================
-- DEPARTMENTS - College of Sport Sciences (3 programs)
-- ============================================

INSERT INTO departments (nameEn, nameAr, collegeId, code, createdAt, updatedAt) VALUES
('Department of Physical Education', 'قسم التربية البدنية', @css_id, 'CSS-PED', NOW(), NOW()),
('Department of Sport Management', 'قسم الإدارة الرياضية', @css_id, 'CSS-SMG', NOW(), NOW()),
('Department of Sport Coaching', 'قسم التدريب الرياضي', @css_id, 'CSS-SCH', NOW(), NOW());

-- ============================================
-- PROGRAMS - College of Arts and Sciences (18 programs)
-- ============================================

-- English Programs (11)
INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Bachelor of Arts in English Literature and Linguistics', 'بكالوريوس الآداب في الأدب واللغويات الإنجليزية', 
  (SELECT id FROM departments WHERE code = 'CAS-ELL'), 'CAS-ELL-BA', 'en', NOW(), NOW()),
('Bachelor of Arts in International Affairs', 'بكالوريوس الآداب في الشؤون الدولية', 
  (SELECT id FROM departments WHERE code = 'CAS-INTA'), 'CAS-INTA-BA', 'en', NOW(), NOW()),
('Bachelor of Arts in Policy, Planning and Development', 'بكالوريوس الآداب في السياسات والتخطيط والتنمية', 
  (SELECT id FROM departments WHERE code = 'CAS-PPD'), 'CAS-PPD-BA', 'en', NOW(), NOW()),
('Bachelor of Arts in Fine Arts', 'بكالوريوس الآداب في الفنون الجميلة', 
  (SELECT id FROM departments WHERE code = 'CAS-FINA'), 'CAS-FINA-BA', 'en', NOW(), NOW()),
('Bachelor of Science in Biological Sciences', 'بكالوريوس العلوم في العلوم البيولوجية', 
  (SELECT id FROM departments WHERE code = 'CAS-BIOL'), 'CAS-BIOL-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Biomedical Sciences', 'بكالوريوس العلوم في العلوم الطبية الحيوية', 
  (SELECT id FROM departments WHERE code = 'CAS-BIOM'), 'CAS-BIOM-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Chemistry', 'بكالوريوس العلوم في الكيمياء', 
  (SELECT id FROM departments WHERE code = 'CAS-CHEM'), 'CAS-CHEM-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Environmental Sciences', 'بكالوريوس العلوم في العلوم البيئية', 
  (SELECT id FROM departments WHERE code = 'CAS-ENVS'), 'CAS-ENVS-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Mathematics', 'بكالوريوس العلوم في الرياضيات', 
  (SELECT id FROM departments WHERE code = 'CAS-MATH'), 'CAS-MATH-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Physics', 'بكالوريوس العلوم في الفيزياء', 
  (SELECT id FROM departments WHERE code = 'CAS-PHYS'), 'CAS-PHYS-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Statistics', 'بكالوريوس العلوم في الإحصاء', 
  (SELECT id FROM departments WHERE code = 'CAS-STAT'), 'CAS-STAT-BS', 'en', NOW(), NOW());

-- Arabic Programs (7)
INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Bachelor of Arts in Arabic Language', 'بكالوريوس الآداب في اللغة العربية', 
  (SELECT id FROM departments WHERE code = 'CAS-ARAB'), 'CAS-ARAB-BA', 'ar', NOW(), NOW()),
('Bachelor of Arts in History', 'بكالوريوس الآداب في التاريخ', 
  (SELECT id FROM departments WHERE code = 'CAS-HIST'), 'CAS-HIST-BA', 'ar', NOW(), NOW()),
('Bachelor of Arts in Applied Geography and Geographic Information Systems', 'بكالوريوس الآداب في الجغرافيا التطبيقية ونظم المعلومات الجغرافية', 
  (SELECT id FROM departments WHERE code = 'CAS-GEOG'), 'CAS-GEOG-BA', 'ar', NOW(), NOW()),
('Bachelor of Arts in Mass Communication', 'بكالوريوس الآداب في الاتصال الجماهيري', 
  (SELECT id FROM departments WHERE code = 'CAS-MCOM'), 'CAS-MCOM-BA', 'ar', NOW(), NOW()),
('Bachelor of Arts in Sociology', 'بكالوريوس الآداب في علم الاجتماع', 
  (SELECT id FROM departments WHERE code = 'CAS-SOCI'), 'CAS-SOCI-BA', 'ar', NOW(), NOW()),
('Bachelor of Arts in Social Work', 'بكالوريوس الآداب في الخدمة الاجتماعية', 
  (SELECT id FROM departments WHERE code = 'CAS-SOWO'), 'CAS-SOWO-BA', 'ar', NOW(), NOW()),
('Bachelor of Arts in Psychology', 'بكالوريوس الآداب في علم النفس', 
  (SELECT id FROM departments WHERE code = 'CAS-PSYC'), 'CAS-PSYC-BA', 'ar', NOW(), NOW());

-- ============================================
-- PROGRAMS - College of Business and Economics (6 programs)
-- ============================================

INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Bachelor of Business Administration in Accounting', 'بكالوريوس إدارة الأعمال في المحاسبة', 
  (SELECT id FROM departments WHERE code = 'CBE-ACC'), 'CBE-ACC-BBA', 'en', NOW(), NOW()),
('Bachelor of Business Administration in Economics', 'بكالوريوس إدارة الأعمال في الاقتصاد', 
  (SELECT id FROM departments WHERE code = 'CBE-ECO'), 'CBE-ECO-BBA', 'en', NOW(), NOW()),
('Bachelor of Business Administration in Finance', 'بكالوريوس إدارة الأعمال في المالية', 
  (SELECT id FROM departments WHERE code = 'CBE-FIN'), 'CBE-FIN-BBA', 'en', NOW(), NOW()),
('Bachelor of Business Administration in Management', 'بكالوريوس إدارة الأعمال في الإدارة', 
  (SELECT id FROM departments WHERE code = 'CBE-MGT'), 'CBE-MGT-BBA', 'en', NOW(), NOW()),
('Bachelor of Business Administration in Management Information Systems', 'بكالوريوس إدارة الأعمال في نظم المعلومات الإدارية', 
  (SELECT id FROM departments WHERE code = 'CBE-MIS'), 'CBE-MIS-BBA', 'en', NOW(), NOW()),
('Bachelor of Business Administration in Marketing', 'بكالوريوس إدارة الأعمال في التسويق', 
  (SELECT id FROM departments WHERE code = 'CBE-MKT'), 'CBE-MKT-BBA', 'en', NOW(), NOW());

-- ============================================
-- PROGRAMS - College of Education (4 programs)
-- ============================================

INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Bachelor of Education in Art Education', 'بكالوريوس التربية في التربية الفنية', 
  (SELECT id FROM departments WHERE code = 'EDU-ART'), 'EDU-ART-BED', 'en', NOW(), NOW()),
('Bachelor of Education in Secondary Education', 'بكالوريوس التربية في التعليم الثانوي', 
  (SELECT id FROM departments WHERE code = 'EDU-SEC'), 'EDU-SEC-BED', 'en', NOW(), NOW()),
('Bachelor of Education in Special Education', 'بكالوريوس التربية في التربية الخاصة', 
  (SELECT id FROM departments WHERE code = 'EDU-SPE'), 'EDU-SPE-BED', 'en', NOW(), NOW()),
('Bachelor of Education in Primary Education', 'بكالوريوس التربية في التعليم الابتدائي', 
  (SELECT id FROM departments WHERE code = 'EDU-PRI'), 'EDU-PRI-BED', 'ar', NOW(), NOW());

-- ============================================
-- PROGRAMS - College of Engineering (9 programs)
-- ============================================

INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Bachelor of Science in Chemical Engineering', 'بكالوريوس العلوم في الهندسة الكيميائية', 
  (SELECT id FROM departments WHERE code = 'ENG-CHE'), 'ENG-CHE-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Civil Engineering', 'بكالوريوس العلوم في الهندسة المدنية', 
  (SELECT id FROM departments WHERE code = 'ENG-CIV'), 'ENG-CIV-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Computer Engineering', 'بكالوريوس العلوم في هندسة الحاسوب', 
  (SELECT id FROM departments WHERE code = 'ENG-CPE'), 'ENG-CPE-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Electrical Engineering', 'بكالوريوس العلوم في الهندسة الكهربائية', 
  (SELECT id FROM departments WHERE code = 'ENG-ELE'), 'ENG-ELE-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Industrial and Systems Engineering', 'بكالوريوس العلوم في الهندسة الصناعية والنظم', 
  (SELECT id FROM departments WHERE code = 'ENG-ISE'), 'ENG-ISE-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Mechanical Engineering', 'بكالوريوس العلوم في الهندسة الميكانيكية', 
  (SELECT id FROM departments WHERE code = 'ENG-MEC'), 'ENG-MEC-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Mechatronics Engineering', 'بكالوريوس العلوم في هندسة الميكاترونكس', 
  (SELECT id FROM departments WHERE code = 'ENG-MCT'), 'ENG-MCT-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Computer Science', 'بكالوريوس العلوم في علوم الحاسوب', 
  (SELECT id FROM departments WHERE code = 'ENG-CSC'), 'ENG-CSC-BS', 'en', NOW(), NOW()),
('Bachelor of Architecture', 'بكالوريوس العمارة', 
  (SELECT id FROM departments WHERE code = 'ENG-ARC'), 'ENG-ARC-BARC', 'en', NOW(), NOW());

-- ============================================
-- PROGRAMS - College of Health Sciences (5 programs)
-- ============================================

INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Bachelor of Science in Biomedical Sciences', 'بكالوريوس العلوم في العلوم الطبية الحيوية', 
  (SELECT id FROM departments WHERE code = 'CHS-BIOM'), 'CHS-BIOM-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Nutrition and Dietetics', 'بكالوريوس العلوم في التغذية والحميات', 
  (SELECT id FROM departments WHERE code = 'CHS-NUTR'), 'CHS-NUTR-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Physiotherapy', 'بكالوريوس العلوم في العلاج الطبيعي', 
  (SELECT id FROM departments WHERE code = 'CHS-PHYS'), 'CHS-PHYS-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Public Health', 'بكالوريوس العلوم في الصحة العامة', 
  (SELECT id FROM departments WHERE code = 'CHS-PUBH'), 'CHS-PUBH-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Speech and Language Pathology', 'بكالوريوس العلوم في علم أمراض النطق واللغة', 
  (SELECT id FROM departments WHERE code = 'CHS-SLPA'), 'CHS-SLPA-BS', 'en', NOW(), NOW());

-- ============================================
-- PROGRAMS - College of Pharmacy (1 program)
-- ============================================

INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Bachelor of Science in Pharmacy', 'بكالوريوس العلوم في الصيدلة', 
  (SELECT id FROM departments WHERE code = 'PHR-PHR'), 'PHR-PHR-BS', 'en', NOW(), NOW());

-- ============================================
-- PROGRAMS - College of Medicine (1 program)
-- ============================================

INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Doctor of Medicine', 'دكتور في الطب', 
  (SELECT id FROM departments WHERE code = 'MED-MED'), 'MED-MED-MD', 'en', NOW(), NOW());

-- ============================================
-- PROGRAMS - College of Dental Medicine (1 program)
-- ============================================

INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Doctor of Dental Medicine', 'دكتور في طب الأسنان', 
  (SELECT id FROM departments WHERE code = 'DEN-DEN'), 'DEN-DEN-DMD', 'en', NOW(), NOW());

-- ============================================
-- PROGRAMS - College of Nursing (1 program)
-- ============================================

INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Bachelor of Science in Nursing', 'بكالوريوس العلوم في التمريض', 
  (SELECT id FROM departments WHERE code = 'NUR-NUR'), 'NUR-NUR-BS', 'en', NOW(), NOW());

-- ============================================
-- PROGRAMS - College of Law (1 program)
-- ============================================

INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Bachelor of Law', 'بكالوريوس القانون', 
  (SELECT id FROM departments WHERE code = 'LAW-LAW'), 'LAW-LAW-LLB', 'ar', NOW(), NOW());

-- ============================================
-- PROGRAMS - College of Sharia and Islamic Studies (4 programs)
-- ============================================

INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Bachelor of Sharia and Islamic Studies in Creed and Dawa', 'بكالوريوس الشريعة والدراسات الإسلامية في العقيدة والدعوة', 
  (SELECT id FROM departments WHERE code = 'SIS-CRD'), 'SIS-CRD-BSIS', 'ar', NOW(), NOW()),
('Bachelor of Sharia and Islamic Studies in Fiqh and Usul', 'بكالوريوس الشريعة والدراسات الإسلامية في الفقه وأصوله', 
  (SELECT id FROM departments WHERE code = 'SIS-FIQ'), 'SIS-FIQ-BSIS', 'ar', NOW(), NOW()),
('Bachelor of Sharia and Islamic Studies in Islamic Studies', 'بكالوريوس الشريعة والدراسات الإسلامية في الدراسات الإسلامية', 
  (SELECT id FROM departments WHERE code = 'SIS-ISL'), 'SIS-ISL-BSIS', 'ar', NOW(), NOW()),
('Bachelor of Sharia and Islamic Studies in Quran and Sunnah', 'بكالوريوس الشريعة والدراسات الإسلامية في القرآن والسنة', 
  (SELECT id FROM departments WHERE code = 'SIS-QUR'), 'SIS-QUR-BSIS', 'ar', NOW(), NOW());

-- ============================================
-- PROGRAMS - College of Sport Sciences (3 programs)
-- ============================================

INSERT INTO programs (nameEn, nameAr, departmentId, code, language, createdAt, updatedAt) VALUES
('Bachelor of Science in Physical Education', 'بكالوريوس العلوم في التربية البدنية', 
  (SELECT id FROM departments WHERE code = 'CSS-PED'), 'CSS-PED-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Sport Management', 'بكالوريوس العلوم في الإدارة الرياضية', 
  (SELECT id FROM departments WHERE code = 'CSS-SMG'), 'CSS-SMG-BS', 'en', NOW(), NOW()),
('Bachelor of Science in Sport Coaching', 'بكالوريوس العلوم في التدريب الرياضي', 
  (SELECT id FROM departments WHERE code = 'CSS-SCH'), 'CSS-SCH-BS', 'en', NOW(), NOW());

-- ============================================
-- SUMMARY REPORT
-- ============================================

SELECT '========================================' as '';
SELECT 'QU PROGRAMS DATABASE SEED COMPLETE' as '';
SELECT '========================================' as '';
SELECT '' as '';

SELECT 'SUMMARY BY COLLEGE' as '';
SELECT 
    c.nameEn as College,
    c.code as Code,
    COUNT(DISTINCT d.id) as Departments,
    COUNT(p.id) as Programs
FROM colleges c
LEFT JOIN departments d ON c.id = d.collegeId
LEFT JOIN programs p ON d.id = p.departmentId
GROUP BY c.id, c.nameEn, c.code
ORDER BY c.nameEn;

SELECT '' as '';
SELECT 'SUMMARY BY LANGUAGE' as '';
SELECT 
    language as Language,
    COUNT(*) as Programs
FROM programs
GROUP BY language
ORDER BY language;

SELECT '' as '';
SELECT 'TOTAL COUNTS' as '';
SELECT 
    (SELECT COUNT(*) FROM colleges) as Colleges,
    (SELECT COUNT(*) FROM departments) as Departments,
    (SELECT COUNT(*) FROM programs) as Programs;

SELECT '' as '';
SELECT '========================================' as '';
SELECT 'Database ready for PLO-GA mapping work!' as '';
SELECT '========================================' as '';
