ALTER TABLE `justifications` DROP INDEX `justifications_programId_gaId_unique`;--> statement-breakpoint
ALTER TABLE `justifications` ADD `competencyId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `justifications` ADD CONSTRAINT `justifications_programId_competencyId_unique` UNIQUE(`programId`,`competencyId`);--> statement-breakpoint
ALTER TABLE `justifications` ADD CONSTRAINT `justifications_competencyId_competencies_id_fk` FOREIGN KEY (`competencyId`) REFERENCES `competencies`(`id`) ON DELETE cascade ON UPDATE no action;