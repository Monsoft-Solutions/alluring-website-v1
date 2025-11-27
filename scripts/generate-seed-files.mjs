import fs from 'fs';

const postsData = JSON.parse(fs.readFileSync('/tmp/scraped-posts.json', 'utf-8'));
const imageResults = JSON.parse(fs.readFileSync('/tmp/image-processing-results.json', 'utf-8'));

// Infer categories and tags from content
function inferCategoriesAndTags(slug, title, content) {
  const categories = [];
  const tags = [];
  
  const lowerContent = content.toLowerCase();
  const lowerTitle = title.toLowerCase();
  
  // Categories
  if (slug.includes('bbl') || lowerContent.includes('brazilian butt lift') || lowerContent.includes('bbl')) {
    categories.push('BBL');
  }
  if (slug.includes('breast') || lowerContent.includes('breast augmentation') || lowerContent.includes('breast reduction')) {
    categories.push('Breast Augmentation');
  }
  if (slug.includes('lipo') || lowerContent.includes('liposuction')) {
    categories.push('Liposuction');
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
  if (slug.includes('bbl') || lowerContent.includes('brazilian butt lift')) {
    tags.push('BBL', 'Brazilian Butt Lift');
  }
  if (slug.includes('breast')) {
    tags.push('Breast Augmentation');
  }
  if (slug.includes('lipo') || lowerContent.includes('liposuction')) {
    tags.push('Liposuction', 'Lipo');
  }
  if (lowerContent.includes('recovery') || lowerContent.includes('healing')) {
    tags.push('Recovery');
  }
  if (lowerContent.includes('swelling') || lowerContent.includes('itching')) {
    tags.push('Swelling');
  }
  if (lowerContent.includes('odor') || lowerContent.includes('smell')) {
    tags.push('Post-Op Care', 'Hygiene');
  }
  if (lowerContent.includes('foam') || lowerContent.includes('compression')) {
    tags.push('Compression Garments');
  }
  
  // Add procedure-specific tags
  if (lowerTitle.includes('weeks') || lowerContent.includes('week')) {
    tags.push('Recovery Timeline');
  }
  
  return { categories, tags };
}

function generatePostFile(post, postNum) {
  const { categories, tags } = inferCategoriesAndTags(post.slug, post.title, post.content);
  
  // Clean excerpt - remove URLs and fix formatting
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
  
  const fileContent = `import type { InsertBlogPost } from '../../schema/blog/blog-post.table'

/**
 * Blog Post: ${post.title}
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
    title: ${JSON.stringify(post.title)},
    metaTitle: ${JSON.stringify(post.metaTitle || post.title)},
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

function generateImageFile(post, postNum, imageData) {
  if (!imageData || !imageData.localPath) {
    return null;
  }
  
  // Use default dimensions (can be updated later)
  const width = 1392;
  const height = 752;
  
  const fileContent = `import type { InsertImage } from '../../schema/blog/image.table'

/**
 * Featured Image for: ${post.title}
 *
 * Migrated from old website
 */

export const image: Omit<InsertImage, 'id' | 'createdAt' | 'updatedAt'> = {
    url: 'https://lcqnjgugr2aws94e.public.blob.vercel-storage.com/posts/${post.slug}/featured-image.jpg',
    alt: ${JSON.stringify(imageData.alt || post.title)},
    title: ${JSON.stringify(imageData.title || post.title)},
    description: ${JSON.stringify(`Featured image for ${post.title}`)},
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

for (let i = 0; i < postsData.length; i++) {
  const post = postsData[i];
  const postNum = String(i + 2).padStart(2, '0');
  const imageData = imageResults.find(r => r.slug === post.slug);
  
  // Generate post file
  const postContent = generatePostFile(post, postNum);
  const postFilename = `${postNum}-${post.slug}.post.ts`;
  fs.writeFileSync(`${seedDir}/${postFilename}`, postContent);
  console.log(`✓ Created ${postFilename}`);
  
  // Generate image file if image exists
  if (imageData && imageData.localPath) {
    const imageContent = generateImageFile(post, postNum, imageData);
    if (imageContent) {
      const imageFilename = `${postNum}-${post.slug}.image.ts`;
      fs.writeFileSync(`${seedDir}/${imageFilename}`, imageContent);
      console.log(`✓ Created ${imageFilename}`);
    }
  }
}

console.log(`\n✓ Generated ${postsData.length} post files`);
console.log(`✓ Generated ${imageResults.filter(r => r.localPath).length} image files`);

