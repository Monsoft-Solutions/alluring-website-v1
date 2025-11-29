import https from 'https';
import fs from 'fs';

const posts = [
  {
    slug: 'why-do-bbl-stink',
    url: 'https://www.alluringplasticsurgery.com/why-do-bbl-stink/',
    publishedAt: '2025-10-21T13:39:41-04:00'
  },
  {
    slug: 'how-long-to-recover-from-bbl',
    url: 'https://www.alluringplasticsurgery.com/how-long-to-recover-from-bbl/',
    publishedAt: '2025-10-03T15:34:40-04:00'
  },
  {
    slug: 'weeks-post-op-breast-augmentation-what-to-expect',
    url: 'https://www.alluringplasticsurgery.com/weeks-post-op-breast-augmentation-what-to-expect/',
    publishedAt: '2025-08-18T12:35:07-04:00'
  },
  {
    slug: 'how-to-reduce-itching-after-lipo',
    url: 'https://www.alluringplasticsurgery.com/how-to-reduce-itching-after-lipo/',
    publishedAt: '2025-08-18T12:33:22-04:00'
  },
  {
    slug: 'what-is-lipo-foam',
    url: 'https://www.alluringplasticsurgery.com/what-is-lipo-foam/',
    publishedAt: '2025-08-18T12:32:50-04:00'
  }
];

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(Array.isArray(json) ? json[0] : json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function htmlToMarkdown(html) {
  // Simple HTML to Markdown conversion
  let md = html
    // Remove HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '--')
    .replace(/&hellip;/g, '...')
    // Headings
    .replace(/<h2[^>]*id="([^"]*)"[^>]*>(.*?)<\/h2>/gis, '\n## $2\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gis, '\n## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gis, '\n### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gis, '\n#### $1\n')
    // Bold and italic
    .replace(/<strong>(.*?)<\/strong>/gis, '**$1**')
    .replace(/<b>(.*?)<\/b>/gis, '**$1**')
    .replace(/<em>(.*?)<\/em>/gis, '*$1*')
    .replace(/<i>(.*?)<\/i>/gis, '*$1*')
    // Links
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gis, '[$2]($1)')
    // Lists
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gis, '- $1\n')
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n')
    // Line breaks
    .replace(/<br[^>]*>/gi, '\n')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  
  return md;
}

function calculateReadingTime(content) {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200); // 200 words per minute
}

function generateExcerpt(content, maxLength = 200) {
  const text = content.replace(/[#*\[\]()]/g, '').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

async function scrapeAll() {
  const results = [];
  
  for (const post of posts) {
    console.log(`Scraping ${post.slug}...`);
    try {
      const apiUrl = `https://www.alluringplasticsurgery.com/wp-json/wp/v2/posts?slug=${post.slug}`;
      const data = await fetchJSON(apiUrl);
      
      const contentHTML = data.content?.rendered || '';
      const contentMarkdown = htmlToMarkdown(contentHTML);
      const readingTime = calculateReadingTime(contentMarkdown);
      const excerpt = generateExcerpt(contentMarkdown);
      
      // Get featured image
      let featuredImage = null;
      if (data.featured_media) {
        try {
          const mediaUrl = `https://www.alluringplasticsurgery.com/wp-json/wp/v2/media/${data.featured_media}`;
          const mediaData = await fetchJSON(mediaUrl);
          featuredImage = {
            url: mediaData.source_url,
            alt: mediaData.alt_text || data.title?.rendered || '',
            title: mediaData.title?.rendered || data.title?.rendered || ''
          };
        } catch (e) {
          console.warn(`  Could not fetch featured image: ${e.message}`);
        }
      }
      
      results.push({
        slug: post.slug,
        title: data.title?.rendered || 'Untitled',
        metaTitle: data.meta?._seopress_titles_title || data.title?.rendered || '',
        metaDescription: data.meta?._seopress_titles_desc || data.excerpt?.rendered?.replace(/<[^>]+>/g, '').substring(0, 160) || '',
        metaKeywords: '',
        excerpt: excerpt,
        content: contentMarkdown,
        readingTime: readingTime,
        publishedAt: post.publishedAt,
        featuredImage: featuredImage,
        categories: data.categories || [],
        tags: data.tags || []
      });
      
      console.log(`  ✓ Extracted ${contentMarkdown.length} chars, ${readingTime} min read`);
    } catch (error) {
      console.error(`  ✗ Error scraping ${post.slug}:`, error.message);
    }
  }
  
  // Save results
  const outputPath = '/tmp/scraped-posts.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n✓ Scraped ${results.length} posts. Results saved to ${outputPath}`);
  return results;
}

scrapeAll().catch(console.error);
