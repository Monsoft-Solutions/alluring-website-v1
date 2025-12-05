CREATE TABLE IF NOT EXISTS "chat_quick_reply" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"message" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_escalation_trigger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trigger_type" text NOT NULL,
	"trigger_value" text NOT NULL,
	"description" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"trigger_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "primary_intent" text;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "intent_confidence" numeric(3, 2);--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "detected_procedures" jsonb;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "tags" jsonb;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "lead_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "lead_grade" text;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "scoring_signals" jsonb;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "is_escalated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "escalated_at" timestamp;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "escalation_reason" text;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "assigned_to" text;