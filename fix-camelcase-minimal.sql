-- Minimal SQL script to convert remaining lowercase columns to camelCase
-- Based on actual database structure inspection

-- Fix programs table
ALTER TABLE `programs` 
  CHANGE COLUMN `departmentid` `departmentId` INT(11) NOT NULL,
  CHANGE COLUMN `nameen` `nameEn` VARCHAR(255) NOT NULL,
  CHANGE COLUMN `namear` `nameAr` VARCHAR(255) NULL,
  CHANGE COLUMN `createdat` `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN `updatedat` `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Fix graduateattributes table
ALTER TABLE `graduateattributes` 
  CHANGE COLUMN `nameen` `nameEn` VARCHAR(255) NOT NULL,
  CHANGE COLUMN `namear` `nameAr` VARCHAR(255) NOT NULL,
  CHANGE COLUMN `sortorder` `sortOrder` INT(11) NOT NULL,
  CHANGE COLUMN `createdat` `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN `updatedat` `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Fix competencies table
ALTER TABLE `competencies` 
  CHANGE COLUMN `gaid` `gaId` INT(11) NOT NULL,
  CHANGE COLUMN `nameen` `nameEn` VARCHAR(255) NOT NULL,
  CHANGE COLUMN `namear` `nameAr` VARCHAR(255) NOT NULL,
  CHANGE COLUMN `sortorder` `sortOrder` INT(11) NOT NULL,
  CHANGE COLUMN `createdat` `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN `updatedat` `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Fix plos table
ALTER TABLE `plos` 
  CHANGE COLUMN `programid` `programId` INT(11) NOT NULL,
  CHANGE COLUMN `descriptionen` `descriptionEn` TEXT NULL,
  CHANGE COLUMN `descriptionar` `descriptionAr` TEXT NULL,
  CHANGE COLUMN `sortorder` `sortOrder` INT(11) NOT NULL,
  CHANGE COLUMN `createdat` `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN `updatedat` `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Fix mappings table
ALTER TABLE `mappings` 
  CHANGE COLUMN `ploid` `ploId` INT(11) NOT NULL,
  CHANGE COLUMN `competencyid` `competencyId` INT(11) NOT NULL,
  CHANGE COLUMN `createdat` `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN `updatedat` `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Fix justifications table
ALTER TABLE `justifications` 
  CHANGE COLUMN `programid` `programId` INT(11) NOT NULL,
  CHANGE COLUMN `gaid` `gaId` INT(11) NOT NULL,
  CHANGE COLUMN `competencyid` `competencyId` INT(11) NOT NULL,
  CHANGE COLUMN `texten` `textEn` TEXT NULL,
  CHANGE COLUMN `textar` `textAr` TEXT NULL,
  CHANGE COLUMN `createdat` `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN `updatedat` `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
