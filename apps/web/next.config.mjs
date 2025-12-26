import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url'

const jiti = createJiti(fileURLToPath(import.meta.url))

// Import env here to validate during build. Using jiti@^1 we can import .ts files :)
jiti('./env')

/** @type {import('next').NextConfig} */
const nextConfig = {
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
        ],
    },
    async redirects() {
        return [
            {
                source: '/contact',
                destination: '/contact-us',
                permanent: true, // 308 permanent redirect
            },
            // Redirect old /blog/:slug URLs to root-level /:slug (WordPress URL structure)
            {
                source: '/blog/:slug',
                destination: '/:slug',
                permanent: true, // 301 permanent redirect for SEO
            },
            // Influencer marketing redirects
            {
                source: '/melany',
                destination:
                    '/miami-plastic-surgery-specials/?utm_source=influencer&utm_medium=melany',
                permanent: true,
            },
            {
                source: '/yele',
                destination:
                    '/miami-plastic-surgery-specials/?utm_source=influencer&utm_medium=yele',
                permanent: true,
            },
            {
                source: '/lorena-gonzalez',
                destination:
                    '/miami-plastic-surgery-specials/?utm_source=influencer&utm_medium=lorena-gonzalez',
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
        ]
    },
}

export default nextConfig
