import { env } from '@/env'

/**
 * Check if crawling is allowed
 * Defaults to false (block crawling) if not explicitly set to 'true'
 */
export function isCrawlingAllowed(): boolean {
    return env.NEXT_PUBLIC_ALLOW_CRAWLING === 'true'
}
