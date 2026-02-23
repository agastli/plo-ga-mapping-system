-- Create clusters table if it doesn't exist
-- Run this in phpMyAdmin to add the clusters table to your database

CREATE TABLE IF NOT EXISTS `clusters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `collegeId` int NOT NULL,
  `nameEn` varchar(255) NOT NULL,
  `nameAr` varchar(255) DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `description` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clusters_collegeId_code_unique` (`collegeId`, `code`),
  KEY `clusters_collegeId_idx` (`collegeId`),
  CONSTRAINT `clusters_collegeId_colleges_id_fk` FOREIGN KEY (`collegeId`) REFERENCES `colleges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add clusterId column to departments table if it doesn't exist
ALTER TABLE `departments` 
ADD COLUMN IF NOT EXISTS `clusterId` int DEFAULT NULL AFTER `collegeId`,
ADD KEY IF NOT EXISTS `departments_clusterId_idx` (`clusterId`),
ADD CONSTRAINT `departments_clusterId_clusters_id_fk` FOREIGN KEY (`clusterId`) REFERENCES `clusters` (`id`) ON DELETE SET NULL;

-- Insert the 3 CAS clusters
INSERT INTO `clusters` (`collegeId`, `nameEn`, `nameAr`, `code`, `description`) 
VALUES 
  (1, 'Languages, Communication and Translation', 'اللغات والاتصال والترجمة', 'CAS-LCT', 'Languages, Communication and Translation Cluster'),
  (1, 'Humanities and Social Sciences', 'العلوم الإنسانية والاجتماعية', 'CAS-HSS', 'Humanities and Social Sciences Cluster'),
  (1, 'Sciences and Applied Sciences', 'العلوم والعلوم التطبيقية', 'CAS-SAS', 'Sciences and Applied Sciences Cluster')
ON DUPLICATE KEY UPDATE 
  `nameEn` = VALUES(`nameEn`),
  `nameAr` = VALUES(`nameAr`),
  `description` = VALUES(`description`);

SELECT 'Clusters table created and CAS clusters inserted successfully!' AS Status;
