CREATE TABLE `sync_state` (
	`id` text PRIMARY KEY DEFAULT 'device' NOT NULL,
	`status` text DEFAULT 'never_initialized' NOT NULL,
	`paused_reason` text,
	`last_successful_sync_at` integer,
	`last_failed_sync_at` integer,
	`last_attempted_sync_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "sync_state_status_guard" CHECK("sync_state"."status" in ('never_initialized', 'idle', 'syncing', 'paused', 'error')),
	CONSTRAINT "sync_state_paused_reason_guard" CHECK("sync_state"."paused_reason" is null or "sync_state"."paused_reason" in ('auth_missing', 'auth_expired', 'backend_unconfigured', 'offline', 'backend_unavailable'))
);
--> statement-breakpoint
CREATE INDEX `sync_state_status_idx` ON `sync_state` (`status`);
