DROP INDEX `gyms_origin_scope_id_idx`;--> statement-breakpoint
ALTER TABLE `gyms` DROP COLUMN `origin_scope_id`;--> statement-breakpoint
ALTER TABLE `gyms` DROP COLUMN `origin_source_id`;--> statement-breakpoint
ALTER TABLE `session_exercises` DROP COLUMN `origin_scope_id`;--> statement-breakpoint
ALTER TABLE `session_exercises` DROP COLUMN `origin_source_id`;
