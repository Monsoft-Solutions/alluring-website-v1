ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "contact_submission_id" uuid;--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'chat_session_contact_submission_id_contact_submission_id_fk'
          AND table_name = 'chat_session'
          AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE "chat_session"
        ADD CONSTRAINT "chat_session_contact_submission_id_contact_submission_id_fk"
        FOREIGN KEY ("contact_submission_id")
        REFERENCES "public"."contact_submission"("id")
        ON DELETE SET NULL
        ON UPDATE NO ACTION;
    END IF;
END $$;