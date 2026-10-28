CREATE TABLE `follows` (
	`person_id` text NOT NULL,
	`record_type` text NOT NULL,
	`record_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`person_id`, `record_type`, `record_id`),
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "follows_record_type" CHECK("follows"."record_type" in ('game', 'organization', 'event', 'country'))
);
--> statement-breakpoint
CREATE INDEX `follows_record` ON `follows` (`record_type`,`record_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`kind` text NOT NULL,
	`data` text NOT NULL,
	`created_at` integer NOT NULL,
	`read_at` integer,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_person` ON `notifications` (`person_id`,`created_at`);