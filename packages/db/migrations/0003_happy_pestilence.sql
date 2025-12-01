ALTER TABLE "contact_submission" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "contact_submission" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "contact_submission" ADD COLUMN "procedure" text;--> statement-breakpoint
ALTER TABLE "contact_submission" ADD COLUMN "preferred_contact_time" text;--> statement-breakpoint
ALTER TABLE "contact_submission" ADD COLUMN "consent_given" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "contact_submission" ADD COLUMN "source" text;