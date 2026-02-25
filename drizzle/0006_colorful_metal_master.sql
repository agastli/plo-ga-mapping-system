CREATE TABLE `userAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assignmentType` enum('university','college','cluster','department') NOT NULL,
	`collegeId` int,
	`clusterId` int,
	`departmentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userAssignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `userAssignments_userId_assignmentType_unique` UNIQUE(`userId`,`assignmentType`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','viewer','editor') NOT NULL DEFAULT 'viewer';--> statement-breakpoint
ALTER TABLE `userAssignments` ADD CONSTRAINT `userAssignments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userAssignments` ADD CONSTRAINT `userAssignments_collegeId_colleges_id_fk` FOREIGN KEY (`collegeId`) REFERENCES `colleges`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userAssignments` ADD CONSTRAINT `userAssignments_clusterId_clusters_id_fk` FOREIGN KEY (`clusterId`) REFERENCES `clusters`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userAssignments` ADD CONSTRAINT `userAssignments_departmentId_departments_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE cascade ON UPDATE no action;