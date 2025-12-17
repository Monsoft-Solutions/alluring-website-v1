# Event Tracking Guide

Complete reference for tracking custom events and user interactions.

## Overview

Event tracking captures user actions beyond page views. Well-implemented event tracking provides insights into user behavior, conversion paths, and engagement patterns.

### Event Types

1. **Automatic Events**: Tracked without code (GA4 Enhanced Measurement)
2. **Recommended Events**: GA4 predefined events with standard parameters
3. **Custom Events**: Your own events for specific business needs

## GA4 Event Structure

### Event Anatomy

```typescript
trackEvent('event_name', {
    parameter_1: 'value',
    parameter_2: 123,
    parameter_3: true,
})
```

**Event Name**: Lowercase snake_case (e.g., `button_click`, `form_submit`)

**Parameters**: Key-value pairs providing event context

### Event Naming Best Practices

**DO**:

- ✅ Use lowercase snake_case: `user_signup`, `video_play`
- ✅ Be specific: `hero_cta_click` vs `button_click`
- ✅ Group related events: `form_start`, `form_submit`, `form_error`
- ✅ Keep names under 40 characters

**DON'T**:

- ❌ Use PascalCase: `UserSignup`
- ❌ Use kebab-case: `user-signup`
- ❌ Use spaces: `user signup`
- ❌ Be vague: `action`, `click`, `event`

## Automatic Events (GA4)

These events track automatically with **Enhanced Measurement** enabled:

| Event                 | Trigger                                    | Parameters                                                         |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| `page_view`           | Page loads                                 | `page_location`, `page_referrer`, `page_title`                     |
| `scroll`              | User scrolls 90%                           | `percent_scrolled: 90`                                             |
| `click`               | Outbound link click                        | `link_domain`, `link_url`, `link_classes`                          |
| `file_download`       | Download link (pdf, zip, etc.)             | `file_name`, `file_extension`, `link_url`                          |
| `video_start`         | Embedded video plays                       | `video_current_time`, `video_duration`, `video_title`, `video_url` |
| `video_progress`      | Video milestones (10%, 25%, 50%, 75%, 90%) | `video_percent`, `video_title`                                     |
| `video_complete`      | Video finishes                             | `video_current_time`, `video_duration`, `video_title`              |
| `view_search_results` | Site search performed                      | `search_term`                                                      |

**Enable in GA4**:

1. Admin → Data Streams → Select stream
2. Enhanced Measurement → Configure
3. Toggle desired events ON

## Custom Event Implementation

### Basic Event Tracking

```typescript
import { trackEvent } from '@/lib/analytics/analytics.client'

// Simple event
trackEvent('cta_click')

// Event with parameters
trackEvent('cta_click', {
    button_text: 'Schedule Consultation',
    button_location: 'hero_section',
})
```

### Button Clicks

```tsx
'use client'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function CTAButton() {
    const handleClick = () => {
        trackEvent('cta_click', {
            button_text: 'Schedule Consultation',
            button_location: 'hero',
            destination_url: '/contact',
        })
    }

    return <button onClick={handleClick}>Schedule Consultation</button>
}
```

### Form Tracking

#### Form Start & Submit

```tsx
'use client'

import { useState } from 'react'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function ContactForm() {
    const [started, setStarted] = useState(false)

    const handleFocus = () => {
        if (!started) {
            setStarted(true)
            trackEvent('form_start', {
                form_name: 'contact',
                form_location: 'contact_page',
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        trackEvent('form_submit', {
            form_name: 'contact',
            form_location: 'contact_page',
            method: 'email',
        })

        // Submit logic
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type='text' name='name' onFocus={handleFocus} required />
            <button type='submit'>Submit</button>
        </form>
    )
}
```

#### Form Validation Errors

```tsx
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm(formData)

    if (errors.length > 0) {
        trackEvent('form_error', {
            form_name: 'contact',
            error_field: errors[0].field,
            error_message: errors[0].message,
        })
        return
    }

    // Submit...
}
```

### Link Tracking

```tsx
'use client'

import Link from 'next/link'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function TrackedLink({
    href,
    children,
}: {
    href: string
    children: React.ReactNode
}) {
    const handleClick = () => {
        const isOutbound = href.startsWith('http')

        trackEvent(isOutbound ? 'outbound_link' : 'internal_link', {
            link_url: href,
            link_text: typeof children === 'string' ? children : '',
        })
    }

    return (
        <Link href={href} onClick={handleClick}>
            {children}
        </Link>
    )
}
```

### Video Tracking

```tsx
'use client'

import { useRef } from 'react'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function VideoPlayer({ src, title }: { src: string; title: string }) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const milestones = useRef(new Set<number>())

    const handlePlay = () => {
        trackEvent('video_play', {
            video_title: title,
            video_url: src,
        })
    }

    const handleTimeUpdate = () => {
        const video = videoRef.current
        if (!video) return

        const percent = (video.currentTime / video.duration) * 100
        const milestone = Math.floor(percent / 25) * 25 // 0, 25, 50, 75

        if (milestone > 0 && !milestones.current.has(milestone)) {
            milestones.current.add(milestone)
            trackEvent('video_progress', {
                video_title: title,
                video_percent: milestone,
            })
        }
    }

    const handleEnded = () => {
        trackEvent('video_complete', {
            video_title: title,
            video_duration: videoRef.current?.duration,
        })
    }

    return (
        <video
            ref={videoRef}
            src={src}
            onPlay={handlePlay}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            controls
        />
    )
}
```

### Download Tracking

```tsx
'use client'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function DownloadButton({
    href,
    fileName,
}: {
    href: string
    fileName: string
}) {
    const handleClick = () => {
        trackEvent('file_download', {
            file_name: fileName,
            file_type: fileName.split('.').pop(),
            file_url: href,
        })
    }

    return (
        <a href={href} download onClick={handleClick} className='btn'>
            Download {fileName}
        </a>
    )
}
```

## GA4 Recommended Events

Use these predefined events for standard e-commerce and engagement tracking:

### User Actions

#### Login

```typescript
trackEvent('login', {
    method: 'email', // or 'google', 'facebook'
})
```

#### Sign Up

```typescript
trackEvent('sign_up', {
    method: 'email',
})
```

#### Search

```typescript
trackEvent('search', {
    search_term: 'breast augmentation cost',
})
```

### E-commerce

#### View Item

```typescript
trackEvent('view_item', {
    item_id: 'PROC_001',
    item_name: 'Breast Augmentation',
    item_category: 'Procedures',
    item_category2: 'Breast',
    price: 5000,
    currency: 'USD',
})
```

#### Add to Cart

```typescript
trackEvent('add_to_cart', {
    currency: 'USD',
    value: 5000,
    items: [
        {
            item_id: 'PROC_001',
            item_name: 'Breast Augmentation',
            price: 5000,
            quantity: 1,
        },
    ],
})
```

#### Begin Checkout

```typescript
trackEvent('begin_checkout', {
    currency: 'USD',
    value: 5000,
    coupon: 'SUMMER2024',
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

#### Purchase

```typescript
trackEvent('purchase', {
    transaction_id: 'TXN_' + Date.now(),
    value: 5000,
    currency: 'USD',
    tax: 400,
    shipping: 0,
    items: [
        {
            item_id: 'PROC_001',
            item_name: 'Breast Augmentation',
            price: 5000,
            quantity: 1,
        },
    ],
})
```

### Lead Generation

#### Generate Lead

```typescript
trackEvent('generate_lead', {
    value: 0, // Estimated lead value
    currency: 'USD',
    method: 'contact_form',
})
```

#### Submit Application

```typescript
trackEvent('submit_application', {
    application_type: 'consultation',
    value: 0,
})
```

## Event Parameters

### Standard Parameters

Use these consistent parameter names:

| Parameter         | Type   | Description          | Example                   |
| ----------------- | ------ | -------------------- | ------------------------- |
| `button_text`     | string | Button label         | `'Schedule Consultation'` |
| `button_location` | string | Where button appears | `'hero_section'`          |
| `form_name`       | string | Form identifier      | `'contact'`               |
| `form_location`   | string | Where form appears   | `'contact_page'`          |
| `link_url`        | string | Link destination     | `'https://example.com'`   |
| `link_text`       | string | Link label           | `'Learn More'`            |
| `video_title`     | string | Video name           | `'Procedure Overview'`    |
| `error_message`   | string | Error description    | `'Invalid email format'`  |
| `method`          | string | Action method        | `'email'`, `'google'`     |

### Parameter Best Practices

**DO**:

- ✅ Use descriptive names: `button_location` not `loc`
- ✅ Keep values concise (under 100 characters)
- ✅ Use consistent naming across events
- ✅ Limit to 25 parameters per event

**DON'T**:

- ❌ Include PII (names, emails, phone numbers)
- ❌ Use nested objects (flatten them)
- ❌ Exceed parameter limits
- ❌ Use special characters in names

### PII Avoidance

**Never track**:

- ❌ Full names
- ❌ Email addresses
- ❌ Phone numbers
- ❌ Street addresses
- ❌ Social security numbers
- ❌ Credit card numbers

**Safe alternatives**:

- ✅ User ID (non-identifiable hash)
- ✅ General location (city, state)
- ✅ Aggregated data
- ✅ Event counts

## Event Tracking Patterns

### Scroll Depth (Already Implemented)

```typescript
// Automatically tracked at 25%, 50%, 75%, 100%
// Via ScrollDepthTracker component
trackEvent('scroll_depth', {
    percent: 75,
    page_path: '/about',
})
```

### Time on Page

```tsx
'use client'

import { useEffect, useRef } from 'react'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function TimeOnPageTracker() {
    const startTime = useRef(Date.now())

    useEffect(() => {
        return () => {
            const timeSpent = Math.floor(
                (Date.now() - startTime.current) / 1000
            )

            if (timeSpent > 10) {
                // Only track if >10 seconds
                trackEvent('time_on_page', {
                    page_path: window.location.pathname,
                    time_spent_seconds: timeSpent,
                })
            }
        }
    }, [])

    return null
}
```

### Element Visibility

```tsx
'use client'

import { useEffect, useRef } from 'react'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function VisibilityTracker({
    elementId,
    eventName,
}: {
    elementId: string
    eventName: string
}) {
    const tracked = useRef(false)

    useEffect(() => {
        const element = document.getElementById(elementId)
        if (!element) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !tracked.current) {
                    tracked.current = true
                    trackEvent(eventName, {
                        element_id: elementId,
                        page_path: window.location.pathname,
                    })
                }
            },
            { threshold: 0.5 } // Trigger when 50% visible
        )

        observer.observe(element)
        return () => observer.disconnect()
    }, [elementId, eventName])

    return null
}

// Usage
;<VisibilityTracker elementId='pricing-section' eventName='pricing_viewed' />
```

### Exit Intent

```tsx
'use client'

import { useEffect } from 'react'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function ExitIntentTracker() {
    useEffect(() => {
        let exitTracked = false

        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY < 10 && !exitTracked) {
                exitTracked = true
                trackEvent('exit_intent', {
                    page_path: window.location.pathname,
                    time_on_page: Math.floor(
                        (Date.now() - performance.now()) / 1000
                    ),
                })
            }
        }

        document.addEventListener('mouseleave', handleMouseLeave)
        return () =>
            document.removeEventListener('mouseleave', handleMouseLeave)
    }, [])

    return null
}
```

## Debugging Events

### Console Logging (Development)

Events automatically log in development:

```javascript
console.log('Analytics: Event tracked', 'button_click', { button_text: 'CTA' })
```

### GA4 DebugView

Real-time event validation:

1. Go to [Google Analytics](https://analytics.google.com)
2. Navigate to: **Admin** → **DebugView**
3. Events appear instantly with full parameter details

### Browser DevTools

Check network requests:

```javascript
// Open DevTools → Network tab
// Filter: "google-analytics"
// Look for: /g/collect requests
```

## Event Conversion Tracking

### Mark Events as Conversions

1. Go to GA4: **Configure** → **Events**
2. Find your event (e.g., `form_submit`)
3. Toggle "Mark as conversion"

**Conversion events appear**:

- Realtime report
- Conversions report
- Attribution report
- Google Ads (if linked)

### Key Conversions to Track

**For SaaS/Lead Gen**:

- `form_submit` - Contact form submitted
- `consultation_request` - Consultation booked
- `generate_lead` - Lead captured
- `sign_up` - Account created

**For E-commerce**:

- `purchase` - Transaction completed
- `add_to_cart` - Item added to cart
- `begin_checkout` - Checkout started

## Related Documentation

- [Google Analytics 4](./04-google-analytics-4.md) - GA4 setup
- [Implementation Guide](./03-implementation-guide.md) - Integration details
- [API Reference](./10-api-reference.md) - Function documentation
- [Verification Guide](./11-verification-debugging.md) - Testing events

---

**Last Updated**: December 16, 2024
