import {
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

export const images = pgTable(
    'images',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        url: text('url').notNull().unique(),
        alt: text('alt').notNull(),
        title: varchar('title', { length: 255 }),
        description: text('description'),
        width: integer('width'),
        height: integer('height'),
        fileSize: integer('file_size'), // in bytes
        mimeType: varchar('mime_type', { length: 100 }),
        originalFilename: varchar('original_filename', { length: 255 }),
        blurDataUrl: text('blur_data_url'), // for Next.js Image optimization
        generationPrompt: text('generation_prompt'), // AI prompt used to generate this image
        generatedBy: varchar('generated_by', { length: 50 }), // 'fal-ai' | 'manual' | null
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow(),
    },
    (table) => [
        {
            // Performance Indexes
            createdAtIdx: index('images_created_at_idx').on(table.createdAt),
            mimeTypeIdx: index('images_mime_type_idx').on(table.mimeType),
            fileSizeIdx: index('images_file_size_idx').on(table.fileSize),
        },
    ]
)

export type Image = typeof images.$inferSelect
export type InsertImage = typeof images.$inferInsert
