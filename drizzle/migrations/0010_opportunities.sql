CREATE TABLE `opportunities` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`about` text,
	`link` text,
	`remote` integer DEFAULT false NOT NULL,
	`city` text,
	`country_code` text,
	`organization_id` text,
	`game_id` text,
	`event_id` text,
	`ends_at` integer NOT NULL,
	`author_id` text,
	`deleted_at` integer,
	`last_modified_by_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`last_modified_by_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "opportunities_kind" CHECK("opportunities"."kind" in ('job', 'freelance', 'playtest', 'team_up', 'pitches', 'submissions')),
	CONSTRAINT "opportunities_title_length" CHECK(length("opportunities"."title") <= 120)
);
--> statement-breakpoint
CREATE INDEX `opportunities_ends_at` ON `opportunities` (`ends_at`);--> statement-breakpoint
CREATE INDEX `opportunities_organization_id` ON `opportunities` (`organization_id`);--> statement-breakpoint
CREATE INDEX `opportunities_game_id` ON `opportunities` (`game_id`);