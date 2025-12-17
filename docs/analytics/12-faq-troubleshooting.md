# FAQ & Troubleshooting

Common questions and solutions for analytics implementation.

## Frequently Asked Questions

### General Questions

#### Q: Do I need all these analytics services?

**A**: No. At minimum, you only need Google Analytics 4. Additional services are optional:

- **Required**: GA4 (comprehensive analytics)
- **Recommended**: Internal Analytics (owned data, ad-blocker resistant)
- **Optional**: Clarity (UX insights), GTM (tag management), Facebook Pixel (ad tracking)

Enable only what you need by setting corresponding environment variables.

---

#### Q: Will analytics slow down my site?

**A**: Minimal impact with our implementation:

- **Strategy**: `afterInteractive` - loads after page is interactive
- **Impact**: <50ms on Total Blocking Time
- **CLS**: Zero impact (no layout shift)
- **FCP/LCP**: No blocking

**Recommendation**: Run Lighthouse audit to verify.

---

#### Q: Are analytics GDPR compliant?

**A**: Depends on configuration:

- **Current setup (consent granted by default)**: ❌ Not GDPR compliant without explicit user consent
- **With cookie banner (consent denied by default)**: ✅ GDPR compliant when user opts in
- **Internal analytics only**: ✅ More privacy-friendly (no third-party cookies)

See [Consent Mode Documentation](./05-consent-mode.md) for compliance options.

---

#### Q: Can users block analytics?

**A**: Yes, partially:

- **Third-party analytics (GA4, Clarity, Facebook)**: Blocked by ad blockers (uBlock Origin, Privacy Badger, etc.)
- **Internal analytics**: Harder to block (first-party domain, no cookies)
- **Estimate**: 20-40% of users may block third-party analytics

**Solution**: Use both third-party and internal analytics for comprehensive data.

---

#### Q: How long until data appears in reports?

**A**: Depends on the service:

| Service                  | Real-Time          | Standard Reports |
| ------------------------ | ------------------ | ---------------- |
| **GA4 DebugView**        | 1-2 seconds        | N/A              |
| **GA4 Realtime**         | 30-60 seconds      | N/A              |
| **GA4 Standard Reports** | N/A                | 24-48 hours      |
| **Clarity**              | 2-3 minutes        | Real-time        |
| **Internal Analytics**   | Instant (database) | Instant          |

**Tip**: Use DebugView for immediate verification.

---

#### Q: Can I track users across devices?

**A**: Yes, with User-ID feature:

```typescript
// Set User-ID (use non-PII identifier)
if (window.gtag && userId) {
    window.gtag('config', 'G-XXXXXXXXXX', {
        user_id: userId, // Hashed or non-identifiable
    })
}
```

**Requirements**:

- User must be logged in (authenticated)
- Use non-PII identifier only
- Enable User-ID in GA4 settings

---

#### Q: What is "consent granted by default" and why is it used?

**A**: It means analytics start tracking immediately without waiting for user consent.

**Why**:

- Simpler implementation (no consent UI required)
- Full data from day one
- Suitable for US-only audiences without strict privacy laws

**Trade-offs**:

- Not GDPR/CCPA compliant
- Not suitable for EU/UK traffic
- May violate some regional privacy laws

**Alternative**: Use cookie banner with consent denied by default (see [Consent Mode](./05-consent-mode.md)).

---

### Technical Questions

#### Q: Why use `strategy="afterInteractive"`?

**A**: Balances performance and data accuracy:

- **Performance**: Doesn't block FCP or LCP
- **Data**: Loads soon enough to track early interactions
- **Alternative**: `"lazyOnload"` loads too late (may miss events)

---

#### Q: What's the difference between PageViewTracker and InternalPageViewTracker?

**A**:

| Feature            | PageViewTracker     | InternalPageViewTracker |
| ------------------ | ------------------- | ----------------------- |
| **Destination**    | Google Analytics 4  | Database (internal)     |
| **Cookies**        | Yes (`_ga`, `_gid`) | No (sessionStorage)     |
| **Ad Blockers**    | Blocked             | Not blocked             |
| **Data Ownership** | Google              | You                     |
| **Reporting**      | GA4 dashboard       | Custom queries          |

**Recommendation**: Use both for redundancy.

---

#### Q: How do I debug "gtag is not defined"?

**A**: This means gtag hasn't loaded yet.

**Causes**:

1. `AnalyticsProvider` not in layout
2. Script blocked by ad blocker or CSP
3. Trying to call before script loads

**Solutions**:

1. Verify `AnalyticsProvider` in root layout
2. Check Network tab for blocked requests
3. Use `if (window.gtag)` guard before calling

```typescript
// ✅ Safe
if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'my_event')
}

// ❌ Unsafe
window.gtag('event', 'my_event') // May throw error
```

---

#### Q: How do I track events in Server Components?

**A**: You can't directly. Analytics require browser context.

**Solutions**:

1. **Use Client Components** for interactive elements
2. **Pass data to Client Components** for tracking
3. **Use Server-Side API** (Measurement Protocol) for server events

**Example**:

```tsx
// Server Component (can't track)
export default function Page() {
    return <ClientButton />
}

// Client Component (can track)
;('use client')
export function ClientButton() {
    const handleClick = () => {
        trackEvent('button_click')
    }
    return <button onClick={handleClick}>Click</button>
}
```

---

#### Q: Should I use GTM or direct integration?

**A**: Depends on your needs:

**Use Direct Integration (current) if**:

- Simple analytics setup
- Full control over tracking code
- Performance is priority
- Developer-managed tracking

**Use GTM if**:

- Multiple teams need to add tags
- Frequent changes without deployments
- Complex trigger conditions
- Many third-party tools

**Current recommendation**: Stick with direct integration unless you have specific GTM needs.

---

### Data & Privacy Questions

#### Q: What data is collected?

**A**:

**Google Analytics 4**:

- Page views and navigation
- User interactions (clicks, scrolls)
- Device and browser info
- Location (country, city)
- Referrer and traffic source
- Custom events and parameters

**Internal Analytics**:

- Page pathname and title
- Referrer
- Session ID (randomized)
- User agent
- IP address (for geo, not stored long-term)
- UTM parameters

**What we DON'T collect**:

- ❌ Names, emails, phone numbers
- ❌ Login credentials
- ❌ Payment information
- ❌ Form field values (unless explicitly tracked)

---

#### Q: How is user privacy protected?

**A**:

1. **No PII**: Never track personally identifiable information
2. **Consent Mode**: Respect user consent preferences
3. **Data Minimization**: Only track what's necessary
4. **Masking**: Clarity auto-masks sensitive fields
5. **Retention**: GA4 data expires after 14 months (configurable)

**Additional measures**:

- Cookie-free alternatives (internal analytics)
- IP anonymization available
- Data deletion on request

---

#### Q: Can I delete analytics data?

**A**:

**GA4**: Yes, but limited:

1. GA4 Admin → Data Settings → Data Retention
2. Set to "2 months" or "14 months"
3. User deletion requests via GA4 API

**Internal Analytics**: Yes, full control:

```sql
DELETE FROM page_views WHERE session_id = 'session_123'
```

**Clarity**: Recordings auto-delete after retention period (30 days default).

---

#### Q: Do I need a privacy policy?

**A**: **Yes, legally required** for any analytics.

**Must include**:

- What data is collected
- Why it's collected (purpose)
- How long it's retained
- User rights (access, deletion)
- Third-party services used (GA4, Clarity, etc.)
- Contact information

**Recommendation**: Consult legal counsel for compliance.

---

### Troubleshooting

#### Problem: Events not appearing in GA4

**Check**:

1. ✅ **Measurement ID correct**

    ```bash
    # Format: G-XXXXXXXXXX (not UA-XXXXXXXX)
    echo $NEXT_PUBLIC_GA_MEASUREMENT_ID
    ```

2. ✅ **Ad blocker disabled**
    - Try incognito mode
    - Disable browser extensions

3. ✅ **gtag initialized**

    ```javascript
    // Browser console
    console.log(window.gtag)
    // Should be: function
    ```

4. ✅ **Consent not blocking**

    ```javascript
    // Browser console
    google_tag_manager['GTM-XXXXX'].dataLayer.get('consent')
    // Should show "granted" for analytics_storage
    ```

5. ✅ **DebugView enabled**
    - Development mode automatically enables debug
    - Or set `debug_mode: true` in config

**Still not working?** See [Verification Guide](./11-verification-debugging.md).

---

#### Problem: Duplicate page views

**Cause**: Multiple sources tracking page views.

**Check**:

1. Direct GA4 initialization (`gtag('event', 'page_view')`)
2. PageViewTracker component
3. GTM page view trigger
4. Enhanced Measurement (GA4 auto-tracking)

**Solution**: Choose ONE method:

- ✅ Let GA4 auto-track initial page view
- ✅ Use PageViewTracker for subsequent navigation
- ❌ Don't manually call `trackPageView()` on load

---

#### Problem: Events missing parameters

**Cause**: Parameters not sent or incorrectly formatted.

**Debug**:

```typescript
// Add logging before tracking
console.log('Event params:', {
    button_text,
    button_location,
    destination_url,
})

trackEvent('cta_click', {
    button_text,
    button_location,
    destination_url,
})
```

**Common issues**:

- Undefined variables
- Typos in parameter names
- Nested objects (flatten them)

---

#### Problem: Consent banner not appearing

**Check**:

1. ✅ `NEXT_PUBLIC_ENABLE_COOKIE_BANNER=true`
2. ✅ `CookieBanner` component in layout
3. ✅ No consent choice stored in localStorage

**Clear stored consent**:

```javascript
// Browser console
localStorage.removeItem('analytics_consent')
```

Then reload page - banner should appear.

---

#### Problem: High rage click rate in Clarity

**This is not a bug** - it indicates UX problems!

**Investigate**:

1. Watch recordings with rage clicks
2. Identify problem elements
3. Common causes:
    - Slow-loading buttons
    - Broken links
    - Hidden content
    - Unclear CTAs

**Solution**: Fix underlying UX issues, not the tracking.

---

#### Problem: Internal analytics not tracking

**Check**:

1. ✅ InternalPageViewTracker mounted
2. ✅ API endpoint accessible: `POST /api/analytics/track`
3. ✅ Database connection working
4. ✅ page_views table exists

**Debug**:

```typescript
// Add to usePageViewTracking hook
console.log('Tracking internal page view:', payload)
```

**Check API response**:

- Network tab → `/api/analytics/track` → Status should be 200

---

#### Problem: "window is not defined"

**Cause**: Trying to use browser APIs in Server Component.

**Solution**: Add 'use client' directive:

```tsx
'use client' // ← Add this
import { trackEvent } from '@/lib/analytics/analytics.client'

export function MyComponent() {
    const handleClick = () => {
        trackEvent('button_click')
    }
    // ...
}
```

---

### Performance Questions

#### Q: How do I measure analytics performance impact?

**A**: Use Lighthouse:

```bash
npx lighthouse https://your-site.com --view
```

**Check**:

- FCP (First Contentful Paint): <1.8s
- LCP (Largest Contentful Paint): <2.5s
- TBT (Total Blocking Time): <200ms
- CLS (Cumulative Layout Shift): <0.1

**Expected**: Analytics should add <50ms to TBT, zero to CLS.

---

#### Q: Can I lazy-load analytics?

**A**: Yes, but not recommended:

```tsx
<Script strategy="lazyOnload">
```

**Trade-offs**:

- ✅ Better initial performance
- ❌ May miss early events
- ❌ Delayed tracking start

**Current strategy (`afterInteractive`) is optimal** for most cases.

---

#### Q: How many events is too many?

**A**: Guidelines:

- **Per page load**: <20 events
- **Per user session**: <100 events
- **Per second**: <5 events

**Excessive events**:

- Impact performance
- Hit GA4 rate limits
- Pollute data

**Solution**: Batch similar events, debounce rapid triggers.

---

### Integration Questions

#### Q: Can I use this with other frameworks?

**A**: Core concepts apply, but implementation differs:

- **Next.js App Router**: ✅ Fully supported (current setup)
- **Next.js Pages Router**: ⚠️ Needs adjustment (`_app.tsx` instead of layout)
- **React (Vite, CRA)**: ⚠️ Similar, use `useEffect` in root component
- **Vue/Angular**: ❌ Would need rewrite

---

#### Q: How do I integrate with my existing analytics?

**A**: Our setup is additive:

1. Keep your existing analytics
2. Add our `AnalyticsProvider` alongside
3. Both will work independently

**Avoid conflicts**: Don't initialize GA4 twice (use GTM OR direct integration, not both).

---

#### Q: Can I track custom user properties?

**A**: Yes:

```typescript
if (window.gtag) {
    window.gtag('set', 'user_properties', {
        user_type: 'premium',
        signup_date: '2024-01-15',
    })
}
```

**Then segment reports** by these properties in GA4.

---

## Getting Help

### Resources

1. **This Documentation**: Comprehensive guides and examples
2. **GA4 Documentation**: [Official Google Analytics docs](https://support.google.com/analytics)
3. **Clarity Docs**: [Microsoft Clarity documentation](https://learn.microsoft.com/en-us/clarity/)
4. **Developer Console**: Check for errors and logs

### Support Channels

1. **Code Issues**: Review [Implementation Guide](./03-implementation-guide.md)
2. **Configuration**: Check [Quick Start](./02-quick-start.md)
3. **Custom Events**: See [Event Tracking Guide](./07-event-tracking.md)
4. **Testing**: Follow [Verification Guide](./11-verification-debugging.md)

### Reporting Bugs

When reporting issues, include:

1. **Environment**: Development or production
2. **Browser**: Chrome, Safari, Firefox, etc.
3. **Console errors**: Any JavaScript errors
4. **Network tab**: Screenshot of failed requests
5. **Configuration**: Environment variables set (don't share actual IDs)
6. **Steps to reproduce**: Exact sequence to trigger issue

---

## Related Documentation

- [Overview](./01-overview.md) - System architecture
- [Quick Start](./02-quick-start.md) - Getting started
- [Implementation Guide](./03-implementation-guide.md) - Detailed setup
- [Verification Guide](./11-verification-debugging.md) - Testing procedures
- [API Reference](./10-api-reference.md) - Complete API docs

---

**Last Updated**: December 16, 2024
