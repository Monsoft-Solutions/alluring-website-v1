# Analytics System Overview

## Introduction

The Alluring Plastic Surgery analytics system provides comprehensive tracking and monitoring capabilities across multiple platforms while maintaining privacy compliance and optimal performance.

## Goals & Objectives

### Primary Goals

1. **Understand User Behavior**: Track how visitors interact with the site
2. **Measure Marketing Performance**: Attribution and conversion tracking
3. **Optimize User Experience**: Identify pain points and improvement opportunities
4. **Maintain Privacy Compliance**: Respect user privacy and regulatory requirements
5. **Enable Data-Driven Decisions**: Provide actionable insights to stakeholders

### Technical Objectives

- ✅ Type-safe implementation with full TypeScript support
- ✅ Zero impact on Core Web Vitals and page performance
- ✅ Server-side rendering (SSR) compatibility
- ✅ Privacy-first approach with Consent Mode v2
- ✅ Reliable tracking without blocking user experience
- ✅ Comprehensive error handling and debugging tools

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                     Root Layout                         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           AnalyticsProvider                       │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  - GoogleAnalytics (GA4)                   │  │  │
│  │  │  - Clarity (Session Recording)             │  │  │
│  │  │  - GoogleTagManager                        │  │  │
│  │  │  - FacebookPixel                           │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │                                                   │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  Automatic Tracking Components             │  │  │
│  │  │  - PageViewTracker (GA4)                   │  │  │
│  │  │  - InternalPageViewTracker (Database)      │  │  │
│  │  │  - ScrollDepthTracker                      │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │                                                   │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  Consent Management                        │  │  │
│  │  │  - ConsentProvider (Context)               │  │  │
│  │  │  - CookieBanner (Optional UI)              │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Component Architecture

#### 1. Analytics Provider Layer

**Location**: `apps/web/components/analytics/analytics-provider.component.tsx`

Central orchestrator that conditionally loads analytics services based on environment configuration.

```tsx
<AnalyticsProvider>
    <GoogleAnalytics /> {/* If NEXT_PUBLIC_GA_MEASUREMENT_ID set */}
    <Clarity /> {/* If NEXT_PUBLIC_CLARITY_PROJECT_ID set */}
    <GoogleTagManager /> {/* If NEXT_PUBLIC_GTM_ID set */}
    <FacebookPixel /> {/* If NEXT_PUBLIC_FACEBOOK_PIXEL_ID set */}
</AnalyticsProvider>
```

#### 2. Tracking Components

**Automatic Page View Tracking**:

- `PageViewTracker`: GA4 page views on navigation
- `InternalPageViewTracker`: Cookie-free database tracking

**Engagement Tracking**:

- `ScrollDepthTracker`: Measures content consumption (25%, 50%, 75%, 100%)

#### 3. Client Utilities

**Location**: `apps/web/lib/analytics/analytics.client.ts`

Browser-only utilities with SSR guards:

```typescript
// Custom event tracking
trackEvent('button_click', { button_name: 'cta' })

// Manual page view
trackPageView({ page_path: '/about' })

// Scroll depth
trackScrollDepth({ percent: 75 })

// Clarity-specific
trackClarityEvent('form_submit')
identifyClarityUser('user_id')
upgradeClaritySession()
```

### Data Flow

#### Third-Party Analytics (GA4)

```
User Action
    ↓
React Component / Hook
    ↓
trackEvent() / trackPageView()
    ↓
window.gtag('event', ...)
    ↓
GA4 / Google Tag Manager
    ↓
Google Analytics Dashboard
```

#### Internal Analytics

```
User Navigation
    ↓
InternalPageViewTracker (useEffect)
    ↓
usePageViewTracking hook
    ↓
navigator.sendBeacon() or fetch()
    ↓
/api/analytics/track endpoint
    ↓
Database (page_views table)
    ↓
Analytics Dashboard / Reports
```

## Technology Stack

### Core Technologies

| Technology             | Purpose       | Why Chosen                                  |
| ---------------------- | ------------- | ------------------------------------------- |
| **Next.js 15**         | Framework     | App Router, SSR support, Script component   |
| **TypeScript**         | Language      | Type safety, better DX, compile-time checks |
| **React 18**           | UI Library    | Component-based architecture, hooks         |
| **Google Analytics 4** | Web Analytics | Industry standard, free, powerful reporting |
| **Microsoft Clarity**  | UX Analytics  | Free session recording and heatmaps         |

### Analytics Services

#### Google Analytics 4 (GA4)

**Script Loading**: `<Script strategy="afterInteractive" />`

**Features**:

- Event-based data model
- Cross-platform tracking
- Machine learning insights
- Free tier with generous limits

**Implementation**:

- Consent Mode v2 integration
- Debug mode for development
- Automatic page view tracking
- Custom event support

#### Microsoft Clarity

**Features**:

- Session recordings
- Heatmaps (click, scroll, attention)
- Rage clicks and dead clicks detection
- Free unlimited recordings

**Use Cases**:

- User behavior analysis
- UX problem identification
- Conversion optimization

#### Internal Analytics

**Technology**: Database-backed (PostgreSQL via Drizzle ORM)

**Features**:

- Cookie-free tracking
- First-party data ownership
- UTM parameter tracking
- Real-time data access

**Privacy Benefits**:

- No third-party cookies
- Full data control
- GDPR-friendly by design

## Key Features

### 1. Consent Mode v2 Implementation

Google's privacy framework for managing user consent preferences.

**Current Configuration**: Default to Granted

```javascript
gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    // ... other consent types
})
```

**Learn More**: [Consent Mode Documentation](./05-consent-mode.md)

### 2. Automatic Event Tracking

Events tracked without additional code:

| Event           | Trigger                        | Parameters                                 |
| --------------- | ------------------------------ | ------------------------------------------ |
| `page_view`     | Page load & navigation         | `page_path`, `page_location`, `page_title` |
| `scroll_depth`  | 25%, 50%, 75%, 100% milestones | `percent`, `page_path`                     |
| `session_start` | First event in session         | Auto by GA4                                |
| `first_visit`   | First time user                | Auto by GA4                                |

### 3. Debug Mode

Development environment features:

```typescript
if (env.NODE_ENV === 'development') {
    // Enable GA4 debug mode
    gtag('config', measurementId, { debug_mode: true })

    // Console logging
    console.log('Analytics: Event tracked', eventName, params)
}
```

**Benefits**:

- Real-time event validation in DebugView
- Console logs for debugging
- No production performance impact

### 4. SSR Compatibility

All analytics code includes server-side rendering guards:

```typescript
const isBrowser = () => typeof window !== 'undefined'
const isGtagAvailable = () => isBrowser() && !!window.gtag

if (!isGtagAvailable()) return
```

**Why This Matters**:

- Prevents "window is not defined" errors
- Ensures clean server-side rendering
- Allows static site generation (SSG)

### 5. Performance Optimization

**Script Loading Strategy**:

- `strategy="afterInteractive"` - Loads after page is interactive
- Non-blocking: Scripts don't delay First Contentful Paint (FCP)
- Deferred execution: No impact on Largest Contentful Paint (LCP)

**Event Transmission**:

- `sendBeacon()` for page unload events (reliable delivery)
- `fetch(..., { keepalive: true })` fallback
- Non-blocking asynchronous requests

## Design Principles

### 1. Privacy First

- Consent Mode v2 compliance
- No PII in event parameters
- Cookie-free alternatives available
- Clear user communication

### 2. Performance First

- Non-blocking script loading
- Minimal bundle impact
- Efficient event batching
- Zero layout shift (CLS = 0)

### 3. Developer Experience

- Type-safe APIs
- Clear error messages
- Development mode debugging
- Comprehensive documentation

### 4. Maintainability

- Component-based architecture
- Single responsibility principle
- Centralized configuration
- Environment-driven setup

### 5. Reliability

- Graceful degradation
- Error handling at all levels
- SSR compatibility
- Fallback mechanisms

## Limitations & Constraints

### Current Limitations

1. **Consent Configuration**: Currently set to "granted by default" - not suitable for GDPR/CCPA strict compliance without user opt-in
2. **Ad Blockers**: Third-party analytics (GA4, Clarity) will be blocked by ad blockers
3. **ITP & Privacy Features**: Safari and Firefox may limit cookie duration and tracking capabilities
4. **Real-Time Reporting**: Internal analytics are near real-time but not instant

### Known Constraints

1. **Environment Variables Required**: Analytics services require configuration at build time
2. **Client-Side Only**: Most analytics functions only work in browser context
3. **Next.js Dependency**: Tightly coupled to Next.js App Router patterns
4. **TypeScript Required**: Not compatible with plain JavaScript without modifications

## Future Enhancements

### Planned Improvements

- [ ] Server-side event tracking for enhanced accuracy
- [ ] Custom dashboard for internal analytics
- [ ] A/B testing framework integration
- [ ] Enhanced attribution modeling
- [ ] Real-time analytics API
- [ ] Data warehouse integration
- [ ] Advanced consent management UI
- [ ] Multi-region compliance presets

### Under Consideration

- [ ] Alternative analytics providers (Plausible, Fathom)
- [ ] Enhanced e-commerce tracking
- [ ] Funnel analysis tools
- [ ] User journey mapping
- [ ] Predictive analytics

## Related Documentation

- [Quick Start Guide](./02-quick-start.md) - Get up and running
- [Implementation Guide](./03-implementation-guide.md) - Detailed integration
- [Google Analytics 4](./04-google-analytics-4.md) - GA4 specific docs
- [API Reference](./10-api-reference.md) - Complete API documentation

---

**Next Steps**: Review the [Quick Start Guide](./02-quick-start.md) to begin implementing analytics in your project.

---

**Last Updated**: December 16, 2024
