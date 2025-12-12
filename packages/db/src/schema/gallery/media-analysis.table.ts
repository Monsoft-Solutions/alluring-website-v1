/**
 * Media Analysis Table
 *
 * Stores analysis sessions from both Instagram bulk analysis and Gallery single-image analysis.
 * Provides a unified history of all AI analysis operations.
 *
 * @module packages/db/src/schema/gallery/media-analysis.table
 */
import {
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

import type { BulkAnalysisResult } from '@workspace/shared/schemas/analysis'

/**
 * Analysis type - bulk (multiple items) or single (one item)
 */
export const mediaAnalysisType = pgEnum('media_analysis_type', [
    'bulk',
    'single',
])

/**
 * Analysis source - where the analysis was triggered from
 */
export const mediaAnalysisSource = pgEnum('media_analysis_source', [
    'instagram',
    'gallery',
])

/**
 * Analysis status lifecycle
 */
export const mediaAnalysisStatus = pgEnum('media_analysis_status', [
    'pending',
    'analyzing',
    'completed',
    'applied',
    'failed',
])

/**
 * Media Analysis table - stores analysis sessions
 */
export const mediaAnalysis = pgTable(
    'media_analysis',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        /**
         * Human-readable name for the analysis
         * Auto-generated: "Instagram Analysis - Dec 12, 2025"
         * Can be edited by user
         */
        name: varchar('name', { length: 255 }).notNull(),

        /**
         * Type of analysis
         */
        type: mediaAnalysisType('type').notNull(),

        /**
         * Source of the analysis
         */
        source: mediaAnalysisSource('source').notNull(),

        /**
         * Current status of the analysis
         */
        status: mediaAnalysisStatus('status').notNull().default('pending'),

        /**
         * Denormalized stats for quick list view rendering
         */
        totalMedia: integer('total_media').notNull().default(0),
        analyzedMedia: integer('analyzed_media').notNull().default(0),
        detectedPairs: integer('detected_pairs').notNull().default(0),
        unpairedMedia: integer('unpaired_media').notNull().default(0),
        nonBAMedia: integer('non_ba_media').notNull().default(0),

        /**
         * Full analysis result data (JSONB)
         * Stores the complete BulkAnalysisResult structure for easy retrieval
         */
        resultData: jsonb('result_data').$type<BulkAnalysisResult>(),

        /**
         * Error message if analysis failed
         */
        errorMessage: text('error_message'),

        /**
         * Timestamps
         */
        startedAt: timestamp('started_at').notNull().defaultNow(),
        completedAt: timestamp('completed_at'),
        appliedAt: timestamp('applied_at'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        // Index for listing analyses by date
        index('media_analysis_created_at_idx').on(table.createdAt),
        // Index for filtering by status
        index('media_analysis_status_idx').on(table.status),
        // Index for filtering by source
        index('media_analysis_source_idx').on(table.source),
        // Composite index for list queries with filters
        index('media_analysis_status_source_created_idx').on(
            table.status,
            table.source,
            table.createdAt
        ),
    ]
)

export type MediaAnalysis = typeof mediaAnalysis.$inferSelect
export type InsertMediaAnalysis = typeof mediaAnalysis.$inferInsert
