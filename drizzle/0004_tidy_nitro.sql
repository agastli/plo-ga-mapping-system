ALTER TABLE `justifications` DROP INDEX `justifications_ploId_unique`;--> statement-breakpoint
ALTER TABLE `justifications` DROP FOREIGN KEY `justifications_ploId_plos_id_fk`;
--> statement-breakpoint
ALTER TABLE `justifications` ADD `programId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `justifications` ADD `gaId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `justifications` ADD `competencyId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `justifications` ADD CONSTRAINT `justifications_programId_gaId_competencyId_unique` UNIQUE(`programId`,`gaId`,`competencyId`);--> statement-breakpoint
ALTER TABLE `justifications` ADD CONSTRAINT `justifications_programId_programs_id_fk` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `justifications` ADD CONSTRAINT `justifications_gaId_graduateAttributes_id_fk` FOREIGN KEY (`gaId`) REFERENCES `graduateAttributes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `justifications` ADD CONSTRAINT `justifications_competencyId_competencies_id_fk` FOREIGN KEY (`competencyId`) REFERENCES `competencies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `justifications` DROP COLUMN `ploId`;