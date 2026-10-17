/**
 * MCP Authentication
 *
 * The `/api/mcp` endpoint is reached by Claude Code, not a browser, so it
 * carries no admin cookie. It authenticates itself with a static bearer token
 * (`ADMIN_MCP_TOKEN`), compared in constant time like the cron secret.
 *
 * Responses follow RFC 6750 (`WWW-Authenticate: Bearer`) so an MCP client
 * reports "unauthorized" rather than a generic transport error.
 *
 * @module @/lib/mcp/mcp-auth.util
 */
import crypto from 'node:crypto'

/** Constant-time string comparison; pads because timingSafeEqual needs equal lengths. */
export function safeEqual(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a, 'utf8')
    const bBuffer = Buffer.from(b, 'utf8')
    const length = Math.max(aBuffer.length, bBuffer.length)
    const aPadded = Buffer.concat([
        aBuffer,
        Buffer.alloc(length - aBuffer.length),
    ])
    const bPadded = Buffer.concat([
        bBuffer,
        Buffer.alloc(length - bBuffer.length),
    ])
    // The length check runs after the comparison so it adds no timing signal.
    return (
        crypto.timingSafeEqual(aPadded, bPadded) &&
        aBuffer.length === bBuffer.length
    )
}

/**
 * Returns null when the request is authorized; otherwise the response to
 * send. A missing `secret` means the endpoint is off (503), so a deploy
 * without the env var fails closed.
 */
export function verifyMcpRequest(
    request: Request,
    secret: string | undefined
): Response | null {
    if (!secret) {
        return Response.json(
            { error: 'MCP is not configured (ADMIN_MCP_TOKEN is unset)' },
            { status: 503 }
        )
    }

    const header = request.headers.get('authorization')
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null

    if (!token || !safeEqual(token, secret)) {
        return Response.json(
            { error: token ? 'Invalid token' : 'Missing bearer token' },
            {
                status: 401,
                headers: { 'WWW-Authenticate': 'Bearer realm="admin-mcp"' },
            }
        )
    }

    return null
}
