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
    images: {
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
        ]
    },
}

export default nextConfig
