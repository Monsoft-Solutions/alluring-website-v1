/**
 * Blog AI Configuration Table
 *
 * Singleton configuration row controlling which AI models the blog content
 * pipeline uses. Lets an admin repoint content generation, review and image
 * generation at different models without a code deploy.
 *
 * Model ids are stored as free-form strings rather than enums on purpose: any
 * OpenRouter `vendor/model` id is accepted, so the column must not be
 * constrained to the curated `AVAILABLE_MODELS` list. Validation lives in the
 * server action via `isValidModelId`.
 *
 * @module packages/db/src/schema/blog/blog-ai-config.table
 */
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

/**
 * Blog AI configuration table.
 *
 * Only one row is ever expected — the query layer reads the first row and the
 * action layer upserts it.
 */
export const blogAiConfig = pgTable('blog_ai_config', {
    id: uuid('id').primaryKey().defaultRandom(),

    /**
     * Model used for the ideation phase (topic generation).
     */
    ideationModelId: varchar('ideation_model_id', { length: 120 })
        .notNull()
        .default('claude-opus-5'),

    /**
     * Model used for the content generation phase (research + drafting).
     */
    contentModelId: varchar('content_model_id', { length: 120 })
        .notNull()
        .default('claude-opus-5'),

    /**
     * Model used for the review/orchestration phase (review agents + editor).
     */
    reviewModelId: varchar('review_model_id', { length: 120 })
        .notNull()
        .default('claude-opus-5'),

    /**
     * Model used for the metadata extraction phase (SEO title, meta
     * description, slug, FAQs).
     */
    extractionModelId: varchar('extraction_model_id', { length: 120 })
        .notNull()
        .default('claude-opus-5'),

    /**
     * Image generation model id — one of `IMAGE_MODELS` in the admin fal
     * service (`gpt-image-2`, `gpt-image-1.5`, `nano-banana-pro`).
     */
    imageModelId: varchar('image_model_id', { length: 40 })
        .notNull()
        .default('gpt-image-2'),

    /**
     * Forced artistic image style preset id.
     *
     * `null` means "auto" — the pipeline's AI picks the preset per topic, which
     * is the recommended behaviour. A non-null value pins every generated image
     * to that preset.
     */
    artisticStyleId: varchar('artistic_style_id', { length: 60 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
})

export type BlogAiConfig = typeof blogAiConfig.$inferSelect
export type InsertBlogAiConfig = typeof blogAiConfig.$inferInsert
