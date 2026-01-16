import { PostMarkdown } from '@/components/blog/post-markdown.component'
import { ContainerLayout } from '@/components/container-layout.component'
import Link from 'next/link'

type LegalPageLayoutProps = {
    title: string
    content: string
    lastUpdated?: string
}

/**
 * Legal Page Layout Component
 *
 * Provides a consistent, professional layout for legal pages (Privacy Policy, Terms of Service, Cookie Policy).
 * Uses MDX rendering via PostMarkdown component for rich markdown content.
 *
 * Design follows brand guidelines:
 * - Minimalistic and professional
 * - Maximum content width for readability (sm: max-w-3xl)
 * - Proper typography hierarchy
 * - Notion-inspired clean design
 *
 * @param title - Page title (e.g., "Privacy Policy")
 * @param content - Markdown content to render
 * @param lastUpdated - Optional last updated date
 */
export function LegalPageLayout({
    title,
    content,
    lastUpdated,
}: LegalPageLayoutProps) {
    return (
        <ContainerLayout size='sm' as='div' className='py-12 md:py-16 lg:py-20'>
            {/* Page Header */}
            <header className='mb-8 border-b pb-6'>
                <h1 className='text-foreground text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl'>
                    {title}
                </h1>
                {lastUpdated && (
                    <p className='text-muted-foreground mt-3 text-sm'>
                        Last Updated: {lastUpdated}
                    </p>
                )}
            </header>

            {/* Legal Content - Rendered as MDX */}
            <article className='prose prose-neutral prose-headings:scroll-mt-20 prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2 prose-p:text-base prose-p:leading-7 prose-p:text-muted-foreground prose-a:text-foreground prose-a:underline prose-a:decoration-muted-foreground/50 prose-a:underline-offset-4 hover:prose-a:decoration-foreground prose-strong:text-foreground prose-strong:font-semibold prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:text-foreground prose-ul:my-4 prose-ul:list-disc prose-ol:my-4 prose-ol:list-decimal prose-li:text-muted-foreground prose-li:my-1 prose-table:text-sm prose-th:text-foreground prose-th:font-semibold prose-th:border-border prose-td:border-border prose-blockquote:border-l-border prose-blockquote:text-muted-foreground max-w-none'>
                <PostMarkdown content={content} />
            </article>

            {/* Footer Notice */}
            <footer className='text-muted-foreground mt-12 border-t pt-6 text-center text-sm'>
                <p>
                    For questions or concerns about this policy, please{' '}
                    <Link
                        href='/contact-us'
                        className='text-foreground decoration-muted-foreground/50 hover:decoration-foreground cursor-pointer underline underline-offset-4'
                    >
                        contact us
                    </Link>
                    .
                </p>
            </footer>
        </ContainerLayout>
    )
}
