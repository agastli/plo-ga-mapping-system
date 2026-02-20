SELECT p.id, p.nameEn, d.nameEn as department, c.nameEn as college 
FROM programs p
JOIN departments d ON p.departmentId = d.id
JOIN colleges c ON d.collegeId = c.id
LIMIT 10;
