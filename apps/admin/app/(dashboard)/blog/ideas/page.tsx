import { redirect } from 'next/navigation'

/**
 * Blog Ideas Page - Redirects to Pipeline
 *
 * The Ideas functionality has been consolidated into the unified
 * Content Pipeline. This redirect ensures backward compatibility
 * for any existing links or bookmarks.
 */
export default function BlogIdeasPage() {
    redirect('/blog/pipeline')
}
