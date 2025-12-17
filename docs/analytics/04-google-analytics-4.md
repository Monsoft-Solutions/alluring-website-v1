# Google Analytics 4 (GA4)

Comprehensive guide to Google Analytics 4 integration and configuration.

## Overview

Google Analytics 4 is the primary web analytics platform for tracking user behavior, conversions, and marketing performance.

### Key Features

- **Event-Based Model**: Everything is an event (no more page views vs events distinction)
- **Cross-Platform**: Track web + app in a single property
- **Machine Learning**: Predictive metrics and automated insights
- **Privacy-Focused**: Consent Mode v2, cookieless measurement
- **Free Tier**: Generous limits for most businesses

## Configuration

### Measurement ID

Find your Measurement ID in GA4:

1. Go to [Google Analytics](https://analytics.google.com)
2. Navigate to: **Admin** → **Data Streams**
3. Select your web stream
4. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### Environment Setup

Add to `.env.local`:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Important**: Measurement ID must start with `G-` (not `UA-` for Universal Analytics).

## Implementation

### Component Structure

```tsx
// apps/web/components/analytics/google-analytics.component.tsx
'use client'

import Script from 'next/script'

import { env } from '@/env'

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
    const isDevelopment = env.NODE_ENV === 'development'

    return (
        <>
            {/* Load gtag.js library */}
            <Script
                strategy='afterInteractive'
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            />

            {/* Initialize GA4 with Consent Mode */}
            <Script id='google-analytics-init' strategy='afterInteractive'>
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          
          // Set consent state BEFORE gtag('config')
          gtag('consent', 'default', {
              'analytics_storage': 'granted',
              'ad_storage': 'granted',
              'ad_user_data': 'granted',
              'ad_personalization': 'granted',
              'functionality_storage': 'granted',
              'personalization_storage': 'granted',
              'security_storage': 'granted',
          });
          
          // Initialize GA4
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
              page_path: window.location.pathname,${isDevelopment ? '\n              debug_mode: true,' : ''}
          });
          
          ${isDevelopment ? "console.log('Analytics: GA4 initialized (consent granted by default)');" : ''}
        `}
            </Script>
        </>
    )
}
```

### Script Loading Strategy

**`strategy="afterInteractive"`**:

- Loads after page becomes interactive
- Non-blocking for First Contentful Paint (FCP)
- Optimal balance of performance and data accuracy

**Alternatives**:

- `"lazyOnload"`: Loads during idle time (may miss early events)
- `"beforeInteractive"`: Loads before page hydration (impacts performance)

## Event Tracking

### Automatic Events

GA4 automatically tracks these events:

| Event            | Trigger                                    | Parameters                                     |
| ---------------- | ------------------------------------------ | ---------------------------------------------- |
| `page_view`      | Initial page load                          | `page_location`, `page_referrer`, `page_title` |
| `session_start`  | New session begins                         | `session_id`, `ga_session_id`                  |
| `first_visit`    | User's first visit                         | `first_visit`, `traffic_source`                |
| `scroll`         | User scrolls 90%                           | `percent_scrolled`                             |
| `click`          | Outbound link clicks                       | `link_domain`, `link_url`                      |
| `file_download`  | Download link clicks                       | `file_name`, `file_extension`                  |
| `video_start`    | Embedded video plays                       | `video_current_time`, `video_title`            |
| `video_progress` | Video milestones (10%, 25%, 50%, 75%, 90%) | `video_percent`                                |
| `video_complete` | Video finishes                             | `video_current_time`                           |

**Enhanced Measurement**: Enable in GA4 Admin → Data Streams → Enhanced Measurement

### Manual Page Views

Track page views on navigation (already implemented via `PageViewTracker`):

```tsx
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { trackPageView } from '@/lib/analytics/analytics.client'

export function PageViewTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        trackPageView({
            page_path: pathname,
            page_location: window.location.href,
            page_title: document.title,
        })
    }, [pathname, searchParams])

    return null
}
```

### Custom Events

#### Basic Event

```typescript
import { trackEvent } from '@/lib/analytics/analytics.client'

trackEvent('button_click', {
    button_name: 'schedule_consultation',
    button_location: 'hero',
})
```

#### Recommended Events

GA4 has predefined events for common actions:

**Conversions**:

```typescript
// Lead generation
trackEvent('generate_lead', {
    currency: 'USD',
    value: 0,
    method: 'contact_form',
})

// Signup
trackEvent('sign_up', {
    method: 'email',
})

// Purchase
trackEvent('purchase', {
    transaction_id: 'TXN_123',
    value: 5000,
    currency: 'USD',
    items: [
        {
            item_id: 'PROC_001',
            item_name: 'Consultation',
            price: 0,
            quantity: 1,
        },
    ],
})
```

**Engagement**:

```typescript
// Search
trackEvent('search', {
    search_term: 'breast augmentation',
})

// View item
trackEvent('view_item', {
    item_name: 'Breast Augmentation',
    item_category: 'Procedures',
})

// Select content
trackEvent('select_content', {
    content_type: 'procedure',
    item_id: 'breast_aug',
})
```

## Debug Mode

### Enable Debug Mode

**Automatic** in development (`NODE_ENV === 'development'`):

```javascript
gtag('config', 'G-XXXXXXXXXX', {
    debug_mode: true,
})
```

### Using DebugView

1. Open [Google Analytics](https://analytics.google.com)
2. Navigate to: **Admin** → **DebugView**
3. Events appear in real-time with full parameter details

**What you'll see**:

- Event name
- All parameters
- User properties
- Device and browser info
- Timestamp

**Tip**: Keep DebugView open while testing to verify events are tracked correctly.

### Console Logging

Development mode includes console logs:

```javascript
console.log('Analytics: GA4 initialized (consent granted by default)')
console.log('Analytics: Tracked scroll depth', {
    percent: 75,
    page_path: '/about',
})
```

## Configuration Options

### Custom Dimensions

Add custom dimensions in GA4:

1. Navigate to: **Admin** → **Custom Definitions** → **Create Custom Dimension**
2. Add dimensions matching your event parameters

**Example**:

- **Dimension Name**: Button Location
- **Scope**: Event
- **Event Parameter**: `button_location`

Now you can segment reports by button location.

### Data Streams

Configure data collection settings:

1. **Admin** → **Data Streams** → Select stream
2. **Enhanced Measurement**: Toggle automatic tracking (scroll, outbound clicks, etc.)
3. **More Tagging Settings**: Configure session timeout, engaged sessions

**Recommended Settings**:

- Session timeout: 30 minutes
- Engaged session: 10 seconds
- Enhanced Measurement: All toggles ON

### User Properties

Set custom user properties:

```typescript
if (window.gtag) {
    window.gtag('set', 'user_properties', {
        user_type: 'premium',
        plan_type: 'consultation_package',
    })
}
```

**Use Cases**:

- User segment (new vs returning)
- Subscription tier
- Preferences or settings

## Consent Mode v2

### Current Configuration

**Default**: Consent granted for all storage types.

```javascript
gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    functionality_storage: 'granted',
    personalization_storage: 'granted',
    security_storage: 'granted',
})
```

**Impact**:

- ✅ Analytics work immediately
- ✅ Full user attribution
- ✅ Remarketing audiences
- ⚠️ Not suitable for strict GDPR/CCPA compliance

See [Consent Mode Documentation](./05-consent-mode.md) for alternatives.

### Update Consent

Dynamically update consent when user accepts:

```typescript
if (window.gtag) {
    window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
    })
}
```

## Reports & Analysis

### Real-Time Reports

View active users and events:

1. Navigate to: **Reports** → **Realtime**
2. See active users, events, and pages

**Use Cases**:

- Verify events are tracking
- Monitor campaign launches
- Test new features

### Standard Reports

**Acquisition**:

- Traffic sources
- Campaign performance
- User acquisition

**Engagement**:

- Page views and screens
- Events
- Conversions

**Monetization**:

- E-commerce purchases
- Revenue tracking

**Retention**:

- User retention
- Lifetime value

### Explorations

Create custom reports:

1. Navigate to: **Explore**
2. Choose template (Funnel, Path, Segment, Cohort)
3. Configure dimensions and metrics

**Example: Conversion Funnel**:

1. Home page view
2. Procedure page view
3. Contact form start
4. Contact form submit

## Troubleshooting

### Events Not Appearing

**Check**:

1. ✅ Measurement ID correct (starts with `G-`)
2. ✅ `NEXT_PUBLIC_GA_MEASUREMENT_ID` set
3. ✅ Ad blocker disabled
4. ✅ Browser console for errors
5. ✅ DebugView for real-time validation

**Solution**: Events may take 24-48 hours to appear in standard reports. Use DebugView for immediate validation.

### Duplicate Page Views

**Cause**: Multiple `trackPageView()` calls on the same page.

**Solution**:

- Remove manual `trackPageView()` on initial load (GA4 auto-tracks)
- Only track subsequent navigations via `PageViewTracker`

### Missing Parameters

**Cause**: Parameters not sent or incorrectly named.

**Solution**:

- Check DebugView for actual parameter names
- Verify parameter names match custom dimensions
- Ensure parameters are flat (no nested objects)

### Consent Mode Issues

**Cause**: Consent set to "denied" but no consent UI to grant.

**Solution**: See [Consent Mode Documentation](./05-consent-mode.md).

## Best Practices

### Event Naming

- Use lowercase snake_case: `button_click`, not `ButtonClick`
- Be specific: `cta_hero_consultation`, not `button`
- Group related events: `form_start`, `form_submit`, `form_error`

### Event Parameters

- Use descriptive names: `button_location`, not `loc`
- Limit to 25 parameters per event
- Keep values under 100 characters
- Never include PII (names, emails, phone numbers)

### Data Quality

- Test events in DebugView before deploying
- Document custom events and parameters
- Regular audits of event counts and patterns
- Monitor for bot traffic and spam

### Performance

- Use `strategy="afterInteractive"` for script loading
- Avoid tracking excessive events (>100 per page load)
- Batch similar events when possible
- Use sendBeacon for unload events

## Advanced Features

### User-ID Tracking

Track authenticated users across devices:

```typescript
if (window.gtag && userId) {
    window.gtag('config', 'G-XXXXXXXXXX', {
        user_id: userId, // Use non-PII identifier (hashed user ID)
    })
}
```

### Cross-Domain Tracking

Track users across multiple domains:

```typescript
gtag('config', 'G-XXXXXXXXXX', {
    linker: {
        domains: ['example.com', 'shop.example.com'],
    },
})
```

### Measurement Protocol

Send events server-side:

```typescript
// Server-side event tracking
await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
    {
        method: 'POST',
        body: JSON.stringify({
            client_id: clientId,
            events: [
                {
                    name: 'purchase',
                    params: {
                        transaction_id: 'TXN_123',
                        value: 5000,
                        currency: 'USD',
                    },
                },
            ],
        }),
    }
)
```

## Related Documentation

- [Consent Mode](./05-consent-mode.md) - Privacy configuration
- [Event Tracking](./07-event-tracking.md) - Complete event reference
- [Verification Guide](./11-verification-debugging.md) - Testing procedures
- [API Reference](./10-api-reference.md) - Function reference

---

**Last Updated**: December 16, 2024
