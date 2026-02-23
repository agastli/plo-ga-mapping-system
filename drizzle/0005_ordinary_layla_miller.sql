CREATE TABLE `clusters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collegeId` int NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`code` varchar(50) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clusters_id` PRIMARY KEY(`id`),
	CONSTRAINT `clusters_collegeId_code_unique` UNIQUE(`collegeId`,`code`)
);
--> statement-breakpoint
ALTER TABLE `departments` ADD `clusterId` int;--> statement-breakpoint
ALTER TABLE `clusters` ADD CONSTRAINT `clusters_collegeId_colleges_id_fk` FOREIGN KEY (`collegeId`) REFERENCES `colleges`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_clusterId_clusters_id_fk` FOREIGN KEY (`clusterId`) REFERENCES `clusters`(`id`) ON DELETE set null ON UPDATE no action;