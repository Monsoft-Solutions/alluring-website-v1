import {
    foreignKey,
    index,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core'

import { blogPost } from './blog-post.table'
import { images } from './image.table'

/**
 * Junction table linking blog posts to their generated images
 * Allows multiple images to be generated for a single post
 */
export const blogPostImages = pgTable(
    'blog_post_images',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        blogPostId: uuid('blog_post_id').notNull(),
        imageId: uuid('image_id').notNull(),
        prompt: text('prompt').notNull(), // The prompt used to generate this image
        createdAt: timestamp('created_at').defaultNow(),
    },
    (table) => [
        // Foreign Keys
        foreignKey({
            columns: [table.blogPostId],
            foreignColumns: [blogPost.id],
            name: 'blog_post_images_post_id_fk',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.imageId],
            foreignColumns: [images.id],
            name: 'blog_post_images_image_id_fk',
        }).onDelete('cascade'),

        // Performance Indexes
        index('blog_post_images_post_id_idx').on(table.blogPostId),
        index('blog_post_images_image_id_idx').on(table.imageId),
        index('blog_post_images_created_at_idx').on(table.createdAt),
    ]
)

export type BlogPostImage = typeof blogPostImages.$inferSelect
export type InsertBlogPostImage = typeof blogPostImages.$inferInsert
