# LLM & Generative Engine Optimization (GEO)

**Version:** 1.0
**Last Updated:** January 2026
**Purpose:** Documentation for AI search engine optimization features

---

## Overview

This site is optimized for AI-powered search engines (ChatGPT, Perplexity, Claude, Google AI Overviews) in addition to traditional SEO. These optimizations help the site appear in AI-generated answers and citations.

---

## Quick Reference

| Feature           | Endpoint/Location                            | Purpose                           |
| ----------------- | -------------------------------------------- | --------------------------------- |
| llms.txt          | `/llms.txt`                                  | Concise AI content guide          |
| llms-full.txt     | `/llms-full.txt`                             | Comprehensive content dump        |
| AI Crawler Access | `robots.txt`                                 | Allows GPTBot, ClaudeBot, etc.    |
| QuickAnswer       | `@/components/shared/quick-answer.component` | Citation-optimized content blocks |
| Speakable Schema  | `@workspace/seo`                             | Voice search optimization         |
| Author Pages      | `/blog/authors/[slug]`                       | E-E-A-T signals                   |

---

## 1. llms.txt Specification

Following the [llms.txt specification](https://llmstxt.org/), we provide structured content for AI crawlers.

### Endpoints

**`/llms.txt`** - Concise guide containing:

- Business overview and credentials
- Procedures organized by category
- Recent blog posts (dynamically fetched)
- Contact information
- Link to full documentation

**`/llms-full.txt`** - Comprehensive dump containing:

- Complete business details with coordinates
- All procedures with FAQs and quick facts
- Service area information
- Full business hours

### Implementation

```
apps/web/app/llms.txt/route.ts      # Dynamic route handler
apps/web/app/llms-full.txt/route.ts # Comprehensive version
```

Content is generated dynamically from:

- `siteConfig` (business info)
- `procedures` data
- Blog posts via `getPublishedPostCardsPage()`

---

## 2. AI Crawler Access

### Allowed Crawlers

The following AI crawlers are explicitly allowed in `robots.txt`:

| Crawler         | Service                         |
| --------------- | ------------------------------- |
| GPTBot          | OpenAI/ChatGPT                  |
| ChatGPT-User    | ChatGPT browsing                |
| OAI-SearchBot   | OpenAI search                   |
| ClaudeBot       | Anthropic/Claude                |
| Claude-Web      | Claude browsing                 |
| PerplexityBot   | Perplexity AI                   |
| Google-Extended | Google AI features              |
| Bingbot         | Microsoft/Bing (powers ChatGPT) |

### Configuration

```
packages/seo/src/utils/robots-generator.util.ts
```

Crawling is controlled by `NEXT_PUBLIC_ALLOW_CRAWLING` environment variable.

---

## 3. QuickAnswer Component

Optimized for AI citations with the "Question → Answer → Explanation" pattern.

### Usage

```tsx
import { QuickAnswer } from '@/components/shared/quick-answer.component'

;<QuickAnswer
    question='How long does breast augmentation recovery take?'
    answer='Most patients return to light activities within 1-2 weeks.'
    details='Full results are visible after 3-6 months as swelling subsides. Our surgeons provide detailed post-operative care instructions.'
    expert={{
        name: 'Dr. Example',
        credentials: 'Board-Certified Plastic Surgeon',
    }}
/>
```

### Features

- Schema.org Question/Answer markup
- Semantic HTML with `itemScope`/`itemProp`
- Expert attribution for E-E-A-T
- Customizable heading levels

---

## 4. Speakable Schema

Voice search optimization using Schema.org SpeakableSpecification.

### Components

```
packages/seo/src/types/schema/speakable.type.ts
packages/seo/src/schemas/speakable.schema.ts
packages/seo/src/react/speakable/speakable-schema.component.tsx
```

### Usage

```tsx
import { SpeakableSchema } from '@workspace/seo/react'

;<SpeakableSchema
    cssSelectors={['.article-summary', '.quick-answer', 'h1']}
    pageUrl='https://example.com/page'
/>
```

Integrated into ArticleSchema and WebPageSchema via `speakable` property.

---

## 5. Freshness Signals

LLMs prioritize recent content. We provide freshness signals via:

### LastUpdated Component

```tsx
import { LastUpdated } from '@/components/shared/last-updated.component'

;<LastUpdated date='2026-01-21' className='text-sm' />
```

### Schema Properties

- `dateModified` on WebPageSchema
- `dateModified` on ArticleSchema
- `datePublished` on all content

---

## 6. Author Pages (E-E-A-T)

Author profile pages establish expertise for medical content.

### Location

```
apps/web/app/blog/authors/[slug]/page.tsx
apps/web/lib/data/authors.data.ts
```

### Features

- Physician schema with medical credentials
- Professional affiliations
- Published articles list
- Social media links

---

## 7. Category Hub Pages

Enhanced category pages build topical authority.

### Features

- 200-300 word unique descriptions
- Category-specific FAQs with schema
- Related category links
- Featured content sections

### Data

```
apps/web/lib/data/category-descriptions.data.ts
```

---

## 8. Review Schema

Testimonials include ReviewSchema for social proof signals.

### Location

```
apps/web/components/shared/testimonials.component.tsx
```

### Features

- Individual review schema per testimonial
- Rating values (1-5 stars)
- Author attribution
- Date published

---

## 9. Bing Verification

ChatGPT primarily uses Bing for web search. Bing verification is supported via:

```typescript
// site-config.ts
seo: {
    verification: {
        google: 'GOOGLE_CODE',
        bing: 'BING_CODE',    // Critical for ChatGPT
        yandex: 'YANDEX_CODE'
    }
}
```

Add verification codes in `apps/web/lib/data/site-config.ts`.

---

## Verification Checklist

- [ ] `/llms.txt` returns valid content
- [ ] `/llms-full.txt` returns comprehensive content
- [ ] `/robots.txt` allows AI crawlers
- [ ] `NEXT_PUBLIC_ALLOW_CRAWLING=true` in production
- [ ] QuickAnswer components on key pages
- [ ] Author pages created for medical content writers
- [ ] Category descriptions populated
- [ ] Bing verification code added (for ChatGPT visibility)

---

## Testing

### Manual Tests

```bash
# Check llms.txt
curl https://yoursite.com/llms.txt

# Check robots.txt for AI crawlers
curl https://yoursite.com/robots.txt | grep -E "GPTBot|ClaudeBot|Perplexity"

# Validate JSON-LD schemas
# Use: https://validator.schema.org/
```

### AI Search Tests

1. Query "Miami plastic surgery" on ChatGPT
2. Query procedures on Perplexity
3. Check Google AI Overviews for branded queries

---

## Resources

- [llms.txt Specification](https://llmstxt.org/)
- [AI Crawler User Agents](https://www.searchenginejournal.com/ai-crawler-user-agents-list/)
- [Speakable Schema](https://developers.google.com/search/docs/appearance/structured-data/speakable)
- [Bing Webmaster Tools](https://www.bing.com/webmasters/)
