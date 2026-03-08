CREATE TABLE `aiReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`reviewedBy` int NOT NULL,
	`discipline` varchar(64) NOT NULL DEFAULT 'other',
	`reviewMode` enum('conservative','standard','expert') NOT NULL DEFAULT 'standard',
	`reviewData` text NOT NULL,
	`summaryStats` text NOT NULL,
	`status` enum('draft','finalised') NOT NULL DEFAULT 'draft',
	`acceptedItems` text,
	`rejectedItems` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `programs` ADD `discipline` enum('engineering','architecture','business','health','education','humanities','science','law','other') DEFAULT 'other';--> statement-breakpoint
ALTER TABLE `aiReviews` ADD CONSTRAINT `aiReviews_programId_programs_id_fk` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aiReviews` ADD CONSTRAINT `aiReviews_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;