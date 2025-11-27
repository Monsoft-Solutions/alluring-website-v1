import fs from 'fs'
import https from 'https'

// Extract all posts from sitemap
function fetchSitemap() {
    return new Promise((resolve, reject) => {
        https
            .get(
                'https://www.alluringplasticsurgery.com/post-sitemap1.xml',
                {
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    },
                },
                (res) => {
                    let data = ''
                    res.on('data', (chunk) => {
                        data += chunk
                    })
                    res.on('end', () => {
                        // Parse XML to extract URLs and dates
                        const urlMatches = data.matchAll(/<loc>(.*?)<\/loc>/g)
                        const lastmodMatches = data.matchAll(
                            /<lastmod>(.*?)<\/lastmod>/g
                        )
                        const imageMatches = data.matchAll(
                            /<image:loc><!\[CDATA\[(.*?)\]\]><\/image:loc>/g
                        )

                        const urls = Array.from(urlMatches)
                            .map((m) => m[1])
                            .filter((url) => !url.includes('/blog/'))
                        const lastmods = Array.from(lastmodMatches).map(
                            (m) => m[1]
                        )
                        const images = Array.from(imageMatches).map((m) => m[1])

                        // Match URLs with their lastmod dates
                        const posts = urls.map((url, index) => {
                            const slug =
                                url.split('/').filter(Boolean).pop() || ''
                            return {
                                slug: slug,
                                url: url,
                                publishedAt:
                                    lastmods[index] || new Date().toISOString(),
                                featuredImageUrl: images[index] || null,
                            }
                        })

                        resolve(posts)
                    })
                }
            )
            .on('error', reject)
    })
}

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https
            .get(
                url,
                {
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    },
                },
                (res) => {
                    let data = ''
                    res.on('data', (chunk) => {
                        data += chunk
                    })
                    res.on('end', () => {
                        try {
                            const json = JSON.parse(data)
                            resolve(Array.isArray(json) ? json[0] : json)
                        } catch (e) {
                            reject(e)
                        }
                    })
                }
            )
            .on('error', reject)
    })
}

function htmlToMarkdown(html) {
    let md = html
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#8217;/g, "'")
        .replace(/&#8211;/g, '-')
        .replace(/&#8212;/g, '--')
        .replace(/&hellip;/g, '...')
        .replace(/<h2[^>]*id="([^"]*)"[^>]*>(.*?)<\/h2>/gis, '\n## $2\n')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gis, '\n## $1\n')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gis, '\n### $1\n')
        .replace(/<h4[^>]*>(.*?)<\/h4>/gis, '\n#### $1\n')
        .replace(/<strong>(.*?)<\/strong>/gis, '**$1**')
        .replace(/<b>(.*?)<\/b>/gis, '**$1**')
        .replace(/<em>(.*?)<\/em>/gis, '*$1*')
        .replace(/<i>(.*?)<\/i>/gis, '*$1*')
        .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gis, '[$2]($1)')
        .replace(/<ul[^>]*>/gi, '\n')
        .replace(/<\/ul>/gi, '\n')
        .replace(/<ol[^>]*>/gi, '\n')
        .replace(/<\/ol>/gi, '\n')
        .replace(/<li[^>]*>(.*?)<\/li>/gis, '- $1\n')
        .replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n')
        .replace(/<br[^>]*>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .trim()

    return md
}

function calculateReadingTime(content) {
    const words = content.split(/\s+/).length
    return Math.ceil(words / 200)
}

function generateExcerpt(content, maxLength = 200) {
    const text = content.replace(/[#*\[\]()]/g, '').trim()
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

async function scrapeAllPosts() {
    console.log('Fetching sitemap...')
    const posts = await fetchSitemap()
    console.log(`Found ${posts.length} posts in sitemap\n`)

    const results = []
    const errors = []

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i]
        const postNum = String(i + 2).padStart(2, '0') // Start from 02

        console.log(`[${i + 1}/${posts.length}] Scraping ${post.slug}...`)

        try {
            const apiUrl = `https://www.alluringplasticsurgery.com/wp-json/wp/v2/posts?slug=${post.slug}`
            const data = await fetchJSON(apiUrl)

            if (!data || !data.id) {
                console.log(`  ⚠ Skipping - post not found in API`)
                errors.push({ slug: post.slug, error: 'Post not found in API' })
                continue
            }

            const contentHTML = data.content?.rendered || ''
            const contentMarkdown = htmlToMarkdown(contentHTML)
            const readingTime = calculateReadingTime(contentMarkdown)
            const excerpt = generateExcerpt(contentMarkdown)

            // Get featured image
            let featuredImage = null
            if (data.featured_media) {
                try {
                    const mediaUrl = `https://www.alluringplasticsurgery.com/wp-json/wp/v2/media/${data.featured_media}`
                    const mediaData = await fetchJSON(mediaUrl)
                    featuredImage = {
                        url: mediaData.source_url,
                        alt: mediaData.alt_text || data.title?.rendered || '',
                        title:
                            mediaData.title?.rendered ||
                            data.title?.rendered ||
                            '',
                    }
                } catch (e) {
                    // Use sitemap image if available
                    if (post.featuredImageUrl) {
                        featuredImage = {
                            url: post.featuredImageUrl,
                            alt: data.title?.rendered || '',
                            title: data.title?.rendered || '',
                        }
                    }
                }
            } else if (post.featuredImageUrl) {
                featuredImage = {
                    url: post.featuredImageUrl,
                    alt: data.title?.rendered || '',
                    title: data.title?.rendered || '',
                }
            }

            results.push({
                slug: post.slug,
                postNum,
                title: data.title?.rendered || 'Untitled',
                metaTitle:
                    data.meta?._seopress_titles_title ||
                    data.title?.rendered ||
                    '',
                metaDescription:
                    data.meta?._seopress_titles_desc ||
                    data.excerpt?.rendered
                        ?.replace(/<[^>]+>/g, '')
                        .substring(0, 160) ||
                    '',
                metaKeywords: '',
                excerpt: excerpt,
                content: contentMarkdown,
                readingTime: readingTime,
                publishedAt: post.publishedAt,
                featuredImage: featuredImage,
                categories: data.categories || [],
                tags: data.tags || [],
            })

            console.log(
                `  ✓ Extracted ${contentMarkdown.length} chars, ${readingTime} min read`
            )

            // Small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 500))
        } catch (error) {
            console.error(`  ✗ Error: ${error.message}`)
            errors.push({ slug: post.slug, error: error.message })
        }
    }

    // Save results
    const outputPath = '/tmp/all-scraped-posts.json'
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))

    console.log(`\n✓ Scraped ${results.length} posts successfully`)
    console.log(`✗ Failed: ${errors.length} posts`)
    console.log(`Results saved to ${outputPath}`)

    if (errors.length > 0) {
        fs.writeFileSync(
            '/tmp/scraping-errors.json',
            JSON.stringify(errors, null, 2)
        )
        console.log(`Errors saved to /tmp/scraping-errors.json`)
    }

    return results
}

scrapeAllPosts().catch(console.error)
