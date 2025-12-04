import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url'

const jiti = createJiti(fileURLToPath(import.meta.url))

// Import env here to validate during build
jiti('./env')

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@workspace/ui', '@workspace/db'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
            },
        ],
    },
}

export default nextConfig

