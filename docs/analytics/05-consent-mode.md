# Consent Mode v2

Privacy-first analytics configuration and compliance guide.

## Overview

Google Consent Mode v2 is a privacy framework that controls how analytics and advertising cookies behave based on user consent preferences.

### What is Consent Mode?

Consent Mode allows analytics to function in two states:

1. **Granted**: Full tracking with cookies and user identifiers
2. **Denied**: Cookieless measurement with aggregated data

**Benefits**:

- ✅ GDPR and CCPA compliance support
- ✅ Maintains some analytics even without consent
- ✅ Conversion modeling for denied users
- ✅ Respects user privacy preferences

## Current Configuration

### Default State: Granted

**Configuration**:

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

**What This Means**:

- Analytics tracking starts immediately on page load
- No user consent prompt required
- Full GA4 features enabled (attribution, audiences, remarketing)
- Cookies are set without user action

**Suitable For**:

- US-only audiences (no GDPR)
- Internal testing and analytics
- Non-commercial sites
- B2B sites with business-only traffic

**Not Suitable For**:

- EU/UK traffic (GDPR)
- California traffic (CCPA) without notice
- Sites requiring strict privacy compliance

## Storage Types

### Consent Categories

| Storage Type              | Purpose                  | Required For               |
| ------------------------- | ------------------------ | -------------------------- |
| `analytics_storage`       | Google Analytics cookies | GA4 tracking               |
| `ad_storage`              | Advertising cookies      | Google Ads, remarketing    |
| `ad_user_data`            | User data for ads        | Conversion tracking        |
| `ad_personalization`      | Personalized ads         | Dynamic remarketing        |
| `functionality_storage`   | Site functionality       | Cookie banner state        |
| `personalization_storage` | User preferences         | Site customization         |
| `security_storage`        | Security features        | Anti-fraud, authentication |

### Impact of Denied Consent

**`analytics_storage: denied`**:

- No GA4 cookies (`_ga`, `_gid`)
- Cookieless pings (aggregated data only)
- No cross-session tracking
- Limited attribution

**`ad_storage: denied`**:

- No advertising cookies
- No remarketing audiences
- Conversion modeling estimates conversions

## Implementation Options

### Option 1: Default to Granted (Current)

**Use When**: Operating in US-only, no strict privacy requirements.

```javascript
// No changes needed - this is current implementation
gtag('consent', 'default', {
    analytics_storage: 'granted',
    // ... all granted
})
```

**Pros**:

- ✅ Full analytics from day one
- ✅ No UI complexity
- ✅ Complete attribution data

**Cons**:

- ❌ Not GDPR compliant
- ❌ Not suitable for EU traffic
- ❌ May violate some regional privacy laws

### Option 2: Default to Denied + Cookie Banner

**Use When**: EU/UK traffic, GDPR compliance required.

**Step 1**: Update consent default:

```javascript
// apps/web/components/analytics/google-analytics.component.tsx
gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted', // Keep for banner state
    personalization_storage: 'denied',
    security_storage: 'granted', // Keep for security
})
```

**Step 2**: Enable cookie banner:

```bash
# .env.local
NEXT_PUBLIC_ENABLE_COOKIE_BANNER=true
```

**Step 3**: Update consent on user acceptance:

```typescript
// apps/web/lib/analytics/consent.util.ts
export function updateConsent(state: 'granted' | 'denied') {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('consent', 'update', {
        analytics_storage: state,
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state,
        personalization_storage: state,
    })

    // Persist choice
    localStorage.setItem('analytics_consent', state)
}
```

**Pros**:

- ✅ GDPR compliant
- ✅ User has control
- ✅ Conversion modeling available

**Cons**:

- ❌ Reduced data (some users decline)
- ❌ UI complexity
- ❌ Requires consent management

### Option 3: Implied Consent

**Use When**: Non-EU traffic, simple notice required.

Display informational banner without blocking:

```tsx
export function ConsentNotice() {
    const [visible, setVisible] = useState(true)

    return visible ? (
        <div className='fixed right-0 bottom-0 left-0 bg-gray-900 p-4 text-white'>
            <p>
                We use cookies to improve your experience.{' '}
                <Link href='/privacy'>Learn more</Link>
            </p>
            <button onClick={() => setVisible(false)}>Got it</button>
        </div>
    ) : null
}
```

**Consent still granted by default** - banner is informational only.

**Pros**:

- ✅ Simple implementation
- ✅ Full analytics
- ✅ Transparent to users

**Cons**:

- ❌ Not GDPR compliant
- ❌ May not satisfy some regulations

## Cookie Banner Integration

### Enable Cookie Banner

```bash
# .env.local
NEXT_PUBLIC_ENABLE_COOKIE_BANNER=true
```

### Cookie Banner Component

**Location**: `apps/web/components/cookie-banner.component.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'

import {
    getStoredConsentState,
    updateConsent,
} from '@/lib/analytics/consent.util'

export function CookieBanner() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Check if user has already made a choice
        const consent = getStoredConsentState()
        if (consent === null) {
            setVisible(true) // Show banner if no choice made
        }
    }, [])

    const handleAccept = () => {
        updateConsent('granted')
        setVisible(false)
    }

    const handleDecline = () => {
        updateConsent('denied')
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div className='fixed right-0 bottom-0 left-0 z-50 border-t bg-white p-4 shadow-lg'>
            <div className='mx-auto flex max-w-7xl items-center justify-between gap-4'>
                <p className='text-sm text-gray-700'>
                    We use cookies to enhance your browsing experience and
                    analyze our traffic. By clicking "Accept All", you consent
                    to our use of cookies.{' '}
                    <a href='/privacy' className='underline'>
                        Learn more
                    </a>
                </p>
                <div className='flex gap-2'>
                    <button
                        onClick={handleDecline}
                        className='rounded border px-4 py-2 text-sm hover:bg-gray-100'
                    >
                        Essential Only
                    </button>
                    <button
                        onClick={handleAccept}
                        className='rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700'
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    )
}
```

### Consent Context Provider

**Location**: `apps/web/lib/analytics/consent.context.tsx`

Provides consent state across the app:

```tsx
'use client'

import {
    type ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react'

import { getStoredConsentState } from './consent.util'

interface ConsentContextValue {
    consent: 'granted' | 'denied' | null
    updateConsent: (state: 'granted' | 'denied') => void
}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined)

export function ConsentProvider({ children }: { children: ReactNode }) {
    const [consent, setConsent] = useState<'granted' | 'denied' | null>(null)

    useEffect(() => {
        // Default consent is set inline in GoogleAnalytics component
        // This provider just exposes the current state to the app
        setConsent(getStoredConsentState())
    }, [])

    const updateConsentState = (state: 'granted' | 'denied') => {
        setConsent(state)
        // Update gtag and localStorage
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                analytics_storage: state,
                ad_storage: state,
                ad_user_data: state,
                ad_personalization: state,
                personalization_storage: state,
            })
            localStorage.setItem('analytics_consent', state)
        }
    }

    return (
        <ConsentContext.Provider
            value={{ consent, updateConsent: updateConsentState }}
        >
            {children}
        </ConsentContext.Provider>
    )
}

export function useConsent() {
    const context = useContext(ConsentContext)
    if (!context) {
        throw new Error('useConsent must be used within ConsentProvider')
    }
    return context
}
```

## Regional Compliance

### GDPR (EU/UK)

**Requirements**:

- ✅ Default consent to "denied"
- ✅ Explicit user opt-in required
- ✅ Clear, unambiguous consent UI
- ✅ Easy to withdraw consent
- ✅ Privacy policy accessible
- ✅ No cookie walls (blocking content)

**Implementation**: Use Option 2 (Default to Denied + Cookie Banner)

### CCPA (California)

**Requirements**:

- ✅ Notice at collection
- ✅ Opt-out mechanism ("Do Not Sell My Info")
- ✅ Privacy policy with data practices
- ❌ Opt-in NOT required (opt-out model)

**Implementation**: Option 1 (Default to Granted) with privacy notice and opt-out link.

### Brazil (LGPD)

**Requirements**:

- ✅ Explicit consent for analytics
- ✅ Clear purpose explanation
- ✅ Easy consent withdrawal
- ✅ Privacy policy in Portuguese

**Implementation**: Use Option 2 (Default to Denied + Cookie Banner)

### Global Strategy

**Best Practice**: Geo-detect and serve appropriate consent UI:

```typescript
// Detect user region (server-side)
const userRegion = getRegionFromIP(ip) // or use Vercel geolocation

// Serve appropriate consent configuration
const consentConfig = userRegion === 'EU' || userRegion === 'UK'
  ? 'denied' // GDPR strict
  : 'granted' // Rest of world

// Pass to GoogleAnalytics component
<GoogleAnalytics measurementId={id} defaultConsent={consentConfig} />
```

## Verification

### Check Consent State

**Browser Console**:

```javascript
// Check current consent state
google_tag_manager['GTM-XXXXX'].dataLayer.get('consent')

// Or inspect cookies
document.cookie.split(';').filter((c) => c.includes('_ga'))
```

**GA4 DebugView**:

- Events appear immediately if consent granted
- No events if consent denied (or modeling pings only)

### Test Cookie Banner

1. Clear browser cookies and localStorage
2. Reload page
3. Banner should appear
4. Click "Accept All"
5. Banner disappears
6. Reload page
7. Banner should NOT reappear (choice persisted)

## FAQ

### What happens if user declines consent?

**GA4**: Sends cookieless pings with limited data. GA4 uses conversion modeling to estimate conversions.

**Clarity**: Does not load at all (respects consent).

**Internal Analytics**: Still works (cookie-free by design).

### Can I change consent configuration later?

Yes. Update the `gtag('consent', 'default', {...})` call in `google-analytics.component.tsx` and deploy.

**Note**: Users who already made a choice will keep that choice (stored in localStorage).

### Do I need a cookie banner?

**Legal Answer**: Depends on jurisdiction and traffic sources. Consult with legal counsel.

**Technical Answer**:

- Current config (granted by default): No banner required for functionality, but may violate laws
- GDPR traffic: Yes, banner required
- US-only: Recommended but not legally required in most states

### How does this affect data accuracy?

**Consent Granted**: 100% accurate (all users tracked)

**Consent Denied (with banner)**: ~50-70% accuracy (varies by region)

- Some users decline
- GA4 conversion modeling estimates remaining ~30%

### Can I track without cookies?

Yes! See [Internal Analytics](./06-internal-analytics.md) for cookie-free tracking that's always active.

## Related Documentation

- [Google Analytics 4](./04-google-analytics-4.md) - GA4 implementation
- [Internal Analytics](./06-internal-analytics.md) - Cookie-free alternative
- [Verification Guide](./11-verification-debugging.md) - Testing consent

## External Resources

- [Google Consent Mode Documentation](https://developers.google.com/tag-platform/devguides/consent)
- [GDPR Official Text](https://gdpr.eu/)
- [CCPA Official Text](https://oag.ca.gov/privacy/ccpa)

---

**Last Updated**: December 16, 2024
