ALTER TABLE "social_media_settings" ADD COLUMN "full_name" varchar(255);--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN "biography" text;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN "profile_picture_url" text;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN "external_url" text;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN "followers_count" integer;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN "following_count" integer;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN "posts_count" integer;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN "is_business_account" boolean;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN "is_professional_account" boolean;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN "is_private" boolean;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN "is_verified" boolean;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN "category_name" varchar(100);--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN "business_address" jsonb;--> statement-breakpoint
ALTER TABLE "social_media_settings" ADD COLUMN "profile_last_fetched_at" timestamp;