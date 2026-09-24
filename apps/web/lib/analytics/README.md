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

### 3. Lead forms and section views

Every form that posts through `useContactFormSubmission` reports the same
funnel (`lib/analytics/lead-form-tracking.ts`, issue #272):

| Event                 | Fires when                                     |
| --------------------- | ---------------------------------------------- |
| `lead_form_view`      | the form is half in view, once per mount       |
| `lead_form_start`     | first focus, tap or keystroke in the form      |
| `lead_submit_attempt` | submit is pressed                              |
| `lead_submit_error`   | validation (`field`) or the API (`error_type`) |
| `lead_submit_success` | `/api/contact` accepted the lead               |

Each carries `form_name`. Attach the hook's `formRef` to the `<form>` and pass
`trackValidationErrors` to React Hook Form's `onInvalid`. Values never leave
the page: the lead is joined to GA4 through the `ga_client_id` column.

GA4's enhanced-measurement form interactions are off (2026-09-23), so GA4 sends
no `form_start` / `form_submit` of its own. Scroll depth comes from GA4 and GTM;
the site no longer sends its own.

`<SectionViewTracker />` sends `section_view` (`section` = the section's id)
once per page view for every `main section[id]` that is seen.

### 4. Page context, CTAs, popups and page speed

Issue #279. Everything here is automatic — the trackers mount once in the root
layout.

**Page context.** Every event the site sends carries `page_type`, `procedure`
and GA4's `content_group` (`lib/analytics/page-context.ts`, derived from the
path): `trackEvent` and `trackPageView` add the context of the current URL.
GA4's `gtag('set')` can't do this — custom parameters set that way never reach
events — and `config` parameters can't change after a client navigation. Events
sent by GTM or enhanced measurement (scroll, `call_click`, `generate_lead`)
carry none; the context is also pushed to the dataLayer for GTM to map.

A new static route needs an entry in `page-context.ts` — unlisted, a
root-level page would count as a blog post;
`__tests__/lib/analytics/page-context.test.ts` fails until it is listed.

`GoogleAnalytics` sends the initial page view itself (`send_page_view: false`
on config) and `PageViewTracker` every client-navigation one. GA4's enhanced
measurement "page changes based on browser history" must stay **off**, or each
navigation counts twice.

**Visitor properties.** User-scoped `site_language` (`en` / `es`) and
`procedure_interest` (the last procedure page read). For analysis only — do not
build Ads remarketing audiences from `procedure_interest`. First-touch source
needs nothing: GA4's "First user source / medium / campaign" hold it.

**CTA clicks.** `<CtaClickTracker />` sends one `cta_click` for every conversion
CTA: any element with `data-cta="<name>"`, and any link to a consultation or
contact page, the booking subdomain, or a `tel:` / `sms:` number.

| Param             | Value                                                          |
| ----------------- | -------------------------------------------------------------- |
| `cta_name`        | the `data-cta` value, else the destination                     |
| `cta_location`    | `nav`, `footer`, `popup`, `sticky`, `hero`, `middle`, `bottom` |
| `cta_destination` | `phone`, `sms`, `booking`, or the page path                    |
| `section`         | the closest `section[id]`                                      |
| `cta_text`        | the button's label                                             |

Mark a CTA with `data-cta` instead of calling `trackCTA` — the listener would
send it a second time.

**Popups.** `popup_view` / `popup_dismiss` with `popup_name` (`exit_intent`,
`promo_modal`). A view counts once the popup's lazy chunk has mounted; a
dismissal is the visitor's own close, not a successful submit.

**Page speed.** `<WebVitalsReporter />` sends `web_vital` for LCP, INP and CLS
with `metric_name`, `metric_value` (ms; CLS ×1000) and `metric_rating`, tagged
with the page that loaded.

### 5. Consent Management

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
- `trackCTA(ctaName, params?)` - Track a CTA click that is not a conversion CTA (those use `data-cta`, see §4)

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
} from '@/lib/analytics'
```

## Troubleshooting

### Events not appearing in GA4

1. Check GA4 Measurement ID is correct
2. Verify scripts are loaded (check Network tab)
3. Check consent state (analytics_storage must be 'granted')
4. Use DebugView to see real-time events

### Clarity not recording

1. Verify Clarity Project ID is correct
2. Check script is loaded in Network tab
3. Ensure page has actual user interactions
4. Check Clarity dashboard after a few minutes (recordings are not instant)
