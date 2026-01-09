DO $$
BEGIN
    -- Add 'generate_image' before 'draft' ONLY if it does not exist already
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'generate_image'
          AND enumtypid = (
              SELECT oid FROM pg_type WHERE typname = 'blog_post_status'
          )
    ) THEN
        ALTER TYPE "public"."blog_post_status" ADD VALUE 'generate_image' BEFORE 'draft';
    END IF;
END;
$$;