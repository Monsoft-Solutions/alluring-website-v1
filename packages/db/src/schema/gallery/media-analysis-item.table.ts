/**
 * Media Analysis Item Table
 *
 * Junction table linking analysis sessions to specific media items (gallery_media or instagram_post).
 * Tracks which items were part of an analysis and their group assignments.
 *
 * @module packages/db/src/schema/gallery/media-analysis-item.table
 */
import {
    boolean,
    foreignKey,
    index,
    jsonb,
    pgEnum,
    pgTable,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core'

import { galleryMedia } from './gallery-media.table'
import { mediaAnalysis } from './media-analysis.table'
import { instagramPost } from '../social-media/instagram-post.table'

/**
 * Type of item in the analysis
 */
export const mediaAnalysisItemType = pgEnum('media_analysis_item_type', [
    'pair',
    'unpaired',
    'non_ba',
])

/**
 * Media Analysis Item table - tracks individual items in an analysis session
 */
export const mediaAnalysisItem = pgTable(
    'media_analysis_item',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        /**
         * Reference to the analysis session
         */
        analysisId: uuid('analysis_id').notNull(),

        /**
         * Reference to gallery media (if applicable)
         * For Instagram posts, this references the primary media
         */
        galleryMediaId: uuid('gallery_media_id'),

        /**
         * Reference to Instagram post (if from Instagram source)
         */
        instagramPostId: uuid('instagram_post_id'),

        /**
         * Type of item in the analysis
         */
        itemType: mediaAnalysisItemType('item_type').notNull(),

        /**
         * Group assignments for this item
         * Array of gallery group IDs
         */
        groupAssignments: jsonb('group_assignments')
            .$type<string[]>()
            .default([]),

        /**
         * Whether this item has been applied to the database
         * (B&A pair created, groups assigned)
         */
        isApplied: boolean('is_applied').notNull().default(false),

        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        // Foreign key to media_analysis
        foreignKey({
            columns: [table.analysisId],
            foreignColumns: [mediaAnalysis.id],
            name: 'media_analysis_item_analysis_id_fkey',
        }).onDelete('cascade'),
        // Foreign key to gallery_media
        foreignKey({
            columns: [table.galleryMediaId],
            foreignColumns: [galleryMedia.id],
            name: 'media_analysis_item_gallery_media_id_fkey',
        }).onDelete('cascade'),
        // Foreign key to instagram_post
        foreignKey({
            columns: [table.instagramPostId],
            foreignColumns: [instagramPost.id],
            name: 'media_analysis_item_instagram_post_id_fkey',
        }).onDelete('cascade'),
        // Index for querying items by analysis
        index('media_analysis_item_analysis_id_idx').on(table.analysisId),
        // Index for querying items by gallery media
        index('media_analysis_item_gallery_media_id_idx').on(
            table.galleryMediaId
        ),
        // Index for querying items by Instagram post
        index('media_analysis_item_instagram_post_id_idx').on(
            table.instagramPostId
        ),
    ]
)

export type MediaAnalysisItem = typeof mediaAnalysisItem.$inferSelect
export type InsertMediaAnalysisItem = typeof mediaAnalysisItem.$inferInsert
