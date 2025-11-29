# CLAUDE.md

**Alluring Plastic Surgery - Technical & Business Guide**

---

## Business Context

**Business**: Alluring Plastic Surgery — luxury cosmetic surgery clinic.

**Location**: Miami, FL (serves locals + medical tourists from Latin America/Caribbean).

**Tagline**: "Luxury Surgeries Made Affordable"

**Industry**: Elective cosmetic procedures. High-consideration, research-heavy purchase cycle.

**Primary Audience**: Women 25-55, value quality, seek affordability, 60%+ mobile users.

**Sales Model**: Consultation-first. Every page drives to booking. No fluff.

---

## Design Philosophy

### World-Class Design — No AI Slop

We create **immersive, distinctive experiences** that feel luxurious yet accessible.

**We Are**:

- UX-first, conversion-focused
- Distinctive, not template-driven
- Immersive (sticky heroes, video backgrounds, glassmorphism)
- Mobile-optimized

**We Avoid**:

- Generic fonts (Inter, Roboto, Arial)
- Overused purple gradients
- Cookie-cutter layouts
- Bland color schemes

### Visual Identity

| Element               | Value                                          |
| --------------------- | ---------------------------------------------- |
| **Primary Palette**   | Stone (`stone-50`, `stone-900`)                |
| **Accent**            | Gold (`gold-500`, `gold-400`)                  |
| **Headings**          | Serif font (`font-serif`)                      |
| **Body**              | Sans-serif (`font-sans`)                       |
| **Signature Pattern** | Glassmorphism (`bg-white/80 backdrop-blur-xl`) |

---

## SEO & Performance (Critical)

### SSR-First Architecture

**All marketing content MUST be server-rendered.**

| Requirement       | Implementation                              |
| ----------------- | ------------------------------------------- |
| Server Components | Default — no `'use client'` for content     |
| CSS Animations    | Use `animate-fade-in-up`, `animate-delay-*` |
| Semantic HTML     | `article`, `section`, `ol`, proper headings |
| Accessibility     | `aria-labelledby`, `aria-label`, alt text   |
| Visible Content   | No `opacity: 0` initial states              |

### Client Components — Only When Needed

- Interactive forms
- Carousels with user controls
- Modals/dialogs
- Real-time booking widgets

---

## Source of Truth

**Site Config**: `apps/web/lib/data/site-config.ts`

Contains: phone, address, hours, social links, SEO defaults.

```tsx
import {
    getFullAddress,
    getPhoneLink,
    siteConfig,
} from '@/lib/data/site-config'
```

**Do not hardcode business information.**

---

## Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Framework  | Next.js 15 (App Router)                           |
| CSS        | Tailwind CSS v4                                   |
| UI Library | shadcn/ui (New York style)                        |
| Icons      | Lucide React                                      |
| Animations | CSS-first, Framer Motion for complex interactions |

---

## Layout Patterns

### 1. Marketing Pages (Home, Procedures, Financing)

```tsx
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
```

### 2. Content Pages (Blog, Legal)

```tsx
import { ContainerLayout } from '@/components/container-layout.component'
```

---

## Shared Components

**Always check `@/components/shared` before building new components.**

Key components: `SectionHeader`, `CTASection`, `FeatureCard`, `ImageSection`, `Gallery`, `MobileCallButton`

```tsx
import { CTASection, SectionHeader } from '@/components/shared'
```

---

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm dlx shadcn@latest add <name> -c apps/web  # Add shadcn component
```

---

## Specialized Agents

| Task        | Agent                             |
| ----------- | --------------------------------- |
| UI/Design   | `@agent-ui-ux-designer`           |
| SEO Content | `@agent-seo-content-expert`       |
| Engineering | `@agent-software-engineer`        |
| TypeScript  | `@agent-typescript`               |
| Testing     | `@agent-unit-testing-agent`       |
| Images      | `@agent-image-creator-expert`     |
| Blog Posts  | `@agent-blog-post-creator-expert` |
