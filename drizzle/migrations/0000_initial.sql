CREATE TABLE `changes` (
	`id` text PRIMARY KEY NOT NULL,
	`operation` text NOT NULL,
	`table_name` text NOT NULL,
	`record_id` text NOT NULL,
	`data` text NOT NULL,
	`author_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "changes_operation" CHECK("changes"."operation" in ('create', 'update', 'delete'))
);
--> statement-breakpoint
CREATE INDEX `changes_record` ON `changes` (`table_name`,`record_id`);--> statement-breakpoint
CREATE INDEX `changes_created_at` ON `changes` (`created_at`);--> statement-breakpoint
CREATE TABLE `event_participants` (
	`event_id` text NOT NULL,
	`person_id` text NOT NULL,
	`joined_at` integer NOT NULL,
	PRIMARY KEY(`event_id`, `person_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `event_participants_person_id` ON `event_participants` (`person_id`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`about` text,
	`site` text,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`time_zone` text DEFAULT 'Europe/Paris' NOT NULL,
	`status` text DEFAULT 'ongoing' NOT NULL,
	`country_code` text,
	`region` text,
	`city` text,
	`street` text,
	`latitude` real,
	`longitude` real,
	`cover_key` text,
	`cover_width` integer,
	`cover_height` integer,
	`search_text` text DEFAULT '' NOT NULL,
	`deleted_at` integer,
	`last_modified_by_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`last_modified_by_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "events_status" CHECK("events"."status" in ('ongoing', 'canceled'))
);
--> statement-breakpoint
CREATE INDEX `events_country_code` ON `events` (`country_code`);--> statement-breakpoint
CREATE INDEX `events_starts_at` ON `events` (`starts_at`);--> statement-breakpoint
CREATE INDEX `events_ends_at` ON `events` (`ends_at`);--> statement-breakpoint
CREATE INDEX `events_deleted_at` ON `events` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `game_events` (
	`game_id` text NOT NULL,
	`event_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`game_id`, `event_id`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `game_events_event_id` ON `game_events` (`event_id`);--> statement-breakpoint
CREATE TABLE `game_igdb` (
	`game_id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`data` text,
	`fetched_at` integer,
	`refresh_started_at` integer,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `game_igdb_fetched_at` ON `game_igdb` (`fetched_at`);--> statement-breakpoint
CREATE TABLE `game_images` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`key` text NOT NULL,
	`width` integer,
	`height` integer,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `game_images_game_id` ON `game_images` (`game_id`,`position`);--> statement-breakpoint
CREATE TABLE `game_organizations` (
	`game_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`role` text DEFAULT 'developer' NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`game_id`, `organization_id`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "game_organizations_role" CHECK("game_organizations"."role" in ('developer', 'co_developer', 'publisher', 'porting', 'support'))
);
--> statement-breakpoint
CREATE INDEX `game_organizations_organization_id` ON `game_organizations` (`organization_id`);--> statement-breakpoint
CREATE TABLE `game_tags` (
	`game_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`game_id`, `tag_id`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `game_tags_tag_id` ON `game_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`about` text,
	`site` text,
	`igdb_slug` text,
	`search_text` text DEFAULT '' NOT NULL,
	`deleted_at` integer,
	`last_modified_by_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`last_modified_by_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `games_igdb_slug_unique` ON `games` (`igdb_slug`);--> statement-breakpoint
CREATE INDEX `games_deleted_at` ON `games` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `games_updated_at` ON `games` (`updated_at`);--> statement-breakpoint
CREATE TABLE `kv` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE INDEX `kv_expires_at` ON `kv` (`expires_at`);--> statement-breakpoint
CREATE TABLE `organization_events` (
	`organization_id` text NOT NULL,
	`event_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`organization_id`, `event_id`),
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `organization_events_event_id` ON `organization_events` (`event_id`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`name` text NOT NULL,
	`about` text,
	`site` text,
	`bsky_handle` text,
	`country_code` text,
	`region` text,
	`city` text,
	`street` text,
	`latitude` real,
	`longitude` real,
	`logo_key` text,
	`logo_width` integer,
	`logo_height` integer,
	`search_text` text DEFAULT '' NOT NULL,
	`deleted_at` integer,
	`last_modified_by_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`last_modified_by_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "organizations_type" CHECK("organizations"."type" in ('studio', 'association')),
	CONSTRAINT "organizations_status" CHECK("organizations"."status" in ('active', 'closed', 'hiatus'))
);
--> statement-breakpoint
CREATE INDEX `organizations_country_code` ON `organizations` (`country_code`);--> statement-breakpoint
CREATE INDEX `organizations_type_index` ON `organizations` (`type`);--> statement-breakpoint
CREATE INDEX `organizations_deleted_at` ON `organizations` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text,
	`about` text,
	`email` text,
	`avatar_key` text,
	`avatar_width` integer,
	`avatar_height` integer,
	`avatar_url` text,
	`role` text DEFAULT 'member' NOT NULL,
	`did` text,
	`discord_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "people_role" CHECK("people"."role" in ('admin', 'member', 'restricted')),
	CONSTRAINT "people_username_length" CHECK(length("people"."username") <= 30)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `people_username_unique` ON `people` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `people_email_unique` ON `people` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `people_did_unique` ON `people` (`did`);--> statement-breakpoint
CREATE UNIQUE INDEX `people_discord_id_unique` ON `people` (`discord_id`);--> statement-breakpoint
CREATE TABLE `tag_aliases` (
	`alias` text PRIMARY KEY NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "tags_name_length" CHECK(length("tags"."name") <= 30)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);