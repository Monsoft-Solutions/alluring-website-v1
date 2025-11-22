export default {
    // Format with Prettier (runs on staged files only)
    '**/*.{js,jsx,ts,tsx,json,css,scss,md,mdx,yml,yaml}': ['prettier --write'],

    // Lint and auto-fix TypeScript/JavaScript files in web app (staged files only)
    'apps/web/**/*.{js,jsx,ts,tsx}': (filenames) => {
        // Convert paths to relative paths from apps/web directory
        // lint-staged passes paths relative to git root (e.g., apps/web/app/page.tsx)
        const relativeFiles = filenames
            .map((file) => {
                // Handle both relative (apps/web/...) and absolute paths
                const normalized = file.replace(/^.*\/apps\/web\//, '')
                return normalized
            })
            .join(' ')
        return `cd apps/web && pnpm next lint --fix --file ${relativeFiles}`
    },
}
