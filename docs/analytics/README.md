# Analytics System Documentation

Comprehensive documentation for the Alluring Plastic Surgery analytics implementation.

## Overview

This documentation covers all analytics services integrated into the application:

- **Google Analytics 4 (GA4)** - Primary web analytics platform
- **Microsoft Clarity** - Session recording and heatmaps
- **Google Tag Manager (GTM)** - Tag management system
- **Facebook Pixel** - Social media conversion tracking
- **Internal Analytics** - Cookie-free page view tracking

## Documentation Index

### Getting Started

1. [**Overview**](./01-overview.md) - Architecture, features, and technology stack
2. [**Quick Start**](./02-quick-start.md) - Environment setup and basic configuration
3. [**Implementation Guide**](./03-implementation-guide.md) - Detailed integration instructions

### Core Features

4. [**Google Analytics 4**](./04-google-analytics-4.md) - GA4 integration and event tracking
5. [**Consent Mode**](./05-consent-mode.md) - Privacy compliance and consent management
6. [**Internal Analytics**](./06-internal-analytics.md) - Cookie-free tracking system

### Advanced Topics

7. [**Event Tracking**](./07-event-tracking.md) - Custom events and tracking patterns
8. [**Microsoft Clarity**](./08-microsoft-clarity.md) - Session recording configuration
9. [**Other Services**](./09-other-services.md) - GTM and Facebook Pixel

### Reference

10. [**API Reference**](./10-api-reference.md) - Complete API documentation
11. [**Verification & Debugging**](./11-verification-debugging.md) - Testing and troubleshooting
12. [**FAQ & Troubleshooting**](./12-faq-troubleshooting.md) - Common issues and solutions

## Quick Links

### For Developers

- [Component Reference](./10-api-reference.md#components)
- [Client Utilities](./10-api-reference.md#client-utilities)
- [Type Definitions](./10-api-reference.md#type-definitions)
- [Environment Variables](./02-quick-start.md#environment-variables)

### For Analytics Teams

- [GA4 Event Reference](./07-event-tracking.md#ga4-events)
- [Consent Configuration](./05-consent-mode.md)
- [DebugView Setup](./11-verification-debugging.md#debugview)
- [Data Verification](./11-verification-debugging.md)

## Key Features

✅ **Privacy-First**: Consent Mode v2 implementation
✅ **Performance**: Non-blocking script loading with Next.js Script component
✅ **Type-Safe**: Full TypeScript support with proper type definitions
✅ **SSR-Compatible**: Server-side rendering guards for all browser APIs
✅ **Developer Experience**: Debug mode, console logging, and detailed error handling
✅ **Cookie-Free Option**: Internal analytics without third-party cookies

## Architecture Highlights

### Component-Based Integration

All analytics services are integrated as React components:

```tsx
import { AnalyticsProvider } from '@/components/analytics/analytics-provider.component'

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                <AnalyticsProvider />
                {children}
            </body>
        </html>
    )
}
```

### Environment-Driven Configuration

Analytics services automatically enable when environment variables are set:

```bash
# Enable GA4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Enable Clarity
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-project-id

# Enable GTM
NEXT_PUBLIC_GTM_ID=GTM-XXXXXX

# Enable Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your-pixel-id
```

### Dual Tracking System

1. **Third-Party Analytics (GA4, Clarity)**: Full featured with cross-domain tracking
2. **Internal Analytics**: Cookie-free, database-backed page view tracking

## Current Configuration

### Consent Mode Status

**Current: Default to Granted** - Analytics enabled immediately without user consent prompt.

This configuration is suitable for:

- US-only audiences
- Non-GDPR/CCPA jurisdictions
- Internal tracking and testing

See [Consent Mode Documentation](./05-consent-mode.md) for compliance considerations and alternative configurations.

### Enabled Services

| Service            | Status          | Configuration              |
| ------------------ | --------------- | -------------------------- |
| Google Analytics 4 | ✅ Active       | Consent granted by default |
| Internal Analytics | ✅ Active       | Cookie-free tracking       |
| Microsoft Clarity  | ⚙️ Configurable | Optional via env var       |
| Google Tag Manager | ⚙️ Configurable | Optional via env var       |
| Facebook Pixel     | ⚙️ Configurable | Optional via env var       |

## Support & Contributing

### Getting Help

1. Check the [FAQ & Troubleshooting](./12-faq-troubleshooting.md) guide
2. Review [Verification & Debugging](./11-verification-debugging.md) for testing procedures
3. Consult the [API Reference](./10-api-reference.md) for detailed function documentation

### Documentation Updates

This documentation is maintained alongside the codebase. When making changes to analytics:

1. Update the relevant documentation files
2. Test all code examples
3. Update the changelog in each modified document
4. Verify cross-references between documents

---

**Last Updated**: December 16, 2024
**Version**: 1.0.0
**Codebase**: Alluring Plastic Surgery - Next.js App
