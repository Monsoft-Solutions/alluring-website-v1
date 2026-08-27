#!/usr/bin/env node
/**
 * Search Console MCP server entry point
 *
 * Credentials must be in process.env before the service layer is imported —
 * `@workspace/seo`'s env module snapshots process.env when it evaluates — so
 * the server module is pulled in dynamically after loadEnv().
 *
 * @module @workspace/mcp-gsc
 */
import { serveStdio } from '@modelcontextprotocol/server/stdio'

import { loadEnv } from './load-env.util.js'

loadEnv()

const { createServer } = await import('./server.js')

serveStdio(() => createServer())
