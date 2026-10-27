ALTER TABLE `events` ADD `attendance` text DEFAULT 'in_person' NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `online_url` text;