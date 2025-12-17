# Microsoft Clarity

Session recording and heatmap analytics platform.

## Overview

Microsoft Clarity provides free session recordings, heatmaps, and user behavior insights to help identify UX issues and optimize conversion paths.

### Key Features

- ✅ **Unlimited Recordings**: Free unlimited session recordings
- ✅ **Heatmaps**: Click, scroll, and attention heatmaps
- ✅ **Rage Clicks**: Detects user frustration points
- ✅ **Dead Clicks**: Identifies non-functional elements users try to click
- ✅ **JavaScript Errors**: Tracks errors affecting users
- ✅ **Privacy-Focused**: Masks sensitive data by default

### Use Cases

- Identify UX problems and friction points
- Analyze user behavior patterns
- Debug issues reported by users
- Optimize forms and conversion funnels
- A/B test validation

## Setup

### 1. Create Clarity Project

1. Go to [Microsoft Clarity](https://clarity.microsoft.com)
2. Sign in with Microsoft account
3. Click **Add new project**
4. Enter project details:
    - **Name**: Your site name
    - **Website URL**: Your production URL
    - **Category**: Health & Wellness
5. Copy **Project ID** (format: `abc123xyz`)

### 2. Configure Environment

Add to `.env.local`:

```bash
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-project-id
```

### 3. Verify Installation

**Automatic**: The `AnalyticsProvider` component automatically loads Clarity when the env var is set.

**Manual check**:

1. Open your site
2. Open browser console
3. Look for Clarity script loading: `clarity.ms/tag/[project-id]`
4. Check Clarity dashboard for active sessions (within 2-3 minutes)

## Implementation

### Component

**Location**: `apps/web/components/analytics/clarity.component.tsx`

```tsx
'use client'

import Script from 'next/script'

export function Clarity({ projectId }: { projectId: string }) {
    return (
        <Script id='microsoft-clarity-init' strategy='afterInteractive'>
            {`
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${projectId}");
      `}
        </Script>
    )
}
```

**Loaded via**: `AnalyticsProvider` component in root layout.

## Features & Usage

### Session Recordings

**What**: Video-like playback of user sessions.

**Access**:

1. Clarity Dashboard → **Recordings**
2. Filter by:
    - Page URL
    - Country
    - Device type
    - Rage clicks
    - Dead clicks
    - JavaScript errors

**Best Practices**:

- Review 10-20 sessions weekly
- Focus on high-value pages (checkout, forms)
- Look for rage clicks (user frustration)
- Identify confusing UI elements

### Heatmaps

**Types**:

- **Click Heatmap**: Where users click
- **Scroll Heatmap**: How far users scroll
- **Attention Heatmap**: Where users spend time

**Access**:

1. Clarity Dashboard → **Heatmaps**
2. Select page to analyze
3. Choose heatmap type

**Insights**:

- Are users clicking non-clickable elements? (Add functionality or remove visual cues)
- Do users miss important CTAs? (Improve visibility)
- Are users not scrolling to key content? (Reposition or shorten page)

### Rage Clicks

**What**: Multiple rapid clicks in the same area (indicates frustration).

**Common Causes**:

- Slow-loading elements
- Broken links
- Non-functional buttons
- Hidden or unclear CTAs

**Action**:

1. Filter recordings by "Rage clicks"
2. Identify problematic elements
3. Fix issues (improve load time, fix links, clarify UI)

### Dead Clicks

**What**: Clicks on non-interactive elements that look clickable.

**Common Causes**:

- Images that look like buttons
- Text that looks like links
- Disabled buttons without visual indication

**Action**:

1. Review dead click report
2. Make elements interactive OR remove visual cues

### JavaScript Errors

**What**: Client-side errors affecting user experience.

**Access**:

1. Clarity Dashboard → **Recordings**
2. Filter by "JavaScript Errors"

**Action**:

1. Review error details
2. Fix in codebase
3. Verify resolution in subsequent recordings

## Custom Events

### Track Custom Events

```typescript
import { trackClarityEvent } from '@/lib/analytics/analytics.client'

// Simple event
trackClarityEvent('button_click')

// Event with data
trackClarityEvent('form_submit', {
    form_name: 'contact',
    success: true,
})
```

**View Events**:

1. Clarity Dashboard → **Recordings**
2. Filter by custom event name

### User Identification

```typescript
import { identifyClarityUser } from '@/lib/analytics/analytics.client'

// Identify user (use non-PII identifier)
identifyClarityUser('user_hash_123')
```

**Use Cases**:

- Link recordings to customer support tickets
- Analyze behavior by user segment
- Debug issues for specific users

**⚠️ Never use PII**: Use hashed user IDs or non-identifiable keys only.

### Session Upgrade

```typescript
import { upgradeClaritySession } from '@/lib/analytics/analytics.client'

// Upgrade to high-fidelity recording
upgradeClaritySession()
```

**When to Use**:

- Important user flows (checkout, onboarding)
- Premium user segments
- A/B test participants
- After detecting errors

## Privacy & Masking

### Automatic Masking

Clarity **automatically masks** sensitive data:

- ✅ Input fields (email, password, credit card)
- ✅ Text areas
- ✅ Certain HTML elements

### Custom Masking

**Mask specific elements**:

```html
<div class="clarity-mask">
    <!-- This content will be masked in recordings -->
    <p>Sensitive information here</p>
</div>
```

**Unmask specific elements** (if needed):

```html
<input type="email" class="clarity-unmask" />
```

**⚠️ Use carefully**: Only unmask when absolutely necessary and compliant with privacy laws.

### IP Address Tracking

**Default**: Clarity collects IP addresses for geo-location.

**To disable**:

1. Clarity Dashboard → **Settings**
2. **Privacy** → Toggle "IP address masking" ON

## Dashboard & Insights

### Dashboard Overview

**Metrics**:

- Active users (real-time)
- Total sessions
- Page views
- Rage clicks count
- Dead clicks count
- JavaScript errors count

### Insights Panel

**Automated Insights**:

- "X% of users have rage clicks on [element]"
- "Y% of users experience JavaScript errors"
- "Z% of users don't scroll past [section]"

**Action**: Review and prioritize fixes based on impact.

### Filtering & Segmentation

**Filter recordings by**:

- Page URL
- Country
- Device (desktop, mobile, tablet)
- Browser
- Referrer
- Custom tags

**Create saved filters** for recurring analysis.

## Integration with GA4

### Link Clarity to GA4

**Benefits**:

- See Clarity session recordings directly in GA4
- Analyze behavior for specific GA4 segments

**Setup**:

1. Clarity Dashboard → **Settings** → **Integrations**
2. Select "Google Analytics"
3. Enter GA4 Measurement ID
4. Save

**View Recordings in GA4**:

1. GA4 → **Explore** → Create exploration
2. Add dimension: "Clarity Session URL"
3. View recordings for specific user segments

## Best Practices

### Recording Review

- 📅 **Weekly**: Review 10-20 sessions
- 🎯 **Focus**: High-value pages (checkout, forms, pricing)
- 🔍 **Look for**: Rage clicks, dead clicks, confusion patterns
- ✅ **Action**: Document issues → Fix → Verify

### Performance Optimization

- ✅ Use `strategy="afterInteractive"` (already implemented)
- ✅ Limit session recording to critical pages (if needed)
- ✅ Monitor impact on Core Web Vitals

**Expected Impact**: Minimal (<50ms on page load)

### Team Collaboration

- Share recordings with designers and developers
- Add recordings to bug reports
- Use in sprint planning to prioritize UX fixes

## Troubleshooting

### Recordings Not Appearing

**Check**:

1. ✅ `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set correctly
2. ✅ Script loading in browser (check Network tab)
3. ✅ Ad blocker disabled (Clarity may be blocked)
4. ✅ Wait 2-3 minutes (recordings aren't instant)

**Solution**: Recordings can take a few minutes to process. Check again after 5 minutes.

### Missing User Interactions

**Cause**: Content Security Policy (CSP) blocking Clarity.

**Solution**: Whitelist Clarity domains in CSP:

```typescript
// next.config.js
const ContentSecurityPolicy = `
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.clarity.ms;
  connect-src 'self' https://www.clarity.ms;
  img-src 'self' https://www.clarity.ms;
`
```

### High Rage Clicks

**Not a bug - it's a feature!** High rage clicks indicate UX problems.

**Action**:

1. Identify elements with rage clicks
2. Investigate root cause (slow load, broken functionality, unclear UI)
3. Fix the underlying issue
4. Monitor for improvement

## Comparison: Clarity vs Competitors

| Feature                | Microsoft Clarity | Hotjar          | FullStory | LogRocket |
| ---------------------- | ----------------- | --------------- | --------- | --------- |
| **Price**              | Free unlimited    | Paid            | Paid      | Paid      |
| **Session Recordings** | ✅ Unlimited      | Limited on free | ✅        | ✅        |
| **Heatmaps**           | ✅                | ✅              | ✅        | ✅        |
| **Rage Clicks**        | ✅                | ✅              | ✅        | ✅        |
| **Privacy Masking**    | ✅ Auto           | ✅ Auto         | ✅ Auto   | ✅ Auto   |
| **Error Tracking**     | ✅                | Limited         | ✅        | ✅        |
| **Performance Impact** | Low               | Low             | Medium    | Medium    |

**Clarity Advantage**: Completely free with unlimited recordings.

## Related Documentation

- [Implementation Guide](./03-implementation-guide.md) - Setup instructions
- [Verification Guide](./11-verification-debugging.md) - Testing
- [API Reference](./10-api-reference.md) - Clarity functions

## External Resources

- [Microsoft Clarity Documentation](https://learn.microsoft.com/en-us/clarity/)
- [Clarity Academy](https://clarity.microsoft.com/academy)
- [Clarity Community](https://techcommunity.microsoft.com/t5/microsoft-clarity/ct-p/MicrosoftClarity)

---

**Last Updated**: December 16, 2024
