CREATE TABLE `mission_claims` (
	`person_id` text NOT NULL,
	`record_type` text NOT NULL,
	`record_id` text NOT NULL,
	`gap` text NOT NULL,
	`status` text NOT NULL,
	`reason` text,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`person_id`, `record_type`, `record_id`),
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "mission_claims_status" CHECK("mission_claims"."status" in ('claimed', 'skipped', 'done', 'flagged', 'resolved'))
);
--> statement-breakpoint
CREATE INDEX `mission_claims_record` ON `mission_claims` (`record_type`,`record_id`);