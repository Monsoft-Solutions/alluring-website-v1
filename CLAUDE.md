# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **Turborepo monorepo** for the Alluring Plastic Surgery website, using **shadcn/ui** components, built with Next.js 15, React 19, and Tailwind CSS v4. The repository uses **pnpm** as the package manager with workspace configuration.

## Project Structure

```
├── apps/
│   └── web/              # Next.js 15 application
├── packages/
│   ├── db/               # Shared database package with Drizzle ORM (exports to @workspace/db)
│   ├── seo/              # Shared SEO utilities and configuration (exports to @workspace/seo)
│   ├── ui/               # Shared shadcn/ui components (exports to @workspace/ui)
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/# Shared TypeScript configuration
```

### Key Architecture Patterns

**Monorepo Package Sharing:**

- The `@workspace/ui` package is the centralized UI component library
- UI components are exported via package.json exports map (components/_, lib/_, hooks/\*)
- The `web` app imports components using workspace protocol: `@workspace/ui/components/button`
- Next.js is configured to transpile the `@workspace/ui` package (see apps/web/next.config.mjs:3)

**shadcn/ui Integration:**

- Components are added at the **root level** targeting the web app: `pnpm dlx shadcn@latest add button -c apps/web`
- This places components in `packages/ui/src/components/` directory (not in apps/web)
- The components.json configuration (apps/web/components.json) defines style="new-york", RSC support, and path aliases
- Global styles are in `packages/ui/src/styles/globals.css` and imported in apps/web/app/layout.tsx:3

**Database Package (@workspace/db):**

- Shared Drizzle ORM package with PostgreSQL support
- Schema files are in `packages/db/src/schema/` directory
- Database client is exported from `@workspace/db/client`
- Type-safe schema exports from `@workspace/db/schema/blog`, `@workspace/db/schema/contact`, `@workspace/db/schema/emails`
- Direct imports from individual schema files for optimal tree-shaking
- Requires `POSTGRES_URL` environment variable in root `.env` file

**SEO Package (@workspace/seo):**

- Shared SEO utilities and configuration for Next.js 15 applications
- Configuration system with environment variable support
- Type-safe SEO configuration types
- Schema.org constants for structured data
- Exports configuration from `@workspace/seo/config`
- Exports utilities from `@workspace/seo/utils`
- Exports types from `@workspace/seo/types`
- Requires SEO environment variables (see Environment Setup below)

## Development Commands

**Prerequisites:**

- Node.js >=20
- pnpm 10.4.1 (run `pnpm --version` to check)

**Common commands (run from root):**

```bash
# Install dependencies
pnpm install

# Start development server (runs all apps)
pnpm dev

# Build all apps and packages
pnpm build

# Lint all packages
pnpm lint

# Format all code
pnpm format

# Type check (from apps/web)
cd apps/web && pnpm typecheck
```

**App-specific commands (run from apps/web):**

```bash
# Development with Turbopack
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint with auto-fix
pnpm lint:fix

# Type checking
pnpm typecheck
```

**Adding shadcn/ui components:**

```bash
# Always run from repository root
pnpm dlx shadcn@latest add <component-name> -c apps/web

# Example: add button component
pnpm dlx shadcn@latest add button -c apps/web
```

This will add the component to `packages/ui/src/components/`.

**Database commands (run from root):**

```bash
# Generate migrations from schema changes
pnpm --filter @workspace/db db:generate

# Run migrations
pnpm --filter @workspace/db db:migrate

# Push schema changes directly (dev only, skips migrations)
pnpm --filter @workspace/db db:push

# Open Drizzle Studio (database GUI)
pnpm --filter @workspace/db db:studio
```

## Technology Stack

- **Build Tool:** Turborepo 2.5.5 with TUI interface
- **Package Manager:** pnpm with workspace protocol
- **Framework:** Next.js 15.4.5 (App Router, RSC enabled)
- **React:** v19.1.1
- **Database:** PostgreSQL with Drizzle ORM 0.38.3
- **Styling:** Tailwind CSS v4.1.11 (using @tailwindcss/postcss)
- **UI Library:** shadcn/ui (New York style, neutral base color)
- **Icons:** Lucide React
- **Theme:** next-themes for dark mode support
- **TypeScript:** 5.7.3 (root) / 5.9.2 (packages)
- **Environment Validation:** @t3-oss/env-nextjs with Zod schemas

## Import Patterns

**Importing UI components in apps/web:**

```tsx
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
```

**Importing database in apps/web:**

```tsx
import { db } from '@workspace/db/client'
import { blogCategory, blogPost } from '@workspace/db/schema/blog'
import { contactSubmission } from '@workspace/db/schema/contact'
import { emailLog } from '@workspace/db/schema/emails'

// Query example
const posts = await db.select().from(blogPost)

// Insert example
await db
    .insert(contactSubmission)
    .values({ name: 'John', email: 'info@alluringplasticsurgery.com' })
```

**Importing SEO utilities in apps/web:**

```tsx
import {
    createDefaultSEOConfig,
    getSiteUrl,
    mergeSEOConfig,
} from '@workspace/seo/config'
import { OrganizationSchema } from '@workspace/seo/react'
import type { SitemapRoute } from '@workspace/seo/types/sitemap/sitemap-route.type'
import { generateSitemapEntries } from '@workspace/seo/utils/sitemap-generator.util'

// Create default SEO configuration from environment variables
const seoConfig = createDefaultSEOConfig()

// Get site URL
const siteUrl = getSiteUrl()

// Merge configurations
const customConfig = mergeSEOConfig(seoConfig, {
    siteName: 'My Custom Site',
})
```

**Path aliases (defined in apps/web/components.json):**

- `@/components` → apps/web/components
- `@/hooks` → apps/web/hooks
- `@/lib` → apps/web/lib
- `@workspace/ui/lib/utils` → packages/ui/src/lib/utils.ts
- `@workspace/ui/components` → packages/ui/src/components/
- `@workspace/db/client` → packages/db/src/client.ts
- `@workspace/db/schema/blog` → packages/db/src/schema/blog/index.ts
- `@workspace/db/schema/contact` → packages/db/src/schema/contact/index.ts
- `@workspace/db/schema/emails` → packages/db/src/schema/emails/index.ts
- `@workspace/seo/config` → packages/seo/src/config/index.ts
- `@workspace/seo/utils` → packages/seo/src/utils/index.ts
- `@workspace/seo/react` → packages/seo/src/react/index.ts
- `@workspace/seo/types` → packages/seo/src/types/index.ts
- `@workspace/seo/utils` → packages/seo/src/utils/index.ts
- `@workspace/seo/types` → packages/seo/src/types/index.ts

## Environment Configuration & Validation

**Type-Safe Environment Variables (apps/web/env.ts):**

- Uses `@t3-oss/env-nextjs` with Zod schemas for runtime validation
- Separates server-only, client, and shared environment variables
- Prevents accidental exposure of server-side variables to the client
- Provides type-safe `env` object for all environment access

**Usage:**

```tsx
import { env } from '@/env'

// Type-safe access to environment variables
const siteUrl = env.NEXT_PUBLIC_SITE_URL
const dbUrl = env.POSTGRES_URL // Only accessible server-side
const nodeEnv = env.NODE_ENV // Shared variable
```

**Key Features:**

- Server variables (`POSTGRES_URL`, `BLOG_API_KEY`, `BLOB_READ_WRITE_TOKEN`) are validated and only accessible server-side
- Client variables (prefixed with `NEXT_PUBLIC_`) are validated and accessible everywhere
- Optional variables have `.optional()` in their schema
- Runtime validation happens at app startup
- Custom error messages when server variables are accessed on client

## Site Configuration Pattern

**Centralized Business Data (apps/web/lib/data/site-config.ts):**

The `site-config.ts` file is the **CENTRAL SOURCE OF TRUTH** for all business and site information:

- Business information (name, legal name, tagline, description, founders)
- Contact information (phone, email, address, business hours)
- Social media links (platform, URL, label)
- Brand assets (logo, favicon, og-image paths)
- SEO defaults (keywords, locale, twitter handle)

**Usage:**

```tsx
import {
    getFullAddress,
    getPhoneLink,
    siteConfig,
} from '@/lib/data/site-config'

// Access business info
const clinicName = siteConfig.business.name
const tagline = siteConfig.business.tagline

// Access contact info
const phone = siteConfig.contact.phone
const email = siteConfig.contact.email

// Use helper functions
const address = getFullAddress()
const telLink = getPhoneLink()
```

**Design Philosophy:**

- Environment variables (env.ts) handle environment-specific config
- Site config (site-config.ts) handles business/content data
- Contains Alluring Plastic Surgery clinic information
- Used across SEO metadata, contact pages, footer, header, and structured data

## Shared UI Components

**Layout Primitives:**

The project provides three layout components for different use cases:

### Multi-Section Pages (SectionContainer + ContentWrapper)

For complex pages with multiple sections (home, about, services):

**1. SectionContainer** - Outer wrapper for page sections:

```tsx
import { SectionContainer } from '@/components/shared/section-container.component'

;<SectionContainer
    variant='muted' // 'default' | 'muted' | 'accent'
    as='section' // HTML element (default: 'section')
    id='features' // Optional section ID
    paddingY='py-16 md:py-24' // Customizable vertical padding
    noPadding={false} // Disable default padding
    ariaLabel='Features section' // Accessibility label
>
    {/* Content */}
</SectionContainer>
```

**2. ContentWrapper** - Inner content constraint:

```tsx
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

;<ContentWrapper
    size='lg' // 'sm' | 'md' | 'lg' | 'xl' | 'full'
    paddingX='px-6' // Customizable horizontal padding
    noPadding={false} // Disable default padding
>
    {/* Content */}
</ContentWrapper>
```

**ContentWrapper Size Variants:**

- `sm`: max-w-3xl (prose content)
- `md`: max-w-5xl (forms, narrow content)
- `lg`: max-w-7xl (default, general content)
- `xl`: max-w-screen-2xl (wide layouts, dashboards)
- `full`: max-w-full (full-width content)

**SectionContainer Background Variants:**

- `default`: bg-background (standard background)
- `muted`: bg-muted/30 (subtle gray background)
- `accent`: bg-accent/30 (brand color background)

**Typical Usage Pattern:**

```tsx
<SectionContainer variant='muted'>
    <ContentWrapper size='lg'>
        <h2>Section Title</h2>
        <p>Section content constrained to max-w-7xl with horizontal padding</p>
    </ContentWrapper>
</SectionContainer>
```

### Single-Purpose Pages (ContainerLayout)

For simple content pages with consistent layout (blog posts, category pages, single-column layouts):

**3. ContainerLayout** - All-in-one container:

```tsx
import { ContainerLayout } from '@/components/container-layout.component'

;<ContainerLayout
    size='sm' // 'default' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
    as='main' // HTML element (default: 'div')
    id='blog-post' // Optional element ID
    className='py-12' // Additional classes
    noPadding={false} // Disable default padding
    paddingX='px-4 sm:px-6 lg:px-8' // Custom horizontal padding
    ariaLabel='Blog post content' // Accessibility label
>
    {/* Content */}
</ContainerLayout>
```

**ContainerLayout Size Variants:**

- `default`: container mx-auto (responsive breakpoints)
- `sm`: max-w-3xl (blog posts, articles)
- `md`: max-w-5xl (documentation, prose)
- `lg`: max-w-6xl (wider content)
- `xl`: max-w-7xl (full-width content)
- `full`: w-full (edge-to-edge)

**When to Use Each:**

- **SectionContainer + ContentWrapper**: Multi-section pages with varied backgrounds (home, about, services, contact)
- **ContainerLayout**: Simple single-purpose pages (blog posts, category listings, tag pages, single-column layouts)

## TypeScript Naming Conventions

**File Naming Pattern:** `<file-name>.<file-type>.ts`

**File Type Suffixes:**

- `*.component.tsx` - React components
- `*.type.ts` - Type definitions and interfaces
- `*.schema.ts` - Zod validation schemas
- `*.table.ts` - Drizzle table definitions
- `*.service.ts` - Business logic and services
- `*.util.ts` - Utility functions
- `*.config.ts` - Configuration files
- `*.hook.ts` - Custom React hooks
- `*.action.ts` - Server actions
- `*.constant.ts` - Constant values

**Code Naming Conventions:**

- **Variables & Functions**: `camelCase` (e.g., `userName`, `getUserData()`)
- **Classes, Interfaces & Types**: `PascalCase` (e.g., `UserProfile`, `ApiResponse`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`)
- **Files & Directories**: `kebab-case` (e.g., `user-profile.component.tsx`)
- **Database**: `snake_case` (e.g., `user_profiles`, `created_at`)
- **Booleans**: Prefixed with `is`, `has`, `can`, `should`, `will`
- **Event Handlers**: Prefixed with `handle` or `on` (e.g., `handleSubmit`, `onClick`)

**Type Organization:**

- All type definitions in `/lib/types/[domain]/`
- One type per file for maintainability
- Export types from dedicated type files
- Use `type` over `interface` for consistency
- **Never use `any`** - always provide proper typing
- Use `unknown` instead of `any` when type is truly unknown

## UI/UX Design Patterns

**Component Architecture Principles:**

- **Mobile-first responsive design** - Start with mobile, scale up
- **User experience first** - Analyze UX implications before implementation
- **Use shadcn/ui components** - Primary component library
- **Tailwind CSS only** - Never define custom colors, spacing, or typography
- **Component composition** - Break complex UIs into small, reusable pieces
- **One responsibility per component** - Single responsibility principle
- **Type-first approach** - Proper TypeScript definitions for all props

**Design System Adherence:**

- Use only Tailwind's predefined design tokens
- Color palette: slate, gray, zinc, neutral, stone (from shadcn)
- Spacing scale: p-4, m-6, gap-3 (Tailwind defaults)
- Typography scale: text-sm, text-lg, text-xl (Tailwind defaults)
- Breakpoints: sm:, md:, lg:, xl:, 2xl: (Tailwind defaults)
- Never create custom CSS or design tokens

**Component Implementation Workflow:**

1. **UX Analysis** - Understand user needs and interaction patterns
2. **Component Discovery** - Check if shadcn/ui has suitable components
3. **Project Inventory** - Verify what components already exist
4. **Installation** - Install shadcn components if needed
5. **Architecture** - Break down complex interfaces into focused components
6. **Implementation** - Build using Tailwind utilities and shadcn components
7. **Responsive Design** - Ensure mobile-first responsive behavior
8. **Accessibility** - Implement ARIA labels, keyboard navigation, screen reader support

**UI Best Practices:**

- Implement clear visual hierarchy
- Provide immediate feedback for user actions
- Design for different device sizes and orientations
- Consider loading states, empty states, and error conditions
- Ensure consistent interaction patterns
- Optimize for performance and perceived performance
- Test keyboard navigation and screen readers
- Proper contrast ratios for accessibility

## Environment Setup

Create a `.env` file in the repository root with:

```bash
# Database Configuration
POSTGRES_URL="postgresql://user:password@localhost:5432/dbname"

# SEO Configuration
NEXT_PUBLIC_SITE_URL=https://alluringplasticsurgery.com
NEXT_PUBLIC_SITE_NAME="Alluring Plastic Surgery"
NEXT_PUBLIC_SITE_DESCRIPTION="Luxury cosmetic and plastic surgery clinic in Miami"
NEXT_PUBLIC_TWITTER_HANDLE=@alluringplasticsurgery
NEXT_PUBLIC_FACEBOOK_APP_ID=
NEXT_PUBLIC_LOCALE=en-US
NEXT_PUBLIC_ENABLE_INDEXING=false

# Blog API Authentication
BLOG_API_KEY=your-secure-api-key-here

# Vercel Blob Storage (for blog featured images)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here

# Email Configuration (required for contact form)
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
OWNER_EMAIL=owner@yourdomain.com

# Analytics Configuration (all optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=

# Mobile Call Button (optional, defaults to enabled)
NEXT_PUBLIC_ENABLE_MOBILE_CALL_BUTTON=true

# Environment
NODE_ENV=development
```

**Database Environment Variables:**
The `POSTGRES_URL` is required for:

- Database migrations (`pnpm --filter @workspace/db db:migrate`)
- Drizzle Kit commands (generate, push, studio)
- Runtime database connections in apps

**SEO Environment Variables:**

- `NEXT_PUBLIC_SITE_URL`: Base URL of your website (no trailing slash)
- `NEXT_PUBLIC_SITE_NAME`: Site name for metadata and title tags
- `NEXT_PUBLIC_SITE_DESCRIPTION`: Default site description
- `NEXT_PUBLIC_TWITTER_HANDLE`: Twitter/X handle (with @ prefix)
- `NEXT_PUBLIC_FACEBOOK_APP_ID`: Facebook App ID (optional)
- `NEXT_PUBLIC_LOCALE`: Default locale (e.g., en-US)
- `NEXT_PUBLIC_ENABLE_INDEXING`: Enable/disable search engine indexing (defaults to true in production)

**Blog API Environment Variables:**

- `BLOG_API_KEY`: Secret API key for validating bearer tokens on blog creation endpoints (e.g., `/api/blog/posts/create`)
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token for uploading blog featured images. Get from Vercel project settings → Storage → Blob

**Analytics Environment Variables (all optional):**

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics measurement ID
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`: Microsoft Clarity project ID
- `NEXT_PUBLIC_GTM_ID`: Google Tag Manager ID
- `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`: Facebook Pixel ID

**Mobile Call Button Environment Variables:**

- `NEXT_PUBLIC_ENABLE_MOBILE_CALL_BUTTON`: Enable/disable the mobile call button (optional, defaults to enabled if not set). Set to `'false'` to disable, or `'true'` to explicitly enable

**Email Environment Variables (required for contact form):**

- `RESEND_API_KEY`: API key from Resend (get from https://resend.com/api-keys)
- `RESEND_FROM_EMAIL`: Sender email address (must be verified domain in Resend, e.g., `noreply@yourdomain.com`)
- `OWNER_EMAIL`: Email address to receive contact form notifications

## Turbo Configuration

The turbo.json defines task dependencies:

- `build` task depends on upstream builds (`^build`)
- `dev` is persistent and never cached
- `lint` and `check-types` have upstream dependencies
- Build outputs go to `.next/**` (excluding cache)

## Specialized Agents

This project includes specialized Claude agents for specific tasks. Use the appropriate agent based on the task:

**@agent-ui-ux-designer** - Use for:

- Creating new pages or UI components
- Improving existing UI layouts and user experience
- Implementing responsive designs
- Building forms, dashboards, or complex interfaces
- Ensuring components follow design system standards
- Accessibility improvements

**@agent-typescript** - Use for:

- TypeScript type safety questions
- Naming convention guidance
- Code organization and structure decisions
- Type definitions and interfaces
- Best practices for TypeScript patterns

**@agent-software-engineer** - Use for:

- Implementing new features
- Refactoring existing code
- Architectural decisions
- Complex business logic
- Integration between systems

**@agent-unit-testing-agent** - Use for:

- Writing comprehensive unit tests
- Test coverage improvements
- Testing best practices with Vitest
- Mock data and test utilities

**General Workflow:**

1. For UI work → use @agent-ui-ux-designer
2. For TypeScript patterns → use @agent-typescript
3. For feature implementation → use @agent-software-engineer
4. For testing → use @agent-unit-testing-agent

These agents are configured in `.claude/agents/` and understand the project's conventions, patterns, and architecture.
