ALTER TABLE `events` ADD `ticket_url` text;--> statement-breakpoint
ALTER TABLE `events` ADD `previous_edition_id` text REFERENCES events(id) ON DELETE set null;--> statement-breakpoint
CREATE INDEX `events_previous_edition_id` ON `events` (`previous_edition_id`);