# CLAUDE.md

**Alluring Plastic Surgery - Business & Design Guide**

## 1. Business Context

**Identity**
Alluring Plastic Surgery is a luxury cosmetic and plastic surgery clinic in Miami.

- **Tagline**: "Luxury Surgeries Made Affordable"
- **Vibe**: Professional, high-end, patient-centric, trustworthy.
- **Location**: Miami, FL.

**Source of Truth**
All business information (contact details, address, hours, social links, SEO defaults) is centralized in one file. **Do not hardcode these values.**

- **File**: `apps/web/lib/data/site-config.ts`
- **Usage**: Import `siteConfig` or helpers like `getPhoneLink()` and `getFullAddress()` from `@/lib/data/site-config`.

## 2. Design System & UI Patterns

**Framework**

- **CSS**: Tailwind CSS v4
- **UI Library**: shadcn/ui (New York style, neutral base)
- **Icons**: Lucide React

**Core Layout Patterns**

1.  **Multi-Section Pages** (Home, Services, About)
    - Use `SectionContainer` for the outer section (controls background/spacing).
    - Use `ContentWrapper` for the inner container (controls width).
    - _Example_: Hero section with "muted" background, Features section with "default" background.

2.  **Simple Pages** (Blog Posts, Legal, Tags)
    - Use `ContainerLayout`.
    - Provides a single consistent container with standard padding.

**Visual Style**

- **Palette**: Neutral (slate/zinc), clean white backgrounds, high contrast text.
- **Typography**: System stack (Inter/Geist), clean, readable.
- **Mobile-First**: Always design for mobile response first, then scale up.

## 3. Shared Component Library

**Crucial Rule**: Always check `@/components/shared` before building a new component.

**Key Components**

- `SectionHeader`: Standardized titles with optional badges and descriptions.
- `ImageSection`: Two-column text + image layout (responsive).
- `CTASection`: High-conversion call-to-action blocks.
- `FeatureCard` / `IconCard`: Grid items for features or values.
- `Gallery`: Image showcase with lightbox (for portfolios/results).
- `MobileCallButton`: Sticky bottom contact button for mobile users.

**Import Path**

```tsx
import { CTASection, SectionHeader } from '@/components/shared'
```

## 4. Development Guidelines

**New Features**

- **UI/Design**: Use `@agent-ui-ux-designer`.
- **Logic/Backend**: Use `@agent-software-engineer`.
- **Content/SEO**: Use `@agent-seo-content-expert`.

**Images**

- Use `next/image` for all images.
- Alt text is mandatory for SEO.
- Images should be optimized and sized correctly.

**Content**

- **Tone**: Professional, direct, reassuring.
- Avoid jargon where possible; explain procedures clearly.
- **Spelling**: US English.

## 5. Essential Commands

Run from project root:

- **Start Dev Server**: `pnpm dev`
- **Build Production**: `pnpm build`
- **Add Component**: `pnpm dlx shadcn@latest add <name> -c apps/web`

## 6. Specialized Agents

Use these agents for specific tasks:

- **@agent-ui-ux-designer**: Creating pages, components, responsive design.
- **@agent-typescript**: Type definitions, naming conventions.
- **@agent-software-engineer**: Feature implementation, refactoring.
- **@agent-unit-testing-agent**: Writing tests (Vitest).
- **@agent-seo-content-expert**: Writing SEO-optimized content.
- **@agent-image-creator-expert**: Creating AI images.
- **@agent-blog-post-creator-expert**: creating blog posts.
