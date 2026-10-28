CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`record_type` text NOT NULL,
	`record_id` text NOT NULL,
	`source` text NOT NULL,
	`url` text NOT NULL,
	`data` text,
	`filled` text,
	`error` text,
	`fetched_at` integer,
	`refresh_started_at` integer,
	`created_at` integer NOT NULL,
	CONSTRAINT "sources_source" CHECK("sources"."source" in ('website', 'steam', 'itch', 'bluesky'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sources_record_url` ON `sources` (`record_type`,`record_id`,`url`);--> statement-breakpoint
CREATE INDEX `sources_fetched_at` ON `sources` (`fetched_at`);