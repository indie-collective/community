CREATE TABLE `slug_aliases` (
	`kind` text NOT NULL,
	`slug` text NOT NULL,
	`record_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`kind`, `slug`)
);
--> statement-breakpoint
ALTER TABLE `events` ADD `slug` text;--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug` ON `events` (`slug`);--> statement-breakpoint
ALTER TABLE `games` ADD `slug` text;--> statement-breakpoint
CREATE UNIQUE INDEX `games_slug` ON `games` (`slug`);--> statement-breakpoint
ALTER TABLE `organizations` ADD `slug` text;--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug` ON `organizations` (`slug`);