CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` enum('create','update','delete') NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `colleges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`code` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `colleges_id` PRIMARY KEY(`id`),
	CONSTRAINT `colleges_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `competencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gaId` int NOT NULL,
	`code` varchar(10) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`sortOrder` int NOT NULL,
	CONSTRAINT `competencies_id` PRIMARY KEY(`id`),
	CONSTRAINT `competencies_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collegeId` int NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`code` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_collegeId_code_unique` UNIQUE(`collegeId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `graduateAttributes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`sortOrder` int NOT NULL,
	CONSTRAINT `graduateAttributes_id` PRIMARY KEY(`id`),
	CONSTRAINT `graduateAttributes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `justifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`gaId` int NOT NULL,
	`textEn` text,
	`textAr` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `justifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `justifications_programId_gaId_unique` UNIQUE(`programId`,`gaId`)
);
--> statement-breakpoint
CREATE TABLE `mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ploId` int NOT NULL,
	`competencyId` int NOT NULL,
	`weight` decimal(3,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mappings_id` PRIMARY KEY(`id`),
	CONSTRAINT `mappings_ploId_competencyId_unique` UNIQUE(`ploId`,`competencyId`)
);
--> statement-breakpoint
CREATE TABLE `plos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`descriptionEn` text,
	`descriptionAr` text,
	`sortOrder` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plos_id` PRIMARY KEY(`id`),
	CONSTRAINT `plos_programId_code_unique` UNIQUE(`programId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`departmentId` int NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`code` varchar(50) NOT NULL,
	`language` enum('en','ar','both') NOT NULL DEFAULT 'en',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `programs_id` PRIMARY KEY(`id`),
	CONSTRAINT `programs_departmentId_code_unique` UNIQUE(`departmentId`,`code`)
);
--> statement-breakpoint
ALTER TABLE `auditLog` ADD CONSTRAINT `auditLog_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `competencies` ADD CONSTRAINT `competencies_gaId_graduateAttributes_id_fk` FOREIGN KEY (`gaId`) REFERENCES `graduateAttributes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_collegeId_colleges_id_fk` FOREIGN KEY (`collegeId`) REFERENCES `colleges`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `justifications` ADD CONSTRAINT `justifications_programId_programs_id_fk` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `justifications` ADD CONSTRAINT `justifications_gaId_graduateAttributes_id_fk` FOREIGN KEY (`gaId`) REFERENCES `graduateAttributes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mappings` ADD CONSTRAINT `mappings_ploId_plos_id_fk` FOREIGN KEY (`ploId`) REFERENCES `plos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mappings` ADD CONSTRAINT `mappings_competencyId_competencies_id_fk` FOREIGN KEY (`competencyId`) REFERENCES `competencies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plos` ADD CONSTRAINT `plos_programId_programs_id_fk` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `programs_departmentId_departments_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE cascade ON UPDATE no action;