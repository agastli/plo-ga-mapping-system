CREATE TABLE `graduateattributes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`sortOrder` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `graduateattributes_id` PRIMARY KEY(`id`),
	CONSTRAINT `graduateattributes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
DROP TABLE `graduateAttributes`;--> statement-breakpoint
ALTER TABLE `userAssignments` DROP INDEX `userAssignments_userId_assignmentType_unique`;--> statement-breakpoint
ALTER TABLE `competencies` DROP FOREIGN KEY `competencies_gaId_graduateAttributes_id_fk`;
--> statement-breakpoint
ALTER TABLE `justifications` DROP FOREIGN KEY `justifications_gaId_graduateAttributes_id_fk`;
--> statement-breakpoint
ALTER TABLE `userAssignments` MODIFY COLUMN `assignmentType` enum('university','college','cluster','department','program') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `username` varchar(191);--> statement-breakpoint
ALTER TABLE `competencies` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `competencies` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `userAssignments` ADD `programId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `resetToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `resetTokenExpiry` timestamp;--> statement-breakpoint
ALTER TABLE `competencies` ADD CONSTRAINT `competencies_gaId_graduateattributes_id_fk` FOREIGN KEY (`gaId`) REFERENCES `graduateattributes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `justifications` ADD CONSTRAINT `justifications_gaId_graduateattributes_id_fk` FOREIGN KEY (`gaId`) REFERENCES `graduateattributes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userAssignments` ADD CONSTRAINT `userAssignments_programId_programs_id_fk` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE cascade ON UPDATE no action;