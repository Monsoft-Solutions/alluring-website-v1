ALTER TABLE "beta_feedback" ADD COLUMN "screen_width" integer;--> statement-breakpoint
ALTER TABLE "beta_feedback" ADD COLUMN "screen_height" integer;--> statement-breakpoint
ALTER TABLE "beta_feedback" ADD COLUMN "viewport_width" integer;--> statement-breakpoint
ALTER TABLE "beta_feedback" ADD COLUMN "viewport_height" integer;--> statement-breakpoint
ALTER TABLE "beta_feedback" ADD COLUMN "device_pixel_ratio" real;--> statement-breakpoint
ALTER TABLE "beta_feedback" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "beta_feedback" ADD COLUMN "language" text;--> statement-breakpoint
ALTER TABLE "beta_feedback" ADD COLUMN "referrer" text;--> statement-breakpoint
ALTER TABLE "beta_feedback" ADD COLUMN "connection_type" text;