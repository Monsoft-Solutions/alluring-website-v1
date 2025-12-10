# Instagram Content Automation Implementation Plan

**Date**: November 30, 2025  
**Feature**: Instagram Scraping & SEO Page Generation Automation  
**Estimated Effort**: 6-8 weeks  
**Complexity**: High

---

## Executive Summary

This implementation plan outlines the architecture and development phases for an automated system that scrapes Instagram content from Alluring Plastic Surgery's social media account and transforms it into SEO-optimized website pages. The system will handle videos (with transcription and Spanish-to-English translation) and images (with AI-powered analysis and categorization).

### Key Objectives

1. **Automated Content Ingestion**: Scrape Instagram posts using ScrapingDog API
2. **Video Processing Pipeline**: Extract audio, transcribe, translate Spanish content
3. **Image Analysis Pipeline**: AI-powered categorization (Before & After, Patient Results, Marketing)
4. **SEO Page Generation**: Create optimized pages for each processed post
5. **Daily Automation**: Scheduled scraping and processing via Vercel Cron Jobs

---

## Technical Analysis

### Current State Assessment

| Component        | Current Implementation       |
| ---------------- | ---------------------------- |
| Framework        | Next.js 15 (App Router)      |
| Database         | PostgreSQL with Drizzle ORM  |
| Storage          | Vercel Blob (`@vercel/blob`) |
| Hosting          | Vercel                       |
| Image Generation | fal.ai MCP tools (existing)  |
| Email            | Resend                       |

### Vercel Serverless Limitations

**Challenge**: Vercel serverless functions have limitations for video processing:

- 50MB package size limit (standard)
- 10-second execution timeout (Hobby), 60s (Pro)
- No native FFmpeg support

**Solution**: Hybrid approach:

1. **Script-based Processing**: Run intensive video processing locally or in a GitHub Action
2. **Cloud Services**: Leverage Replicate/fal.ai for transcription
3. **Vercel Fluid Compute**: For simpler audio extraction (if needed on-demand)

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Instagram Automation System                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
│  │  ScrapingDog │───▶│   Vercel     │───▶│      PostgreSQL          │  │
│  │  Instagram   │    │   Cron Job   │    │  (instagram_post table)  │  │
│  │     API      │    │  (Daily)     │    └──────────────────────────┘  │
│  └──────────────┘    └──────────────┘                                   │
│                             │                                            │
│                             ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Processing Pipeline                            │   │
│  │  ┌─────────────────────┐    ┌────────────────────────────────┐   │   │
│  │  │   Video Pipeline     │    │      Image Pipeline            │   │   │
│  │  │   ───────────────    │    │      ──────────────            │   │   │
│  │  │   1. Download Video  │    │   1. Download Image(s)         │   │   │
│  │  │   2. Extract Audio   │    │   2. Upload to Vercel Blob     │   │   │
│  │  │   3. Transcribe      │    │   3. Analyze with GPT-4o       │   │   │
│  │  │      (Whisper API)   │    │   4. Categorize Content        │   │   │
│  │  │   4. Translate       │    │   5. Generate Description      │   │   │
│  │  │      (if Spanish)    │    │                                │   │   │
│  │  │   5. Upload to Blob  │    └────────────────────────────────┘   │   │
│  │  └─────────────────────┘                                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                             │                                            │
│                             ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                   SEO Page Generation                             │   │
│  │   • /results/[category]/[slug] - Individual post pages            │   │
│  │   • /results - Main gallery page                                  │   │
│  │   • /results/before-after - Before & After gallery                │   │
│  │   • /results/patient-results - Patient results gallery            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Dependencies & Prerequisites

### New NPM Packages

```json
{
    "dependencies": {
        "openai": "^4.68.0",
        "replicate": "^0.34.0"
    },
    "devDependencies": {
        "fluent-ffmpeg": "^2.1.3",
        "@ffmpeg-installer/ffmpeg": "^1.1.0"
    }
}
```

### Required API Keys & Services

| Service              | Purpose                                                 | Environment Variable               |
| -------------------- | ------------------------------------------------------- | ---------------------------------- |
| ScrapingDog          | Instagram scraping                                      | `SCRAPINGDOG_API_KEY`              |
| OpenAI               | Whisper (transcription), GPT-4o Vision (image analysis) | `OPENAI_API_KEY`                   |
| Replicate (optional) | Alternative transcription                               | `REPLICATE_API_TOKEN`              |
| Vercel Blob          | Media storage                                           | `BLOB_READ_WRITE_TOKEN` (existing) |

### ScrapingDog API Details

**Endpoint**: `https://api.scrapingdog.com/instagram/`

**Parameters**:

- `api_key`: Your API key
- `username`: Instagram username
- `next_token`: Pagination token for subsequent requests

**Response Structure** (estimated):

```json
{
    "posts": [
        {
            "id": "instagram_post_id",
            "shortcode": "ABC123",
            "timestamp": 1732968000,
            "caption": "Post caption text...",
            "media_type": "video|image|carousel",
            "display_url": "https://...",
            "video_url": "https://...",
            "is_video": true,
            "carousel_media": [{ "display_url": "...", "is_video": false }],
            "like_count": 150,
            "comment_count": 25
        }
    ],
    "next_token": "pagination_token_here",
    "user": {
        "id": "user_id",
        "username": "alluringplasticsurgery",
        "full_name": "Alluring Plastic Surgery"
    }
}
```

---

## Database Schema Design

### New Tables

#### 1. `instagram_post` Table

```sql
-- Instagram Post: Core post metadata
CREATE TABLE instagram_post (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instagram_id VARCHAR(255) NOT NULL UNIQUE,
    shortcode VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,

    -- Content
    caption TEXT,
    generated_title VARCHAR(500),
    generated_description TEXT,
    seo_content TEXT,  -- Long-form SEO content generated by AI

    -- Metadata
    media_type VARCHAR(20) NOT NULL,  -- 'video', 'image', 'carousel'
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    posted_at TIMESTAMP NOT NULL,

    -- Processing status
    status VARCHAR(30) DEFAULT 'pending',  -- pending, processing, ready, published, failed
    processing_error TEXT,

    -- Publication
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_instagram_post_status ON instagram_post(status);
CREATE INDEX idx_instagram_post_media_type ON instagram_post(media_type);
CREATE INDEX idx_instagram_post_posted_at ON instagram_post(posted_at);
CREATE INDEX idx_instagram_post_published ON instagram_post(is_published, published_at);
```

#### 2. `instagram_media` Table

```sql
-- Instagram Media: Individual media items (images/videos)
CREATE TABLE instagram_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instagram_post_id UUID NOT NULL REFERENCES instagram_post(id) ON DELETE CASCADE,

    -- Original Instagram URLs
    original_url TEXT NOT NULL,
    original_video_url TEXT,  -- For videos

    -- Processed URLs (Vercel Blob)
    blob_url TEXT,
    thumbnail_url TEXT,

    -- Media info
    media_type VARCHAR(20) NOT NULL,  -- 'video', 'image'
    media_index INTEGER DEFAULT 0,  -- For carousel ordering
    width INTEGER,
    height INTEGER,
    duration_seconds INTEGER,  -- For videos

    -- AI Analysis
    ai_analysis JSONB,  -- Full analysis response
    content_categories TEXT[],  -- ['before_after', 'patient_result', etc.]
    detected_procedure VARCHAR(100),  -- 'bbl', 'breast_augmentation', etc.
    content_description TEXT,
    alt_text TEXT,

    -- Processing
    status VARCHAR(30) DEFAULT 'pending',
    processing_error TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_instagram_media_post ON instagram_media(instagram_post_id);
CREATE INDEX idx_instagram_media_categories ON instagram_media USING GIN(content_categories);
CREATE INDEX idx_instagram_media_procedure ON instagram_media(detected_procedure);
```

#### 3. `instagram_transcription` Table

```sql
-- Instagram Transcription: Audio transcriptions for videos
CREATE TABLE instagram_transcription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instagram_media_id UUID NOT NULL REFERENCES instagram_media(id) ON DELETE CASCADE,

    -- Transcription
    original_language VARCHAR(10) DEFAULT 'es',  -- 'es', 'en', 'auto'
    original_text TEXT NOT NULL,

    -- Translation (if applicable)
    translated_text TEXT,
    translation_language VARCHAR(10) DEFAULT 'en',

    -- Processing metadata
    transcription_model VARCHAR(100),  -- 'whisper-1', etc.
    confidence_score DECIMAL(4,3),
    duration_seconds INTEGER,
    word_count INTEGER,

    -- Processing
    status VARCHAR(30) DEFAULT 'pending',
    processing_error TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_instagram_transcription_media ON instagram_transcription(instagram_media_id);
```

#### 4. `instagram_category` Table

```sql
-- Instagram Category: Content categorization
CREATE TABLE instagram_category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    -- SEO
    seo_title VARCHAR(255),
    seo_description TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Seed default categories
INSERT INTO instagram_category (name, slug, description, display_order) VALUES
    ('Before & After', 'before-after', 'Transformation photos showing procedure results', 1),
    ('Patient Results', 'patient-results', 'Patient testimonials and result showcases', 2),
    ('Educational', 'educational', 'Educational content about procedures', 3),
    ('Behind the Scenes', 'behind-scenes', 'Behind the scenes at our clinic', 4),
    ('Promotions', 'promotions', 'Special offers and announcements', 5),
    ('General', 'general', 'General content and updates', 99);
```

#### 5. `instagram_post_category` Table (Junction)

```sql
-- Junction table for post-category relationship
CREATE TABLE instagram_post_category (
    instagram_post_id UUID NOT NULL REFERENCES instagram_post(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES instagram_category(id) ON DELETE CASCADE,
    PRIMARY KEY (instagram_post_id, category_id)
);
```

#### 6. `instagram_scrape_log` Table

```sql
-- Scrape logging for monitoring and debugging
CREATE TABLE instagram_scrape_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Scrape details
    scrape_type VARCHAR(30) NOT NULL,  -- 'full', 'incremental'
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,

    -- Results
    posts_fetched INTEGER DEFAULT 0,
    posts_new INTEGER DEFAULT 0,
    posts_updated INTEGER DEFAULT 0,
    posts_failed INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(30) DEFAULT 'running',  -- running, completed, failed
    error_message TEXT,

    -- API usage
    api_calls_made INTEGER DEFAULT 0,
    next_token TEXT  -- Store for resume capability
);

CREATE INDEX idx_scrape_log_status ON instagram_scrape_log(status);
CREATE INDEX idx_scrape_log_started ON instagram_scrape_log(started_at);
```

### Drizzle Schema Files

Create the following files in `packages/db/src/schema/instagram/`:

1. `instagram-post.table.ts`
2. `instagram-media.table.ts`
3. `instagram-transcription.table.ts`
4. `instagram-category.table.ts`
5. `instagram-post-category.table.ts`
6. `instagram-scrape-log.table.ts`
7. `instagram-relations.ts`
8. `index.ts`

---

## Implementation Phases

### Phase 1: Database Schema & Foundation (Week 1)

**Objectives**:

- Create database tables using Drizzle ORM
- Set up type definitions and schemas
- Create migration files
- Seed default categories

**Deliverables**:

1. **Database Schema Implementation**
    - Create `packages/db/src/schema/instagram/` directory
    - Implement all 6 table definitions in Drizzle
    - Set up relations between tables
    - Export from schema index

2. **Type Definitions**
    - Create `apps/web/lib/types/instagram/` directory
    - Define TypeScript types for:
        - Instagram post data
        - Media types (video, image, carousel)
        - Processing status enums
        - API response types
        - Category types

3. **Migration & Seed**
    - Generate migration file: `pnpm db:generate`
    - Run migration: `pnpm db:migrate`
    - Create category seed file: `packages/db/src/seed/03-instagram-categories.seed.ts`

**Testing Criteria**:

- Migration runs without errors
- All tables created with correct indexes
- Categories seeded successfully
- Relations work correctly in queries

---

### Phase 2: Instagram Scraping Service (Week 2)

**Objectives**:

- Implement ScrapingDog API integration
- Create scraping service with pagination
- Set up incremental scraping logic
- Implement error handling and logging

**Deliverables**:

1. **ScrapingDog API Client**
    - File: `apps/web/lib/services/instagram/scrapingdog.client.ts`
    - Features:
        - Fetch posts with pagination
        - Rate limiting
        - Error handling
        - Response validation with Zod

2. **Scraping Service**
    - File: `apps/web/lib/services/instagram/scraper.service.ts`
    - Features:
        - Full scrape (initial import)
        - Incremental scrape (daily updates)
        - Duplicate detection
        - Scrape log management

3. **API Route for Manual Trigger**
    - File: `apps/web/app/api/instagram/scrape/route.ts`
    - Secured endpoint for manual scrape triggers
    - Admin authentication required

4. **Environment Configuration**
    - Add `SCRAPINGDOG_API_KEY` to env validation
    - Add `INSTAGRAM_USERNAME` for target account

**Code Structure**:

```typescript
// apps/web/lib/services/instagram/scrapingdog.client.ts
export interface ScrapingDogConfig {
    apiKey: string
    username: string
}

export class ScrapingDogClient {
    constructor(config: ScrapingDogConfig)

    async fetchPosts(nextToken?: string): Promise<InstagramPostsResponse>
    async fetchAllPosts(): AsyncGenerator<InstagramPost>
}

// apps/web/lib/services/instagram/scraper.service.ts
export class InstagramScraperService {
    async runFullScrape(): Promise<ScrapeResult>
    async runIncrementalScrape(): Promise<ScrapeResult>
    private async savePost(post: InstagramPost): Promise<void>
    private async updateExistingPost(post: InstagramPost): Promise<void>
}
```

**Testing Criteria**:

- Successfully fetch posts from ScrapingDog API
- Pagination works correctly
- Posts saved to database without duplicates
- Scrape logs created correctly

---

### Phase 3: Video Processing Pipeline (Week 3)

**Objectives**:

- Implement video download and processing
- Set up audio extraction (script-based for local dev, optional cloud for production)
- Integrate OpenAI Whisper for transcription
- Implement Spanish-to-English translation

**Deliverables**:

1. **Video Download Service**
    - File: `apps/web/lib/services/instagram/video-processor.service.ts`
    - Download video from Instagram URL
    - Upload to Vercel Blob
    - Generate thumbnail

2. **Audio Extraction Script**
    - File: `scripts/process-instagram-videos.mjs`
    - Uses FFmpeg for local processing
    - Can be run manually or via GitHub Action

3. **Transcription Service**
    - File: `apps/web/lib/services/instagram/transcription.service.ts`
    - OpenAI Whisper API integration
    - Language detection
    - Spanish-to-English translation

4. **Processing Queue**
    - File: `apps/web/lib/services/instagram/processing-queue.service.ts`
    - Queue management for video processing
    - Status tracking
    - Error handling with retries

**OpenAI Whisper Integration**:

```typescript
// apps/web/lib/services/instagram/transcription.service.ts
import OpenAI from 'openai'

export class TranscriptionService {
    private openai: OpenAI

    constructor() {
        this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
    }

    async transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
        // Download audio file
        const audioBuffer = await this.downloadAudio(audioUrl)

        // Transcribe with Whisper
        const transcription = await this.openai.audio.transcriptions.create({
            file: audioBuffer,
            model: 'whisper-1',
            response_format: 'verbose_json',
            language: 'es', // Spanish
        })

        return {
            originalText: transcription.text,
            language: transcription.language,
            duration: transcription.duration,
            words: transcription.words,
        }
    }

    async translateToEnglish(text: string): Promise<string> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a professional translator specializing in medical/cosmetic surgery content. Translate the following Spanish text to English, maintaining medical terminology accuracy.',
                },
                { role: 'user', content: text },
            ],
        })

        return response.choices[0].message.content
    }
}
```

**Alternative: fal.ai Whisper**:

```typescript
// Using fal.ai Whisper (if preferred)
import { fal } from '@fal-ai/client'

const result = await fal.subscribe('fal-ai/whisper', {
    input: {
        audio_url: audioUrl,
        task: 'transcribe',
        language: 'es',
    },
})
```

**Testing Criteria**:

- Videos downloaded and uploaded to Vercel Blob
- Audio extracted correctly (locally)
- Transcription accurate for Spanish content
- Translation maintains medical terminology
- Error handling for failed transcriptions

---

### Phase 4: Image Analysis Pipeline (Week 4)

**Objectives**:

- Implement image download and upload
- Set up GPT-4o Vision for image analysis
- Create categorization logic
- Generate SEO-friendly descriptions

**Deliverables**:

1. **Image Processing Service**
    - File: `apps/web/lib/services/instagram/image-processor.service.ts`
    - Download images (including carousel)
    - Upload to Vercel Blob with optimized paths
    - Generate thumbnails

2. **Image Analysis Service**
    - File: `apps/web/lib/services/instagram/image-analyzer.service.ts`
    - GPT-4o Vision integration
    - Content categorization
    - Procedure detection
    - Description generation

3. **Category Assignment Logic**
    - Automatic category assignment based on AI analysis
    - Confidence scoring
    - Manual override capability

**GPT-4o Vision Integration**:

```typescript
// apps/web/lib/services/instagram/image-analyzer.service.ts
import OpenAI from 'openai'

export class ImageAnalyzerService {
    private openai: OpenAI

    constructor() {
        this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
    }

    async analyzeImage(
        imageUrl: string,
        caption?: string
    ): Promise<ImageAnalysis> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4.1',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert at analyzing medical/cosmetic surgery images for a plastic surgery clinic's website.
          
Analyze the image and provide:
1. Category: One of ['before_after', 'patient_result', 'educational', 'behind_scenes', 'promotional', 'general']
2. Detected Procedure: If visible, identify the procedure (e.g., 'bbl', 'breast_augmentation', 'tummy_tuck', 'liposuction', 'mommy_makeover', 'facelift', etc.)
3. Description: A detailed, SEO-friendly description (150-200 words)
4. Alt Text: Accessible alt text for the image (under 125 characters)
5. Is Before/After: Boolean if this appears to be a before/after comparison
6. Content Tags: Array of relevant tags

Respond in JSON format only.`,
                },
                {
                    role: 'user',
                    content: [
                        { type: 'image_url', image_url: { url: imageUrl } },
                        {
                            type: 'text',
                            text: caption
                                ? `Instagram caption: ${caption}`
                                : 'No caption provided',
                        },
                    ],
                },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 1000,
        })

        return JSON.parse(response.choices[0].message.content)
    }
}

// Response type
interface ImageAnalysis {
    category:
        | 'before_after'
        | 'patient_result'
        | 'educational'
        | 'behind_scenes'
        | 'promotional'
        | 'general'
    detected_procedure: string | null
    description: string
    alt_text: string
    is_before_after: boolean
    content_tags: string[]
    confidence_score: number
}
```

**Testing Criteria**:

- Images downloaded and uploaded correctly
- Carousel images processed in order
- AI categorization accurate (>85% accuracy)
- Descriptions are SEO-friendly
- Alt text generated for accessibility

---

### Phase 5: SEO Content Generation (Week 5)

**Objectives**:

- Generate long-form SEO content for each post
- Create optimized page titles and meta descriptions
- Implement internal linking strategy
- Generate structured data (JSON-LD)

**Deliverables**:

1. **SEO Content Generator**
    - File: `apps/web/lib/services/instagram/seo-content.service.ts`
    - Generate unique, long-form content per post
    - Integrate transcriptions and image descriptions
    - Add relevant internal links to procedures

2. **Structured Data Generator**
    - File: `apps/web/lib/seo/instagram-schema.ts`
    - ImageObject schema for images
    - VideoObject schema for videos
    - BreadcrumbList schema

3. **Meta Tag Configuration**
    - Dynamic OG images
    - Twitter cards
    - Canonical URLs

**SEO Content Generation**:

```typescript
// apps/web/lib/services/instagram/seo-content.service.ts
export class SEOContentService {
    async generatePostContent(
        post: InstagramPostWithMedia
    ): Promise<SEOContent> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4.1',
            messages: [
                {
                    role: 'system',
                    content: `You are an SEO content writer for Alluring Plastic Surgery, a luxury cosmetic surgery clinic in Miami, FL. 
          
Create SEO-optimized content for a social media post page. The content should:
1. Be 500-800 words
2. Naturally incorporate keywords related to the procedure
3. Include a compelling hook that encourages consultation booking
4. Reference the clinic's expertise and location (Miami, FL)
5. Be written in a professional yet approachable tone
6. Include relevant internal links (use format: [text](/procedures/procedure-slug))

Available procedures for linking:
- Brazilian Butt Lift: /procedures/brazilian-butt-lift-bbl-miami
- Breast Augmentation: /procedures/breast-augmentation
- Tummy Tuck: /procedures/tummy-tuck
- Liposuction: /procedures/liposuction
- Mommy Makeover: /procedures/mommy-makeover

Target audience: Women 25-55 considering cosmetic procedures.`,
                },
                {
                    role: 'user',
                    content: `Create SEO content for this Instagram post:
          
Caption: ${post.caption}
Media Type: ${post.mediaType}
Category: ${post.categories.join(', ')}
Procedure: ${post.detectedProcedure || 'General'}
${post.transcription ? `Video Transcription: ${post.transcription}` : ''}
Image Descriptions: ${post.media.map((m) => m.contentDescription).join('\n')}`,
                },
            ],
        })

        return {
            title: this.generateTitle(post),
            metaDescription: this.generateMetaDescription(post),
            content: response.choices[0].message.content,
            keywords: this.extractKeywords(post),
        }
    }
}
```

**Testing Criteria**:

- Content is unique and non-duplicative
- Internal links are correctly formatted
- Meta descriptions under 160 characters
- Structured data validates in Google's testing tool
- Content reads naturally (not AI-sounding)

---

### Phase 6: Frontend Page Implementation (Week 6)

**Objectives**:

- Create results gallery page
- Implement individual post pages
- Build category-specific galleries
- Implement infinite scroll/pagination

**Deliverables**:

1. **Page Routes**

    ```
    apps/web/app/
    └── results/
        ├── page.tsx                 # Main gallery
        ├── [category]/
        │   └── page.tsx             # Category gallery
        └── [category]/[slug]/
            └── page.tsx             # Individual post page
    ```

2. **Components**

    ```
    apps/web/components/results/
    ├── results-gallery.component.tsx
    ├── results-card.component.tsx
    ├── results-filter.component.tsx
    ├── video-player.component.tsx
    ├── image-carousel.component.tsx
    ├── transcription-display.component.tsx
    └── index.ts
    ```

3. **API Routes for Pagination**
    - File: `apps/web/app/api/results/route.ts`
    - Cursor-based pagination
    - Category filtering
    - Procedure filtering

**Page Structure**:

```tsx
// apps/web/app/results/[category]/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ResultsPostDetail } from '@/components/results/results-post-detail.component'
import { getInstagramPostBySlug } from '@/lib/queries/instagram/post.query'
import { generateInstagramPostSchema } from '@/lib/seo/instagram-schema'

interface PageProps {
    params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params
    const post = await getInstagramPostBySlug(slug)

    if (!post) return {}

    return {
        title: post.generatedTitle,
        description: post.metaDescription,
        openGraph: {
            title: post.generatedTitle,
            description: post.metaDescription,
            images: post.media.map((m) => ({ url: m.blobUrl, alt: m.altText })),
            type: post.mediaType === 'video' ? 'video.other' : 'article',
        },
    }
}

export default async function ResultsPostPage({ params }: PageProps) {
    const { slug } = await params
    const post = await getInstagramPostBySlug(slug)

    if (!post || !post.isPublished) {
        notFound()
    }

    const jsonLd = generateInstagramPostSchema(post)

    return (
        <>
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ResultsPostDetail post={post} />
        </>
    )
}
```

**Testing Criteria**:

- Pages load under 3 seconds
- Images optimized with Next.js Image
- Videos play correctly
- Pagination works smoothly
- Mobile responsive
- SEO metadata renders correctly

---

### Phase 7: Automation & Cron Jobs (Week 7)

**Objectives**:

- Set up Vercel Cron Jobs for daily scraping
- Implement processing queue for background tasks
- Create admin notification system
- Build monitoring dashboard

**Deliverables**:

1. **Vercel Cron Configuration**
    - File: `vercel.json` (create if not exists)
    - Daily scrape cron job
    - Processing queue trigger

2. **Cron API Routes**
    - File: `apps/web/app/api/cron/instagram-scrape/route.ts`
    - File: `apps/web/app/api/cron/instagram-process/route.ts`

3. **Admin Dashboard Components**
    - Scrape status overview
    - Content review queue
    - Processing error logs

**Vercel Cron Configuration**:

```json
// vercel.json
{
    "crons": [
        {
            "path": "/api/cron/instagram-scrape",
            "schedule": "0 6 * * *"
        },
        {
            "path": "/api/cron/instagram-process",
            "schedule": "0 7 * * *"
        }
    ]
}
```

```typescript
// apps/web/app/api/cron/instagram-scrape/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for Pro plan

export async function GET(request: NextRequest) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const scraperService = new InstagramScraperService()
    const result = await scraperService.runIncrementalScrape()

    return NextResponse.json({
        success: true,
        postsScraped: result.newPosts,
        postsUpdated: result.updatedPosts,
    })
}
```

**Testing Criteria**:

- Cron jobs execute on schedule
- Processing completes within timeout
- Errors are logged and admin notified
- Queue handles concurrent processing
- System recovers from failures

---

### Phase 8: Unit Testing (Week 8)

**Objectives**:

- Comprehensive test coverage for all services
- Integration tests for API routes
- E2E tests for critical user flows
- Mock external API responses

**Deliverables**:

1. **Service Unit Tests**

    ```
    packages/db/src/schema/instagram/__tests__/
    apps/web/lib/services/instagram/__tests__/
    ```

2. **API Route Tests**

    ```
    apps/web/app/api/instagram/__tests__/
    apps/web/app/api/cron/__tests__/
    ```

3. **Component Tests**
    ```
    apps/web/components/results/__tests__/
    ```

**Test Coverage Requirements**:

- Minimum 80% coverage for new code
- 100% coverage for critical processing logic
- All error paths tested

**Example Test**:

```typescript
// apps/web/lib/services/instagram/__tests__/image-analyzer.service.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ImageAnalyzerService } from '../image-analyzer.service'

vi.mock('openai')

describe('ImageAnalyzerService', () => {
    let service: ImageAnalyzerService

    beforeEach(() => {
        service = new ImageAnalyzerService()
    })

    describe('analyzeImage', () => {
        it('should correctly categorize a before/after image', async () => {
            vi.mocked(openai.chat.completions.create).mockResolvedValue({
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                category: 'before_after',
                                detected_procedure: 'bbl',
                                description: 'Before and after BBL results...',
                                alt_text: 'BBL before and after comparison',
                                is_before_after: true,
                                content_tags: [
                                    'bbl',
                                    'transformation',
                                    'results',
                                ],
                                confidence_score: 0.95,
                            }),
                        },
                    },
                ],
            })

            const result = await service.analyzeImage(
                'https://example.com/image.jpg'
            )

            expect(result.category).toBe('before_after')
            expect(result.detected_procedure).toBe('bbl')
            expect(result.is_before_after).toBe(true)
        })

        it('should handle API errors gracefully', async () => {
            vi.mocked(openai.chat.completions.create).mockRejectedValue(
                new Error('API rate limit exceeded')
            )

            await expect(
                service.analyzeImage('https://example.com/image.jpg')
            ).rejects.toThrow('API rate limit exceeded')
        })
    })
})
```

---

### Phase 9: Documentation (Week 8)

**Objectives**:

- Document all new services and APIs
- Create admin user guide
- Write troubleshooting guide
- Update main documentation

**Deliverables**:

1. **Technical Documentation**
    - File: `docs/instagram-automation.md`
    - Architecture overview
    - Service documentation
    - API endpoints reference

2. **Admin Guide**
    - File: `docs/instagram-admin-guide.md`
    - Content review process
    - Manual scrape triggers
    - Error handling procedures

3. **Environment Setup Guide**
    - File: `docs/instagram-setup.md`
    - Required API keys
    - Environment variables
    - Local development setup

---

## Folder Structure

```
apps/web/
├── app/
│   ├── api/
│   │   ├── instagram/
│   │   │   ├── scrape/
│   │   │   │   └── route.ts
│   │   │   └── process/
│   │   │       └── route.ts
│   │   └── cron/
│   │       ├── instagram-scrape/
│   │       │   └── route.ts
│   │       └── instagram-process/
│   │           └── route.ts
│   └── results/
│       ├── page.tsx
│       ├── [category]/
│       │   ├── page.tsx
│       │   └── [slug]/
│       │       └── page.tsx
│       └── layout.tsx
├── components/
│   └── results/
│       ├── results-gallery.component.tsx
│       ├── results-card.component.tsx
│       ├── results-filter.component.tsx
│       ├── video-player.component.tsx
│       ├── image-carousel.component.tsx
│       ├── transcription-display.component.tsx
│       └── index.ts
├── lib/
│   ├── services/
│   │   └── instagram/
│   │       ├── scrapingdog.client.ts
│   │       ├── scraper.service.ts
│   │       ├── video-processor.service.ts
│   │       ├── image-processor.service.ts
│   │       ├── image-analyzer.service.ts
│   │       ├── transcription.service.ts
│   │       ├── seo-content.service.ts
│   │       ├── processing-queue.service.ts
│   │       └── index.ts
│   ├── queries/
│   │   └── instagram/
│   │       ├── post.query.ts
│   │       ├── category.query.ts
│   │       └── index.ts
│   ├── types/
│   │   └── instagram/
│   │       ├── instagram-post.type.ts
│   │       ├── instagram-media.type.ts
│   │       ├── processing-status.enum.ts
│   │       ├── api-response.type.ts
│   │       └── index.ts
│   └── seo/
│       └── instagram-schema.ts
└── hooks/
    └── useInstagramResults.hook.ts

packages/db/src/schema/
└── instagram/
    ├── instagram-post.table.ts
    ├── instagram-media.table.ts
    ├── instagram-transcription.table.ts
    ├── instagram-category.table.ts
    ├── instagram-post-category.table.ts
    ├── instagram-scrape-log.table.ts
    ├── instagram-relations.ts
    └── index.ts

scripts/
└── process-instagram-videos.mjs
```

---

## Configuration Changes

### Environment Variables

Add to `apps/web/env.ts`:

```typescript
server: {
  // ... existing vars ...

  // Instagram Automation
  SCRAPINGDOG_API_KEY: z.string().min(1),
  INSTAGRAM_USERNAME: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  CRON_SECRET: z.string().min(32),

  // Optional: Replicate for alternative transcription
  REPLICATE_API_TOKEN: z.string().optional(),
}
```

### Vercel Configuration

Create `vercel.json`:

```json
{
    "crons": [
        {
            "path": "/api/cron/instagram-scrape",
            "schedule": "0 6 * * *"
        },
        {
            "path": "/api/cron/instagram-process",
            "schedule": "0 7 * * *"
        }
    ],
    "functions": {
        "app/api/cron/**/*.ts": {
            "maxDuration": 300
        },
        "app/api/instagram/**/*.ts": {
            "maxDuration": 60
        }
    }
}
```

### Package.json Updates

Add to `apps/web/package.json`:

```json
{
    "dependencies": {
        "openai": "^4.68.0"
    }
}
```

Add to root scripts:

```json
{
    "scripts": {
        "instagram:scrape-full": "tsx scripts/instagram-full-scrape.ts",
        "instagram:process-videos": "node scripts/process-instagram-videos.mjs"
    }
}
```

---

## Risk Assessment

### Technical Risks

| Risk                                | Impact | Probability | Mitigation                                       |
| ----------------------------------- | ------ | ----------- | ------------------------------------------------ |
| ScrapingDog API rate limits         | Medium | Medium      | Implement exponential backoff, cache responses   |
| Vercel timeout for video processing | High   | High        | Use script-based processing, queue system        |
| OpenAI API costs                    | Medium | Medium      | Monitor usage, set budget alerts, batch requests |
| Instagram blocks scraping           | High   | Low         | Use proxy rotation (ScrapingDog handles this)    |
| AI categorization errors            | Medium | Medium      | Manual review queue, confidence thresholds       |

### Business Risks

| Risk                  | Impact   | Probability | Mitigation                                           |
| --------------------- | -------- | ----------- | ---------------------------------------------------- |
| Copyright concerns    | High     | Low         | Only use clinic's own content                        |
| HIPAA considerations  | Critical | Medium      | Never show identifiable patient info without consent |
| SEO duplicate content | Medium   | Low         | Generate unique content per post                     |
| Content quality       | Medium   | Medium      | Human review before publishing                       |

### Mitigation Strategies

1. **Processing Failures**: Implement retry logic with exponential backoff
2. **API Outages**: Queue failed items for retry, notify admin
3. **Cost Overruns**: Set OpenAI spending limits, monitor daily
4. **Quality Control**: Require admin approval before publishing

---

## Success Metrics

### Technical Metrics

- [ ] 95% uptime for scraping automation
- [ ] < 5% processing failure rate
- [ ] < 3 second page load time for results pages
- [ ] 100% mobile responsive

### SEO Metrics (3-6 months post-launch)

- [ ] 20+ new indexed pages from Instagram content
- [ ] Increase in organic traffic to results pages
- [ ] Improved keyword rankings for procedure-related terms
- [ ] Decreased bounce rate on results pages

### Content Metrics

- [ ] 85%+ AI categorization accuracy
- [ ] < 24 hours from Instagram post to website publication
- [ ] 100% of content has alt text and descriptions

---

## API Cost Estimates

### Monthly Estimates (assuming 30 posts/month)

| Service            | Operation           | Cost per Unit      | Monthly Usage | Monthly Cost |
| ------------------ | ------------------- | ------------------ | ------------- | ------------ |
| ScrapingDog        | API calls           | ~$0.001/call       | 100 calls     | $0.10        |
| OpenAI Whisper     | Audio transcription | $0.006/min         | 60 min        | $0.36        |
| OpenAI GPT-4o      | Image analysis      | $0.01/image        | 90 images     | $0.90        |
| OpenAI GPT-4o      | SEO content         | $0.03/1K tokens    | 150K tokens   | $4.50        |
| OpenAI GPT-4o-mini | Translation         | $0.00015/1K tokens | 100K tokens   | $0.015       |
| Vercel Blob        | Storage             | $0.15/GB           | 2 GB          | $0.30        |

**Estimated Monthly Total**: ~$6-10/month

---

## References

### Official Documentation

- [ScrapingDog Instagram API](https://docs.scrapingdog.com/)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)

### Best Practices

- [Instagram Scraping Best Practices](https://www.scrapingdog.com/blog/scrape-instagram/)
- [FFmpeg on Vercel](https://github.com/vercel-labs/ffmpeg-on-vercel)
- [SEO for User-Generated Content](https://developers.google.com/search/docs/advanced/guidelines/ugc)

### Related Project Documentation

- [Blog Post Seeding System](/docs/BLOG-POST-SEEDING-SYSTEM.md)
- [Shared Components Reference](/docs/shared-components-reference.md)
- [Layout Patterns](/docs/layout-patterns.md)

---

## Appendix: Alternative Approaches Considered

### Video Processing Alternatives

1. **Mux Integration**
    - Pros: Seamless Vercel integration, handles transcoding
    - Cons: Additional cost, overkill for simple use case
    - Decision: Not selected - too complex for current needs

2. **Cloudinary**
    - Pros: Video processing, CDN, transformations
    - Cons: Learning curve, additional vendor
    - Decision: Not selected - Vercel Blob sufficient

3. **GitHub Actions Processing**
    - Pros: Full control, no timeout limits
    - Cons: Complexity, delayed processing
    - Decision: Consider for future if Vercel limits become issue

### Transcription Alternatives

1. **fal.ai Whisper**
    - Pros: Already have fal.ai integration
    - Cons: Less documentation, uncertain pricing
    - Decision: Keep as backup option

2. **AssemblyAI**
    - Pros: Real-time transcription, speaker detection
    - Cons: Additional API to manage
    - Decision: Not selected - OpenAI sufficient

3. **Google Cloud Speech-to-Text**
    - Pros: High accuracy, medical terminology
    - Cons: Complex setup, GCP dependency
    - Decision: Not selected - OpenAI sufficient

---

_Last Updated: November 30, 2025_
_Author: Software Architect Agent_
_Version: 1.0_
