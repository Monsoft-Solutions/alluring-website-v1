# Blog CTA System

**Version:** 2.0  
**Last Updated:** October 19, 2025  
**Status:** ✅ Production Ready

---

## Overview

The Blog CTA (Call-to-Action) system provides intelligent, automated CTA insertion within blog posts. It supports both manual placement via markdown markers and smart automatic placement based on content structure.

## Key Features

✅ **Smart Heading-Based Insertion**

- Automatically finds the next `##` heading after 40% content point
- Falls back to `###` headings if no `##` found
- Preserves document structure and readability

✅ **Manual Placement Control**

- Support for explicit markers: `<!-- CTA -->` or `<!-- CTA:type -->`
- Override automatic placement when needed
- Choose specific CTA variants by type

✅ **Multiple CTA Variants**

- Pre-defined content types (default, consultation, newsletter, etc.)
- Consistent branding and messaging
- Easy to extend with new variants

✅ **Visual Flexibility**

- `inline` variant: Accent box within content flow
- `footer` variant: Large section at post end
- Responsive design with proper spacing

✅ **Type Safety**

- Full TypeScript definitions
- Compile-time validation
- Runtime error handling

---

## Architecture

### Core Components

```
apps/web/lib/
├── utils/inject-cta-marker.util.ts    # CTA insertion logic
├── data/blog-cta-content.ts           # CTA content variants
├── types/blog/blog-cta.type.ts        # TypeScript definitions
└── queries/blog/related-posts.query.ts

apps/web/components/blog/
└── BlogCTA.component.tsx              # CTA component

apps/web/app/[slug]/
└── page.tsx                           # Blog post integration (root-level)
```

### Data Flow

```
1. Blog post content (markdown)
   ↓
2. findCTAInsertionPoint() analyzes content
   ↓
3. Splits content at optimal insertion point
   ↓
4. BlogCTA component renders with appropriate variant
   ↓
5. Seamless integration within post layout
```

---

## CTA Insertion Logic

### Priority Order

The system determines CTA placement using this priority:

1. **Explicit Markers** (Highest Priority)
    - `<!-- CTA -->` - Uses default CTA
    - `<!-- CTA:consultation -->` - Uses specific CTA type
    - Exact placement as specified in markdown

2. **Smart Heading-Based Insertion** (New in v2.0)
    - Calculates 40% content point as starting reference
    - Searches for next `## heading` after 40% point
    - If no `##` found, searches for next `### heading`
    - Inserts before the heading, preferably at preceding blank line

3. **Safe Paragraph Splitting** (Fallback)
    - Splits at paragraph boundaries (blank lines)
    - Avoids breaking markdown structures
    - Respects code blocks, lists, tables, etc.

### Algorithm Details

**Step 1: Check for Explicit Markers**

```typescript
const ctaMarkerRegex = /<!--\s*CTA(?::(\w+))?\s*-->/
const markerMatch = content.match(ctaMarkerRegex)

if (markerMatch) {
    // Use explicit placement
    const ctaId = markerMatch[1] // Extract type if present
    return splitAtMarker(content, markerMatch[0])
}
```

**Step 2: Smart Heading-Based Insertion**

```typescript
const targetLine = Math.floor(totalLines * 0.4) // 40% reference point

// Look for ## heading after target line
for (let i = targetLine; i < totalLines; i++) {
    const line = lines[i]?.trim()
    if (line.startsWith('## ') && !line.startsWith('### ')) {
        headingIndex = i
        break
    }
}

// Fall back to ### heading if no ## found
if (headingIndex === -1) {
    for (let i = targetLine; i < totalLines; i++) {
        const line = lines[i]?.trim()
        if (line.startsWith('### ') && !line.startsWith('#### ')) {
            headingIndex = i
            break
        }
    }
}
```

**Step 3: Clean Insertion Point**

```typescript
// Look backwards from heading to find blank line for cleaner insertion
for (let i = headingIndex - 1; i >= targetLine; i--) {
    const line = lines[i]?.trim()
    if (line === '') {
        splitIndex = i // Insert at blank line
        break
    }
}
```

### Benefits of Heading-Based Logic

✅ **Respects Document Structure**

- CTAs appear before logical section breaks
- Maintains content hierarchy and flow
- Better reading experience

✅ **Improved Engagement**

- Strategic placement at natural pause points
- Higher conversion rates vs. arbitrary percentage splits
- Contextual relevance to surrounding content

✅ **Editor Friendly**

- Content creators can predict CTA placement
- Easy to adjust by moving headings
- Clear visual separation in markdown

---

## CTA Content Variants

### Available Types

| CTA ID         | Purpose           | Primary Button      | Secondary Button     |
| -------------- | ----------------- | ------------------- | -------------------- |
| `default`      | General inquiry   | "Get Started"       | "View Services"      |
| `consultation` | Book consultation | "Book Consultation" | "Learn More"         |
| `keel-product` | Product promotion | "Get Keel"          | "View Documentation" |
| `newsletter`   | Email signup      | "Subscribe"         | "Browse Posts"       |
| `contact`      | Contact form      | "Get In Touch"      | "Call Us"            |

### Content Structure

```typescript
type BlogCTAContent = {
    id: string // Unique identifier
    heading: string // Main CTA heading
    description: string // Supporting text
    primaryButton: {
        text: string // Button text
        href: string // Destination URL
        iconName?: string // Lucide icon name
    }
    secondaryButton?: {
        // Optional second button
        text: string
        href: string
        variant?: 'outline' | 'ghost'
    }
}
```

### Adding New CTA Variants

1. **Add to content configuration**:

```typescript
// apps/web/lib/data/blog-cta-content.ts
export const blogCTAContents: readonly BlogCTAContent[] = [
    // ... existing CTAs
    {
        id: 'custom-cta',
        heading: 'Your Custom Heading',
        description: 'Compelling description that drives action.',
        primaryButton: {
            text: 'Take Action',
            href: '/custom-page',
            iconName: 'arrow-right',
        },
        secondaryButton: {
            text: 'Learn More',
            href: '/about',
            variant: 'outline',
        },
    },
]
```

2. **Update TypeScript documentation**:

```typescript
// Update JSDoc comment with new CTA ID
* Available CTA IDs: default, consultation, keel-product, newsletter, contact, custom-cta
```

3. **Use in blog posts**:

```markdown
<!-- CTA:custom-cta -->
```

---

## Usage Examples

### 1. Automatic Insertion (Recommended)

**No marker needed** - CTA automatically placed before next appropriate heading after 40% content:

```markdown
# Blog Post Title

## Introduction

Content here...

## Problem Statement

More content...

## Solution Details

<!-- CTA will be inserted before this heading automatically -->

Implementation details...

## Conclusion

Final thoughts...
```

**Result**: CTA appears before "## Solution Details" heading.

### 2. Manual Placement with Default CTA

```markdown
# Blog Post Title

## Introduction

Content before CTA...

<!-- CTA -->

## Implementation

Content after CTA...
```

### 3. Manual Placement with Specific CTA Type

```markdown
# Blog Post Title

## Introduction

Content before CTA...

<!-- CTA:consultation -->

## Next Steps

Content after CTA...
```

### 4. Multiple CTAs (Advanced)

```markdown
# Blog Post Title

## Introduction

Content...

<!-- CTA:newsletter -->

## Implementation

More content...

<!-- CTA:consultation -->

## Conclusion

Final content...
```

---

## Visual Variants

### Inline Variant (Default)

```tsx
<BlogCTA variant='inline' ctaId='default' />
```

**Appearance:**

- Accent-colored box (`bg-accent/30`)
- Integrated within content flow
- Moderate visual emphasis
- Perfect for mid-content placement

### Footer Variant

```tsx
<BlogCTA variant='footer' content={customCTAContent} />
```

**Appearance:**

- Large, prominent section
- Full-width container
- Strong visual emphasis
- Ideal for post conclusions

---

## Technical Implementation

### Component Integration

**In blog post page** (`apps/web/app/[slug]/page.tsx` for blog posts):

```tsx
// Split content at CTA insertion point
const { beforeCTA, afterCTA, ctaId } = findCTAInsertionPoint(post.content)

return (
    <article>
        {/* Content before CTA */}
        <PostMarkdown content={beforeCTA} />

        {/* CTA component */}
        <BlogCTA variant="inline" ctaId={ctaId} />

        {/* Content after CTA */}
        <PostMarkdown content={afterCTA} />
    </article>
)
```

### Type Safety

**Insertion result type**:

```typescript
export type CTAInsertionResult = {
    readonly beforeCTA: string // Content before CTA
    readonly afterCTA: string // Content after CTA
    readonly hasMarker: boolean // Whether explicit marker found
    readonly ctaId?: string // CTA type from marker (optional)
}
```

**Component props**:

```typescript
export type BlogCTAProps = {
    variant: 'inline' | 'footer' // Visual style
    content?: BlogCTAContent // Direct content (optional)
    ctaId?: string // Content ID (optional)
}
```

### Error Handling

```typescript
// Component validates content availability
if (!ctaContent) {
    console.error(`BlogCTA: No content found for ctaId "${ctaId}". Component will not render.`)
    return null
}
```

---

## Content Guidelines

### Writing CTA Content

**Heading Best Practices:**

- 3-8 words maximum
- Action-oriented language
- Clear value proposition
- Avoid generic phrases ("Contact us", "Learn more")

**Description Guidelines:**

- 1-2 sentences
- Specific benefit or outcome
- Address reader's likely state at this point
- Create urgency without being pushy

**Button Text:**

- 2-3 words ideal
- Strong action verbs
- Specific rather than generic
- Match the promised outcome

### Example: Well-Written CTA

```typescript
{
    id: 'implementation-help',
    heading: 'Need Implementation Help?',
    description: 'Our team can implement this solution for your business in under 2 weeks. Get a free technical consultation.',
    primaryButton: {
        text: 'Get Help',
        href: '/contact',
        iconName: 'message-circle',
    },
    secondaryButton: {
        text: 'View Portfolio',
        href: '/work',
        variant: 'outline',
    },
}
```

### Integration with Blog Content

**Context Awareness:**

- CTAs should relate to the surrounding content
- Use different CTAs for different post types
- Match CTA urgency to content depth

**Placement Strategy:**

- Technical tutorials → consultation CTA
- Product announcements → product CTA
- How-to guides → newsletter CTA
- Case studies → contact CTA

---

## Analytics & Tracking

### Event Tracking

CTAs automatically track user interactions:

```typescript
// Automatic click tracking
trackClick('cta_button', {
    cta_id: ctaId,
    cta_variant: variant,
    button_type: 'primary' | 'secondary',
    post_slug: slug,
    position: 'before_heading' | 'manual_placement',
})
```

### Metrics to Monitor

**Engagement Metrics:**

- CTA click-through rate (CTR)
- Conversion rate by CTA type
- Performance by placement method (auto vs. manual)

**Content Metrics:**

- Reading depth when CTA appears
- Time spent on page after CTA interaction
- Bounce rate correlation with CTA placement

**A/B Testing Opportunities:**

- CTA content variations
- Placement timing (30% vs. 40% vs. 50%)
- Visual variant performance (inline vs. footer)

---

## Performance Considerations

### Lazy Loading

CTAs use dynamic imports for optimal performance:

```typescript
// Icon components loaded only when needed
const Icon = lazy(() => import(`lucide-react/${iconName}`))
```

### SEO Impact

**Benefits:**

- Longer time on page (engagement signal)
- Lower bounce rate
- Internal link equity distribution

**Considerations:**

- CTAs count toward content length
- Internal links boost page authority
- User experience affects rankings

### Accessibility

**Implementation:**

- Proper ARIA labels on buttons
- Keyboard navigation support
- Screen reader friendly descriptions
- Color contrast compliance (WCAG 2.1 AA)

---

## Testing

### Manual Testing Checklist

**Content Splitting:**

- [ ] Explicit markers work correctly
- [ ] Automatic placement finds appropriate headings
- [ ] Fallback logic handles edge cases
- [ ] Content before/after splits are non-empty

**Component Rendering:**

- [ ] All CTA variants display correctly
- [ ] Icons load and display properly
- [ ] Links navigate to correct destinations
- [ ] Responsive design works on all devices

**Error Handling:**

- [ ] Invalid CTA IDs handled gracefully
- [ ] Missing content doesn't break page
- [ ] Console errors logged appropriately

### Automated Testing

**Unit Tests:**

```typescript
describe('findCTAInsertionPoint', () => {
    it('should find explicit CTA markers', () => {
        const content = 'Content before <!-- CTA:consultation --> Content after'
        const result = findCTAInsertionPoint(content)

        expect(result.hasMarker).toBe(true)
        expect(result.ctaId).toBe('consultation')
        expect(result.beforeCTA).toBe('Content before')
        expect(result.afterCTA).toBe('Content after')
    })

    it('should find next ## heading after 40% point', () => {
        const content =
            generateLongContent() + '\n\n## Target Heading\n\nMore content'
        const result = findCTAInsertionPoint(content)

        expect(result.hasMarker).toBe(false)
        expect(result.afterCTA).toContain('## Target Heading')
    })
})
```

---

## Troubleshooting

### Common Issues

**CTA Not Appearing:**

- Check if content has sufficient length (> 500 words recommended)
- Verify heading structure (## or ### headings exist after 40% point)
- Ensure CTA content exists for the specified ID

**Incorrect Placement:**

- Review heading hierarchy in markdown
- Check for malformed markdown that affects parsing
- Consider using explicit markers for precise control

**Styling Issues:**

- Verify Tailwind classes are properly applied
- Check responsive breakpoints on different devices
- Ensure shadcn/ui components are imported correctly

### Debug Mode

Enable debug logging:

```typescript
// Set environment variable for detailed logs
DEBUG_CTA_INSERTION = true

// Output includes:
// - Content analysis details
// - Heading discovery process
// - Final split point selection
// - Insertion reasoning
```

---

## Roadmap

### Planned Enhancements

**Version 2.1:**

- [ ] A/B testing framework for CTA variants
- [ ] Dynamic CTA selection based on user behavior
- [ ] Analytics dashboard for CTA performance

**Version 2.2:**

- [ ] Visual CTA editor interface
- [ ] Custom CTA templates by post category
- [ ] Advanced targeting (device, traffic source, etc.)

**Version 3.0:**

- [ ] AI-powered CTA content generation
- [ ] Personalized CTA recommendations
- [ ] Conversion funnel optimization

---

## Related Documentation

- **Blog Writing Guidelines:** `docs/blog-writing-guidelines.md`
- **Blog Post Seeding System:** `docs/BLOG-POST-SEEDING-SYSTEM.md`
- **SEO Content Guidelines:** `.cursor/rules/seo-content-expert.mdc`
- **Component Documentation:** `apps/web/components/blog/README.md`

---

## Conclusion

The Blog CTA system provides intelligent, automated call-to-action placement that enhances user engagement while maintaining content quality. The smart heading-based insertion logic ensures CTAs appear at natural break points, creating better user experience and higher conversion rates.

**Key Benefits:**

- ✅ Intelligent automatic placement
- ✅ Manual override capability
- ✅ Multiple content variants
- ✅ Type-safe implementation
- ✅ Analytics integration
- ✅ Performance optimized
- ✅ Accessibility compliant

**Ready to implement?** Use automatic insertion for most posts, with manual markers only when specific placement is crucial.

---

**Created by:** AI Agent (Documentation Writer + Software Engineer)  
**Date:** October 19, 2025  
**Version:** 2.0
