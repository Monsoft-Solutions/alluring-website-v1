/**
 * API Route Error Handler Utilities
 *
 * Provides centralized error handling for Next.js API routes.
 * Handles authentication errors and other exceptions consistently.
 */

import { NextResponse } from 'next/server'

import { UnauthorizedError } from './auth.util'

/**
 * Handle errors in API route handlers.
 * Returns appropriate NextResponse based on error type.
 *
 * @param error - The error to handle
 * @param defaultMessage - Default error message for 500 responses
 * @param logPrefix - Optional prefix for console.error logging
 * @returns NextResponse with appropriate status code and error message
 *
 * @example
 * ```ts
 * export async function GET() {
 *   try {
 *     await requireAuth()
 *     const data = await fetchData()
 *     return NextResponse.json(data)
 *   } catch (error) {
 *     return handleApiError(error, 'Failed to fetch data', 'Error fetching data:')
 *   }
 * }
 * ```
 */
export function handleApiError(
    error: unknown,
    defaultMessage: string,
    logPrefix?: string
): NextResponse {
    if (error instanceof UnauthorizedError) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        )
    }

    const errorMessage = logPrefix || defaultMessage
    console.error(errorMessage, error)

    return NextResponse.json(
        { success: false, error: defaultMessage },
        { status: 500 }
    )
}
