import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url'

const jiti = createJiti(fileURLToPath(import.meta.url))

// Import env here to validate during build. Using jiti@^1 we can import .ts files :)
jiti('./env')

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Acknowledge Turbopack usage (silences webpack plugin warnings)
    turbopack: {},
    transpilePackages: ['@workspace/ui', '@workspace/db', '@workspace/seo'],
    experimental: {
        // Prerendering the 155 blog posts (issue #198) turned the build into a
        // heavy database client: every post fires its detail, related, adjacent
        // and inline-image queries, across 17 export workers each holding up to
        // 5 pooled connections (packages/db `max: 5`), all aimed at the Supabase
        // transaction pooler. That produced an intermittent `read ETIMEDOUT`
        // mid-prerender — one failed build in five, measured on this branch.
        // Next defaults to no retries, so a single transient pooler timeout
        // failed the whole deploy. Three attempts per page covers it.
        staticGenerationRetryCount: 3,
        // Next 16 ships a 75-entry default list (lucide-react and date-fns are
        // both on it) and framer-motion is not among them. The 17 components
        // that still legitimately need AnimatePresence / useScroll now sit
        // behind route-level code splitting rather than the root layout, so
        // this mostly helps the pages that still import it directly.
        optimizePackageImports: ['framer-motion'],
    },
    images: {
        // AVIF first — it was off entirely, so every optimized image was served
        // as WebP even to browsers that would take a smaller AVIF.
        formats: ['image/avif', 'image/webp'],
        // 1 day. The floor the optimizer applies to its own cache entries; the
        // default let /public-sourced images (the logo on every page) revalidate
        // constantly. Kept to a day rather than a month because /public filenames
        // are not fingerprinted — an image replaced in place has to reach people
        // within a working day, and a day already removes the per-view revalidation.
        minimumCacheTTL: 86400,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'www.alluringplasticsurgery.com',
            },
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
    async headers() {
        return [
            {
                // Everything under /public. Next serves these with `max-age=0` by
                // default, so the logo revalidated on every page view and the image
                // optimizer inherited that floor as its own ceiling.
                // A day of freshness plus a week of background revalidation, rather
                // than a flat month: these filenames are NOT fingerprinted, so an
                // asset replaced in place is the realistic failure mode and it must
                // not be able to stick around for weeks.
                source: '/:path((?:images|videos|fonts)/.*|logo\\.png|logo-dark\\.png|icon\\.png|favicon\\.png|apple-touch-icon\\.png|og-image\\.jpg)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=604800',
                    },
                ],
            },
            // No Cache-Control rule for marketing HTML. Issue #198 asked for one,
            // on the strength of production answering `max-age=0, must-revalidate`.
            // Measured against `next start`, Next already emits
            // `s-maxage=60, stale-while-revalidate=31535940` for every prerendered
            // route — a shared cache is being told exactly the right thing, and
            // production's `must-revalidate` is Vercel rewriting the browser-facing
            // copy while its own edge serves from the ISR cache. Any rule here
            // REPLACES that header, dropping `s-maxage` for anyone running behind a
            // CDN other than Vercel's, which is the opposite of the intent. The
            // browser-side win was marginal and cost up to an hour of stale HTML
            // after a publish or a copy correction.
        ]
    },
    async redirects() {
        return [
            {
                source: '/contact',
                destination: '/contact-us',
                permanent: true, // 308 permanent redirect
            },
            // Blog post URL routing is now handled by route-level logic in
            // app/[slug]/page.tsx and app/blog/[slug]/page.tsx based on publish date.
            // Influencer marketing redirects
            {
                source: '/melany',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=melany',
                permanent: true,
            },
            {
                source: '/yele',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=yele',
                permanent: true,
            },
            {
                source: '/lorena-gonzalez',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=lorena-gonzalez',
                permanent: true,
            },
            {
                source: '/melany-capote',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=melany-capote',
                permanent: true,
            },
            {
                source: '/cristina-deletto',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=cristina-deletto',
                permanent: true,
            },
            {
                source: '/angelica',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=angelica',
                permanent: true,
            },
            {
                source: '/kuki',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=kuki',
                permanent: true,
            },
            {
                source: '/dirian-garcia',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=dirian-garcia',
                permanent: true,
            },
            {
                source: '/dr-karlinsky-ig',
                destination:
                    '/landing/dr-victoria-karlinsky?utm_source=doctor&utm_medium=dr-karlinsky',
                permanent: true,
            },
            {
                source: '/cosmetic-procedures-in-miami',
                destination: '/procedures',
                permanent: true,
            },
            {
                source: '/faq',
                destination: '/faqs',
                permanent: true,
            },
            // Social Media Bio Links
            {
                source: '/ig',
                destination:
                    '/links?utm_source=instagram&utm_medium=social&utm_campaign=bio_link',
                permanent: true,
            },
            {
                source: '/fb',
                destination:
                    '/links?utm_source=facebook&utm_medium=social&utm_campaign=bio_link',
                permanent: true,
            },
            {
                source: '/tiktok',
                destination:
                    '/links?utm_source=tiktok&utm_medium=social&utm_campaign=bio_link',
                permanent: true,
            },

            // KEyword Cannibalization Redirects
            {
                source: '/mommy-makeover-miami-guide',
                destination: '/procedures/mommy-makeover-miami',
                permanent: true,
            },
            {
                source: '/prepare-mommy-makeover-miami',
                destination: '/procedures/mommy-makeover-miami',
                permanent: true,
            },
            {
                source: '/mommy-makeover-myths-miami',
                destination: '/procedures/mommy-makeover-miami',
                permanent: true,
            },

            // Duplicate blog content consolidation redirects
            // Destinations use /blog/ prefix since canonical posts are published >= Jan 2026
            // Mommy Makeover Recovery (6 posts, same topic -> 1 canonical)
            {
                source: '/mommy-makeover-recovery-timeline',
                destination: '/blog/mommy-makeover-recovery-timeline-miami',
                permanent: true,
            },
            {
                source: '/mommy-makeover-recovery-guide',
                destination: '/blog/mommy-makeover-recovery-timeline-miami',
                permanent: true,
            },
            {
                source: '/mommy-makeover-recovery-time-miami',
                destination: '/blog/mommy-makeover-recovery-timeline-miami',
                permanent: true,
            },
            {
                source: '/mommy-makeover-recovery-pain-management',
                destination: '/blog/mommy-makeover-recovery-timeline-miami',
                permanent: true,
            },
            {
                source: '/mommy-makeover-recovery-pain-guide',
                destination: '/blog/mommy-makeover-recovery-timeline-miami',
                permanent: true,
            },
            // Liposuction Cost (duplicate keyword)
            {
                source: '/miami-liposuction-cost',
                destination: '/blog/liposuction-cost-miami',
                permanent: true,
            },
            // Blepharoplasty Candidate (3 posts -> 1 canonical)
            {
                source: '/blepharoplasty-candidate-checklist',
                destination: '/blog/blepharoplasty-candidate-miami-checklist',
                permanent: true,
            },
            {
                source: '/blepharoplasty-miami-candidate',
                destination: '/blog/blepharoplasty-candidate-miami-checklist',
                permanent: true,
            },
            // Blepharoplasty Age (2 posts -> 1 canonical)
            {
                source: '/best-blepharoplasty-age-miami',
                destination: '/blog/best-blepharoplasty-age-miami-checklist',
                permanent: true,
            },
            // Liposuction Candidate (2 posts -> 1 canonical)
            {
                source: '/liposuction-candidate-checklist-miami',
                destination: '/blog/liposuction-candidate-miami',
                permanent: true,
            },
            // Liposuction Moms (2 posts -> 1 canonical)
            {
                source: '/liposuction-miami-moms-faq',
                destination: '/blog/liposuction-miami-moms-tips',
                permanent: true,
            },
            // Breast Reduction Candidate (2 posts -> 1 canonical)
            {
                source: '/breast-reduction-miami-recovery-candidates',
                destination: '/blog/breast-reduction-candidate-miami',
                permanent: true,
            },

            // Anti-cannibalization redirects — blog posts → procedure pages
            {
                source: '/what-is-the-mommy-makeover-procedure',
                destination: '/procedures/mommy-makeover-miami',
                permanent: true,
            },
            {
                source: '/liposuction-cost-miami',
                destination: '/procedures/liposuction-miami',
                permanent: true,
            },
            {
                source: '/breast-reduction-cost-miami',
                destination: '/procedures/breast-reduction-miami',
                permanent: true,
            },
            {
                source: '/miami-breast-reduction-cost-weight-loss',
                destination: '/procedures/breast-reduction-miami',
                permanent: true,
            },
            {
                source: '/facelift-cost-miami',
                destination: '/procedures/facelift-miami',
                permanent: true,
            },
            {
                source: '/breast-reduction-surgeons-miami',
                destination: '/procedures/breast-reduction-miami',
                permanent: true,
            },
            {
                source: '/best-breast-lift-surgeons-miami',
                destination: '/procedures/breast-lift-miami',
                permanent: true,
            },

            // Pricing URL referenced from published blog copy but never built.
            // Kept as a redirect rather than a content edit so inbound links
            // from anywhere else land somewhere useful too.
            {
                source: '/plastic-surgery-cost-miami',
                destination: '/plastic-surgery-financing-miami',
                permanent: true,
            },
        ]
    },
}

export default nextConfig
