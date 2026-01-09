import { relations } from 'drizzle-orm'

import { author } from './author.table'
import { blogPostImages } from './blog-post-images.table'
import { blogPostTag } from './blog-post-tag.table'
import { blogPost } from './blog-post.table'
import { blogCategory, blogPostCategory } from './blog-posts-category.table'
import { blogTag } from './blog-tag.table'
import { images } from './image.table'

// Junction table relations
export const blogPostTagsRelations = relations(blogPostTag, ({ one }) => ({
    blogPost: one(blogPost, {
        fields: [blogPostTag.blogPostId],
        references: [blogPost.id],
    }),
    tag: one(blogTag, {
        fields: [blogPostTag.tagId],
        references: [blogTag.id],
    }),
}))

export const blogPostImagesRelations = relations(blogPostImages, ({ one }) => ({
    blogPost: one(blogPost, {
        fields: [blogPostImages.blogPostId],
        references: [blogPost.id],
    }),
    image: one(images, {
        fields: [blogPostImages.imageId],
        references: [images.id],
    }),
}))

export const blogPostCategoriesRelations = relations(
    blogPostCategory,
    ({ one }) => ({
        blogPost: one(blogPost, {
            fields: [blogPostCategory.blogPostId],
            references: [blogPost.id],
        }),
        category: one(blogCategory, {
            fields: [blogPostCategory.categoryId],
            references: [blogCategory.id],
        }),
    })
)

// Main entity relations
export const blogPostsRelations = relations(blogPost, ({ one, many }) => ({
    author: one(author, {
        fields: [blogPost.authorId],
        references: [author.id],
    }),
    featuredImage: one(images, {
        fields: [blogPost.featuredImageId],
        references: [images.id],
    }),
    categories: many(blogPostCategory),
    tags: many(blogPostTag),
    generatedImages: many(blogPostImages),
}))

export const blogTagsRelations = relations(blogTag, ({ many }) => ({
    blogPosts: many(blogPostTag),
}))

export const blogCategoriesRelations = relations(blogCategory, ({ many }) => ({
    blogPosts: many(blogPostCategory),
}))

export const authorsRelations = relations(author, ({ many }) => ({
    blogPosts: many(blogPost),
}))

export const imagesRelations = relations(images, ({ many }) => ({
    featuredInBlogPosts: many(blogPost),
    generatedForBlogPosts: many(blogPostImages),
}))
