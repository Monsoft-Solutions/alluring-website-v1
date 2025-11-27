import https from 'https';
import fs from 'fs';
import { createReadStream } from 'fs';

const postsData = JSON.parse(fs.readFileSync('/tmp/scraped-posts.json', 'utf-8'));

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      } else {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      reject(err);
    });
  });
}

function getImageMetadata(filepath) {
  return new Promise((resolve, reject) => {
    // Use a simple approach - we'll get dimensions from the uploaded image
    const stats = fs.statSync(filepath);
    resolve({
      fileSize: stats.size,
      mimeType: filepath.endsWith('.jpg') || filepath.endsWith('.jpeg') ? 'image/jpeg' : 'image/png'
    });
  });
}

async function processImages() {
  const results = [];
  
  for (let i = 0; i < postsData.length; i++) {
    const post = postsData[i];
    const postNum = String(i + 2).padStart(2, '0');
    
    if (!post.featuredImage || !post.featuredImage.url) {
      console.log(`Post ${postNum} (${post.slug}): No featured image`);
      results.push({ slug: post.slug, image: null });
      continue;
    }
    
    console.log(`Processing image for post ${postNum} (${post.slug})...`);
    
    try {
      const imageUrl = post.featuredImage.url;
      const tempPath = `/tmp/${post.slug}-image.jpg`;
      
      // Download image
      await downloadImage(imageUrl, tempPath);
      console.log(`  ✓ Downloaded to ${tempPath}`);
      
      // Get metadata
      const metadata = await getImageMetadata(tempPath);
      
      results.push({
        slug: post.slug,
        postNum,
        localPath: tempPath,
        originalUrl: imageUrl,
        alt: post.featuredImage.alt || post.title,
        title: post.featuredImage.title || post.title,
        fileSize: metadata.fileSize,
        mimeType: metadata.mimeType,
        originalFilename: `${postNum}-${post.slug}.jpg`
      });
      
    } catch (error) {
      console.error(`  ✗ Error processing image for ${post.slug}:`, error.message);
      results.push({ slug: post.slug, image: null, error: error.message });
    }
  }
  
  // Save results
  fs.writeFileSync('/tmp/image-processing-results.json', JSON.stringify(results, null, 2));
  console.log(`\n✓ Processed ${results.length} images. Results saved to /tmp/image-processing-results.json`);
  console.log('\nNext step: Upload images to Vercel Blob using MCP tools');
  
  return results;
}

processImages().catch(console.error);

