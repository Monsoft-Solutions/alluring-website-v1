import { put, del } from '@vercel/blob'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { env } from '@/env'

const AUTH_COOKIE_NAME = 'admin-auth'

/**
 * Validates admin authentication by checking for the auth cookie
 * @returns true if authenticated, false otherwise
 */
async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get(AUTH_COOKIE_NAME)
    return !!authCookie?.value
}

/**
 * Route segment config for handling large file uploads
 */
export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Allowed MIME types for uploads
 */
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]

/**
 * File size limits in bytes
 */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

type UploadResponse = {
    success: true
    url: string
    filename: string
}

type ErrorResponse = {
    success: false
    error: string
}

type BlobGenerateTokenResponse = {
    type: 'blob.generate-client-token'
    clientToken: string
}

type BlobUploadCompletedResponse = {
    type: 'blob.upload-completed'
    response: 'ok'
}

/**
 * POST /api/upload
 * Handle file uploads using Vercel Blob's handleUpload for client uploads
 * Also supports direct server uploads for smaller files
 */
export async function POST(
    request: NextRequest
): Promise<
    NextResponse<
        | UploadResponse
        | ErrorResponse
        | BlobGenerateTokenResponse
        | BlobUploadCompletedResponse
    >
> {
    // Check authentication
    const authenticated = await isAuthenticated()
    if (!authenticated) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        )
    }

    const contentType = request.headers.get('content-type') || ''

    // Handle client-side upload token request (JSON body)
    if (contentType.includes('application/json')) {
        try {
            const body = (await request.json()) as HandleUploadBody

            const jsonResponse = (await handleUpload({
                body,
                request,
                // eslint-disable-next-line @typescript-eslint/require-await
                onBeforeGenerateToken: async (pathname) => {
                    // Validate file type from pathname
                    const extension = pathname.split('.').pop()?.toLowerCase()
                    const mimeMap: Record<string, string> = {
                        jpg: 'image/jpeg',
                        jpeg: 'image/jpeg',
                        png: 'image/png',
                        webp: 'image/webp',
                        gif: 'image/gif',
                        mp4: 'video/mp4',
                        webm: 'video/webm',
                    }

                    const mimeType = extension ? mimeMap[extension] : null
                    if (!mimeType || !ALLOWED_TYPES.includes(mimeType)) {
                        throw new Error(`Invalid file type: ${extension}`)
                    }

                    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType)
                    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE

                    return {
                        allowedContentTypes: ALLOWED_TYPES,
                        maximumSizeInBytes: maxSize,
                        tokenPayload: JSON.stringify({
                            pathname,
                        }),
                    }
                },
                // eslint-disable-next-line @typescript-eslint/require-await
                onUploadCompleted: async ({ blob }) => {
                    console.log('Upload completed:', blob.url)
                },
            })) as BlobGenerateTokenResponse | BlobUploadCompletedResponse

            return NextResponse.json(jsonResponse)
        } catch (error) {
            console.error('Client upload error:', error)
            return NextResponse.json(
                {
                    success: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Upload failed',
                },
                { status: 500 }
            )
        }
    }

    // Handle direct multipart/form-data upload (for smaller files)
    if (contentType.includes('multipart/form-data')) {
        try {
            let formData: FormData
            try {
                formData = await request.formData()
            } catch (parseError) {
                console.error('FormData parse error:', parseError)
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Failed to parse form data. For large files, try refreshing the page.',
                    },
                    { status: 400 }
                )
            }

            const file = formData.get('file') as File | null
            const folder = (formData.get('folder') as string) || 'uploads'

            if (!file) {
                return NextResponse.json(
                    { success: false, error: 'No file provided' },
                    { status: 400 }
                )
            }

            // Validate file type
            const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
            const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

            if (!isImage && !isVideo) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}`,
                    },
                    { status: 400 }
                )
            }

            // Validate file size
            const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
            if (file.size > maxSize) {
                const maxSizeMB = maxSize / (1024 * 1024)
                return NextResponse.json(
                    {
                        success: false,
                        error: `File too large. Maximum size is ${maxSizeMB}MB`,
                    },
                    { status: 400 }
                )
            }

            // Generate unique filename
            const extension = file.name.split('.').pop() || 'bin'
            const timestamp = Date.now()
            const randomStr = Math.random().toString(36).substring(2, 8)
            const sanitizedName = file.name
                .replace(/\.[^/.]+$/, '')
                .replace(/[^a-zA-Z0-9-_]/g, '-')
                .substring(0, 50)
            const filename = `${folder}/${sanitizedName}-${timestamp}-${randomStr}.${extension}`

            // Upload to Vercel Blob
            const blob = await put(filename, file, {
                access: 'public',
                token: env.BLOB_READ_WRITE_TOKEN,
            })

            return NextResponse.json({
                success: true,
                url: blob.url,
                filename: filename,
            })
        } catch (error) {
            console.error('Upload error:', error)
            return NextResponse.json(
                {
                    success: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Failed to upload file',
                },
                { status: 500 }
            )
        }
    }

    return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
    )
}

/**
 * DELETE /api/upload
 * Delete a file from Vercel Blob storage
 * Requires admin authentication
 */
export async function DELETE(
    request: NextRequest
): Promise<NextResponse<{ success: boolean; error?: string }>> {
    try {
        // Validate admin authentication
        const authenticated = await isAuthenticated()
        if (!authenticated) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized - Admin authentication required',
                },
                { status: 401 }
            )
        }

        const body: unknown = await request.json()
        const { url } = body as { url: string }

        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { success: false, error: 'No URL provided' },
                { status: 400 }
            )
        }

        if (!url.includes('blob.vercel-storage.com')) {
            return NextResponse.json(
                { success: false, error: 'Invalid blob URL' },
                { status: 400 }
            )
        }

        await del(url, { token: env.BLOB_READ_WRITE_TOKEN })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete error:', error)
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to delete file',
            },
            { status: 500 }
        )
    }
}
