export {
    blogPostStatus,
    blogPost,
    type BlogPost,
    type InsertBlogPost,
} from './blog-post.table'

export {
    blogCategory,
    blogPostCategory,
    type BlogCategory,
    type InsertBlogCategory,
    type BlogPostCategory,
    type InsertBlogPostCategory,
} from './blog-posts-category.table'

export { blogTag } from './blog-tag.table'

export { author } from './author.table'

export {
    blogPostTag,
    type BlogPostTag,
    type InsertBlogPostTag,
} from './blog-post-tag.table'

export { images, type Image, type InsertImage } from './image.table'

export {
    blogPostImages,
    type BlogPostImage,
    type InsertBlogPostImage,
} from './blog-post-images.table'

export {
    blogPostTagsRelations,
    blogPostCategoriesRelations,
    blogPostsRelations,
    blogPostImagesRelations,
    blogTagsRelations,
    blogCategoriesRelations,
    authorsRelations,
    imagesRelations,
} from './blog-relations'

export {
    imageDataSchema,
    createResourceSchema,
    type CreateResourceInput,
} from './create-blog-post.schema'
