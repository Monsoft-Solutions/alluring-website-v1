import fs from 'fs';

const postsData = JSON.parse(fs.readFileSync('/tmp/all-scraped-posts.json', 'utf-8'));
const imageResults = JSON.parse(fs.readFileSync('/tmp/all-image-processing-results.json', 'utf-8'));

// Infer categories and tags from content
function inferCategoriesAndTags(slug, title, content) {
  const categories = [];
  const tags = [];
  
  const lowerContent = content.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const lowerSlug = slug.toLowerCase();
  
  // Categories
  if (lowerSlug.includes('bbl') || lowerContent.includes('brazilian butt lift') || lowerContent.includes('bbl')) {
    categories.push('BBL');
  }
  if (lowerSlug.includes('breast') || lowerContent.includes('breast augmentation') || lowerContent.includes('breast reduction') || lowerContent.includes('breast lift')) {
    categories.push('Breast Augmentation');
  }
  if (lowerSlug.includes('lipo') || lowerContent.includes('liposuction')) {
    categories.push('Liposuction');
  }
  if (lowerSlug.includes('tummy') || lowerContent.includes('tummy tuck') || lowerContent.includes('abdominoplasty')) {
    categories.push('Tummy Tuck');
  }
  if (lowerSlug.includes('mommy') || lowerContent.includes('mommy makeover')) {
    categories.push('Mommy Makeover');
  }
  if (lowerContent.includes('recovery') || lowerContent.includes('post-op') || lowerContent.includes('healing')) {
    categories.push('Recovery');
  }
  if (lowerContent.includes('post-op') || lowerContent.includes('recovery')) {
    categories.push('Post-Op Care');
  }
  
  // Default category if none found
  if (categories.length === 0) {
    categories.push('Recovery');
  }
  
  // Tags
  if (lowerSlug.includes('bbl') || lowerContent.includes('brazilian butt lift')) {
    tags.push('BBL', 'Brazilian Butt Lift');
  }
  if (lowerSlug.includes('breast')) {
    if (lowerContent.includes('augmentation')) tags.push('Breast Augmentation');
    if (lowerContent.includes('reduction')) tags.push('Breast Reduction');
    if (lowerContent.includes('lift')) tags.push('Breast Lift');
  }
  if (lowerSlug.includes('lipo') || lowerContent.includes('liposuction')) {
    tags.push('Liposuction', 'Lipo');
  }
  if (lowerSlug.includes('tummy') || lowerContent.includes('tummy tuck')) {
    tags.push('Tummy Tuck', 'Abdominoplasty');
  }
  if (lowerSlug.includes('mommy') || lowerContent.includes('mommy makeover')) {
    tags.push('Mommy Makeover');
  }
  if (lowerContent.includes('recovery') || lowerContent.includes('healing')) {
    tags.push('Recovery');
  }
  if (lowerContent.includes('swelling') || lowerContent.includes('itching') || lowerContent.includes('bruising')) {
    tags.push('Swelling');
  }
  if (lowerContent.includes('odor') || lowerContent.includes('smell')) {
    tags.push('Post-Op Care', 'Hygiene');
  }
  if (lowerContent.includes('foam') || lowerContent.includes('compression')) {
    tags.push('Compression Garments');
  }
  if (lowerContent.includes('massage') || lowerContent.includes('lymphatic')) {
    tags.push('Lymphatic Massage');
  }
  if (lowerTitle.includes('weeks') || lowerContent.includes('week') || lowerContent.includes('timeline')) {
    tags.push('Recovery Timeline');
  }
  if (lowerContent.includes('sleep') || lowerContent.includes('sitting') || lowerContent.includes('driving')) {
    tags.push('Post-Op Care');
  }
  
  return { categories, tags };
}

function generatePostFile(post) {
  const { categories, tags } = inferCategoriesAndTags(post.slug, post.title, post.content);
  
  // Clean excerpt
  let excerpt = post.excerpt
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (excerpt.length > 200) {
    excerpt = excerpt.substring(0, 200).replace(/\s+\S*$/, '') + '...';
  }
  
  // Format published date
  const publishedDate = new Date(post.publishedAt);
  const publishedAtISO = publishedDate.toISOString();
  
  // Clean title - remove HTML entities
  let cleanTitle = post.title
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');
  
  const fileContent = `import type { InsertBlogPost } from '../../schema/blog/blog-post.table'

/**
 * Blog Post: ${cleanTitle}
 *
 * Migrated from old website
 * Categories: ${categories.join(', ')}
 * Tags: ${tags.join(', ')}
 */

export const post: Omit<
    InsertBlogPost,
    'id' | 'authorId' | 'createdAt' | 'updatedAt'
> = {
    slug: '${post.slug}',
    title: ${JSON.stringify(cleanTitle)},
    metaTitle: ${JSON.stringify(post.metaTitle || cleanTitle)},
    metaDescription: ${JSON.stringify(post.metaDescription)},
    metaKeywords: ${JSON.stringify(post.metaKeywords || '')},
    excerpt: ${JSON.stringify(excerpt)},
    content: ${JSON.stringify(post.content)},
    readingTime: ${post.readingTime},
    status: 'published',
    publishedAt: new Date('${publishedAtISO}'),
    isFeatured: false,
    allowComments: true,
}

export const categories = ${JSON.stringify(categories)}
export const tags = ${JSON.stringify(tags)}
`;

  return fileContent;
}

function generateImageFile(post, imageData) {
  if (!imageData || !imageData.localPath) {
    return null;
  }
  
  const width = 1392;
  const height = 752;
  
  // Clean title
  let cleanTitle = post.title
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, '&');
  
  let cleanAlt = (imageData.alt || post.title)
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, '&');
  
  let cleanImageTitle = (imageData.title || post.title)
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, '&');
  
  const fileContent = `import type { InsertImage } from '../../schema/blog/image.table'

/**
 * Featured Image for: ${cleanTitle}
 *
 * Migrated from old website
 */

export const image: Omit<InsertImage, 'id' | 'createdAt' | 'updatedAt'> = {
    url: 'https://lcqnjgugr2aws94e.public.blob.vercel-storage.com/posts/${post.slug}/featured-image.jpg',
    alt: ${JSON.stringify(cleanAlt)},
    title: ${JSON.stringify(cleanImageTitle)},
    description: ${JSON.stringify(`Featured image for ${cleanTitle}`)},
    width: ${width},
    height: ${height},
    fileSize: ${imageData.fileSize},
    mimeType: ${JSON.stringify(imageData.mimeType)},
    originalFilename: ${JSON.stringify(imageData.originalFilename)},
}
`;

  return fileContent;
}

// Generate all seed files
const seedDir = '/Users/monsoft_solutions/monsoft/projects/alluring-websites/alluring-website-1/packages/db/src/seed/posts';

console.log(`Generating seed files for ${postsData.length} posts...\n`);

let postCount = 0;
let imageCount = 0;

for (const post of postsData) {
  const imageData = imageResults.find(r => r.slug === post.slug);
  
  // Generate post file
  const postContent = generatePostFile(post);
  const postFilename = `${post.postNum}-${post.slug}.post.ts`;
  fs.writeFileSync(`${seedDir}/${postFilename}`, postContent);
  postCount++;
  
  if (postCount % 10 === 0) {
    console.log(`  Generated ${postCount} post files...`);
  }
  
  // Generate image file if image exists
  if (imageData && imageData.localPath) {
    const imageContent = generateImageFile(post, imageData);
    if (imageContent) {
      const imageFilename = `${post.postNum}-${post.slug}.image.ts`;
      fs.writeFileSync(`${seedDir}/${imageFilename}`, imageContent);
      imageCount++;
    }
  }
}

console.log(`\n✓ Generated ${postCount} post files`);
console.log(`✓ Generated ${imageCount} image files`);

