DO $$ BEGIN
    CREATE TYPE "image_type" AS ENUM('featured', 'inline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "blog_post_images" ADD COLUMN "image_type" "image_type" DEFAULT 'inline' NOT NULL;
