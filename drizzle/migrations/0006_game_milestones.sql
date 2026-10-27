CREATE TABLE `game_milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`kind` text NOT NULL,
	`date` integer NOT NULL,
	`date_precision` text DEFAULT 'month' NOT NULL,
	`note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "game_milestones_kind" CHECK("game_milestones"."kind" in ('announced', 'prototype', 'alpha', 'beta', 'demo', 'early_access', 'funded', 'signed', 'released', 'ported', 'update', 'other')),
	CONSTRAINT "game_milestones_date_precision" CHECK("game_milestones"."date_precision" in ('year', 'month', 'day')),
	CONSTRAINT "game_milestones_note_length" CHECK(length("game_milestones"."note") <= 140)
);
--> statement-breakpoint
CREATE INDEX `game_milestones_game_id` ON `game_milestones` (`game_id`,`date`);