# Other Analytics Services

Google Tag Manager and Facebook Pixel integration.

## Google Tag Manager (GTM)

### Overview

Google Tag Manager is a tag management system that allows you to deploy tracking codes without modifying your codebase.

**Use Cases**:

- Centralized tag management
- Non-technical team members can add tags
- A/B testing scripts
- Marketing pixel management
- Third-party integrations

### When to Use GTM

**Use GTM if**:

- Multiple teams need to add tracking
- Frequent tag changes without deployments
- Complex trigger conditions
- Multiple third-party tools

**Skip GTM if**:

- Simple analytics setup (GA4 only)
- Full control over tracking code
- Performance is critical (GTM adds overhead)

### Setup

#### 1. Create GTM Container

1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Create account and container
3. Choose "Web" as platform
4. Copy **Container ID** (format: `GTM-XXXXXX`)

#### 2. Configure Environment

Add to `.env.local`:

```bash
NEXT_PUBLIC_GTM_ID=GTM-XXXXXX
```

#### 3. Verify Installation

**Automatic**: The `AnalyticsProvider` loads GTM when env var is set.

**Manual check**:

1. Install [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Visit your site
3. Click Tag Assistant icon
4. Verify GTM container is detected

### Implementation

**Location**: `apps/web/components/analytics/google-tag-manager.component.tsx`

```tsx
'use client'

import Script from 'next/script'

export function GoogleTagManager({ containerId }: { containerId: string }) {
  return (
    <>
      {/* GTM Script */}
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${containerId}');
        `}
      </Script>

      {/* GTM noscript fallback */}
      <noscript>
        <iframe
          src={\`https://www.googletagmanager.com/ns.html?id=\${containerId}\`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}
```

### Configure Tags in GTM

#### GA4 Tag

1. GTM Dashboard → **Tags** → **New**
2. Tag type: "Google Analytics: GA4 Configuration"
3. Measurement ID: Your GA4 ID (`G-XXXXXXXXXX`)
4. Trigger: "All Pages"
5. Save and publish

#### Custom Event Tag

1. GTM Dashboard → **Tags** → **New**
2. Tag type: "Google Analytics: GA4 Event"
3. Configuration Tag: Select your GA4 config tag
4. Event Name: `button_click`
5. Event Parameters: Add custom parameters
6. Trigger: Create custom trigger (e.g., "Click - All Elements" with CSS selector)

### Triggers

**Common Triggers**:

- **All Pages**: Fires on every page view
- **Click - All Elements**: Fires on any click
- **Form Submission**: Fires on form submit
- **Scroll Depth**: Fires at scroll thresholds
- **Custom Event**: Fires on custom `dataLayer.push()`

### Variables

**Built-in Variables**:

- Page URL
- Page Path
- Referrer
- Click Element
- Form Element

**Custom Variables**:
Create variables for dynamic values (user ID, product info, etc.)

### dataLayer Integration

Push events to GTM from your code:

```typescript
// Extend Window interface
declare global {
    interface Window {
        dataLayer?: Array<Record<string, unknown>>
    }
}

// Push event
if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
        event: 'button_click',
        button_text: 'Schedule Consultation',
        button_location: 'hero',
    })
}
```

**Best Practice**: Create a utility function:

```typescript
// lib/analytics/gtm.util.ts
export function pushToDataLayer(event: string, data?: Record<string, unknown>) {
    if (typeof window === 'undefined' || !window.dataLayer) return

    window.dataLayer.push({
        event,
        ...data,
    })
}

// Usage
pushToDataLayer('custom_event', { key: 'value' })
```

### GTM Preview Mode

**Debug your setup**:

1. GTM Dashboard → **Preview**
2. Enter your site URL
3. GTM opens in debug mode
4. See which tags fire on each interaction

**Benefits**:

- Test tags before publishing
- Debug trigger conditions
- Validate data layer values

### GTM vs Direct Integration

| Feature                  | GTM             | Direct Integration |
| ------------------------ | --------------- | ------------------ |
| **Setup Complexity**     | Medium          | Low                |
| **Performance**          | Slight overhead | Optimal            |
| **Flexibility**          | High            | Medium             |
| **Non-technical Access** | Yes             | No                 |
| **Version Control**      | GTM UI          | Git                |
| **Deployment**           | Instant         | Requires deploy    |

**Recommendation**: Use direct integration (current setup) unless you need GTM's flexibility.

---

## Facebook Pixel

### Overview

Facebook Pixel tracks conversions and builds audiences for Facebook/Instagram advertising.

**Use Cases**:

- Facebook/Instagram ad conversion tracking
- Custom audience creation (remarketing)
- Lookalike audience generation
- Ad performance optimization

### Setup

#### 1. Create Facebook Pixel

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Click **Add** → **Meta Pixel**
3. Name your pixel
4. Copy **Pixel ID** (format: `1234567890`)

#### 2. Configure Environment

Add to `.env.local`:

```bash
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1234567890
```

#### 3. Verify Installation

**Automatic**: The `AnalyticsProvider` loads Facebook Pixel when env var is set.

**Manual check**:

1. Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Visit your site
3. Click extension icon
4. Verify pixel is detected and firing

### Implementation

**Location**: `apps/web/components/analytics/facebook-pixel.component.tsx`

```tsx
'use client'

import Script from 'next/script'

export function FacebookPixel({ pixelId }: { pixelId: string }) {
    return (
        <Script id='facebook-pixel' strategy='afterInteractive'>
            {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `}
        </Script>
    )
}
```

### Standard Events

Track Facebook standard events:

```typescript
// Extend Window interface
declare global {
    interface Window {
        fbq?: (
            command: string,
            eventName: string,
            params?: Record<string, unknown>
        ) => void
    }
}

// View Content
if (window.fbq) {
    window.fbq('track', 'ViewContent', {
        content_name: 'Breast Augmentation',
        content_category: 'Procedures',
    })
}

// Add to Cart
window.fbq?.('track', 'AddToCart', {
    content_name: 'Consultation',
    content_ids: ['consultation_001'],
    value: 0,
    currency: 'USD',
})

// Lead
window.fbq?.('track', 'Lead', {
    content_name: 'Contact Form',
    value: 0,
    currency: 'USD',
})

// Schedule (Consultation)
window.fbq?.('track', 'Schedule', {
    content_name: 'Consultation Booking',
})

// Contact
window.fbq?.('track', 'Contact', {
    content_name: 'Contact Form Submit',
})

// Purchase
window.fbq?.('track', 'Purchase', {
    value: 5000,
    currency: 'USD',
    content_type: 'procedure',
})
```

### Custom Events

Track custom events (not standard):

```typescript
window.fbq?.('trackCustom', 'ProcedureInquiry', {
    procedure_type: 'breast_augmentation',
    inquiry_source: 'pricing_page',
})
```

**Best Practice**: Use standard events when possible for better Facebook optimization.

### Conversion API

**Server-side tracking** for improved accuracy (bypasses ad blockers):

```typescript
// Server-side API endpoint
import crypto from 'crypto'

export async function POST(request: Request) {
    const { eventName, eventData, userData } = await request.json()

    const hashedEmail = crypto
        .createHash('sha256')
        .update(userData.email.toLowerCase())
        .digest('hex')

    await fetch(
        `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PIXEL_ID}/events`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: [
                    {
                        event_name: eventName,
                        event_time: Math.floor(Date.now() / 1000),
                        user_data: {
                            em: hashedEmail, // Hashed email
                            client_ip_address:
                                request.headers.get('x-forwarded-for'),
                            client_user_agent:
                                request.headers.get('user-agent'),
                        },
                        custom_data: eventData,
                    },
                ],
                access_token: process.env.FACEBOOK_CONVERSION_API_TOKEN,
            }),
        }
    )
}
```

**Benefits**:

- ✅ Works with ad blockers
- ✅ More accurate attribution
- ✅ Better iOS 14.5+ tracking

### Custom Audiences

**Create audiences for remarketing**:

1. Events Manager → **Audiences**
2. Create Custom Audience → **Website**
3. Define audience rules:
    - Visited `/procedures` in last 30 days
    - Viewed content but didn't convert
    - Added to cart but didn't purchase

**Use in ads**: Target these audiences with Facebook/Instagram ads.

### Testing

**Test Mode**:

1. Events Manager → **Test Events**
2. Enter test event code
3. Perform actions on site
4. Verify events appear in test dashboard

## Performance Considerations

### Script Loading Strategy

All analytics services use `strategy="afterInteractive"`:

```tsx
<Script strategy='afterInteractive'>...</Script>
```

**Impact**:

- Loads after page is interactive
- Does not block First Contentful Paint (FCP)
- Minimal impact on Core Web Vitals

### Disable Services

**Production only** - disable in development:

```typescript
// lib/analytics/config.ts
export function getAnalyticsConfig() {
    const isDev = process.env.NODE_ENV === 'development'

    return {
        gtm:
            !isDev && process.env.NEXT_PUBLIC_GTM_ID
                ? { containerId: process.env.NEXT_PUBLIC_GTM_ID, enabled: true }
                : undefined,
        // ... other services
    }
}
```

## Related Documentation

- [Google Analytics 4](./04-google-analytics-4.md) - GA4 integration
- [Microsoft Clarity](./08-microsoft-clarity.md) - Clarity setup
- [Implementation Guide](./03-implementation-guide.md) - Setup instructions

---

**Last Updated**: December 16, 2024
