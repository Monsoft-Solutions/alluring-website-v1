ALTER TABLE "chat_session" ADD COLUMN "conversation_analysis" jsonb;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN "lead_profile" jsonb;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN "psychographic_data" jsonb;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN "actionable_intelligence" jsonb;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN "conversation_summary" text;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN "decision_stage" text;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN "follow_up_priority" text;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN "analyzed_at" timestamp;