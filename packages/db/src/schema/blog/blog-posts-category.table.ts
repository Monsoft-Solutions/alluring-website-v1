import {
    boolean,
    index,
    integer,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

import { blogPost } from './blog-post.table'

export const blogCategory = pgTable(
    'blog_category',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        name: varchar('name', { length: 255 }).notNull().unique(),
        description: text('description'),
        slug: varchar('slug', { length: 255 }).notNull().unique(),
        color: varchar('color', { length: 7 }), // hex color code
        sortOrder: integer('sort_order').default(0),
        isActive: boolean('is_active').default(true).notNull(),
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        {
            // Performance Indexes
            isActiveIdx: index('blog_category_is_active_idx').on(
                table.isActive
            ),
            sortOrderIdx: index('blog_category_sort_order_idx').on(
                table.sortOrder
            ),
            createdAtIdx: index('blog_category_created_at_idx').on(
                table.createdAt
            ),
        },
    ]
)

export const blogPostCategory = pgTable(
    'blog_post_category',
    {
        blogPostId: uuid('blog_post_id')
            .notNull()
            .references(() => blogPost.id, { onDelete: 'cascade' }),
        categoryId: uuid('category_id')
            .notNull()
            .references(() => blogCategory.id, { onDelete: 'cascade' }),
    },
    (table) => [
        {
            pk: primaryKey({ columns: [table.blogPostId, table.categoryId] }),
        },
    ]
)

export type BlogCategory = typeof blogCategory.$inferSelect
export type InsertBlogCategory = typeof blogCategory.$inferInsert
export type BlogPostCategory = typeof blogPostCategory.$inferSelect
export type InsertBlogPostCategory = typeof blogPostCategory.$inferInsert
