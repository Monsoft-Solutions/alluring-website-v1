ALTER TABLE "chat_session" ALTER COLUMN "full_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_session" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_session" ADD COLUMN "is_anonymous" boolean DEFAULT false NOT NULL;