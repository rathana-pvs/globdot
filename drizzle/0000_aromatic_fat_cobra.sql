CREATE TABLE `article_authors` (
	`article_id` integer NOT NULL,
	`author_id` integer NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`article_id`, `author_id`),
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_article_authors_position` ON `article_authors` (`article_id`,`position`);--> statement-breakpoint
CREATE TABLE `article_regions` (
	`article_id` integer NOT NULL,
	`region_id` integer NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`article_id`, `region_id`),
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_article_regions_feed` ON `article_regions` (`region_id`,`article_id`);--> statement-breakpoint
CREATE TABLE `article_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_id` integer NOT NULL,
	`editor_id` integer NOT NULL,
	`revision_number` integer NOT NULL,
	`snapshot_json` text NOT NULL,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`editor_id`) REFERENCES `editorial_users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_article_revisions_unique` ON `article_revisions` (`article_id`,`revision_number`);--> statement-breakpoint
CREATE INDEX `idx_article_revisions_latest` ON `article_revisions` (`article_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `article_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_id` integer NOT NULL,
	`label` text NOT NULL,
	`url` text,
	`source_type` text DEFAULT 'reporting' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_article_sources_article` ON `article_sources` (`article_id`);--> statement-breakpoint
CREATE TABLE `article_topics` (
	`article_id` integer NOT NULL,
	`topic_id` integer NOT NULL,
	PRIMARY KEY(`article_id`, `topic_id`),
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_article_topics_feed` ON `article_topics` (`topic_id`,`article_id`);--> statement-breakpoint
CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`standfirst` text NOT NULL,
	`body_json` text DEFAULT '{"root":{"children":[]}}' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`story_type` text DEFAULT 'news' NOT NULL,
	`section_id` integer NOT NULL,
	`lead_media_id` integer,
	`created_by_id` integer NOT NULL,
	`is_breaking` integer DEFAULT false NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`homepage_slot` text,
	`read_time_minutes` integer DEFAULT 1 NOT NULL,
	`dateline` text,
	`key_points_json` text DEFAULT '[]' NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`social_media_id` integer,
	`canonical_url` text,
	`published_at` text,
	`scheduled_for` text,
	`corrected_at` text,
	`correction_note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`lead_media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_id`) REFERENCES `editorial_users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`social_media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_slug_unique` ON `articles` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_articles_public_feed` ON `articles` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_articles_section_feed` ON `articles` (`section_id`,`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_articles_homepage` ON `articles` (`status`,`homepage_slot`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_articles_owner_status` ON `articles` (`created_by_id`,`status`);--> statement-breakpoint
CREATE TABLE `authors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`role_title` text,
	`bio` text,
	`email` text,
	`social_url` text,
	`avatar_id` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`avatar_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `authors_slug_unique` ON `authors` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_authors_active` ON `authors` (`is_active`);--> statement-breakpoint
CREATE TABLE `editorial_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`auth_id` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'contributor' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `editorial_users_auth_id_unique` ON `editorial_users` (`auth_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `editorial_users_email_unique` ON `editorial_users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_editorial_users_role_status` ON `editorial_users` (`role`,`status`);--> statement-breakpoint
CREATE TABLE `live_blogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`section_id` integer,
	`created_by_id` integer NOT NULL,
	`started_at` text,
	`ended_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_id`) REFERENCES `editorial_users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `live_blogs_slug_unique` ON `live_blogs` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_live_blogs_status_started` ON `live_blogs` (`status`,`started_at`);--> statement-breakpoint
CREATE TABLE `live_updates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`live_blog_id` integer NOT NULL,
	`author_id` integer,
	`headline` text,
	`body_json` text NOT NULL,
	`is_pinned` integer DEFAULT false NOT NULL,
	`published_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`live_blog_id`) REFERENCES `live_blogs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_live_updates_timeline` ON `live_updates` (`live_blog_id`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_live_updates_pinned` ON `live_updates` (`live_blog_id`,`is_pinned`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`object_key` text NOT NULL,
	`file_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`alt` text NOT NULL,
	`caption` text,
	`credit` text,
	`focal_x` integer DEFAULT 50,
	`focal_y` integer DEFAULT 50,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_object_key_unique` ON `media` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_media_created_at` ON `media` (`created_at`);--> statement-breakpoint
CREATE TABLE `navigation_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`href` text NOT NULL,
	`location` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_navigation_location_order` ON `navigation_items` (`location`,`is_visible`,`sort_order`);--> statement-breakpoint
CREATE TABLE `redirects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_path` text NOT NULL,
	`to_path` text NOT NULL,
	`status_code` integer DEFAULT 308 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `redirects_from_path_unique` ON `redirects` (`from_path`);--> statement-breakpoint
CREATE TABLE `regions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `regions_slug_unique` ON `regions` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_regions_navigation` ON `regions` (`is_visible`,`sort_order`);--> statement-breakpoint
CREATE TABLE `sections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#2457ff' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sections_slug_unique` ON `sections` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_sections_navigation` ON `sections` (`is_visible`,`sort_order`);--> statement-breakpoint
CREATE TABLE `share_campaigns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`article_id` integer NOT NULL,
	`label` text,
	`click_count` integer DEFAULT 0 NOT NULL,
	`expires_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `share_campaigns_key_unique` ON `share_campaigns` (`key`);--> statement-breakpoint
CREATE INDEX `idx_share_campaigns_article` ON `share_campaigns` (`article_id`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text NOT NULL,
	`updated_by_id` integer,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`updated_by_id`) REFERENCES `editorial_users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topics_slug_unique` ON `topics` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_topics_name` ON `topics` (`name`);