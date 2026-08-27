import { createJiti } from 'jiti'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import workflowNext from 'workflow/next'

const { withWorkflow } = workflowNext

const jiti = createJiti(fileURLToPath(import.meta.url))

// Import env here to validate during build
jiti('./env')

const appDir = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
        // The monorepo root, stated rather than inferred — see the matching
        // setting in apps/web/next.config.mjs for why the inference goes wrong.
        root: join(appDir, '..', '..'),
    },
    transpilePackages: ['@workspace/ui', '@workspace/db'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
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

export default withWorkflow(nextConfig)
