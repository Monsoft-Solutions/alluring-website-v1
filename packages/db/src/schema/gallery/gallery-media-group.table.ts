import { index, integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core'

import { galleryGroup } from './gallery-group.table'
import { galleryMedia } from './gallery-media.table'

export const galleryMediaGroup = pgTable(
    'gallery_media_group',
    {
        mediaId: uuid('media_id')
            .notNull()
            .references(() => galleryMedia.id, { onDelete: 'cascade' }),
        groupId: uuid('group_id')
            .notNull()
            .references(() => galleryGroup.id, { onDelete: 'cascade' }),
        displayOrder: integer('display_order').default(0).notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.mediaId, table.groupId] }),
        // Critical for filtering media by group (WHERE group_id = X queries)
        index('gallery_media_group_group_id_idx').on(table.groupId),
    ]
)

export type GalleryMediaGroup = typeof galleryMediaGroup.$inferSelect
export type InsertGalleryMediaGroup = typeof galleryMediaGroup.$inferInsert
