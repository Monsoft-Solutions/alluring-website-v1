# Verification & Debugging

Complete guide for testing and troubleshooting analytics implementation.

## Pre-Deployment Checklist

### Environment Configuration

- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` set correctly (format: `G-XXXXXXXXXX`)
- [ ] Other service IDs configured if using (Clarity, GTM, Facebook)
- [ ] No hardcoded analytics IDs in code
- [ ] Environment variables present in production deployment

### Component Integration

- [ ] `AnalyticsProvider` added to root layout
- [ ] `PageViewTracker` component mounted
- [ ] `ScrollDepthTracker` component mounted
- [ ] `InternalPageViewTracker` component mounted (if using)
- [ ] Components render without errors

### Code Review

- [ ] No PII in event parameters
- [ ] Event names use lowercase snake_case
- [ ] SSR guards present (`typeof window !== 'undefined'`)
- [ ] Error handling in place
- [ ] No blocking analytics calls

## Verification Methods

### 1. Browser Console (Development)

**What to Look For**:

```javascript
// ✅ Expected logs in development
"Analytics: GA4 initialized (consent granted by default)"
"Analytics: Tracked scroll depth" { percent: 75, page_path: "/about" }
```

**How to Check**:

1. Open DevTools (F12)
2. Go to **Console** tab
3. Load your page
4. Look for analytics initialization messages

**Common Issues**:

- No logs → Analytics not loading
- Error messages → Configuration or code issue

---

### 2. Network Tab

**What to Look For**:

Request to `https://www.google-analytics.com/g/collect`

**How to Check**:

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter: `google-analytics` or `g/collect`
4. Perform action (click, scroll, navigate)
5. Verify requests appear

**Request Details**:

- **Status**: 200 OK
- **Method**: POST
- **Type**: ping / xhr
- **Parameters**: Check payload for event data

**Common Issues**:

- No requests → gtag not initialized or blocked
- 4xx/5xx errors → Configuration issue
- Blocked by extension → Ad blocker active

---

### 3. GA4 DebugView (Recommended)

**What It Shows**: Real-time event stream with full parameter details.

**How to Access**:

1. Go to [Google Analytics](https://analytics.google.com)
2. Navigate: **Admin** → **DebugView**
3. Open your site in **development mode** (automatic debug mode)
4. Perform actions
5. Watch events appear in real-time

**What to Verify**:

- ✅ `page_view` on load
- ✅ `scroll_depth` at 25%, 50%, 75%, 100%
- ✅ Custom events with correct parameters
- ✅ User properties set correctly

**Timeline**:

- Events appear within **1-2 seconds**
- If no events after 30 seconds, something is wrong

---

### 4. GA4 Realtime Report

**What It Shows**: Active users and events (last 30 minutes).

**How to Access**:

1. Go to [Google Analytics](https://analytics.google.com)
2. Navigate: **Reports** → **Realtime**
3. View active users, events, and pages

**What to Verify**:

- Active users count > 0 (you should see yourself)
- Events appear in event stream
- Page titles and paths correct

**Timeline**:

- Events appear within **30-60 seconds**
- More delay than DebugView but works in production

---

### 5. Microsoft Clarity Dashboard

**What It Shows**: Active sessions and recordings.

**How to Check**:

1. Go to [Microsoft Clarity](https://clarity.microsoft.com)
2. Select your project
3. Check dashboard for active users
4. Wait 2-3 minutes for recordings to process

**What to Verify**:

- Active sessions count > 0
- Recordings appear within 3-5 minutes
- Heatmaps generating

---

### 6. Browser Extensions

#### Google Tag Assistant (Legacy)

1. Install: [Tag Assistant Legacy](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Open your site
3. Click extension icon
4. Verify GA4 tag detected

#### Meta Pixel Helper

1. Install: [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Open your site
3. Click extension icon
4. Verify pixel detected and firing

## Testing Procedures

### Test 1: Page Views

**Objective**: Verify page views track on load and navigation.

**Steps**:

1. Open site in browser
2. Open GA4 DebugView
3. Load home page → Verify `page_view` event
4. Navigate to another page → Verify new `page_view` event
5. Check parameters:
    - `page_path` correct
    - `page_title` correct
    - `page_location` correct

**Expected**: `page_view` event on each page load/navigation.

**Troubleshooting**:

- No event on initial load → GA4 not initialized
- No event on navigation → PageViewTracker not mounted
- Wrong parameters → Check document.title and window.location

---

### Test 2: Scroll Depth

**Objective**: Verify scroll tracking at 25%, 50%, 75%, 100%.

**Steps**:

1. Open long page (blog post, about page)
2. Open GA4 DebugView
3. Slowly scroll down
4. Stop at 25% → Verify `scroll_depth` event with `percent: 25`
5. Continue to 50%, 75%, 100% → Verify each milestone

**Expected**: 4 separate `scroll_depth` events (one per milestone).

**Troubleshooting**:

- No events → ScrollDepthTracker not mounted
- Events fire multiple times → Bug in tracking logic
- Wrong percentages → Calculation issue

---

### Test 3: Custom Events

**Objective**: Verify custom event tracking.

**Steps**:

1. Open page with tracked button
2. Open GA4 DebugView
3. Click button
4. Verify custom event appears with correct parameters

**Example**:

```typescript
// Button code
trackEvent('cta_click', {
  button_text: 'Schedule Consultation',
  button_location: 'hero',
})

// Expected in DebugView
Event: cta_click
Parameters:
  - button_text: "Schedule Consultation"
  - button_location: "hero"
```

**Troubleshooting**:

- Event not appearing → Check trackEvent() call
- Missing parameters → Check params object
- Wrong parameter names → Typo in code

---

### Test 4: Form Tracking

**Objective**: Verify form start and submit events.

**Steps**:

1. Open page with form
2. Open GA4 DebugView
3. Focus first field → Verify `form_start` event
4. Fill form and submit → Verify `form_submit` event
5. Submit with errors → Verify `form_error` event

**Expected**: Events at each stage with form context.

**Troubleshooting**:

- No `form_start` → onFocus handler not firing
- No `form_submit` → onSubmit handler not called
- Events fire multiple times → Missing state tracking

---

### Test 5: Consent Mode (If Using Cookie Banner)

**Objective**: Verify consent state affects tracking.

**Steps**:

1. Clear cookies and localStorage
2. Open site
3. Open GA4 DebugView
4. **Before consent**: Should see NO events OR cookieless pings
5. Click "Accept All"
6. **After consent**: Should see full events with cookies
7. Reload page → Banner should NOT reappear

**Expected**: Analytics respect consent state.

**Troubleshooting**:

- Events appear before consent → Consent not blocking correctly
- Banner reappears → localStorage not persisting choice
- No events after consent → updateConsent() not working

---

### Test 6: Internal Analytics

**Objective**: Verify cookie-free tracking to database.

**Steps**:

1. Open browser Network tab
2. Navigate to a page
3. Look for POST request to `/api/analytics/track`
4. Verify:
    - Status: 200 OK
    - Payload contains pathname, sessionId, UTM params
5. Check database for new record

**Expected**: Non-blocking POST request on each navigation.

**Troubleshooting**:

- No request → InternalPageViewTracker not mounted
- 500 error → Database connection issue
- Missing data → Check API endpoint logic

---

## Debugging Tools

### Console Logging

**Enable verbose logging** (development only):

```typescript
// lib/analytics/analytics.client.ts
export function trackEvent(eventName: string, params?: EventParams): void {
    // ... existing code ...

    // Add verbose logging
    if (env.NODE_ENV === 'development') {
        console.log('🔍 Analytics Event:', {
            eventName,
            params,
            timestamp: new Date().toISOString(),
        })
    }
}
```

### Network Request Inspector

**View raw GA4 requests**:

1. Network tab → Find `g/collect` request
2. Right-click → Copy → Copy as cURL
3. Decode payload to inspect parameters

### GA4 Debug Mode

**Force debug mode** (if not auto-enabling):

```javascript
gtag('config', 'G-XXXXXXXXXX', {
    debug_mode: true,
})
```

**View debug output**: GA4 DebugView (Admin → DebugView)

### React DevTools Profiler

**Check component performance**:

1. Install React DevTools
2. Profiler tab → Start recording
3. Perform actions
4. Stop recording
5. Analyze component renders

**What to Look For**:

- Analytics components should render once
- No unnecessary re-renders
- Minimal impact on page performance

## Common Issues & Solutions

### Issue: Events Not Tracking

**Symptoms**: No events in GA4 DebugView or Realtime.

**Possible Causes**:

1. **Measurement ID incorrect**
    - Check: `NEXT_PUBLIC_GA_MEASUREMENT_ID` format (`G-XXXXXXXXXX`)
    - Solution: Verify ID in GA4 Admin → Data Streams

2. **Ad blocker enabled**
    - Check: Disable uBlock Origin, Privacy Badger, etc.
    - Solution: Whitelist your domain or disable for testing

3. **gtag not initialized**
    - Check: Browser console for `window.gtag`
    - Solution: Verify `AnalyticsProvider` in layout

4. **Consent blocking**
    - Check: Consent set to "denied"
    - Solution: Set default consent to "granted" or accept banner

---

### Issue: Duplicate Events

**Symptoms**: Same event tracked multiple times.

**Possible Causes**:

1. **React Strict Mode** (development only)
    - Check: Look for `<React.StrictMode>` in code
    - Solution: Expected in dev, won't happen in production

2. **Multiple tracker components**
    - Check: Search for duplicate `<PageViewTracker />` components
    - Solution: Ensure only one instance in layout

3. **Missing tracking state**
    - Check: Event fires on every render
    - Solution: Use `useRef` or `useState` to track if event fired

---

### Issue: Wrong Parameters

**Symptoms**: Event parameters missing or incorrect.

**Possible Causes**:

1. **Parameter name typo**
    - Check: Compare to documentation/examples
    - Solution: Fix typo, use consistent naming

2. **Undefined values**
    - Check: Parameter values are undefined
    - Solution: Add null checks before tracking

3. **PII included**
    - Check: Parameters contain names, emails, etc.
    - Solution: Remove PII, use hashed IDs only

---

### Issue: Performance Impact

**Symptoms**: Slow page load, poor Core Web Vitals.

**Possible Causes**:

1. **Blocking scripts**
    - Check: Scripts loading before page interactive
    - Solution: Ensure `strategy="afterInteractive"`

2. **Too many events**
    - Check: Hundreds of events on page load
    - Solution: Reduce event frequency, batch similar events

3. **Large payloads**
    - Check: Event parameters are huge objects
    - Solution: Limit parameter size, flatten objects

---

### Issue: Cross-Domain Tracking

**Symptoms**: Sessions break when navigating between domains.

**Solution**: Configure cross-domain tracking:

```javascript
gtag('config', 'G-XXXXXXXXXX', {
    linker: {
        domains: ['domain1.com', 'domain2.com'],
    },
})
```

---

## Production Monitoring

### Week 1 Checklist

- [ ] GA4 Realtime shows active users
- [ ] Event counts match expectations
- [ ] No JavaScript errors in Clarity
- [ ] Conversion events tracking
- [ ] Mobile tracking works

### Ongoing Monitoring

**Weekly**:

- Review top events report
- Check for sudden drops in tracking
- Review Clarity recordings for UX issues

**Monthly**:

- Audit custom dimensions
- Review conversion funnels
- Analyze user flow reports
- Check data quality

### Alerts to Set

**GA4 Custom Alerts**:

1. No data received for 24 hours
2. Sudden 50% drop in page views
3. Spike in JavaScript errors

**Clarity Monitoring**:

1. High rage click rate
2. Increased dead clicks
3. Error rate increase

## Related Documentation

- [Quick Start](./02-quick-start.md) - Initial setup
- [Implementation Guide](./03-implementation-guide.md) - Detailed integration
- [Event Tracking](./07-event-tracking.md) - Custom events
- [FAQ & Troubleshooting](./12-faq-troubleshooting.md) - Common questions

---

**Last Updated**: December 16, 2024
