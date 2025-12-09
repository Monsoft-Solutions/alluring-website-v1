import {
    boolean,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

import { galleryMedia } from './gallery-media.table'

export const beforeAfterPair = pgTable(
    'before_after_pair',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        beforeMediaId: uuid('before_media_id')
            .notNull()
            .references(() => galleryMedia.id, { onDelete: 'cascade' }),
        afterMediaId: uuid('after_media_id')
            .notNull()
            .references(() => galleryMedia.id, { onDelete: 'cascade' }),
        procedureType: varchar('procedure_type', { length: 100 }),
        procedureSlug: varchar('procedure_slug', { length: 100 }), // Links to procedure page slug
        patientInfo: text('patient_info'), // Anonymized notes
        timeframe: varchar('timeframe', { length: 100 }), // e.g., "3 months post-op"
        isFeatured: boolean('is_featured').default(false).notNull(),
        displayOrder: integer('display_order').default(0).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        {
            procedureTypeIdx: index('before_after_pair_procedure_type_idx').on(
                table.procedureType
            ),
            procedureSlugIdx: index('before_after_pair_procedure_slug_idx').on(
                table.procedureSlug
            ),
            isFeaturedIdx: index('before_after_pair_is_featured_idx').on(
                table.isFeatured
            ),
            displayOrderIdx: index('before_after_pair_display_order_idx').on(
                table.displayOrder
            ),
        },
    ]
)

export type BeforeAfterPair = typeof beforeAfterPair.$inferSelect
export type InsertBeforeAfterPair = typeof beforeAfterPair.$inferInsert
