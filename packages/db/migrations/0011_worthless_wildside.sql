CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed_amount');--> statement-breakpoint
CREATE TYPE "public"."promotion_link_type" AS ENUM('procedure', 'custom_url', 'contact');--> statement-breakpoint
CREATE TYPE "public"."promotion_status" AS ENUM('draft', 'scheduled', 'active', 'paused', 'expired');--> statement-breakpoint
CREATE TYPE "public"."promotion_type" AS ENUM('discount', 'seasonal', 'bundle', 'financing');--> statement-breakpoint
CREATE TABLE "promotion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"excerpt" text,
	"status" "promotion_status" DEFAULT 'draft' NOT NULL,
	"type" "promotion_type" NOT NULL,
	"discount_value" integer,
	"discount_type_value" "discount_type",
	"starts_at" timestamp,
	"ends_at" timestamp,
	"is_auto_activate" boolean DEFAULT true NOT NULL,
	"is_auto_expire" boolean DEFAULT true NOT NULL,
	"image_url" text,
	"image_alt" varchar(255),
	"video_url" text,
	"thumbnail_url" text,
	"link_type" "promotion_link_type" DEFAULT 'contact' NOT NULL,
	"procedure_slug" varchar(255),
	"custom_url" text,
	"cta_text" varchar(100) DEFAULT 'Learn More' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promotion_slug_unique" UNIQUE("slug")
);
