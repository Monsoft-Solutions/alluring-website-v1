/**
 * Breadcrumbs Component
 *
 * A reusable breadcrumb navigation component that helps users understand
 * their current location within the site hierarchy. Includes proper
 * accessibility attributes, responsive styling, and an optional enhanced
 * glass effect background.
 *
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'About', href: '/about' },
 *     { label: 'Team' },
 *   ]}
 *   showBackground={true}
 * />
 * ```
 */
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

/**
 * Individual breadcrumb item
 */
interface BreadcrumbItem {
    label: string
    href?: string
}

/**
 * Props for the Breadcrumbs component
 */
interface BreadcrumbsProps {
    /**
     * Array of breadcrumb items
     */
    items: BreadcrumbItem[]

    /**
     * Additional CSS classes
     */
    className?: string

    /**
     * Whether to show the enhanced glass effect background
     * @default true
     */
    showBackground?: boolean
}

export function Breadcrumbs({
    items,
    className,
    showBackground = true,
}: BreadcrumbsProps) {
    const breadcrumbContent = (
        <ol className='flex flex-wrap items-center gap-2'>
            {items.map((item, index) => (
                <li
                    key={`${item.label}-${index}`}
                    className='flex items-center gap-2'
                >
                    {item.href ? (
                        <>
                            <Link
                                href={item.href}
                                className='text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200 hover:underline'
                            >
                                {item.label}
                            </Link>
                            {index < items.length - 1 && (
                                <ChevronRight
                                    className='text-muted-foreground/40 size-4 flex-shrink-0'
                                    aria-hidden='true'
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <span
                                className='text-foreground text-sm font-medium'
                                aria-current='page'
                            >
                                {item.label}
                            </span>
                            {index < items.length - 1 && (
                                <ChevronRight
                                    className='text-muted-foreground/40 size-4 flex-shrink-0'
                                    aria-hidden='true'
                                />
                            )}
                        </>
                    )}
                </li>
            ))}
        </ol>
    )

    return (
        <nav aria-label='Breadcrumb' className={className}>
            {showBackground ? (
                <div className='bg-background/60 border-border/50 hover:bg-background/70 inline-flex rounded-full border px-4 py-2 shadow-sm backdrop-blur-sm transition-all duration-200'>
                    {breadcrumbContent}
                </div>
            ) : (
                breadcrumbContent
            )}
        </nav>
    )
}
