# Video SEO - Google Search Console Guide

This guide walks you through notifying Google Search Console about your Instagram video content and monitoring video indexing performance.

## Prerequisites

- Access to Google Search Console for `alluringplasticsurgery.com`
- Video SEO implementation deployed to production
- Updated sitemap with video metadata at `/sitemap/instagram.xml`

---

## Step 1: Submit Updated Sitemap

### 1.1 Access Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property: `alluringplasticsurgery.com`

### 1.2 Navigate to Sitemaps

1. Click **"Sitemaps"** in the left sidebar under "Indexing"
2. You'll see a list of previously submitted sitemaps

### 1.3 Submit or Resubmit Instagram Sitemap

**If the sitemap is already submitted:**

1. Find `sitemap/instagram.xml` in the list
2. Click the three-dot menu next to it
3. Select **"Resubmit sitemap"**
4. Google will re-crawl the sitemap and discover the new video metadata

**If the sitemap is NOT submitted:**

1. In the "Add a new sitemap" field, enter: `sitemap/instagram.xml`
2. Click **"Submit"**
3. Wait a few moments for Google to process it

### 1.4 Verify Sitemap Status

- Status should show as "Success" (green checkmark)
- If you see warnings or errors, click on the sitemap to view details
- Common issues:
    - **404 errors**: Ensure the sitemap route is deployed
    - **XML parsing errors**: Check the sitemap XML format at `https://alluringplasticsurgery.com/sitemap/instagram.xml`

---

## Step 2: Request Indexing for Key Pages

For faster indexing of your most important video posts, manually request indexing.

### 2.1 Identify Top Video Posts

Choose 5-10 of your best-performing Instagram video posts. Consider:

- Recent before/after transformation videos
- Procedure explanation videos
- Patient testimonial videos
- High engagement posts (likes, comments)

### 2.2 Request Indexing

For each video post:

1. Click **"URL Inspection"** in the left sidebar
2. Enter the full URL: `https://alluringplasticsurgery.com/instagram/[CODE]`
3. Click **"Request Indexing"**
4. Wait for Google to crawl the page (this can take a few minutes to a few days)

**Note:** Google limits the number of indexing requests per day. Prioritize your best content.

### 2.3 Check Indexing Status

After requesting indexing:

1. The tool will show whether the URL is indexed
2. If indexed, you'll see:
    - Coverage status
    - Mobile usability
    - Structured data detected (including VideoObject schema)

---

## Step 3: Monitor Video Indexing Report

Google provides a dedicated report for video content indexing.

### 3.1 Access Video Pages Report

1. In Google Search Console, navigate to **"Video pages"** under "Indexing"
2. This report shows:
    - **Total indexed videos**: Number of pages with successfully indexed videos
    - **Not indexed**: Pages with videos that couldn't be indexed
    - **Issues**: Specific problems preventing video indexing

### 3.2 Review Video Indexing Issues

Common issues and solutions:

| Issue                    | Cause                       | Solution                                                              |
| ------------------------ | --------------------------- | --------------------------------------------------------------------- |
| Video not detected       | Missing VideoObject schema  | Verify schema is present on video pages                               |
| Thumbnail not accessible | Invalid thumbnail URL       | Check that thumbnail URLs are publicly accessible                     |
| Video not accessible     | Video file blocked or 404   | Ensure video URLs are valid and not blocked by robots.txt             |
| Missing required fields  | Incomplete VideoObject data | Add all required fields (name, description, thumbnailUrl, uploadDate) |

### 3.3 Check Individual Video Status

1. Click on any issue in the Video pages report
2. View affected URLs
3. Click **"Inspect URL"** to see detailed information
4. Review the **"Video results"** section for:
    - Detected videos on the page
    - Video metadata extracted
    - Any warnings or errors

---

## Step 4: Verify Structured Data

Ensure VideoObject schema is correctly implemented.

### 4.1 Rich Results Test

1. Go to [Rich Results Test](https://search.google.com/test/rich-results)
2. Enter a video post URL: `https://alluringplasticsurgery.com/instagram/[CODE]`
3. Click **"Test URL"**
4. Verify that **VideoObject** appears in the detected structured data
5. Check for any warnings or errors

### 4.2 Schema Markup Validator

1. Go to [Schema Markup Validator](https://validator.schema.org/)
2. Enter your video post URL
3. Verify the VideoObject schema is valid
4. Check that all required properties are present:
    - `name`
    - `description`
    - `thumbnailUrl`
    - `uploadDate`

---

## Step 5: Monitor Performance

Track how your video content performs in search results.

### 5.1 Performance Report

1. Navigate to **"Performance"** in Google Search Console
2. Add filter: **Search appearance** → **Video**
3. View metrics:
    - **Impressions**: How often videos appear in search
    - **Clicks**: How often users click on your videos
    - **Average position**: Where videos rank in search results
    - **CTR**: Click-through rate

### 5.2 Search Appearance Filters

Monitor video-specific search features:

- **Video carousel**: Videos appearing in Google's video carousel
- **Video rich results**: Videos with enhanced search results

### 5.3 Track Progress Over Time

- Video indexing can take 1-4 weeks to fully process
- Check the Video pages report weekly
- Monitor impressions and clicks in the Performance report
- Compare video post performance vs. image posts

---

## Expected Timeline

| Timeframe       | Expected Results                                           |
| --------------- | ---------------------------------------------------------- |
| **24-48 hours** | Sitemap processed, initial crawling begins                 |
| **1 week**      | First videos indexed, appearing in Video pages report      |
| **2-3 weeks**   | Majority of videos indexed                                 |
| **4+ weeks**    | Full indexing complete, videos appearing in search results |

---

## Troubleshooting

### Videos Not Being Indexed

**Check:**

1. VideoObject schema is present on the page (use Rich Results Test)
2. Video URLs are accessible (not blocked by robots.txt)
3. Thumbnail URLs are valid and publicly accessible
4. All required VideoObject fields are populated

**Common fixes:**

- Ensure `contentUrl` points to the actual video file
- Verify `thumbnailUrl` is a valid image URL
- Check that video files are not blocked by CORS or authentication

### Sitemap Errors

**Check:**

1. Sitemap XML is valid (visit the URL directly)
2. Video namespace is included: `xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"`
3. All required video fields are present in the sitemap
4. URLs in the sitemap are absolute (include `https://`)

### Schema Validation Errors

**Check:**

1. All required VideoObject properties are present
2. Date formats are ISO 8601 (e.g., `2024-01-15T10:30:00Z`)
3. URLs are absolute and valid
4. No syntax errors in the JSON-LD

---

## Additional Resources

- [Google Video SEO Best Practices](https://developers.google.com/search/docs/appearance/structured-data/video)
- [Video Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps)
- [VideoObject Schema](https://schema.org/VideoObject)
- [Google Search Console Help](https://support.google.com/webmasters)

---

## Next Steps After Implementation

1. **Week 1**: Submit sitemap and request indexing for top 10 video posts
2. **Week 2**: Check Video pages report for initial indexing results
3. **Week 3**: Review Performance report for video impressions and clicks
4. **Week 4**: Analyze which video types perform best and optimize accordingly
5. **Ongoing**: Monitor video indexing weekly, optimize metadata based on performance

---

**Implementation Date:** December 21, 2024  
**Last Updated:** December 21, 2024
