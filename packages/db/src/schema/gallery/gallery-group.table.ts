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

export const galleryGroup = pgTable(
    'gallery_group',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        name: varchar('name', { length: 255 }).notNull(),
        slug: varchar('slug', { length: 255 }).notNull().unique(),
        description: text('description'),
        coverImageId: uuid('cover_image_id').references(() => galleryMedia.id, {
            onDelete: 'set null',
        }),
        displayOrder: integer('display_order').default(0).notNull(),
        isVisible: boolean('is_visible').default(true).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        {
            isVisibleIdx: index('gallery_group_is_visible_idx').on(
                table.isVisible
            ),
            displayOrderIdx: index('gallery_group_display_order_idx').on(
                table.displayOrder
            ),
        },
    ]
)

export type GalleryGroup = typeof galleryGroup.$inferSelect
export type InsertGalleryGroup = typeof galleryGroup.$inferInsert
