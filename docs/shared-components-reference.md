# Shared Components Reference

Comprehensive guide to reusable shared components in `apps/web/components/shared/`.

## Quick Import

All shared components can be imported from the barrel export:

```tsx
import {
    Breadcrumbs,
    CTASection,
    ContentWrapper,
    FAQComponent,
    FeatureCard,
    Gallery,
    IconCard,
    ImageSection,
    MobileCallButton,
    SectionContainer,
    SectionHeader,
} from '@/components/shared'
```

## Layout Components

### SectionContainer

**Purpose:** Outer wrapper for page sections with background variants and vertical spacing.

**When to use:** Multi-section pages needing varied background styles (home, about, services).

```tsx
<SectionContainer
    variant='muted'
    id='features'
    paddingY='py-16 md:py-24'
    ariaLabel='Features section'
>
    {/* Content */}
</SectionContainer>
```

**Props:**

- `variant`: `'default'` | `'muted'` | `'accent'` - Background styling
    - `default`: bg-background
    - `muted`: bg-muted/30 (subtle gray)
    - `accent`: bg-accent/30 (brand color)
- `as`: HTML element (`'section'` | `'div'` | `'article'`) - Default: `'section'`
- `id`: Optional section identifier for anchor navigation
- `paddingY`: Custom vertical padding - Default: `'py-16 md:py-24'`
- `noPadding`: Disable default padding - Default: `false`
- `className`: Additional CSS classes
- `ariaLabel`: Accessibility label

---

### ContentWrapper

**Purpose:** Inner content constraint with max-width and horizontal padding.

**When to use:** Inside SectionContainer to constrain content width and provide horizontal padding.

```tsx
<ContentWrapper size='lg' paddingX='px-6'>
    {/* Constrained content */}
</ContentWrapper>
```

**Props:**

- `size`: Width constraint
    - `'sm'`: max-w-3xl (prose, narrow content)
    - `'md'`: max-w-5xl (forms, moderate content)
    - `'lg'`: max-w-7xl (general content, **default**)
    - `'xl'`: max-w-screen-2xl (wide layouts)
    - `'full'`: max-w-full (no constraint)
- `paddingX`: Custom horizontal padding - Default: `'px-6'`
- `noPadding`: Disable default padding - Default: `false`
- `className`: Additional CSS classes

**Typical pattern:**

```tsx
<SectionContainer variant='muted'>
    <ContentWrapper size='lg'>
        <h2>Section Title</h2>
        <p>Content constrained to max-w-7xl</p>
    </ContentWrapper>
</SectionContainer>
```

---

### SectionHeader

**Purpose:** Standardized section titles with optional badges, descriptions, and flexible alignment.

**When to use:** Page titles, section headers, content area titles.

```tsx
<SectionHeader
    badge='Our Services'
    title='What We Offer'
    description='Comprehensive solutions tailored to your needs'
    as='h2'
    align='center'
    spacing='default'
/>
```

**Props:**

- `title`: Main heading text (required)
- `description`: Optional description text
- `badge`: Optional badge (string or ReactNode)
- `as`: Heading level (`'h1'` | `'h2'` | `'h3'` | `'h4'` | `'h5'` | `'h6'`) - Default: `'h2'`
- `align`: Text alignment (`'left'` | `'center'` | `'right'`) - Default: `'center'`
- `spacing`: Vertical spacing (`'tight'` | `'default'` | `'loose'`) - Default: `'default'`
- `className`: Container classes
- `titleClassName`: Title-specific classes
- `descriptionClassName`: Description-specific classes

---

## Navigation Components

### Breadcrumbs

**Purpose:** Hierarchical navigation showing page location within site structure.

**When to use:** Blog posts, nested pages, category pages, detail pages.

```tsx
<Breadcrumbs
    items={[
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: 'Current Article' },
    ]}
    showBackground={true}
/>
```

**Props:**

- `items`: Array of breadcrumb items (required)
    - Each item: `{ label: string, href?: string }`
    - Last item typically has no `href` (current page)
- `showBackground`: Glass effect background - Default: `true`
- `className`: Additional CSS classes

**Features:**

- Responsive design with proper wrapping
- Chevron separators between items
- Hover effects on links
- Accessible with proper ARIA attributes
- Optional glass effect background

---

## Content Components

### FeatureCard

**Purpose:** Feature showcase card with icon, title, description, and optional CTA link.

**When to use:** Feature grids, service listings, benefit showcases.

```tsx
<FeatureCard
    icon={Zap}
    title='Lightning Fast'
    description='Optimized for performance with sub-second load times'
    href='/features/performance'
    linkText='Learn more'
    iconVariant='primary'
    iconSize='default'
    hoverEffect='lift'
/>
```

**Props:**

- `icon`: Lucide icon component (required)
- `title`: Card title (required)
- `description`: Card description (required)
- `href`: Optional link destination
- `linkText`: CTA link text - Default: `'Learn more'`
- `external`: Open link in new tab - Default: `false`
- `iconVariant`: Icon color (`'primary'` | `'secondary'` | `'accent'` | `'muted'`) - Default: `'primary'`
- `iconSize`: Icon dimensions (`'sm'` | `'default'` | `'lg'`) - Default: `'default'`
- `hoverEffect`: Hover animation
    - `'lift'`: Lift up with shadow (default)
    - `'border'`: Border color change
    - `'glow'`: Glowing shadow
    - `'none'`: No effect
- `onClick`: Optional click handler
- `className`: Additional CSS classes
- `ariaLabel`: Accessibility label

**Typical grid layout:**

```tsx
<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
    <FeatureCard icon={Zap} title='Fast' description='...' />
    <FeatureCard icon={Shield} title='Secure' description='...' />
    <FeatureCard icon={Users} title='Scalable' description='...' />
</div>
```

---

### IconCard

**Purpose:** Lightweight card for simple icon + title + description layouts.

**When to use:** Value propositions, process steps, team values, about sections.

```tsx
<IconCard
    icon={Target}
    title='Our Mission'
    description='To deliver exceptional value through innovative solutions'
    iconStyle='outlined'
    orientation='vertical'
    showBorder={true}
/>
```

**Props:**

- `icon`: Lucide icon component (required)
- `title`: Card title (required)
- `description`: Card description (required)
- `href`: Optional link destination
- `external`: Open link in new tab - Default: `false`
- `iconStyle`: Icon container style
    - `'outlined'`: Border with background (default)
    - `'filled'`: Solid background
    - `'minimal'`: No container
- `iconVariant`: Icon color (`'primary'` | `'secondary'` | `'accent'` | `'muted'`) - Default: `'primary'`
- `orientation`: Layout direction (`'vertical'` | `'horizontal'`) - Default: `'vertical'`
- `showBorder`: Show card border - Default: `true`
- `onClick`: Optional click handler
- `className`: Additional CSS classes
- `ariaLabel`: Accessibility label

**Typical grid layout:**

```tsx
<div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
    <IconCard icon={Target} title='Mission' description='...' />
    <IconCard icon={Eye} title='Vision' description='...' />
    <IconCard icon={Heart} title='Values' description='...' />
    <IconCard icon={Compass} title='Strategy' description='...' />
</div>
```

---

### ImageSection

**Purpose:** Two-column layout combining an image with content (title, description, CTAs).

**When to use:** About sections, feature highlights, product showcases, storytelling.

```tsx
<ImageSection
    image={{
        src: '/images/about-us.jpg',
        alt: 'Our team collaborating',
        width: 800,
        height: 600,
        priority: false,
    }}
    badge='About Us'
    title='Building the Future Together'
    description="We're passionate about creating innovative solutions that make a difference..."
    primaryButton={{ text: 'Learn More', href: '/about' }}
    secondaryButton={{
        text: 'Contact Us',
        href: '/contact',
        variant: 'outline',
    }}
    imagePosition='left'
    contentAlign='center'
    variant='default'
/>
```

**Props:**

- `image`: Image configuration (required)
    - `src`: Image path (required)
    - `alt`: Alt text (required)
    - `aspectRatio`: Optional aspect ratio class (default: `'aspect-video'`)
    - `priority`: Next.js priority loading
- `title`: Section title (required)
- `description`: Section description (required)
- `badge`: Optional badge (string or ReactNode)
- `primaryButton`: Optional primary CTA
    - `{ text: string, href: string, variant?: ButtonVariant, external?: boolean }`
- `secondaryButton`: Optional secondary CTA (same structure)
- `imagePosition`: Image placement (`'left'` | `'right'`) - Default: `'left'`
- `contentAlign`: Content vertical alignment (`'start'` | `'center'` | `'end'`) - Default: `'center'`
- `variant`: Background variant (`'default'` | `'muted'` | `'accent'`) - Default: `'default'`
- `reverseMobile`: Reverse order on mobile - Default: `false`
- `className`: Additional CSS classes
- `imageContainerClassName`: Image container classes
- `contentContainerClassName`: Content container classes
- `id`: Section identifier

**Features:**

- Fully responsive (stacks on mobile)
- Image position control (left/right)
- Flexible content alignment
- Background variants
- Optional badge
- Primary and secondary CTAs
- Mobile order control

---

### CTASection

**Purpose:** Prominent call-to-action section with heading, description, and action buttons.

**When to use:** Page endings, conversion points, newsletter signups, feature promotions.

```tsx
<CTASection
    heading='Ready to Get Started?'
    description='Join thousands of satisfied customers today and transform your workflow'
    primaryButton={{
        text: 'Sign Up Now',
        href: '/signup',
        variant: 'default',
    }}
    secondaryButton={{
        text: 'Learn More',
        href: '/about',
        variant: 'outline',
    }}
    variant='accent'
    align='center'
    size='default'
    buttonLayout='stack'
/>
```

**Props:**

- `heading`: Main CTA heading (required)
- `description`: Optional description text
- `primaryButton`: Primary action button (required)
    - `{ text: string, href: string, variant?: ButtonVariant, icon?: ReactNode, iconPosition?: 'left' | 'right', external?: boolean, onClick?: () => void }`
- `secondaryButton`: Optional secondary button (same structure)
- `variant`: Background style
    - `'default'`: bg-background
    - `'muted'`: bg-muted/30
    - `'accent'`: bg-accent/30
    - `'primary'`: bg-primary with text-primary-foreground
- `align`: Content alignment (`'left'` | `'center'` | `'right'`) - Default: `'center'`
- `size`: Section padding
    - `'sm'`: py-12 md:py-16
    - `'default'`: py-16 md:py-24
    - `'lg'`: py-24 md:py-32
- `buttonLayout`: Button arrangement (`'stack'` | `'inline'`) - Default: `'stack'`
- `className`: Additional CSS classes
- `id`: Section identifier

**Features:**

- Multiple background variants including full primary color
- Flexible alignment options
- Primary and secondary buttons
- Button layout control (stack or inline)
- Responsive typography
- Icon support in buttons

---

### FAQComponent

**Purpose:** Displays frequently asked questions in an accordion layout with smooth animations.

**When to use:** Service pages, product pages, support pages, any page requiring FAQ sections.

```tsx
<FAQComponent
    faqs={[
        {
            question: 'How long does the project take?',
            answer: 'Project timelines vary based on scope and complexity. Typically, we deliver most projects within 4-6 weeks from kickoff.',
        },
        {
            question: 'What is included in the service?',
            answer: 'Our comprehensive service includes initial consultation, design mockups, development, testing, deployment, and post-launch support.',
        },
        {
            question: 'Do you offer ongoing support?',
            answer: 'Yes, we provide ongoing maintenance and support packages to ensure your solution continues to perform optimally.',
        },
    ]}
    title='Frequently Asked Questions'
    description='Common questions about our services'
    variant='muted'
    id='faq'
/>
```

**Props:**

- `faqs`: Array of FAQ items (required)
    - Each item: `{ question: string, answer: string }`
- `title`: Section title - Default: `'Frequently Asked Questions'`
- `description`: Optional section description
- `variant`: Background variant (`'default'` | `'muted'` | `'accent'`) - Default: `'muted'`
- `id`: Section identifier for anchor links - Default: `'faq'`
- `className`: Additional CSS classes

**Features:**

- Accordion with single-item open behavior
- Smooth expand/collapse animations
- Keyboard navigation support
- Proper ARIA attributes for accessibility
- Mobile-first responsive design
- Hover effects on items
- Auto-hides if FAQ array is empty

**FAQ Type Definition:**

```tsx
import type { FaqItem } from '@/lib/types/shared'

const faqs: FaqItem[] = [
    {
        question: 'Your question here?',
        answer: 'Your detailed answer here...',
    },
]
```

---

### Gallery

**Purpose:** Reusable, mobile-first gallery component with lightbox functionality using yet-another-react-lightbox.

**When to use:** Project showcases, portfolio displays, image galleries, service pages, blog image galleries.

```tsx
<Gallery
    images={[
        {
            url: '/images/project-1.jpg',
            alt: 'Project 1',
            caption: 'E-commerce platform',
            width: 1920,
            height: 1080,
        },
        {
            url: '/images/project-2.jpg',
            alt: 'Project 2',
            caption: 'Mobile app design',
        },
    ]}
    columns={{ mobile: 1, tablet: 2, desktop: 3 }}
    aspectRatio='video'
    showCaptions={true}
/>
```

**Props:**

- `images`: Array of GalleryImage objects (required)
    - Each item: `{ url: string, alt: string, caption?: string, width?: number, height?: number }`
- `columns`: Grid column configuration - Default: `{ mobile: 1, tablet: 2, desktop: 3 }`
    - `mobile`: 1 or 2 columns
    - `tablet`: 2 or 3 columns
    - `desktop`: 3 or 4 columns
- `aspectRatio`: Image aspect ratio (`'square'` | `'video'` | `'portrait'`) - Default: `'video'`
- `showCaptions`: Show captions on hover - Default: `true`
- `className`: Additional CSS classes

**Features:**

- Mobile-first responsive design
- Built-in lazy loading (via yet-another-react-lightbox)
- Touch gesture support on mobile devices
- Keyboard navigation (ESC, arrow keys)
- Click-to-expand lightbox with smooth transitions
- Configurable responsive grid columns
- Hover overlay with captions
- Next.js Image optimization
- Full accessibility support (ARIA labels, keyboard navigation)
- Swipe gestures for mobile lightbox navigation

**GalleryImage Type Definition:**

```tsx
import type { GalleryImage } from '@/lib/types/shared'

const images: GalleryImage[] = [
    {
        url: '/images/project-1.jpg',
        alt: 'Project showcase',
        caption: 'E-commerce platform',
        width: 1920,
        height: 1080,
    },
]
```

**Usage in Section Layout:**

For service pages or sections with headers, wrap the Gallery in section components:

```tsx
<SectionContainer variant='muted' id='gallery'>
    <ContentWrapper size='lg'>
        <SectionHeader
            title='Project Gallery'
            description='Examples of our recent work'
            align='center'
            className='mb-12'
        />
        <Gallery images={images} />
    </ContentWrapper>
</SectionContainer>
```

**Typical Grid Configurations:**

```tsx
// Square grid for portfolio
<Gallery
    images={portfolioImages}
    columns={{ mobile: 1, tablet: 2, desktop: 4 }}
    aspectRatio='square'
/>

// Video aspect ratio for projects
<Gallery
    images={projectImages}
    columns={{ mobile: 1, tablet: 2, desktop: 3 }}
    aspectRatio='video'
/>

// Portrait for team photos
<Gallery
    images={teamPhotos}
    columns={{ mobile: 2, tablet: 3, desktop: 4 }}
    aspectRatio='portrait'
/>
```

---

## Mobile Components

### MobileCallButton

**Purpose:** Mobile-only call button (floating or banner) for phone contact.

**When to use:** Service businesses, local businesses, businesses prioritizing phone contact.

```tsx
<MobileCallButton position='bottom-center' style='icon-text' isBanner={false} />
```

**Props:**

- `position`: Button placement (`'bottom-left'` | `'bottom-right'` | `'bottom-center'`) - Default: `'bottom-center'`
- `style`: Button appearance
    - `'icon-only'`: Just phone icon
    - `'text-only'`: Just "Call Now" text
    - `'icon-text'`: Icon + text (default)
- `isBanner`: Full-width banner mode - Default: `false`

**Features:**

- Hidden on desktop (md breakpoint and above)
- Automatic phone link from site config
- Banner mode for persistent bottom bar
- Floating button mode with positioning
- Smooth animations and transitions
- Safe area support for mobile devices

**Configuration:**
Phone number is pulled from `lib/data/site-config.ts`:

```tsx
export const siteConfig = {
    contact: {
        phone: '+1 (555) 123-4567',
        phoneDisplay: '(555) 123-4567',
    },
}
```

---

## Usage Patterns

### Multi-Section Landing Page

```tsx
export default function LandingPage() {
    return (
        <>
            {/* Hero */}
            <SectionContainer variant='default'>
                <ContentWrapper size='lg'>
                    <SectionHeader
                        title='Welcome'
                        description='Build amazing things'
                        align='center'
                    />
                </ContentWrapper>
            </SectionContainer>

            {/* Features */}
            <SectionContainer variant='muted' id='features'>
                <ContentWrapper size='lg'>
                    <SectionHeader badge='Features' title='What We Offer' />
                    <div className='mt-12 grid grid-cols-1 gap-6 md:grid-cols-3'>
                        <FeatureCard
                            icon={Zap}
                            title='Fast'
                            description='...'
                        />
                        <FeatureCard
                            icon={Shield}
                            title='Secure'
                            description='...'
                        />
                        <FeatureCard
                            icon={Users}
                            title='Scalable'
                            description='...'
                        />
                    </div>
                </ContentWrapper>
            </SectionContainer>

            {/* About */}
            <ImageSection
                image={{ src: '/about.jpg', alt: 'Team' }}
                title='About Us'
                description='Our story...'
                primaryButton={{ text: 'Learn More', href: '/about' }}
            />

            {/* CTA */}
            <CTASection
                heading='Ready?'
                primaryButton={{ text: 'Get Started', href: '/signup' }}
                variant='accent'
            />
        </>
    )
}
```

### Simple Content Page

```tsx
export default function BlogPost({ post }) {
    return (
        <ContainerLayout size='sm' as='div' className='py-12'>
            <Breadcrumbs
                items={[
                    { label: 'Home', href: '/' },
                    { label: 'Blog', href: '/blog' },
                    { label: post.title },
                ]}
            />

            <article className='mt-8'>
                <h1>{post.title}</h1>
                <div className='prose'>{post.content}</div>
            </article>
        </ContainerLayout>
    )
}
```

---

## Component Decision Tree

```
Need a component?
│
├─ Layout wrapper?
│  ├─ Multi-section page? → SectionContainer + ContentWrapper
│  └─ Simple page? → ContainerLayout
│
├─ Section title?
│  └─ SectionHeader
│
├─ Navigation?
│  └─ Breadcrumbs
│
├─ Feature showcase?
│  ├─ With CTA link? → FeatureCard
│  └─ Simple display? → IconCard
│
├─ Image + content?
│  └─ ImageSection
│
├─ Call to action?
│  └─ CTASection
│
├─ Frequently asked questions?
│  └─ FAQ
│
├─ Image gallery?
│  └─ Gallery
│
└─ Mobile call button?
   └─ MobileCallButton
```

---

## Best Practices

1. **Always check shared components first** before creating new ones
2. **Use barrel imports** from `@/components/shared` for cleaner code
3. **Follow layout patterns** - don't create custom layout wrappers
4. **Leverage composition** - combine components for complex UIs
5. **Respect component props** - use intended variants and options
6. **Maintain accessibility** - use provided ARIA props
7. **Follow naming conventions** - consistent with project standards
8. **Mobile-first thinking** - components are designed mobile-first
9. **Type safety** - all components have proper TypeScript types
10. **Reusability** - prefer shared components over one-offs

---

_Last Updated: 2025-10-17_
_Total Shared Components: 11_
