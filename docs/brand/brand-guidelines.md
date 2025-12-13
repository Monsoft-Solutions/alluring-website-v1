# Keel Brand Guidelines

**by MonsoftLabs**

---

## Brand Essence

**Keel** is the foundation for building production-grade websites. Like the structural keel of a ship, it provides stability, direction, and the essential base that everything else is built upon.

### Core Philosophy

Less is more. Keel removes complexity, not capability.

### Brand Promise

Production-ready in hours, not weeks.

---

## Visual Identity

### Logo

**Primary Mark**

```
KEEL
```

- Wordmark only, no icon
- Sans-serif, medium weight
- All caps for logo usage
- Lower case for body text references

**Minimum Size**

- Digital: 80px width
- Print: 0.5 inches width

**Clear Space**

- Minimum padding: height of "K" on all sides

### Color Palette

**Primary**

- Neutral 950: `#0a0a0a` (headings, primary text)
- Neutral 50: `#fafafa` (backgrounds, inverse text)

**Secondary**

- Neutral 700: `#404040` (body text)
- Neutral 200: `#e5e5e5` (borders, dividers)

**Accent**

- Define per implementation
- Keep minimal, use sparingly
- Recommend: Single accent from brand palette

**Usage**

- Primarily monochromatic
- High contrast always
- Accent color only for CTAs and key interactions

### Typography

**Headings**

- Font: System font stack (Geist, Inter, or default)
- Weight: 600–700
- Tracking: Tight (-0.02em to -0.01em)

**Body**

- Font: System font stack
- Weight: 400
- Line height: 1.6–1.75
- Size: 16px base

**Code**

- Font: Monospace (JetBrains Mono, Fira Code, or default)
- Weight: 400

**Scale**

- Mobile-first approach
- Fluid typography (clamp values)
- Maximum 3–4 size variations per section

### Spacing System

Use Tailwind's default spacing scale exclusively:

- 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px
- No custom values
- Consistent vertical rhythm

### Grid & Layout

**Container Widths** (via ContentWrapper)

- `sm`: max-w-3xl (prose, blog posts)
- `md`: max-w-5xl (forms, narrow content)
- `lg`: max-w-7xl (default)
- `xl`: max-w-screen-2xl (wide layouts)
- `full`: max-w-full (edge-to-edge)

**Breakpoints** (Tailwind defaults)

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

---

## Voice & Tone

### Writing Principles

**Clear over clever**

- Direct statements over metaphors
- Active voice preferred
- Short sentences

**Technical but accessible**

- Avoid jargon unless necessary
- Explain complex concepts simply
- Assume developer audience

**Confident, not arrogant**

- "Built for production" not "The only solution"
- Show, don't tell

### Messaging Framework

**What we say:**

- Production-ready
- Type-safe
- Enterprise-grade
- Built with Next.js 15
- Hours, not weeks

**What we don't say:**

- Revolutionary/game-changing
- "Blazing fast"
- "World-class"
- Over-promising features
- Comparing directly to competitors

### Example Copy

**Homepage Hero**

```
The foundation for production websites.
Built with Next.js 15. Ready in hours.
```

**Feature Description**

```
Type-safe from database to UI.
PostgreSQL + Drizzle ORM + TypeScript.
```

**CTA Copy**

- "Start building" (not "Get started now!")
- "View documentation" (not "Learn more")
- "See features" (not "Discover what's possible")

---

## UI Patterns

### Components

**Use shadcn/ui exclusively**

- New York style variant
- Minimal customization
- Neutral base color

**Component Philosophy**

- Composition over configuration
- Single responsibility
- Progressive disclosure

### Interactions

**Animations**

- Subtle, purposeful
- Duration: 150–300ms
- Ease: ease-in-out
- Avoid decorative animations

**Hover States**

- Minimal: opacity, scale, or color shift
- Consistent across similar elements
- Never more than one property change

**Loading States**

- Skeleton loaders preferred
- Simple spinners for actions
- Maintain layout stability

### Imagery

**Photography**

- Minimal or none
- High contrast
- Clean, professional
- Avoid stock photo clichés

**Illustrations**

- Use sparingly
- Line-based, simple
- Monochrome or single accent
- Never decorative

**Icons**

- Lucide React library
- Stroke weight: 2px
- Size: 16px or 24px
- Align to text baseline

### Dark Mode

**Strategy**

- System preference default
- Manual toggle available
- Equal weight to both modes

**Palette Adjustments**

- Invert neutral scale
- Reduce contrast slightly for dark
- Maintain accent colors

---

## Content Strategy

### Documentation

**Structure**

- Single page when possible
- Progressive disclosure
- Code examples over explanation
- Always show TypeScript

**Code Blocks**

- Syntax highlighting
- Copy button
- Language label
- Minimal comments

### Marketing Pages

**Homepage**

- Hero: One sentence value prop
- Features: Grid of 3–6 items
- No more than 3 sections
- Single CTA above fold

**About**

- Mission first
- Team optional
- Story brief
- No corporate speak

**Contact**

- Form above fold
- Phone/email visible
- No chatbots
- Real response time stated

### Blog

**Style**

- Technical depth encouraged
- Practical examples required
- No fluff
- Title: Clear, descriptive (not clickbait)

**Format**

- TL;DR at top
- Scannable headers
- Code-first when relevant
- Links to docs

---

## Technical Standards

### Performance

**Metrics**

- Lighthouse Score: 90+ all categories
- Core Web Vitals: Green
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s

**Optimization**

- Next.js Image component required
- Lazy load below fold
- Font optimization enabled
- No unnecessary JavaScript

### SEO

**Requirements**

- Unique meta per page
- Semantic HTML
- Alt text on images
- Structured data (JSON-LD)
- Dynamic sitemap
- Proper heading hierarchy

### Accessibility

**Standards**

- WCAG 2.1 AA minimum
- Keyboard navigation complete
- ARIA labels where needed
- Color contrast 4.5:1 minimum
- Focus indicators visible
- Screen reader tested

---

## Implementation Checklist

### New Project Setup

- [ ] Update `site-config.ts` with business details
- [ ] Replace logo, favicon, OG image
- [ ] Set accent color in Tailwind config
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Update footer links
- [ ] Test responsive behavior
- [ ] Verify SEO metadata
- [ ] Enable analytics
- [ ] Test dark mode

### Content Creation

- [ ] Write clear, direct copy
- [ ] Use ContentWrapper sizing appropriately
- [ ] Add alt text to images
- [ ] Optimize image sizes
- [ ] Test readability (Hemingway 8 or below)
- [ ] Check grammar (Grammarly/LanguageTool)
- [ ] Verify CTAs are clear
- [ ] Test all links

### Pre-Launch

- [ ] Lighthouse audit (all pages)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness verified
- [ ] Forms tested and validated
- [ ] 404 page customized
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Analytics tracking verified
- [ ] SSL certificate active
- [ ] Backup configured

---

## Don'ts

### Visual

- No gradients (unless brand accent)
- No drop shadows (except elevation)
- No decorative animations
- No carousels/sliders
- No auto-playing media
- No modal pop-ups on entry

### Content

- No lorem ipsum in production
- No "click here" link text
- No vague CTAs
- No walls of text
- No marketing jargon
- No ALL CAPS in body copy

### Technical

- No custom CSS (use Tailwind)
- No inline styles (except dynamic values)
- No `any` types in TypeScript
- No console.log in production
- No unoptimized images
- No client components without reason

---

## Resources

### Internal

- Template: github.com/Monsoft-Solutions/alluring-website-v1
- Documentation: `/docs` folder
- AI Agents: `.cursor/rules` folder

### External

- Next.js: nextjs.org/docs
- Tailwind CSS: tailwindcss.com/docs
- shadcn/ui: ui.shadcn.com
- Lucide Icons: lucide.dev

---

## Contact

Questions about Keel brand usage?
Contact MonsoftLabs team.

---

**Version 1.0** • Last updated: October 2025
