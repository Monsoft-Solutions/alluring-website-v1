CREATE TYPE "public"."reasoning_effort" AS ENUM('none', 'minimal', 'low', 'medium', 'high', 'xhigh');--> statement-breakpoint
ALTER TABLE "blog_ai_config" ALTER COLUMN "ideation_model_id" SET DEFAULT 'x-ai/grok-4.6';--> statement-breakpoint
ALTER TABLE "blog_ai_config" ALTER COLUMN "content_model_id" SET DEFAULT 'x-ai/grok-4.6';--> statement-breakpoint
ALTER TABLE "blog_ai_config" ALTER COLUMN "review_model_id" SET DEFAULT 'x-ai/grok-4.6';--> statement-breakpoint
ALTER TABLE "blog_ai_config" ALTER COLUMN "extraction_model_id" SET DEFAULT 'x-ai/grok-4.6';--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "ideation_effort" "reasoning_effort" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "content_effort" "reasoning_effort" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "review_effort" "reasoning_effort" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "orchestrator_model_id" varchar(120);--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "orchestrator_effort" "reasoning_effort" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "extraction_effort" "reasoning_effort" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "image_prompt_model_id" varchar(120);--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "image_prompt_effort" "reasoning_effort" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_ai_config" ADD COLUMN "image_alt_model_id" varchar(120);
--> statement-breakpoint
-- Rewrite bare model ids to their OpenRouter equivalents (epic #194).
--
-- `toOpenRouterId` in packages/ai already translates these at call time, so
-- this is belt-and-braces rather than load-bearing. It exists so the settings
-- picker does not flag every stored id as "not in the catalog" — the picker
-- searches the live OpenRouter catalog, where every id is `vendor/model`.
--
-- The mapping is a lookup table, not a prefix rule: Anthropic's point releases
-- are dashed in our stored ids and dotted on OpenRouter, so `'anthropic/' || id`
-- would 404 on exactly the legacy ids we have stored. Mirrors LEGACY_ID_MAP in
-- packages/ai/src/models/model-resolver.util.ts.
WITH id_map ("bare_id", "openrouter_id") AS (VALUES
    ('claude-opus-5',     'anthropic/claude-opus-5'),
    ('claude-sonnet-5',   'anthropic/claude-sonnet-5'),
    ('claude-haiku-4-5',  'anthropic/claude-haiku-4.5'),
    ('claude-opus-4-5',   'anthropic/claude-opus-4.5'),
    ('claude-sonnet-4-5', 'anthropic/claude-sonnet-4.5'),
    ('gpt-4.1',           'openai/gpt-4.1'),
    ('gpt-4.1-mini',      'openai/gpt-4.1-mini'),
    ('gpt-4.1-nano',      'openai/gpt-4.1-nano'),
    ('gpt-4-turbo',       'openai/gpt-4-turbo'),
    ('gpt-5.2',           'openai/gpt-5.2')
)
UPDATE "blog_ai_config" AS c SET
    "ideation_model_id" = COALESCE(
        (SELECT m."openrouter_id" FROM id_map m WHERE m."bare_id" = c."ideation_model_id"),
        c."ideation_model_id"
    ),
    "content_model_id" = COALESCE(
        (SELECT m."openrouter_id" FROM id_map m WHERE m."bare_id" = c."content_model_id"),
        c."content_model_id"
    ),
    "review_model_id" = COALESCE(
        (SELECT m."openrouter_id" FROM id_map m WHERE m."bare_id" = c."review_model_id"),
        c."review_model_id"
    ),
    "extraction_model_id" = COALESCE(
        (SELECT m."openrouter_id" FROM id_map m WHERE m."bare_id" = c."extraction_model_id"),
        c."extraction_model_id"
    );
