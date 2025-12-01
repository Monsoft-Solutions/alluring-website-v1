ALTER TABLE "bug_report" ADD COLUMN "screen_width" integer;--> statement-breakpoint
ALTER TABLE "bug_report" ADD COLUMN "screen_height" integer;--> statement-breakpoint
ALTER TABLE "bug_report" ADD COLUMN "viewport_width" integer;--> statement-breakpoint
ALTER TABLE "bug_report" ADD COLUMN "viewport_height" integer;--> statement-breakpoint
ALTER TABLE "bug_report" ADD COLUMN "device_pixel_ratio" real;--> statement-breakpoint
ALTER TABLE "bug_report" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "bug_report" ADD COLUMN "language" text;--> statement-breakpoint
ALTER TABLE "bug_report" ADD COLUMN "referrer" text;--> statement-breakpoint
ALTER TABLE "bug_report" ADD COLUMN "connection_type" text;