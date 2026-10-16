/**
 * Admin MCP endpoint (issue #343)
 *
 * Streamable HTTP MCP server for Claude Code: blog post read/edit/create
 * tools from `@/lib/mcp/server`. Stateless — `createMcpHandler` builds a
 * fresh server per request — so it runs as an ordinary Vercel function.
 *
 * Auth: `Authorization: Bearer <ADMIN_MCP_TOKEN>`. The cookie middleware
 * skips this path (see middleware.ts); the check here is the only gate.
 *
 *   claude mcp add --transport http alluring-admin https://<admin-host>/api/mcp \
 *       --header "Authorization: Bearer $ADMIN_MCP_TOKEN"
 */
import { createMcpHandler } from '@modelcontextprotocol/server'

import { env } from '@/env'
import { verifyMcpRequest } from '@/lib/mcp/mcp-auth.util'
import { createServer } from '@/lib/mcp/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const handler = createMcpHandler(() => createServer(), {
    onerror: (error) => console.error('[MCP]', error),
})

async function serve(request: Request): Promise<Response> {
    const rejected = verifyMcpRequest(request, env.ADMIN_MCP_TOKEN)
    if (rejected) return rejected
    return handler.fetch(request)
}

export { serve as GET, serve as POST, serve as DELETE }
