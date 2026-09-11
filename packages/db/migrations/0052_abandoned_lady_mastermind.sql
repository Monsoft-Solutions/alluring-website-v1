ALTER TABLE "blog_post" ADD COLUMN "content_updated_at" timestamp;
--> statement-breakpoint
-- Hand-written (drizzle-kit does not manage triggers; see packages/db/README.md).
-- Stamps content_updated_at only when a reader-visible field changes, so the
-- view counter, pipeline state and other bookkeeping writes never touch it.
CREATE OR REPLACE FUNCTION blog_post_touch_content_updated_at() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.content_updated_at := COALESCE(NEW.content_updated_at, now());
        RETURN NEW;
    END IF;

    IF (NEW.title, NEW.content, NEW.meta_title, NEW.meta_description, NEW.excerpt,
        NEW.quick_answer, NEW.faqs, NEW.featured_image_id, NEW.slug)
       IS DISTINCT FROM
       (OLD.title, OLD.content, OLD.meta_title, OLD.meta_description, OLD.excerpt,
        OLD.quick_answer, OLD.faqs, OLD.featured_image_id, OLD.slug)
    THEN
        NEW.content_updated_at := now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER blog_post_content_updated_at
BEFORE INSERT OR UPDATE ON "blog_post"
FOR EACH ROW EXECUTE FUNCTION blog_post_touch_content_updated_at();
--> statement-breakpoint
-- Backfill: the last revision snapshot is the best record of a real edit;
-- otherwise the post has not changed since it was published (or created).
UPDATE "blog_post" p
SET "content_updated_at" = COALESCE(
    (SELECT max(r."created_at") FROM "blog_post_revision" r WHERE r."blog_post_id" = p."id"),
    p."published_at",
    p."created_at",
    now()
);
