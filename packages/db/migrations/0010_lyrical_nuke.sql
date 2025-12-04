CREATE TYPE "public"."device_type" AS ENUM('desktop', 'mobile', 'tablet', 'unknown');--> statement-breakpoint
CREATE TABLE "page_view" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_path" varchar(500) NOT NULL,
	"page_url" text NOT NULL,
	"page_title" varchar(500),
	"referrer" text,
	"utm_source" varchar(255),
	"utm_medium" varchar(255),
	"utm_campaign" varchar(255),
	"utm_content" varchar(255),
	"utm_term" varchar(255),
	"user_agent" text,
	"device_type" "device_type" DEFAULT 'unknown',
	"browser" varchar(100),
	"browser_version" varchar(50),
	"os" varchar(100),
	"os_version" varchar(50),
	"country_code" varchar(2),
	"region" varchar(100),
	"city" varchar(100),
	"session_id" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL
);
