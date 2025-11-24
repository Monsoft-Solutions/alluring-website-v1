# Alluring Plastic Surgery Website

A production-ready website for Alluring Plastic Surgery, a Miami-based cosmetic and plastic surgery clinic. Built with Next.js 15, React 19, and TypeScript.

[![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.11-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-10.4.1-f69220?logo=pnpm)](https://pnpm.io/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Development Guide](#-development-guide)
- [Deployment](#-deployment)
- [Best Practices](#-best-practices)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

This is the official website for **Alluring Plastic Surgery**, a luxury cosmetic and plastic surgery clinic located in Miami, Florida. The website showcases our board-certified surgeons, procedures, and patient resources, built with modern web technologies for optimal performance and user experience.

### Key Features

- **🏗️ Monorepo Architecture** - Organized Turborepo with shared packages for maximum code reuse
- **📦 Production Ready** - Enterprise-grade code with TypeScript, error handling, and testing infrastructure
- **🎨 Beautiful UI** - Built with shadcn/ui components following Notion-inspired design principles
- **🔍 SEO Optimized** - Comprehensive SEO package with structured data, metadata, and sitemap generation
- **📊 Analytics Ready** - Pre-integrated Google Analytics, Microsoft Clarity, GTM, and Facebook Pixel
- **📝 Full Blog System** - Complete blog with categories, tags, markdown support, and infinite scroll
- **♿ Accessible** - WCAG compliant with proper ARIA labels and keyboard navigation
- **📱 Mobile First** - Responsive design that works flawlessly on all devices
- **🌙 Dark Mode** - Built-in theme switching with next-themes

---

## ✨ Key Features

### 🎨 UI/UX Features

- **shadcn/ui Components** - 11+ pre-built, customizable components (Button, Card, Input, Form, etc.)
- **Responsive Layout System** - `SectionContainer` and `ContentWrapper` primitives for consistent layouts
- **Dark Mode Support** - Automatic theme detection with manual override
- **Mobile Call Button** - Configurable floating call button for mobile users
- **Cookie Consent Banner** - GDPR/CCPA compliant cookie consent system
- **Loading States** - Skeleton loaders and suspense boundaries
- **Smooth Animations** - Tailwind CSS transitions and transforms

### 📝 Content Features

- **Full Blog System**
    - PostgreSQL database with Drizzle ORM
    - Categories and tags support
    - Author management
    - Featured images (Vercel Blob integration)
    - Markdown/MDX support with syntax highlighting
    - **Smart CTA insertion** - Intelligent placement before headings or manual control with markers
    - Infinite scroll pagination
    - Blog post slugs and SEO-friendly URLs
    - Related posts and category filtering
- **Contact Forms**
    - React Hook Form with Zod validation
    - Phone number validation (international support)
    - Real-time validation feedback
    - API route protection with bearer tokens
    - Analytics event tracking
- **Pre-built Pages**
    - Home page with hero, features, testimonials
    - About page with mission, story, team sections
    - Contact page with form and info
    - Blog listing and individual post pages
    - 404 and error pages

### 🔍 SEO & Performance

- **Comprehensive SEO Package** (`@workspace/seo`)
    - Type-safe SEO configuration
    - Automatic metadata generation
    - Open Graph and Twitter Card support
    - Schema.org structured data (JSON-LD)
    - Dynamic sitemap generation
    - Robots.txt generation
    - Canonical URLs
- **Core Web Vitals Tracking** - Web Vitals reporting for performance monitoring
- **Image Optimization** - Next.js Image component with automatic optimization
- **Font Optimization** - Automatic font optimization with next/font

### 📊 Analytics & Tracking

- **Multiple Analytics Providers**
    - Google Analytics 4 (GA4)
    - Microsoft Clarity
    - Google Tag Manager (GTM)
    - Facebook Pixel
- **Event Tracking System**
    - Page view tracking
    - Scroll depth tracking (25%, 50%, 75%, 100%)
    - Form submission tracking
    - Click event tracking
    - Custom event tracking
    - CTA performance tracking
- **Type-Safe Hooks**
    - `useAnalyticsEvent()` - Custom event tracking
    - `useScrollDepth()` - Scroll depth monitoring

### 🗄️ Database & Backend

- **PostgreSQL Database** with Drizzle ORM
- **Type-Safe Database Schema**
    - Blog posts, categories, tags
    - Authors and images
    - Full relations and constraints
- **Database Management**
    - Migration system
    - Seed data utilities
    - Drizzle Studio (database GUI)
- **API Routes**
    - Protected endpoints with bearer token authentication
    - Zod validation schemas
    - Error handling middleware
    - Type-safe request/response handling

### 🔧 Developer Experience

- **Turborepo Monorepo** - Fast builds with intelligent caching
- **pnpm Workspaces** - Efficient package management
- **TypeScript Everywhere** - 100% type-safe codebase
- **Strict Naming Conventions**
    - File naming: `<name>.<type>.ts` (e.g., `button.component.tsx`)
    - Code naming: camelCase, PascalCase, SCREAMING_SNAKE_CASE
- **Environment Variable Validation** - Runtime validation with `@t3-oss/env-nextjs` and Zod
- **Centralized Configuration** - Single source of truth for all business data
- **Code Quality Tools**
    - ESLint with strict rules
    - Prettier with import sorting
    - Husky for git hooks
    - Lint-staged for pre-commit checks
- **Specialized AI Agents** - 13 Claude agents for specific development tasks
    - UI/UX design
    - Software architecture
    - Database optimization
    - Documentation writing
    - Unit testing
    - PR review analysis
    - And more!

---

## 🛠️ Tech Stack

### Core

- **[Next.js 15.4.5](https://nextjs.org/)** - React framework with App Router and Server Components
- **[React 19.1.1](https://react.dev/)** - UI library with concurrent features
- **[TypeScript 5.7.3](https://www.typescriptlang.org/)** - Type safety and developer experience
- **[Tailwind CSS 4.1.11](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Turborepo 2.5.8](https://turbo.build/)** - High-performance build system

### UI & Styling

- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library (New York style)
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management

### Database & ORM

- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database
- **[Drizzle ORM 0.38.3](https://orm.drizzle.team/)** - Type-safe SQL ORM
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Migration and schema management

### Forms & Validation

- **[React Hook Form 7.65.0](https://react-hook-form.com/)** - Performant form handling
- **[Zod 3.25.76](https://zod.dev/)** - Schema validation
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** - Form validation integration
- **[libphonenumber-js](https://www.npmjs.com/package/libphonenumber-js)** - Phone number validation

### Content & Markdown

- **[unified](https://unifiedjs.com/)** - Markdown/MDX processing
- **[remark](https://remark.js.org/)** - Markdown parser
- **[rehype](https://rehype.js.org/)** - HTML processor
- **[rehype-highlight](https://www.npmjs.com/package/rehype-highlight)** - Syntax highlighting

### Storage & Assets

- **[@vercel/blob](https://vercel.com/docs/storage/vercel-blob)** - File storage for images

### Analytics

- **Google Analytics 4** - Website analytics
- **Microsoft Clarity** - Heatmaps and session recordings
- **Google Tag Manager** - Tag management system
- **Facebook Pixel** - Social media analytics

### Code Quality

- **[ESLint 9.37.0](https://eslint.org/)** - JavaScript/TypeScript linting
- **[Prettier 3.6.2](https://prettier.io/)** - Code formatting
- **[Husky 9.1.7](https://typicode.github.io/husky/)** - Git hooks
- **[lint-staged 16.2.4](https://github.com/okonet/lint-staged)** - Pre-commit linting

### Package Management

- **[pnpm 10.4.1](https://pnpm.io/)** - Fast, disk space efficient package manager

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** 10.4.1 (install with `npm install -g pnpm@10.4.1`)
- **PostgreSQL** database (local or remote)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd alluring-website-v1
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

The template includes a `.env.example` file as a reference. Create your local environment files:

**For the web app** (`apps/web/.env.local`):

```bash
# Database
POSTGRES_URL="postgresql://user:password@localhost:5432/dbname"

# SEO
NEXT_PUBLIC_SITE_URL=https://alluringplasticsurgery.com
NEXT_PUBLIC_SITE_NAME="Alluring Plastic Surgery"
NEXT_PUBLIC_SITE_DESCRIPTION="Luxury cosmetic and plastic surgery clinic in Miami"
NEXT_PUBLIC_TWITTER_HANDLE=@alluringplasticsurgery
NEXT_PUBLIC_LOCALE=en-US
NEXT_PUBLIC_ENABLE_INDEXING=false

# Blog API
BLOG_API_KEY=your-secure-api-key-here

# Vercel Blob (optional, for blog images)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# Analytics (all optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=

# Features (optional)
NEXT_PUBLIC_ENABLE_MOBILE_CALL_BUTTON=true

# Environment
NODE_ENV=development
```

**For the database package** (`packages/db/.env.local`):

```bash
# Database
POSTGRES_URL="postgresql://user:password@localhost:5432/dbname"
```

4. **Set up the database**

```bash
# Generate migration files
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Seed with sample data
pnpm db:seed
```

5. **Start the development server**

```bash
pnpm dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### 🎨 Customization

1. **Update site configuration** - Edit `apps/web/lib/data/site-config.ts` with clinic information
2. **Replace brand assets** - Update logo, favicon, and OG image in `apps/web/public/`
3. **Customize color scheme** - Modify Tailwind theme in `packages/ui/tailwind.config.ts`
4. **Update environment variables** - Configure `.env` with clinic-specific values

---

## 📁 Project Structure

```
alluring-website-v1/
├── apps/
│   └── web/                          # Next.js 15 application
│       ├── app/                      # App Router pages
│       │   ├── (routes)/            # Page routes
│       │   │   ├── about/           # About page
│       │   │   ├── blog/            # Blog pages
│       │   │   └── contact/         # Contact page
│       │   ├── api/                 # API routes
│       │   │   ├── blog/           # Blog API endpoints
│       │   │   └── contact/        # Contact form handler
│       │   ├── layout.tsx          # Root layout
│       │   ├── page.tsx            # Home page
│       │   ├── robots.ts           # Robots.txt
│       │   └── sitemap.ts          # Dynamic sitemap
│       ├── components/              # React components
│       │   ├── analytics/          # Analytics components
│       │   ├── blog/               # Blog components
│       │   ├── layout/             # Header, Footer
│       │   ├── sections/           # Page sections
│       │   └── shared/             # Shared components
│       ├── hooks/                  # Custom React hooks
│       ├── lib/                    # Utilities and helpers
│       │   ├── analytics/          # Analytics utilities
│       │   ├── api/                # API utilities
│       │   ├── blog/               # Blog utilities
│       │   ├── data/               # Site configuration
│       │   ├── seo/                # SEO utilities
│       │   └── types/              # Type definitions
│       ├── public/                 # Static assets
│       ├── env.ts                  # Environment validation
│       └── components.json         # shadcn/ui config
│
├── packages/
│   ├── db/                          # Shared database package
│   │   ├── src/
│   │   │   ├── schema/             # Drizzle schema
│   │   │   │   └── blog/           # Blog tables
│   │   │   ├── seed/               # Seed data
│   │   │   ├── client.ts           # Database client
│   │   │   └── migrate.ts          # Migration runner
│   │   └── migrations/             # SQL migrations
│   │
│   ├── seo/                         # Shared SEO package
│   │   └── src/
│   │       ├── config/             # SEO configuration
│   │       ├── react/              # React SEO components
│   │       ├── schemas/            # JSON-LD schemas
│   │       ├── types/              # TypeScript types
│   │       └── utils/              # SEO utilities
│   │
│   ├── ui/                          # Shared UI components
│   │   └── src/
│   │       ├── components/         # shadcn/ui components
│   │       ├── hooks/              # UI hooks
│   │       ├── lib/                # UI utilities
│   │       └── styles/             # Global styles
│   │
│   ├── eslint-config/               # Shared ESLint config
│   └── typescript-config/           # Shared TypeScript config
│
├── .cursor/                         # Cursor AI configuration
│   └── rules/                      # 13 specialized AI agents
├── docs/                           # Documentation
│   ├── CTA-SYSTEM.md              # Smart CTA insertion system
│   ├── BLOG-POST-SEEDING-SYSTEM.md # Blog post seeding documentation
│   └── blog-writing-guidelines.md  # Content creation guidelines
├── implementation-plans/            # Feature implementation plans
├── pr-reviews/                     # PR review documentation
├── .env                            # Environment variables
├── .prettierrc                     # Prettier configuration
├── turbo.json                      # Turborepo configuration
└── pnpm-workspace.yaml             # pnpm workspaces
```

---

## ⚙️ Configuration

### Site Configuration (Business Data)

**File:** `apps/web/lib/data/site-config.ts`

This is the **central source of truth** for all business information. Contains clinic information for Alluring Plastic Surgery:

```typescript
export const siteConfig: SiteConfig = {
    business: {
        name: 'Alluring Plastic Surgery',
        legalName: 'Alluring Plastic Surgery',
        tagline: 'Luxury Surgeries Made Affordable',
        description: 'World-class aesthetic procedures in Miami...',
    },
    contact: {
        phone: '+1-786-305-8649',
        email: 'info@alluringplasticsurgery.com',
        address: '8435 SW 24th St',
        city: 'Miami',
        state: 'FL',
        postalCode: '33155',
        country: 'United States',
    },
    social: [
        { platform: 'facebook', url: 'https://facebook.com/...' },
        { platform: 'instagram', url: 'https://instagram.com/...' },
        { platform: 'tiktok', url: 'https://tiktok.com/@...' },
    ],
    brand: {
        logo: '/logo.png',
        favicon: '/favicon.png',
        ogImage: '/og-image.jpg',
    },
}
```

### Environment Variables

The template includes a `.env.example` file with all available environment variables. Create your local environment files:

- **`apps/web/.env.local`** - All web app environment variables (SEO, analytics, API keys)
- **`packages/db/.env.local`** - Database connection string only (`POSTGRES_URL`)

See the [Quick Start](#-quick-start) section for the complete list of environment variables.

**Key variables:**

- `POSTGRES_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SITE_URL` - Website URL (https://alluringplasticsurgery.com)
- `NEXT_PUBLIC_SITE_NAME` - Website name (Alluring Plastic Surgery)
- `BLOG_API_KEY` - API authentication key
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics ID
- `NEXT_PUBLIC_CLARITY_PROJECT_ID` - Microsoft Clarity ID

### shadcn/ui Configuration

**File:** `apps/web/components.json`

Configure component style, colors, and path aliases:

```json
{
    "style": "new-york",
    "rsc": true,
    "tsx": true,
    "tailwind": {
        "config": "packages/ui/tailwind.config.ts",
        "css": "packages/ui/src/styles/globals.css",
        "baseColor": "neutral"
    }
}
```

---

## 💻 Development Guide

### Common Commands

#### Root Commands (run from root directory)

```bash
# Install all dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Build all apps and packages
pnpm build

# Lint all packages
pnpm lint

# Format all code
pnpm format

# Check formatting
pnpm format:check
```

#### App-Specific Commands (run from `apps/web/`)

```bash
# Start development server (with Turbopack)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint with auto-fix
pnpm lint:fix

# Type checking
pnpm typecheck
```

#### Database Commands (run from root)

```bash
# Generate migrations from schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema changes directly (dev only, skips migrations)
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Seed database with sample data
pnpm db:seed
```

#### Adding shadcn/ui Components

Always run from the **root directory**:

```bash
# Add a component
pnpm dlx shadcn@latest add <component-name> -c apps/web

# Examples
pnpm dlx shadcn@latest add button -c apps/web
pnpm dlx shadcn@latest add dialog -c apps/web
pnpm dlx shadcn@latest add form -c apps/web
```

This adds components to `packages/ui/src/components/`.

### Import Patterns

#### UI Components

```tsx
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'
```

#### Database

```tsx
import { type NewUser, type User, db } from '@workspace/db/client'
import { users } from '@workspace/db/schema'

// Query
const allUsers = await db.select().from(users)

// Insert
const newUser: NewUser = { name: 'John', email: 'john@example.com' }
await db.insert(users).values(newUser)
```

#### SEO

```tsx
import {
    createDefaultSEOConfig,
    getSiteUrl,
    mergeSEOConfig,
} from '@workspace/seo/config'
import type { SEOConfig } from '@workspace/seo/types'
```

#### Analytics

```tsx
import { useAnalyticsEvent, useScrollDepth } from '@/lib/analytics'

const { track, trackClick, trackFormSubmit } = useAnalyticsEvent()

// Track events
trackClick('button_name', { location: 'hero' })
trackFormSubmit('contact_form', { status: 'success' })
```

#### Path Aliases

- `@/components` → `apps/web/components`
- `@/hooks` → `apps/web/hooks`
- `@/lib` → `apps/web/lib`
- `@workspace/ui` → `packages/ui/src`
- `@workspace/db` → `packages/db/src`
- `@workspace/seo` → `packages/seo/src`

### TypeScript Naming Conventions

#### File Naming: `<name>.<type>.ts`

- `*.component.tsx` - React components
- `*.type.ts` - Type definitions
- `*.schema.ts` - Zod validation schemas
- `*.table.ts` - Drizzle table definitions
- `*.service.ts` - Business logic
- `*.util.ts` - Utility functions
- `*.hook.ts` - Custom hooks
- `*.action.ts` - Server actions
- `*.config.ts` - Configuration files
- `*.constant.ts` - Constants

#### Code Naming

- **Variables & Functions:** `camelCase` (`userName`, `getUserData()`)
- **Classes, Interfaces & Types:** `PascalCase` (`UserProfile`, `ApiResponse`)
- **Constants:** `SCREAMING_SNAKE_CASE` (`MAX_RETRY_ATTEMPTS`, `API_BASE_URL`)
- **Files & Directories:** `kebab-case` (`user-profile.component.tsx`)
- **Database:** `snake_case` (`user_profiles`, `created_at`)
- **Booleans:** Prefix with `is`, `has`, `can`, `should`, `will`
- **Event Handlers:** Prefix with `handle` or `on` (`handleSubmit`, `onClick`)

### UI/UX Design Patterns

#### Layout Primitives

Use these two components for consistent layouts:

```tsx
import { ContentWrapper } from '@/components/shared/ContentWrapper.component'
import { SectionContainer } from '@/components/shared/SectionContainer.component'

// Typical usage

;<SectionContainer variant='muted'>
    <ContentWrapper size='lg'>
        <h2>Section Title</h2>
        <p>Content goes here</p>
    </ContentWrapper>
</SectionContainer>
```

**SectionContainer variants:**

- `default` - Standard background
- `muted` - Subtle gray background
- `accent` - Brand color background

**ContentWrapper sizes:**

- `sm` - max-w-3xl (prose content, blog posts)
- `md` - max-w-5xl (forms, narrow content)
- `lg` - max-w-7xl (default, general content)
- `xl` - max-w-screen-2xl (wide layouts)
- `full` - max-w-full (full-width)

#### Component Best Practices

- **Mobile-first responsive design** - Start with mobile, scale up
- **Use shadcn/ui components** - Primary component library
- **Tailwind CSS only** - Never define custom colors or spacing
- **Component composition** - Break complex UIs into small pieces
- **Single responsibility** - One responsibility per component
- **Type-first approach** - Proper TypeScript definitions

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel project settings
3. **Set build settings:**
    - Build Command: `pnpm build`
    - Output Directory: `apps/web/.next`
    - Install Command: `pnpm install`
4. **Deploy!**

### Environment Variables for Production

Set these in your Vercel project settings:

**Required:**

```bash
POSTGRES_URL=postgresql://...
NEXT_PUBLIC_SITE_URL=https://alluringplasticsurgery.com
NEXT_PUBLIC_SITE_NAME="Alluring Plastic Surgery"
BLOG_API_KEY=your-production-api-key
```

**Optional but recommended:**

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=xxxxxxxxxx
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

**Production settings:**

```bash
NODE_ENV=production
NEXT_PUBLIC_ENABLE_INDEXING=true
```

> **Note:** Vercel automatically injects environment variables into both the web app and packages that need them.

### Database Setup for Production

1. **Create a PostgreSQL database** (Vercel Postgres, Neon, Supabase, etc.)
2. **Set `POSTGRES_URL`** environment variable
3. **Run migrations:**

```bash
# From your local machine with production DATABASE_URL
pnpm db:migrate

# Or use Vercel CLI
vercel env pull .env.production
pnpm --filter @workspace/db db:migrate
```

### Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Run database migrations
- [ ] Test all pages and forms
- [ ] Verify analytics tracking works
- [ ] Check SEO metadata (Open Graph, Twitter Cards)
- [ ] Test mobile responsiveness
- [ ] Verify sitemap.xml is accessible
- [ ] Check robots.txt
- [ ] Enable error tracking (Sentry, etc.)
- [ ] Set up monitoring (Vercel Analytics, etc.)

---

## 📚 Best Practices

### Code Organization

- **One file, one responsibility** - Single component/function per file
- **Colocate related files** - Keep components, types, and styles together
- **Use barrel exports** - Index files for clean imports
- **Types in dedicated files** - All types in `lib/types/[domain]/`

### Type Safety

- **Never use `any`** - Always provide proper typing
- **Use `unknown`** over `any`\*\* when type is truly unknown
- **Prefer `type` over `interface`** for consistency
- **Export types** from dedicated type files

### Performance

- **Use Server Components** by default - Only use Client Components when needed
- **Optimize images** - Use Next.js Image component
- **Lazy load heavy components** - Use dynamic imports with Suspense
- **Monitor Core Web Vitals** - Track LCP, FID, CLS

### SEO

- **Unique titles and descriptions** for every page
- **Use semantic HTML** - Proper heading hierarchy
- **Add alt text** to all images
- **Generate sitemap** dynamically
- **Test with Google Search Console**

### Accessibility

- **Use semantic HTML elements**
- **Add ARIA labels** where needed
- **Ensure keyboard navigation** works
- **Test with screen readers**
- **Maintain proper color contrast**

---

## 🤖 AI-Powered Development

This template includes **13 specialized Claude agents** to accelerate development:

### Available Agents

- **@agent-ui-ux-designer** - UI design and component implementation
- **@agent-software-engineer** - Feature implementation and refactoring
- **@agent-software-architect** - Architecture planning and system design
- **@agent-typescript** - TypeScript patterns and best practices
- **@agent-database-optimizer** - Database optimization and query tuning
- **@agent-documentation-writer** - Technical documentation
- **@agent-unit-testing** - Unit test creation and coverage
- **@agent-pr-review-analyzer** - Pull request review analysis
- **@agent-api-request-expert** - API route and hook development
- **@agent-image-creator-expert** - AI image generation
- **@agent-creator-expert** - Agent creation and management
- **@agent-ui-tester** - UI testing and QA
- **@agent-github-expert** - GitHub workflow optimization

### Using Agents in Cursor

Simply mention an agent in your prompt:

```
@agent-ui-ux-designer Create a new pricing section with 3 tiers
@agent-software-engineer Add user authentication to the app
@agent-database-optimizer Optimize slow blog post queries
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Follow naming conventions** - See TypeScript conventions above
2. **Write type-safe code** - No `any` types allowed
3. **Add JSDoc comments** - Document public functions and types
4. **Update documentation** - Keep README and docs in sync
5. **Test your changes** - Run `pnpm typecheck` and `pnpm lint`
6. **Use conventional commits** - `feat:`, `fix:`, `docs:`, etc.

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run quality checks: `pnpm lint && pnpm typecheck`
4. Commit: `git commit -m "feat: your feature"`
5. Push and create a pull request

---

## 📝 License

Private website for Alluring Plastic Surgery. All rights reserved.

---

## 🔗 Useful Links

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools

- [Vercel](https://vercel.com/) - Deployment platform
- [Google Analytics](https://analytics.google.com/) - Website analytics
- [Microsoft Clarity](https://clarity.microsoft.com/) - Heatmaps and recordings
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview) - Database GUI

---

## 🎉 Support

For issues, questions, or feature requests, please:

1. Check existing documentation in `/docs`
2. Search through implementation plans in `/implementation-plans`
3. Create a new issue with detailed information
4. Use the appropriate AI agent for guidance

---

**Built with ❤️ using modern web technologies**

Ready to create amazing websites in record time? Let's get started! 🚀
