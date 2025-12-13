ALTER TABLE "social_media_settings" ADD COLUMN IF NOT EXISTS "full_name" varchar(255);--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN IF NOT EXISTS "biography" text;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN IF NOT EXISTS "profile_picture_url" text;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN IF NOT EXISTS "external_url" text;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN IF NOT EXISTS "followers_count" integer;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN IF NOT EXISTS "following_count" integer;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN IF NOT EXISTS "posts_count" integer;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN IF NOT EXISTS "is_business_account" boolean;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN IF NOT EXISTS "is_professional_account" boolean;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN IF NOT EXISTS "is_private" boolean;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN IF NOT EXISTS "is_verified" boolean;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN IF NOT EXISTS "category_name" varchar(100);--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN IF NOT EXISTS "business_address" jsonb;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN IF NOT EXISTS "profile_last_fetched_at" timestamp;