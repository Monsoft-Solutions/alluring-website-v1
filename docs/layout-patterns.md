# Layout Patterns Guide

This guide explains the two layout patterns used in our application and when to use each one.

## Overview

Our application uses two distinct layout patterns, each optimized for different use cases:

1. **SectionContainer + ContentWrapper** - For multi-section pages with complex layouts
2. **ContainerLayout** - For simple content pages with consistent styling

## Pattern 1: SectionContainer + ContentWrapper

### When to Use

- **Multi-section pages** with different background variants
- **Complex layouts** requiring fine-grained control over sections
- **Marketing pages** like Homepage, About, Contact
- **Landing pages** with multiple distinct sections

### Benefits

- Section-level background control (default, muted, accent)
- Flexible vertical and horizontal spacing
- Semantic HTML sections
- Independent section styling

### Usage Example

```tsx
import { ContentWrapper, SectionContainer } from '@/components/shared'

export default function AboutPage() {
    return (
        <main>
            {/* Breadcrumbs Section */}
            <div className='pt-8 pb-4'>
                <ContentWrapper>
                    <Breadcrumbs items={breadcrumbItems} />
                </ContentWrapper>
            </div>

            {/* Hero Section with muted background */}
            <SectionContainer variant='muted'>
                <ContentWrapper>
                    <h1>About Us</h1>
                    <p>Company description...</p>
                </ContentWrapper>
            </SectionContainer>

            {/* Content Section with default background */}
            <SectionContainer variant='default'>
                <ContentWrapper size='md'>
                    <div>Main content...</div>
                </ContentWrapper>
            </SectionContainer>
        </main>
    )
}
```

### Available Props

#### SectionContainer

- `variant`: 'default' | 'muted' | 'accent' - Background variant
- `as`: HTML element to render (default: 'section')
- `id`: Element ID for navigation
- `className`: Additional CSS classes
- `noPadding`: Remove default vertical padding
- `paddingY`: Custom vertical padding
- `ariaLabel`: Accessibility label

#### ContentWrapper

- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full' - Max width constraint
- `className`: Additional CSS classes
- `noPadding`: Remove default horizontal padding
- `paddingX`: Custom horizontal padding

## Pattern 2: ContainerLayout

### When to Use

- **Simple content pages** with consistent styling
- **Blog posts** and article pages
- **Category/tag listing pages**
- **Single-purpose pages** without complex sections
- **Quick layouts** that don't need section-level control

### Benefits

- Simple, single-component API
- Consistent container width and padding
- Semantic HTML element support
- Quick implementation
- Built-in responsive behavior

### Usage Example

```tsx
import { ContainerLayout } from '@/components/ContainerLayout.component'

export default function BlogPostPage() {
    return (
        <ContainerLayout as='div' size='sm' className='py-12 lg:py-16'>
            <article>
                <Breadcrumbs items={breadcrumbItems} />
                <h1>Blog Post Title</h1>
                <p>Article content...</p>
            </article>
        </ContainerLayout>
    )
}
```

### Available Props

- `size`: 'default' | 'sm' | 'md' | 'lg' | 'xl' | 'full' - Container width
- `as`: 'div' | 'main' | 'section' | 'article' | 'aside' - HTML element
- `className`: Additional CSS classes
- `noPadding`: Remove default horizontal padding
- `paddingX`: Custom horizontal padding
- `id`: Element ID for navigation
- `ariaLabel`: Accessibility label

### Size Variants

- `default`: Responsive container with breakpoint-based max-widths
- `sm`: max-w-3xl (768px) - Ideal for blog posts and reading content
- `md`: max-w-5xl (1024px) - Good for medium content pages
- `lg`: max-w-6xl (1152px) - Suitable for wider content layouts
- `xl`: max-w-7xl (1280px) - Maximum content width
- `full`: w-full - Full width container

## Decision Matrix

| Use Case       | Pattern                           | Reasoning                                        |
| -------------- | --------------------------------- | ------------------------------------------------ |
| Homepage       | SectionContainer + ContentWrapper | Multiple sections with different backgrounds     |
| About Page     | SectionContainer + ContentWrapper | Complex layout with hero, mission, team sections |
| Contact Page   | SectionContainer + ContentWrapper | Multiple sections (hero, form, info)             |
| Blog Post      | ContainerLayout (size='sm')       | Simple reading layout, optimal line length       |
| Blog Index     | ContainerLayout                   | Simple list layout                               |
| Category Pages | ContainerLayout                   | Simple content with consistent styling           |
| Tag Pages      | ContainerLayout                   | Simple content with consistent styling           |
| Error Pages    | ContainerLayout                   | Simple error message layout                      |

## Best Practices

### General Guidelines

1. **Choose the right pattern** based on complexity, not preference
2. **Use semantic HTML elements** (`as` prop) for better accessibility
3. **Maintain consistent spacing** using the established padding patterns
4. **Follow responsive design** principles with appropriate size variants

### SectionContainer + ContentWrapper Best Practices

1. **Always wrap content** in ContentWrapper within SectionContainer
2. **Use appropriate background variants** to create visual hierarchy
3. **Place breadcrumbs** in their own container with ContentWrapper
4. **Maintain section semantics** with proper HTML elements

### ContainerLayout Best Practices

1. **Use semantic elements** (`as='div'` for page content)
2. **Choose appropriate sizes** (sm for reading, default for general content)
3. **Include consistent padding** (`py-12 lg:py-16` for pages)
4. **Add proper IDs** for navigation and accessibility

### Breadcrumb Guidelines

- **Multi-section pages**: Use ContentWrapper for breadcrumbs
- **Simple pages**: Include breadcrumbs inside ContainerLayout
- **Consistent spacing**: Use `pt-8 pb-4` for breadcrumb containers on multi-section pages

## Migration Guidelines

### When to Refactor

- **Inconsistent container usage** across similar page types
- **Custom container implementations** that could use standard patterns
- **Missing semantic HTML** elements
- **Inconsistent spacing** patterns

### How to Migrate

1. **Identify the page type** (multi-section vs simple content)
2. **Choose the appropriate pattern** based on the decision matrix
3. **Update imports** to use the correct components
4. **Apply consistent spacing** and sizing
5. **Add semantic HTML elements** using the `as` prop
6. **Test responsive behavior** across breakpoints

## Common Patterns

### Blog Pages

```tsx
<ContainerLayout as='div' size='sm' className='py-12 lg:py-16'>
    <Breadcrumbs items={breadcrumbItems} />
    <article className='prose prose-neutral dark:prose-invert'>
        {/* Content */}
    </article>
</ContainerLayout>
```

### Marketing Pages

```tsx
<main>
    <div className='pt-8 pb-4'>
        <ContentWrapper>
            <Breadcrumbs items={breadcrumbItems} />
        </ContentWrapper>
    </div>

    <SectionContainer variant='muted'>
        <ContentWrapper>{/* Hero content */}</ContentWrapper>
    </SectionContainer>

    <SectionContainer variant='default'>
        <ContentWrapper>{/* Main content */}</ContentWrapper>
    </SectionContainer>
</main>
```

### List Pages

```tsx
<ContainerLayout as='div' className='py-12 lg:py-16'>
    <Breadcrumbs items={breadcrumbItems} />
    <header className='mb-12 space-y-6'>
        <h1>Page Title</h1>
        <p>Description</p>
    </header>
    <div className='grid gap-6'>{/* List items */}</div>
</ContainerLayout>
```

## Troubleshooting

### Common Issues

1. **Inconsistent spacing**: Ensure you're using the standard padding patterns
2. **Wrong pattern choice**: Review the decision matrix and use cases
3. **Missing semantic HTML**: Always use the `as` prop for better accessibility
4. **Responsive issues**: Test across breakpoints and adjust size variants

### Performance Considerations

- Both patterns are lightweight and performant
- ContainerLayout has a simpler DOM structure for simple pages
- SectionContainer + ContentWrapper provides more flexibility at the cost of slightly more DOM nodes

## Conclusion

By following these patterns and guidelines, you'll maintain consistency across the application while choosing the right tool for each use case. The dual pattern approach provides both simplicity for straightforward pages and flexibility for complex layouts.
