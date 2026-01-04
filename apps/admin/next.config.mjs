import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url'

const jiti = createJiti(fileURLToPath(import.meta.url))

// Import env here to validate during build
jiti('./env')

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Acknowledge Turbopack usage (silences webpack plugin warnings)
    turbopack: {},
    transpilePackages: ['@workspace/ui', '@workspace/db'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
            },
        ],
    },
    // Increase body size limit for file uploads (50MB for videos)
    serverExternalPackages: [],
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
}

export default nextConfig
