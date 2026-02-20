ALTER TABLE `justifications` DROP INDEX `justifications_programId_competencyId_unique`;--> statement-breakpoint
ALTER TABLE `justifications` DROP FOREIGN KEY `justifications_programId_programs_id_fk`;
--> statement-breakpoint
ALTER TABLE `justifications` DROP FOREIGN KEY `justifications_gaId_graduateAttributes_id_fk`;
--> statement-breakpoint
ALTER TABLE `justifications` DROP FOREIGN KEY `justifications_competencyId_competencies_id_fk`;
--> statement-breakpoint
ALTER TABLE `justifications` ADD `ploId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `justifications` ADD CONSTRAINT `justifications_ploId_unique` UNIQUE(`ploId`);--> statement-breakpoint
ALTER TABLE `justifications` ADD CONSTRAINT `justifications_ploId_plos_id_fk` FOREIGN KEY (`ploId`) REFERENCES `plos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `justifications` DROP COLUMN `programId`;--> statement-breakpoint
ALTER TABLE `justifications` DROP COLUMN `gaId`;--> statement-breakpoint
ALTER TABLE `justifications` DROP COLUMN `competencyId`;