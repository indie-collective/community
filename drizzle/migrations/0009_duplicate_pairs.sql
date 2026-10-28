CREATE TABLE `duplicate_pairs` (
	`kind` text NOT NULL,
	`first_id` text NOT NULL,
	`second_id` text NOT NULL,
	`status` text NOT NULL,
	`person_id` text,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`kind`, `first_id`, `second_id`),
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "duplicate_pairs_status" CHECK("duplicate_pairs"."status" in ('flagged', 'dismissed'))
);
