# Stacking Scroll Effect Guide

## Overview

The enhanced stacking scroll effect creates an Apple-style card stacking animation with sophisticated 3D transforms, dynamic shadows, blur effects, and full accessibility support. This guide shows you how to use these components throughout your website.

## Components

### 1. StackingCard

The core wrapper component that provides the scroll-based animation logic.

**Location:** `@/components/shared/StackingCard.component.tsx`

**Features:**

- 3D perspective transforms (rotateX, translateY)
- Dynamic shadow and blur effects
- Performance optimized (RAF throttling, Intersection Observer)
- Accessibility support (reduced motion)
- Fully configurable animation intensity

### 2. StackingFeatureCard

A pre-styled card designed for the stacking effect with image, title, and description.

**Location:** `@/components/shared/StackingFeatureCard.component.tsx`

**Features:**

- Gradient glow effect on hover
- Dynamic border color transitions
- Image scaling animations
- Optimized for stacking animations

### 3. StackingFeaturesSection

A complete section component that combines StackingCard and StackingFeatureCard.

**Location:** `@/components/sections/home/StackingFeaturesSection.component.tsx`

## Usage Examples

### Example 1: Basic Usage (Home Page Features)

```tsx
import { StackingFeaturesSection } from '@/components/sections/home'

;<StackingFeaturesSection
    id='key-features'
    title='Everything You Need to Launch Fast'
    description='A complete website template with all the features'
    features={keyFeaturesData}
    variant='muted'
/>
```

### Example 2: Custom Animation Intensity

```tsx
<StackingFeaturesSection
    id='services'
    title='Our Services'
    features={servicesData}
    animationIntensity='dramatic' // 'subtle' | 'normal' | 'dramatic'
    variant='default'
/>
```

### Example 3: Custom Stacking Variant

```tsx
<StackingFeaturesSection
    id='products'
    title='Our Products'
    features={productsData}
    stackingVariant='compact' // 'default' | 'compact' | 'spacious'
    animationIntensity='normal'
/>
```

### Example 4: Custom Card with StackingCard Wrapper

```tsx
import { StackingCard } from '@/components/shared'

// In your custom section component

;<div className='space-y-16'>
    {items.map((item, index) => (
        <StackingCard
            key={item.id}
            index={index}
            total={items.length}
            animationIntensity='normal'
            stackingVariant='default'
        >
            {/* Your custom card component */}
            <YourCustomCard {...item} />
        </StackingCard>
    ))}
</div>
```

### Example 5: Services Section with Stacking Effect

```tsx
// apps/web/app/services/page.tsx
import { IconCard, StackingCard } from '@/components/shared'
import { servicesData } from '@/lib/data/services'

export default function ServicesPage() {
    return (
        <SectionContainer variant='muted'>
            <ContentWrapper size='md'>
                <SectionHeader
                    title='Our Services'
                    description='Comprehensive solutions for your business'
                    align='center'
                    className='mb-16 md:mb-20'
                />

                <div className='space-y-16'>
                    {servicesData.map((service, index) => (
                        <StackingCard
                            key={service.title}
                            index={index}
                            total={servicesData.length}
                            animationIntensity='subtle'
                        >
                            <IconCard
                                icon={service.icon}
                                title={service.title}
                                description={service.description}
                                href={service.href}
                            />
                        </StackingCard>
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
```

### Example 6: Testimonials with Stacking

```tsx
import { StackingCard } from '@/components/shared'
import { TestimonialCard } from '@/components/testimonials'

;<div className='space-y-16'>
    {testimonials.map((testimonial, index) => (
        <StackingCard
            key={index}
            index={index}
            total={testimonials.length}
            animationIntensity='normal'
            stackingVariant='compact'
        >
            <TestimonialCard
                quote={testimonial.quote}
                name={testimonial.name}
                role={testimonial.role}
                company={testimonial.company}
                avatar={testimonial.avatar}
            />
        </StackingCard>
    ))}
</div>
```

### Example 7: Advanced Configuration

```tsx
<StackingFeaturesSection
    id='features'
    title='Advanced Features'
    features={featuresData}
    animationIntensity='normal'
    stackingVariant='default'
    stackingConfig={{
        scaleAmount: 0.2, // Custom scale reduction (0-1)
        rotationAmount: 3, // Custom rotation degrees
        blurAmount: 6, // Custom blur in pixels
        enableBlur: true, // Enable/disable blur
        enable3D: true, // Enable/disable 3D transforms
        offsetAmount: 15, // Horizontal offset in pixels
        shadowIntensity: 1.2, // Shadow intensity multiplier
        brightnessReduction: 0.25, // Brightness reduction (0-1)
    }}
/>
```

## Configuration Options

### Animation Intensity Presets

| Preset       | Scale | Rotation | Blur | Offset | Shadow | Brightness |
| ------------ | ----- | -------- | ---- | ------ | ------ | ---------- |
| **subtle**   | 8%    | 1deg     | 2px  | 5px    | 0.5x   | 10%        |
| **normal**   | 15%   | 2deg     | 4px  | 10px   | 1x     | 20%        |
| **dramatic** | 25%   | 4deg     | 6px  | 20px   | 1.5x   | 30%        |

### Stacking Variants (Container Heights)

| Variant      | Default | Last Card |
| ------------ | ------- | --------- |
| **compact**  | 70vh    | 50vh      |
| **default**  | 90vh    | 60vh      |
| **spacious** | 120vh   | 80vh      |

## Props Reference

### StackingCard Props

```typescript
type StackingCardProps = {
    children: ReactNode // Card content
    index: number // Zero-based index
    total: number // Total number of cards
    className?: string // Additional CSS classes
    animationIntensity?: AnimationIntensity // 'subtle' | 'normal' | 'dramatic'
    stackingVariant?: StackingVariant // 'default' | 'compact' | 'spacious'
    config?: Partial<StackingCardConfig> // Custom configuration overrides
}
```

### StackingFeatureCard Props

```typescript
type StackingFeatureCardProps = {
    title: string // Feature title
    description: string // Feature description
    imageSrc: string // Image source path
    imageAlt: string // Image alt text
    className?: string // Additional CSS classes
}
```

### StackingFeaturesSection Props

```typescript
type StackingFeaturesSectionProps = {
    title: string // Section title
    description?: string // Section description
    features: Feature[] // Array of feature items
    variant?: 'default' | 'muted' | 'accent' // Background variant
    className?: string // Additional CSS classes
    id?: string // Section ID for anchor links
    animationIntensity?: AnimationIntensity // Animation preset
    stackingVariant?: StackingVariant // Container height preset
    stackingConfig?: Partial<StackingCardConfig> // Custom overrides
}
```

## Accessibility

The stacking effect fully respects user preferences:

- **Reduced Motion:** Users who prefer reduced motion will see static cards without animations
- **Keyboard Navigation:** All interactive elements remain keyboard accessible
- **Screen Readers:** Proper semantic HTML and ARIA labels maintained

Test with:

```css
/* In browser DevTools, emulate reduced motion */
@media (prefers-reduced-motion: reduce) {
    /* Animations disabled automatically */
}
```

## Performance

The implementation includes multiple optimizations:

1. **RAF Throttling:** Scroll calculations use requestAnimationFrame
2. **Intersection Observer:** Only tracks cards in viewport
3. **GPU Acceleration:** Uses `will-change` for transform optimization
4. **Passive Listeners:** Scroll events marked as passive for better performance

## Best Practices

### 1. Optimal Number of Cards

- **3-5 cards:** Best for maintaining user engagement
- **6-8 cards:** Maximum recommended
- **9+ cards:** Consider splitting into multiple sections

### 2. Content Guidelines

- Use high-quality images (1200x800px minimum)
- Keep titles concise (3-5 words)
- Descriptions should be 1-2 sentences
- Ensure good contrast for readability

### 3. Section Placement

- Works best in middle of page (not first section)
- Add regular content sections between stacking sections
- Use sparingly—one stacking section per page recommended

### 4. Mobile Considerations

- Cards automatically adjust container heights on mobile
- Touch scrolling is smooth and responsive
- Images load lazily for better performance

## Customization Examples

### Custom Card Component

```tsx
// Create your own card for use with StackingCard
function CustomProductCard({ product }: { product: Product }) {
    return (
        <div className='bg-background border-border rounded-2xl border p-8 shadow-2xl'>
            <div className='relative mb-6 aspect-square'>
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className='rounded-lg object-cover'
                />
            </div>
            <h3 className='mb-2 text-2xl font-bold'>{product.name}</h3>
            <p className='text-muted-foreground mb-4'>{product.description}</p>
            <div className='flex items-center justify-between'>
                <span className='text-primary text-3xl font-bold'>
                    ${product.price}
                </span>
                <Button>Add to Cart</Button>
            </div>
        </div>
    )
}

// Use it with StackingCard
;<StackingCard index={0} total={products.length}>
    <CustomProductCard product={products[0]} />
</StackingCard>
```

### Themed Stacking Section

```tsx
// Create a themed variant for specific pages
function ThemedStackingSection() {
    return (
        <SectionContainer variant='accent' className='relative overflow-hidden'>
            {/* Add background pattern or gradient */}
            <div className='from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent' />

            <ContentWrapper size='md' className='relative z-10'>
                <SectionHeader
                    title='Premium Features'
                    description='Exclusive capabilities for power users'
                    align='center'
                    className='mb-20'
                />

                <div className='space-y-16'>
                    {premiumFeatures.map((feature, index) => (
                        <StackingCard
                            key={feature.id}
                            index={index}
                            total={premiumFeatures.length}
                            animationIntensity='dramatic'
                        >
                            <PremiumFeatureCard {...feature} />
                        </StackingCard>
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
```

## Troubleshooting

### Cards Not Stacking Properly

- Ensure each StackingCard has correct `index` and `total` props
- Check that container has proper height (`min-h-[90vh]`)
- Verify z-index is not being overridden by other styles

### Animations Feeling Slow

- Try `animationIntensity="subtle"` or `stackingVariant="compact"`
- Reduce `scaleAmount` and `rotationAmount` in custom config
- Check if browser DevTools is throttling performance

### Images Loading Slowly

- Use optimized images (WebP format recommended)
- Ensure Next.js Image optimization is working
- Add proper `sizes` attribute to Image components

### Performance Issues

- Reduce number of cards (aim for 3-5)
- Disable blur with `enableBlur: false` in config
- Check browser console for performance warnings

## Type Definitions

All types are available from:

```typescript
import type {
    AnimationIntensity,
    StackingCardConfig,
    StackingCardProps,
    StackingFeatureCardProps,
    StackingFeaturesSectionProps,
    StackingVariant,
} from '@/lib/types/sections'
```

## Browser Support

- Chrome/Edge: Full support ✅
- Firefox: Full support ✅
- Safari: Full support ✅
- Mobile browsers: Full support ✅

Requires:

- CSS Sticky positioning
- Intersection Observer API
- requestAnimationFrame

All features gracefully degrade on older browsers.

## Examples in Codebase

1. **Stacking Section:** `apps/web/components/sections/home/stacking-features-section.component.tsx`
2. **Type Definitions:** `apps/web/lib/types/sections/stacking.type.ts`

> **Status:** this component has no callers. The data the examples above were
> written against — `keyFeaturesData` in `apps/web/lib/data/webpages/home.ts` —
> was another company's website content left over from the monorepo template,
> and issue #202 deleted it along with the 49 MB of stock photography it pointed
> at. Treat the usage examples here as illustrative rather than as live code.

---

**Last Updated:** 2025-10-19  
**Version:** 2.0.0 (Enhanced with 3D effects and accessibility)
