import fs from 'fs'
import https from 'https'

const postsData = JSON.parse(
    fs.readFileSync('/tmp/all-scraped-posts.json', 'utf-8')
)

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath)
        https
            .get(
                url,
                {
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    },
                },
                (response) => {
                    if (response.statusCode === 200) {
                        response.pipe(file)
                        file.on('finish', () => {
                            file.close()
                            resolve(filepath)
                        })
                    } else {
                        file.close()
                        if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
                        reject(
                            new Error(
                                `Failed to download: ${response.statusCode}`
                            )
                        )
                    }
                }
            )
            .on('error', (err) => {
                file.close()
                if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
                reject(err)
            })
    })
}

function getImageMetadata(filepath) {
    const stats = fs.statSync(filepath)
    const ext = filepath.toLowerCase()
    let mimeType = 'image/jpeg'
    if (ext.endsWith('.png')) mimeType = 'image/png'
    if (ext.endsWith('.webp')) mimeType = 'image/webp'

    return {
        fileSize: stats.size,
        mimeType: mimeType,
    }
}

async function processImages() {
    const results = []
    const imagePosts = postsData.filter(
        (p) => p.featuredImage && p.featuredImage.url
    )

    console.log(
        `Processing ${imagePosts.length} images out of ${postsData.length} posts...\n`
    )

    for (let i = 0; i < imagePosts.length; i++) {
        const post = imagePosts[i]

        console.log(
            `[${i + 1}/${imagePosts.length}] Processing image for ${post.slug}...`
        )

        try {
            const imageUrl = post.featuredImage.url
            const tempPath = `/tmp/${post.slug}-image.jpg`

            await downloadImage(imageUrl, tempPath)
            const metadata = await getImageMetadata(tempPath)

            results.push({
                slug: post.slug,
                postNum: post.postNum,
                localPath: tempPath,
                originalUrl: imageUrl,
                alt: post.featuredImage.alt || post.title,
                title: post.featuredImage.title || post.title,
                fileSize: metadata.fileSize,
                mimeType: metadata.mimeType,
                originalFilename: `${post.postNum}-${post.slug}.jpg`,
            })

            console.log(
                `  ✓ Downloaded (${(metadata.fileSize / 1024).toFixed(1)} KB)`
            )

            // Small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 300))
        } catch (error) {
            console.error(`  ✗ Error: ${error.message}`)
            results.push({ slug: post.slug, image: null, error: error.message })
        }
    }

    fs.writeFileSync(
        '/tmp/all-image-processing-results.json',
        JSON.stringify(results, null, 2)
    )
    console.log(
        `\n✓ Processed ${results.filter((r) => r.localPath).length} images`
    )
    console.log(`Results saved to /tmp/all-image-processing-results.json`)

    return results
}

processImages().catch(console.error)
