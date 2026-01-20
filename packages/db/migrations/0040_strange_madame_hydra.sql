-- Remove duplicate images, prioritizing keeping featured images
-- Priority: 1) Images used as featured images 2) Oldest image (smallest id)
DELETE FROM "images"
WHERE "id" IN (
    SELECT "id"
    FROM (
        SELECT 
            i."id",
            ROW_NUMBER() OVER (
                PARTITION BY i."url" 
                ORDER BY 
                    -- Prioritize images that are used as featured images (keep them first)
                    CASE WHEN bp."featured_image_id" IS NOT NULL THEN 0 ELSE 1 END ASC,
                    -- Then by oldest id
                    i."id" ASC
            ) AS rn
        FROM "images" i
        LEFT JOIN "blog_post" bp ON bp."featured_image_id" = i."id"
    ) duplicates
    WHERE rn > 1
);

-- Now add the unique constraint
ALTER TABLE "images" ADD CONSTRAINT "images_url_unique" UNIQUE("url");