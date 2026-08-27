-- Fixture for the Bundle Size Budget CI job (issue #202).
--
-- The job builds against an empty database, which means `generateStaticParams`
-- for `app/blog/[slug]` returns nothing and the blog post template is never
-- prerendered — so the size gate cannot see it. That template backs 104 live
-- routes and is the surface the content pipeline touches most, so leaving it
-- unmeasured was the gate's largest hole: it could gain ~74 KB of first-load
-- JavaScript with CI still reporting green.
--
-- One published row is enough. The bundle graph comes from imports, not
-- content, so a synthetic post measures exactly what a real one does (verified:
-- 281.2 KB across 17 chunks, matching the real /blog/* routes).
--
-- The date must be 2026 or later: posts before then live at the root and are
-- served by `app/[slug]/page.tsx`, whose chunk set is already covered in CI by
-- the static surgeon pages.
--
-- This only ever runs against the throwaway Postgres service container in CI.
-- It is not a seed and must never be pointed at a database holding real posts.

DELETE FROM blog_post WHERE slug = 'ci-size-budget-fixture';

INSERT INTO blog_post (
    slug, title, excerpt, content, meta_description,
    status, published_at, reading_time
) VALUES (
    'ci-size-budget-fixture',
    'CI Size Budget Fixture',
    'A synthetic post so the bundle-size gate can measure the blog template.',
    E'## Heading\n\nBody copy for the fixture post.\n\n- one\n- two\n',
    'Synthetic fixture used only by the CI bundle-size job.',
    'published',
    TIMESTAMP '2026-06-01 00:00:00',
    3
);
