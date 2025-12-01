import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core'

import { blogPost } from './blog-post.table'
import { blogTag } from './blog-tag.table'

/**
 * Junction table for many-to-many relationship between blog posts and tags
 * Associates tags with blog posts for better content organization
 */
export const blogPostTag = pgTable(
    'blog_post_tag',
    {
        blogPostId: uuid('blog_post_id')
            .notNull()
            .references(() => blogPost.id, { onDelete: 'cascade' }),
        tagId: uuid('tag_id')
            .notNull()
            .references(() => blogTag.id, { onDelete: 'cascade' }),
    },
    (table) => [
        {
            pk: primaryKey({ columns: [table.blogPostId, table.tagId] }),
        },
    ]
)

export type BlogPostTag = typeof blogPostTag.$inferSelect
export type InsertBlogPostTag = typeof blogPostTag.$inferInsert
