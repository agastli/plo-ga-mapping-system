-- Migration: Add competencyId to justifications table
-- This will drop and recreate the justifications table with the new schema

-- Step 1: Drop the old table
DROP TABLE IF EXISTS justifications;

-- Step 2: Create the new table with competencyId
CREATE TABLE justifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  programId INT NOT NULL,
  gaId INT NOT NULL,
  competencyId INT NOT NULL,
  textEn TEXT,
  textAr TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY justifications_programId_competencyId_unique (programId, competencyId),
  FOREIGN KEY (programId) REFERENCES programs(id) ON DELETE CASCADE,
  FOREIGN KEY (gaId) REFERENCES graduateAttributes(id) ON DELETE CASCADE,
  FOREIGN KEY (competencyId) REFERENCES competencies(id) ON DELETE CASCADE
);

-- Migration complete
SELECT 'Justifications table recreated successfully with competencyId column' AS status;
