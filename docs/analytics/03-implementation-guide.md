# Implementation Guide

Detailed guide for implementing analytics across your Next.js application.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Core Integration](#core-integration)
3. [Component Implementation](#component-implementation)
4. [Custom Event Tracking](#custom-event-tracking)
5. [Advanced Patterns](#advanced-patterns)
6. [Production Checklist](#production-checklist)

## Project Setup

### 1. Environment Configuration

Create `.env.local` in your project root:

```bash
# Google Analytics 4 (Required)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Microsoft Clarity (Optional)
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-project-id

# Google Tag Manager (Optional)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXX

# Facebook Pixel (Optional)
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your-pixel-id

# Cookie Banner (Optional)
NEXT_PUBLIC_ENABLE_COOKIE_BANNER=false

# Internal Use
NODE_ENV=development
```

### 2. Type Definitions

Ensure TypeScript recognizes environment variables in `env.ts`:

```typescript
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
    client: {
        NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
        NEXT_PUBLIC_CLARITY_PROJECT_ID: z.string().optional(),
        NEXT_PUBLIC_GTM_ID: z.string().optional(),
        NEXT_PUBLIC_FACEBOOK_PIXEL_ID: z.string().optional(),
        NEXT_PUBLIC_ENABLE_COOKIE_BANNER: z.string().optional(),
    },
    runtimeEnv: {
        NEXT_PUBLIC_GA_MEASUREMENT_ID:
            process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
        NEXT_PUBLIC_CLARITY_PROJECT_ID:
            process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
        NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
        NEXT_PUBLIC_FACEBOOK_PIXEL_ID:
            process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
        NEXT_PUBLIC_ENABLE_COOKIE_BANNER:
            process.env.NEXT_PUBLIC_ENABLE_COOKIE_BANNER,
    },
})
```

### 3. Verify Analytics Files

Ensure these files exist in your project:

```
apps/web/
├── components/
│   └── analytics/
│       ├── analytics-provider.component.tsx
│       ├── google-analytics.component.tsx
│       ├── clarity.component.tsx
│       ├── google-tag-manager.component.tsx
│       ├── facebook-pixel.component.tsx
│       ├── page-view-tracker.component.tsx
│       ├── scroll-depth-tracker.component.tsx
│       └── internal-page-view-tracker.component.tsx
├── lib/
│   └── analytics/
│       ├── analytics.client.ts
│       ├── analytics.types.ts
│       ├── config.ts
│       ├── consent.util.ts
│       ├── consent.context.tsx
│       └── useScrollDepth.hook.ts
└── env.ts
```

## Core Integration

### Root Layout Setup

**File**: `app/layout.tsx`

```tsx
import { AnalyticsProvider } from '@/components/analytics/analytics-provider.component'
import { InternalPageViewTracker } from '@/components/analytics/internal-page-view-tracker.component'
import { PageViewTracker } from '@/components/analytics/page-view-tracker.component'
import { ScrollDepthTracker } from '@/components/analytics/scroll-depth-tracker.component'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang='en'>
            <head>{/* Meta tags, fonts, etc. */}</head>
            <body>
                {/* 1. Load analytics scripts first */}
                <AnalyticsProvider />

                {/* 2. Enable automatic tracking */}
                <PageViewTracker />
                <ScrollDepthTracker />
                <InternalPageViewTracker />

                {/* 3. Your app content */}
                <main>{children}</main>
            </body>
        </html>
    )
}
```

**Order matters**:

1. `AnalyticsProvider` must load first (initializes gtag)
2. Tracking components rely on gtag being available
3. App content comes last

### Understanding AnalyticsProvider

The `AnalyticsProvider` component conditionally loads analytics services:

```tsx
'use client'

import { getAnalyticsConfig } from '@/lib/analytics/config'

import { Clarity } from './clarity.component'
import { FacebookPixel } from './facebook-pixel.component'
import { GoogleAnalytics } from './google-analytics.component'
import { GoogleTagManager } from './google-tag-manager.component'

export function AnalyticsProvider() {
    const analyticsConfig = getAnalyticsConfig()

    return (
        <>
            {/* Only loads if NEXT_PUBLIC_GA_MEASUREMENT_ID is set */}
            {analyticsConfig.ga?.enabled && (
                <GoogleAnalytics
                    measurementId={analyticsConfig.ga.measurementId}
                />
            )}

            {/* Only loads if NEXT_PUBLIC_GTM_ID is set */}
            {analyticsConfig.gtm?.enabled && (
                <GoogleTagManager
                    containerId={analyticsConfig.gtm.containerId}
                />
            )}

            {/* Only loads if NEXT_PUBLIC_CLARITY_PROJECT_ID is set */}
            {analyticsConfig.clarity?.enabled && (
                <Clarity projectId={analyticsConfig.clarity.projectId} />
            )}

            {/* Only loads if NEXT_PUBLIC_FACEBOOK_PIXEL_ID is set */}
            {analyticsConfig.facebookPixel?.enabled && (
                <FacebookPixel
                    pixelId={analyticsConfig.facebookPixel.pixelId}
                />
            )}
        </>
    )
}
```

**Key Points**:

- ✅ Environment-driven: Services only load when configured
- ✅ No runtime overhead for unused services
- ✅ Easy to enable/disable services via env vars
- ✅ Centralized management

## Component Implementation

### Tracking in React Components

#### Basic Event Tracking

```tsx
'use client'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function NewsletterSignup() {
    const handleSubmit = async (email: string) => {
        // Track the event
        trackEvent('newsletter_signup', {
            method: 'footer_form',
            page_location: window.location.pathname,
        })

        // Your signup logic
        await subscribeToNewsletter(email)
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                const email = new FormData(e.currentTarget).get(
                    'email'
                ) as string
                handleSubmit(email)
            }}
        >
            <input type='email' name='email' required />
            <button type='submit'>Subscribe</button>
        </form>
    )
}
```

#### Button Click Tracking

```tsx
'use client'

import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics/analytics.client'

export function CTAButton() {
    const handleClick = () => {
        trackEvent('cta_click', {
            button_text: 'Schedule Consultation',
            button_location: 'hero_section',
            destination_url: '/contact',
        })
    }

    return (
        <Button onClick={handleClick} href='/contact'>
            Schedule Consultation
        </Button>
    )
}
```

#### Link Tracking

```tsx
'use client'

import Link from 'next/link'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function TrackedLink({
    href,
    children,
    eventName = 'link_click',
    ...props
}: {
    href: string
    children: React.ReactNode
    eventName?: string
}) {
    const handleClick = () => {
        trackEvent(eventName, {
            link_url: href,
            link_text: typeof children === 'string' ? children : '',
        })
    }

    return (
        <Link href={href} onClick={handleClick} {...props}>
            {children}
        </Link>
    )
}

// Usage
;<TrackedLink href='/procedures' eventName='procedure_nav'>
    View Procedures
</TrackedLink>
```

### Form Tracking Patterns

#### Contact Form

```tsx
'use client'

import { useState } from 'react'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function ContactForm() {
    const [formState, setFormState] = useState<
        'idle' | 'submitting' | 'success' | 'error'
    >('idle')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setFormState('submitting')

        const formData = new FormData(e.currentTarget)

        // Track form start
        trackEvent('form_start', {
            form_name: 'contact',
            form_location: 'contact_page',
        })

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                setFormState('success')

                // Track successful submission
                trackEvent('form_submit', {
                    form_name: 'contact',
                    form_location: 'contact_page',
                    success: true,
                })
            } else {
                throw new Error('Submission failed')
            }
        } catch (error) {
            setFormState('error')

            // Track error
            trackEvent('form_error', {
                form_name: 'contact',
                form_location: 'contact_page',
                error_type: 'submission_failed',
            })
        }
    }

    return <form onSubmit={handleSubmit}>{/* Form fields */}</form>
}
```

#### Multi-Step Form

```tsx
'use client'

import { useState } from 'react'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function MultiStepForm() {
    const [step, setStep] = useState(1)
    const totalSteps = 3

    const handleStepChange = (newStep: number) => {
        trackEvent('form_step_change', {
            form_name: 'consultation_booking',
            previous_step: step,
            new_step: newStep,
            progress: `${newStep}/${totalSteps}`,
        })

        setStep(newStep)
    }

    const handleComplete = () => {
        trackEvent('form_complete', {
            form_name: 'consultation_booking',
            total_steps: totalSteps,
        })
    }

    return (
        <div>
            {step === 1 && <Step1 onNext={() => handleStepChange(2)} />}
            {step === 2 && (
                <Step2
                    onNext={() => handleStepChange(3)}
                    onBack={() => handleStepChange(1)}
                />
            )}
            {step === 3 && (
                <Step3
                    onComplete={handleComplete}
                    onBack={() => handleStepChange(2)}
                />
            )}
        </div>
    )
}
```

## Custom Event Tracking

### Event Naming Convention

Follow GA4 naming best practices:

**Format**: `category_action` (lowercase, snake_case)

**Examples**:

- ✅ `cta_click`
- ✅ `form_submit`
- ✅ `video_play`
- ✅ `procedure_view`
- ❌ `CtaClick` (PascalCase)
- ❌ `cta-click` (kebab-case)
- ❌ `Form Submit` (spaces)

### Common Event Patterns

#### User Engagement

```typescript
// Button clicks
trackEvent('cta_click', {
    button_text: 'Get Started',
    button_location: 'hero',
})

// Video interaction
trackEvent('video_play', {
    video_title: 'Procedure Overview',
    video_location: 'procedure_page',
})

trackEvent('video_complete', {
    video_title: 'Procedure Overview',
    watch_duration: 120, // seconds
})

// File downloads
trackEvent('file_download', {
    file_name: 'price_guide.pdf',
    file_type: 'pdf',
})
```

#### E-commerce / Conversions

```typescript
// Add to cart (for booking systems)
trackEvent('add_to_cart', {
    item_name: 'Consultation',
    item_category: 'service',
    value: 0, // Free consultation
})

// Begin checkout
trackEvent('begin_checkout', {
    item_name: 'Breast Augmentation',
    value: 5000,
    currency: 'USD',
})

// Purchase
trackEvent('purchase', {
    transaction_id: 'TXN_123456',
    value: 5000,
    currency: 'USD',
    items: ['Consultation', 'Procedure'],
})
```

#### Content Engagement

```typescript
// Blog post reading
trackEvent('article_read', {
    article_title: 'Recovery Timeline',
    article_category: 'education',
    reading_time: 180, // seconds
})

// Search
trackEvent('search', {
    search_term: 'breast augmentation cost',
    search_location: 'header',
})

// Filter usage
trackEvent('filter_apply', {
    filter_type: 'procedure_type',
    filter_value: 'facial',
})
```

### Event Parameters Best Practices

**DO**:

- Use descriptive parameter names
- Use lowercase snake_case
- Include context (page, location, etc.)
- Limit to 25 parameters per event
- Keep values concise

**DON'T**:

- Include PII (names, emails, phone numbers)
- Use nested objects (flatten them)
- Exceed 100 characters per parameter value
- Use special characters in parameter names

## Advanced Patterns

### Custom Hook for Tracking

Create reusable tracking hooks:

```typescript
// lib/analytics/useButtonTracking.hook.ts
'use client'

import { useCallback } from 'react'
import { trackEvent } from './analytics.client'

export function useButtonTracking() {
  const trackButtonClick = useCallback((buttonText: string, location: string) => {
    trackEvent('button_click', {
      button_text: buttonText,
      button_location: location,
      timestamp: Date.now(),
    })
  }, [])

  return { trackButtonClick }
}

// Usage in component
export function MyButton() {
  const { trackButtonClick } = useButtonTracking()

  return (
    <button onClick={() => trackButtonClick('Subscribe', 'footer')}>
      Subscribe
    </button>
  )
}
```

### HOC for Automatic Tracking

```typescript
// lib/analytics/withTracking.tsx
'use client'

import { ComponentType } from 'react'
import { trackEvent } from './analytics.client'

export function withClickTracking<P extends object>(
  Component: ComponentType<P>,
  eventName: string,
  getParams: (props: P) => Record<string, unknown>
) {
  return function TrackedComponent(props: P) {
    const handleClick = () => {
      trackEvent(eventName, getParams(props))
    }

    return (
      <div onClick={handleClick}>
        <Component {...props} />
      </div>
    )
  }
}

// Usage
const TrackedButton = withClickTracking(
  Button,
  'cta_click',
  (props) => ({ button_text: props.children })
)
```

### Tracking Context Provider

```typescript
// lib/analytics/tracking.context.tsx
'use client'

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { trackEvent } from './analytics.client'

interface TrackingContextValue {
  trackWithContext: (eventName: string, params?: Record<string, unknown>) => void
  pageContext: Record<string, unknown>
}

const TrackingContext = createContext<TrackingContextValue | undefined>(undefined)

export function TrackingProvider({
  children,
  pageContext,
}: {
  children: ReactNode
  pageContext: Record<string, unknown>
}) {
  const trackWithContext = useCallback(
    (eventName: string, params?: Record<string, unknown>) => {
      trackEvent(eventName, {
        ...pageContext,
        ...params,
      })
    },
    [pageContext]
  )

  return (
    <TrackingContext.Provider value={{ trackWithContext, pageContext }}>
      {children}
    </TrackingContext.Provider>
  )
}

export function useTracking() {
  const context = useContext(TrackingContext)
  if (!context) {
    throw new Error('useTracking must be used within TrackingProvider')
  }
  return context
}

// Usage in page
export default function ProcedurePage() {
  return (
    <TrackingProvider pageContext={{ page_type: 'procedure', procedure_name: 'breast_augmentation' }}>
      <ProcedureContent />
    </TrackingProvider>
  )
}

// Usage in component
function ProcedureContent() {
  const { trackWithContext } = useTracking()

  return (
    <button onClick={() => trackWithContext('consultation_request')}>
      Schedule Consultation
    </button>
  )
}
```

## Production Checklist

### Pre-Launch

- [ ] Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in production env
- [ ] Test all critical events in GA4 DebugView
- [ ] Confirm page views tracking correctly
- [ ] Validate scroll depth tracking
- [ ] Test form submission tracking
- [ ] Check mobile device tracking
- [ ] Verify consent mode configuration matches requirements
- [ ] Remove any console.log statements (auto-removed in production)
- [ ] Test with ad blockers enabled (expect failures)

### Post-Launch Monitoring

**Week 1**:

- [ ] Check GA4 Realtime report for active users
- [ ] Verify event counts match expectations
- [ ] Review top events report
- [ ] Check for error events or unexpected patterns

**Week 2-4**:

- [ ] Analyze user flow reports
- [ ] Review conversion funnels
- [ ] Check engagement metrics
- [ ] Validate attribution data

### Performance Validation

Ensure analytics don't impact Core Web Vitals:

```bash
# Run Lighthouse audit
npx lighthouse https://your-site.com --view

# Check for:
# - FCP < 1.8s (First Contentful Paint)
# - LCP < 2.5s (Largest Contentful Paint)
# - CLS < 0.1 (Cumulative Layout Shift)
# - TBT < 200ms (Total Blocking Time)
```

**Expected**: Analytics scripts should have **zero impact** on CLS and minimal impact (<50ms) on TBT.

## Related Documentation

- [Quick Start](./02-quick-start.md) - Basic setup
- [Event Tracking Guide](./07-event-tracking.md) - Detailed event reference
- [API Reference](./10-api-reference.md) - Complete API docs
- [Verification Guide](./11-verification-debugging.md) - Testing procedures

---

**Last Updated**: December 16, 2024
