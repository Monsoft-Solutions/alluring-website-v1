/**
 * Path of the blog sitemap route (`app/sitemap/blog.xml/route.ts`).
 *
 * The route is route-level ISR and reads the database directly, so no data
 * cache tag such as `sitemap-urls` is attached to it. Only its implicit path
 * tag reaches it, which is what `revalidatePath` on this value expires.
 */
export const BLOG_SITEMAP_PATH = '/sitemap/blog.xml'
