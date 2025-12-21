import { z } from 'zod'

/**
 * Base pagination schema for cursor-based pagination
 * Used across multiple API endpoints for consistent pagination validation
 */
export const basePaginationSchema = z.object({
    /**
     * Number of items to return per page
     * @default 12
     * @minimum 1
     * @maximum 100
     */
    pageSize: z
        .string()
        .optional()
        .transform((val) => {
            if (!val) return 12
            const parsed = parseInt(val, 10)
            return Math.min(Math.max(parsed, 1), 100)
        }),

    /**
     * Base64 encoded cursor for pagination continuation
     * Format: {publishedAt: string, id: string}
     */
    cursor: z
        .string()
        .optional()
        .transform((val) => {
            if (!val) return null

            try {
                const decoded = JSON.parse(
                    Buffer.from(val, 'base64').toString('utf-8')
                ) as { publishedAt: string; id: string }
                const publishedAtDate = new Date(decoded.publishedAt)

                // Validate that the date is actually valid
                if (isNaN(publishedAtDate.getTime())) {
                    throw new Error('Invalid date in cursor')
                }

                return {
                    publishedAt: publishedAtDate,
                    id: decoded.id,
                }
            } catch {
                throw new Error('Invalid cursor format')
            }
        })
        .nullable(),
})

/**
 * Type inference for base pagination schema
 */
export type BasePaginationInput = z.input<typeof basePaginationSchema>
export type BasePaginationOutput = z.output<typeof basePaginationSchema>
