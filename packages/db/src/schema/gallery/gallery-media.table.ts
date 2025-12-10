import {
    boolean,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

import type { GalleryMediaAIAnalysis } from './gallery-media-ai-analysis.type'

export const galleryMediaType = pgEnum('gallery_media_type', ['image', 'video'])

export const galleryMediaStatus = pgEnum('gallery_media_status', [
    'draft',
    'published',
    'archived',
])

export const galleryMedia = pgTable(
    'gallery_media',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        type: galleryMediaType('type').notNull().default('image'),
        url: text('url').notNull(),
        thumbnailUrl: text('thumbnail_url'),
        title: varchar('title', { length: 255 }).notNull(),
        description: text('description'),
        alt: text('alt'),
        seoTitle: varchar('seo_title', { length: 60 }),
        seoDescription: varchar('seo_description', { length: 160 }),
        slug: varchar('slug', { length: 255 }).notNull().unique(),
        width: integer('width'),
        height: integer('height'),
        duration: integer('duration'), // For videos (seconds)
        fileSize: integer('file_size'),
        mimeType: varchar('mime_type', { length: 100 }),
        originalFilename: varchar('original_filename', { length: 255 }),
        blurDataUrl: text('blur_data_url'),
        isFeatured: boolean('is_featured').default(false).notNull(),
        isBeforeAfter: boolean('is_before_after').default(false).notNull(),
        beforeAfterId: uuid('before_after_id'),
        displayOrder: integer('display_order').default(0).notNull(),
        status: galleryMediaStatus('status').default('draft').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
        publishedAt: timestamp('published_at'),

        /**
         * AI Analysis data from image analysis
         * Contains structured output from GPT-4o vision analysis
         */
        aiAnalysis: jsonb('ai_analysis').$type<GalleryMediaAIAnalysis>(),
    },
    (table) => [
        {
            // Performance Indexes
            typeIdx: index('gallery_media_type_idx').on(table.type),
            statusIdx: index('gallery_media_status_idx').on(table.status),
            isFeaturedIdx: index('gallery_media_is_featured_idx').on(
                table.isFeatured
            ),
            isBeforeAfterIdx: index('gallery_media_is_before_after_idx').on(
                table.isBeforeAfter
            ),
            beforeAfterIdIdx: index('gallery_media_before_after_id_idx').on(
                table.beforeAfterId
            ),
            displayOrderIdx: index('gallery_media_display_order_idx').on(
                table.displayOrder
            ),
            createdAtIdx: index('gallery_media_created_at_idx').on(
                table.createdAt
            ),
            publishedAtIdx: index('gallery_media_published_at_idx').on(
                table.publishedAt
            ),
            statusPublishedAtIdx: index(
                'gallery_media_status_published_at_idx'
            ).on(table.status, table.publishedAt),
        },
    ]
)

export type GalleryMedia = typeof galleryMedia.$inferSelect
export type InsertGalleryMedia = typeof galleryMedia.$inferInsert
