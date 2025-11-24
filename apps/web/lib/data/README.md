# Site Configuration Guide

## Overview

All business and site information is centralized in **`site-config.ts`**. This is your single source of truth for client data.

## 🎯 When Creating a New Client Website

**Update only ONE file:** `site-config.ts`

All other files automatically pull data from this central configuration.

## Configuration Structure

### 1. Business Information

```typescript
business: {
    name: 'Your Company Name',           // Main brand name
    legalName: 'Your Company Name LLC',  // Legal business name
    tagline: '...',                       // Short slogan
    description: '...',                   // Full description
    foundedYear: 2024,                    // Year established
    founders: ['Name 1', 'Name 2'],      // Founder names
    organizationType: 'LLC',              // Business type
}
```

### 2. Contact Information

```typescript
contact: {
    phone: '+1-555-123-4567',
    phoneDisplay: '+1 (555) 123-4567',   // Formatted version
    email: 'info@alluringplasticsurgery.com',
    supportEmail: 'info@alluringplasticsurgery.com',
    address: '123 Main St',
    addressLine2: 'Suite 100',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    businessHours: [...],                 // Operating hours
    supportHours: [...],                  // Support hours
}
```

### 3. Social Media Links

```typescript
social: [
    {
        platform: 'github',
        url: 'https://github.com/example',
        label: 'GitHub',
    },
    // Add more platforms as needed
]
```

### 4. Brand Assets

```typescript
brand: {
    logo: '/logo.png',
    logoAlt: 'Your Company Name Logo',
    favicon: '/favicon.png',
    appleTouchIcon: '/apple-touch-icon.png',
    ogImage: '/og-image.jpg',
}
```

### 5. SEO Defaults

```typescript
seo: {
    siteUrl: getSiteUrl(),               // Automatically from NEXT_PUBLIC_SITE_URL env
    siteName: 'Your Company Name',
    siteDescription: '...',
    keywords: ['keyword1', 'keyword2'],
    locale: 'en-US',
    twitterHandle: '@example',
    facebookAppId: '',
    enableIndexing: true,                 // Search engine indexing
}
```

**Note:** The `siteUrl` is automatically set from the `NEXT_PUBLIC_SITE_URL` environment variable (or VERCEL_URL as fallback). This allows the URL to change based on deployment environment (localhost, staging, production).

## Where This Data is Used

The centralized config automatically populates:

- ✅ **SEO Metadata** - All pages use site name, description, URLs
- ✅ **Header** - Logo and brand name
- ✅ **Footer** - Company name, description, contact info, copyright
- ✅ **Contact Page** - Phone, email, address, business hours
- ✅ **Schema.org Markup** - Organization data, founders, social profiles
- ✅ **Sitemap & Robots** - Base URL for search engines
- ✅ **Social Links** - Consistent across all components

## Helper Functions

The config file includes utility functions:

```typescript
// Get formatted address
getFullAddress() → "123 Main St, Suite 100, San Francisco, CA 94105, United States"

// Get phone link
getPhoneLink() → "tel:+15551234567"

// Get email links
getEmailLink() → "mailto:info@alluringplasticsurgery.com"
getSupportEmailLink() → "mailto:info@alluringplasticsurgery.com"
```

## Environment Variables

Most site data comes from `site-config.ts`, but some environment-specific variables are still used:

**Required:**

- `POSTGRES_URL` - Database connection
- `BLOG_API_KEY` - Blog API authentication

**Optional:**

- `NEXT_PUBLIC_SITE_URL` - Site URL (used for dynamic environments, fallback: VERCEL_URL or https://alluringplasticsurgery.com)
- `BLOB_READ_WRITE_TOKEN` - Blob storage (optional)
- Other SEO vars are optional - defaults from `site-config.ts`

## File Organization

```
lib/data/
├── site-config.ts          # 🎯 MAIN CONFIG - Update this for new clients
├── navigation.ts           # Re-exports from site-config
├── footer.ts              # Uses business name from site-config
└── webpages/
    ├── home.ts            # Page-specific content
    ├── about.ts           # Page-specific content
    └── contact.ts         # Uses contact info from site-config
```

## Migration Checklist

When setting up for a new client:

- [ ] Update `site-config.ts` with client information
- [ ] Replace logo files in `/public/`
    - [ ] `logo.png`
    - [ ] `favicon.png`
    - [ ] `apple-touch-icon.png`
    - [ ] `og-image.jpg`
- [ ] Update page-specific content in `webpages/`
- [ ] Test all pages to verify data displays correctly
- [ ] Verify contact form sends to correct email
- [ ] Check SEO metadata on all pages

## Benefits

1. **Single Source of Truth** - Change data in one place
2. **No Duplication** - Contact info, social links, brand name unified
3. **Type Safety** - Comprehensive TypeScript types prevent errors
4. **Easy Maintenance** - Quick updates for new clients
5. **Consistency** - Same data across all pages and components
