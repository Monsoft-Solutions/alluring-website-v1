# Analytics Documentation

This directory contains the analytics implementation for Google Analytics 4 (GA4) and Microsoft Clarity with Consent Mode v2 support.

## Quick Start

### 1. Page View Tracking

Page views are automatically tracked via the `PageViewTracker` component in the root layout. No additional setup needed.

```tsx
// Already configured in apps/web/app/layout.tsx
import { PageViewTracker } from '@/components/analytics'

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                <PageViewTracker />
                {children}
            </body>
        </html>
    )
}
```

### 2. Track Custom Events

Use the `useAnalyticsEvent` hook for tracking user interactions:

```tsx
'use client'

import { useAnalyticsEvent } from '@/lib/analytics'

export function MyComponent() {
    const { track, trackClick, trackCTA, trackFormSubmit } = useAnalyticsEvent()

    return (
        <div>
            {/* Track button clicks */}
            <button
                onClick={() =>
                    trackClick('subscribe_button', {
                        location: 'hero',
                        variant: 'primary',
                    })
                }
            >
                Subscribe
            </button>

            {/* Track CTA clicks */}
            <button
                onClick={() =>
                    trackCTA('get_started', {
                        page_section: 'pricing',
                    })
                }
            >
                Get Started
            </button>

            {/* Track form submissions */}
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    trackFormSubmit('contact_form', {
                        source: 'landing_page',
                    })
                }}
            >
                {/* form fields */}
            </form>

            {/* Track custom events */}
            <button
                onClick={() =>
                    track('video_play', {
                        video_title: 'product_demo',
                        duration: 120,
                    })
                }
            >
                Play Video
            </button>
        </div>
    )
}
```

### 3. Track Scroll Depth

Use the `useScrollDepth` hook to automatically track scroll milestones:

```tsx
'use client'

import { useScrollDepth } from '@/lib/analytics'

export function BlogPost() {
    // Automatically track at 25%, 50%, 75%, 100% scroll depth
    useScrollDepth({
        onThresholdReached: (threshold) => {
            console.log(`Reader scrolled ${threshold}% of article`)
        },
    })

    return <article>{/* Long-form content */}</article>
}
```

#### Custom Scroll Thresholds

```tsx
import { useScrollDepth } from '@/lib/analytics'

export function CustomScrollTracking() {
    useScrollDepth({
        thresholds: [50, 100], // Only track 50% and 100%
        debounceMs: 200, // Custom debounce delay
        onThresholdReached: (threshold) => {
            // Custom callback
        },
    })

    return <div>{/* content */}</div>
}
```

### 4. Consent Management

Use the `useConsent` hook to manage user consent:

```tsx
'use client'

import { useConsent } from '@/lib/analytics'

export function ConsentBanner() {
    const { consentState, grantConsent, revokeConsent } = useConsent()

    return (
        <div>
            <p>Current consent: {consentState.analytics_storage}</p>

            <button onClick={grantConsent}>Accept All Cookies</button>

            <button onClick={revokeConsent}>Reject All</button>
        </div>
    )
}
```

## API Reference

### Hooks

#### `useAnalyticsEvent()`

Returns event tracking utilities:

- `track(eventName, params?, options?)` - Track custom event
- `trackClick(elementName, params?)` - Track click event
- `trackFormSubmit(formName, params?)` - Track form submission
- `trackCTA(ctaName, params?)` - Track CTA click

**Parameters:**

- `eventName` (string) - Event name in snake_case
- `params` (EventParams) - Event parameters (avoid PII)
- `options` (UseAnalyticsEventOptions) - Additional options

**Example:**

```tsx
const { track, trackClick } = useAnalyticsEvent()

track('custom_event', { key: 'value' })
trackClick('button_name', { location: 'header' })
```

#### `useScrollDepth(options?)`

Track scroll depth automatically.

**Options:**

- `thresholds` - Array of thresholds to track (default: [25, 50, 75, 100])
- `debounceMs` - Debounce delay in ms (default: 100)
- `enabled` - Enable/disable tracking (default: true)
- `resetOnPathChange` - Reset on route change (default: true)
- `onThresholdReached` - Callback when threshold is reached

**Example:**

```tsx
useScrollDepth({
    thresholds: [25, 50, 75, 100],
    onThresholdReached: (threshold) => {
        console.log(`Scrolled ${threshold}%`)
    },
})
```

#### `useConsent()`

Manage consent state.

**Returns:**

- `consentState` - Current consent state
- `grantConsent()` - Grant all consent
- `revokeConsent()` - Revoke all consent
- `updateConsent(config)` - Update specific consent categories
- `isConsentGranted()` - Check if analytics consent is granted

### Client Utilities

#### `trackEvent(eventName, params?)`

Track custom event to Google Analytics.

```tsx
import { trackEvent } from '@/lib/analytics'

trackEvent('button_click', {
    button_name: 'subscribe',
    page_section: 'hero',
})
```

#### `trackPageView(params?)`

Manually track page view (usually automatic).

```tsx
import { trackPageView } from '@/lib/analytics'

trackPageView({
    page_title: 'About Us',
    page_path: '/about',
})
```

#### `trackScrollDepth(params)`

Track scroll depth milestone.

```tsx
import { trackScrollDepth } from '@/lib/analytics'

trackScrollDepth({
    percent: 75,
    page_path: '/blog/article',
})
```

#### `trackClarityEvent(eventName, eventData?)`

Track event to Microsoft Clarity.

```tsx
import { trackClarityEvent } from '@/lib/analytics'

trackClarityEvent('form_error', {
    form_name: 'contact',
    error_type: 'validation',
})
```

## Best Practices

### Event Naming

Use lowercase snake_case for consistency:

✅ Good:

```tsx
track('button_click')
track('form_submit')
track('video_play')
```

❌ Bad:

```tsx
track('ButtonClick')
track('form-submit')
track('Video Play')
```

### Avoid PII

Never send personally identifiable information:

✅ Good:

```tsx
track('form_submit', {
    form_name: 'contact',
    has_newsletter_opt_in: true,
})
```

❌ Bad:

```tsx
track('form_submit', {
    email: 'info@alluringplasticsurgery.com',
    name: 'John Doe',
})
```

### Performance

- Use debouncing for high-frequency events
- Limit custom parameters to essential data
- Enable tracking conditionally when needed

```tsx
// Good: conditional tracking
useScrollDepth({
    enabled: isLongFormContent,
    thresholds: [50, 100],
})
```

## Testing

### Development Mode

Analytics errors are logged to console in development:

```tsx
// Will log errors if gtag is not available
trackEvent('test_event')
```

### GA4 DebugView

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
2. Navigate to GA4 → Admin → DebugView
3. Interact with your app to see events in real-time

### Clarity Recordings

1. Open [Microsoft Clarity Dashboard](https://clarity.microsoft.com/)
2. Select your project
3. View recordings and heatmaps

## Environment Variables

Required in root `.env`:

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Microsoft Clarity
NEXT_PUBLIC_CLARITY_PROJECT_ID=XXXXXXXXXX

# Optional: Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

## TypeScript Types

All analytics functions are fully typed:

```tsx
import type {
    AnalyticsConfig,
    ConsentConfig,
    EventParams,
    PageViewParams,
    ScrollDepthParams,
} from '@/lib/analytics'
```

## Troubleshooting

### Events not appearing in GA4

1. Check GA4 Measurement ID is correct
2. Verify scripts are loaded (check Network tab)
3. Check consent state (analytics_storage must be 'granted')
4. Use DebugView to see real-time events

### Scroll tracking not working

1. Ensure content is actually scrollable
2. Check `enabled` option is true
3. Verify debounce delay isn't too high
4. Check browser console for errors

### Clarity not recording

1. Verify Clarity Project ID is correct
2. Check script is loaded in Network tab
3. Ensure page has actual user interactions
4. Check Clarity dashboard after a few minutes (recordings are not instant)
