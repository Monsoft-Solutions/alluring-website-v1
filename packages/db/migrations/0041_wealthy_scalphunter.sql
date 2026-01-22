CREATE TABLE "google_review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_review_id" varchar(255) NOT NULL,
	"reviewer_name" varchar(255) NOT NULL,
	"reviewer_photo_url" text,
	"rating" integer NOT NULL,
	"comment" text,
	"review_created_at" timestamp NOT NULL,
	"review_updated_at" timestamp,
	"reply_text" text,
	"reply_created_at" timestamp,
	"is_published" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "google_review_google_review_id_unique" UNIQUE("google_review_id")
);
--> statement-breakpoint
CREATE TABLE "google_reviews_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" varchar(255),
	"location_id" varchar(255),
	"location_name" varchar(255),
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"last_sync_at" timestamp,
	"total_reviews_count" integer,
	"average_rating" numeric(2, 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "google_review_rating_idx" ON "google_review" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "google_review_published_rating_idx" ON "google_review" USING btree ("is_published","rating");--> statement-breakpoint
CREATE INDEX "google_review_featured_idx" ON "google_review" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "google_review_display_order_idx" ON "google_review" USING btree ("display_order");