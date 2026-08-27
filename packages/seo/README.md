# @workspace/seo

SEO utilities package for Next.js 15 applications with TypeScript support.

## Overview

This package provides a comprehensive SEO solution for Next.js 15 marketing websites, including:

- Type-safe SEO configuration system
- Environment-based configuration
- Schema.org constants and types
- Utilities for generating metadata
- Support for Open Graph and Twitter Cards
- JSON-LD structured data support (coming soon)
- A Google Search Console data layer (`@workspace/seo/search-console`)

## Search Console

`@workspace/seo/search-console` wraps the Search Console API behind
task-shaped functions — `getTopQueries`, `getQueriesForPage`, `getPagesForQuery`
(cannibalization), `getContentOpportunities`, `getContentGaps`,
`getPositionChanges`, `inspectUrl` and friends — over the `fetchSearchAnalytics`
primitive.

It authenticates with a Google service account (`GOOGLE_CLIENT_EMAIL`,
`GOOGLE_PRIVATE_KEY`, `GOOGLE_SEARCH_CONSOLE_SITE_URL`) and depends on nothing
from Next.js, so it runs equally well in a route handler, a script, or a bare
Node process. Read functions return empty data rather than throwing when
credentials are absent; call `isSearchConsoleConfigured()` to tell "no data"
from "not wired up."

Two consumers share it: the admin app's `/api/admin/search-console/*` routes and
the `@workspace/mcp-gsc` server that exposes the same data to Claude agents.

One capability stays outside the package: classifying a page URL into a content
type accurately needs the published blog posts from Postgres, because pre-2026
posts live at root level. `searchPages` therefore accepts a `classifyPages`
injection — the admin app passes its database-backed classifier, and everyone
else falls back to the bundled path heuristic.

## Installation

This package is already included in the monorepo. To use it in your Next.js app:

1. Add the package to your app's `package.json`:

```json
{
    "dependencies": {
        "@workspace/seo": "workspace:*"
    }
}
```

2. Run `pnpm install` to link the package.

## Environment Variables

Add these environment variables to your `.env` and `.env.example` files:

```bash
# SEO Configuration
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_SITE_NAME="Your Marketing Site"
NEXT_PUBLIC_SITE_DESCRIPTION="Default site description"
NEXT_PUBLIC_TWITTER_HANDLE=@yourbrand
NEXT_PUBLIC_FACEBOOK_APP_ID=123456789
NEXT_PUBLIC_LOCALE=en-US
NEXT_PUBLIC_ENABLE_INDEXING=false

# Environment
NODE_ENV=development
```

## Usage

### Basic Configuration

Create a site-specific SEO configuration file in your app:

```typescript
// apps/web/lib/seo-config.ts
import { createDefaultSEOConfig, mergeSEOConfig } from '@workspace/seo/config'
import type { SEOConfig } from '@workspace/seo/config'

export function getSEOConfig(): SEOConfig {
    const defaultConfig = createDefaultSEOConfig()

    const siteConfig: Partial<SEOConfig> = {
        organization: {
            name: defaultConfig.siteName,
            url: defaultConfig.siteUrl,
            logo: `${defaultConfig.siteUrl}/logo.png`,
            socialProfiles: [
                {
                    platform: 'Twitter',
                    url: 'https://twitter.com/yourbrand',
                },
                {
                    platform: 'LinkedIn',
                    url: 'https://linkedin.com/company/yourbrand',
                },
            ],
        },
    }

    return mergeSEOConfig(defaultConfig, siteConfig)
}

export const seoConfig = getSEOConfig()
```

### Using Configuration

Import and use the configuration in your Next.js app:

```typescript
import { getSiteUrl, shouldEnableIndexing } from '@workspace/seo/config'

import { seoConfig } from '@/lib/seo-config'

// Get the site URL
const siteUrl = getSiteUrl()

// Check if indexing is enabled
const enableIndexing = shouldEnableIndexing()

// Access configuration
console.log(seoConfig.siteName)
console.log(seoConfig.defaultMetadata.title)
```

## API Reference

### Configuration Functions

#### `createDefaultSEOConfig()`

Creates a default SEO configuration from environment variables.

**Returns:** `SEOConfig`

**Example:**

```typescript
import { createDefaultSEOConfig } from '@workspace/seo/config'

const config = createDefaultSEOConfig()
```

#### `mergeSEOConfig(base, override)`

Merges two SEO configuration objects.

**Parameters:**

- `base: SEOConfig` - Base configuration
- `override: Partial<SEOConfig>` - Override configuration

**Returns:** `SEOConfig`

**Example:**

```typescript
import { createDefaultSEOConfig, mergeSEOConfig } from '@workspace/seo/config'

const defaultConfig = createDefaultSEOConfig()
const customConfig = {
    siteName: 'My Custom Site',
}

const finalConfig = mergeSEOConfig(defaultConfig, customConfig)
```

#### `getSiteUrl()`

Gets the site URL from environment variables.

**Returns:** `string`

#### `getSiteName()`

Gets the site name from environment variables.

**Returns:** `string`

#### `getSiteDescription()`

Gets the site description from environment variables.

**Returns:** `string`

#### `getTwitterHandle()`

Gets the Twitter handle from environment variables.

**Returns:** `string | undefined`

#### `getFacebookAppId()`

Gets the Facebook App ID from environment variables.

**Returns:** `string | undefined`

#### `getEnvironment()`

Gets the current environment.

**Returns:** `"development" | "staging" | "production"`

#### `shouldEnableIndexing()`

Determines if search engine indexing should be enabled based on environment.

**Returns:** `boolean`

#### `getDefaultRobotsConfig()`

Gets the default robots configuration based on environment.

**Returns:** `RobotsConfig`

#### `getLocale()`

Gets the locale from environment variables.

**Returns:** `string`

### Types

The package exports comprehensive TypeScript types for all SEO-related data:

- `SEOConfig` - Main configuration type
- `DefaultMetadata` - Default metadata type
- `TwitterConfig` - Twitter card configuration
- `OpenGraphConfig` - Open Graph configuration
- `OrganizationConfig` - Organization information
- `RobotsConfig` - Robots meta tag configuration
- `EnvironmentConfig` - Environment-specific configuration
- `SocialProfile` - Social media profile
- `ContactInfo` - Contact information
- `ImageMetadata` - Image metadata

### Constants

The package provides schema.org constants:

```typescript
import {
    DEFAULT_LOCALE,
    ROBOTS_INDEX,
    ROBOTS_NOINDEX,
    // ... and many more
    SCHEMA_ORG_CONTEXT,
    SCHEMA_TYPE_ORGANIZATION,
    SCHEMA_TYPE_WEBSITE,
} from '@workspace/seo/config'
```

## Package Structure

```
packages/seo/
├── src/
│   ├── config/
│   │   ├── index.ts                    # Re-exports
│   │   ├── seo.config.ts               # Configuration utilities
│   │   ├── seo-config.type.ts          # Configuration types
│   │   └── schema-org.constant.ts      # Schema.org constants
│   ├── schemas/                        # JSON-LD components (coming soon)
│   ├── types/                          # Additional types
│   └── index.ts                        # Main exports
├── package.json
├── tsconfig.json
└── README.md
```

## Features

### Current Features (Phase 1.3 Complete)

- ✅ Type-safe SEO configuration system
- ✅ Environment-based configuration
- ✅ Configuration merging utilities
- ✅ Schema.org constants
- ✅ Robots meta tag configuration
- ✅ Multi-environment support (dev, staging, production)

### Coming Soon

- 🚧 Metadata generation utilities
- 🚧 JSON-LD structured data components
- 🚧 Sitemap generation
- 🚧 Robots.txt generation
- 🚧 Image metadata helpers
- 🚧 URL utilities

## Development

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

## Contributing

When adding new features:

1. Follow TypeScript naming conventions (see `.cursor/rules/typescript.mdc`)
2. Use `type` instead of `interface` for all type definitions
3. Add JSDoc comments to all public functions
4. Export types from dedicated type files
5. Update this README with new features

## License

Private package for internal use only.

## Status

**Phase 1.3 Complete** ✅

- Core configuration system implemented
- Type definitions complete
- Schema.org constants added
- Environment variable reading utilities
- Package integrated with monorepo
