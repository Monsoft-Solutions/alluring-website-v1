#!/usr/bin/env node
/**
 * Google Ads MCP server entry point
 *
 * `@workspace/google-ads` reads process.env per request rather than at import,
 * so loading the env files before serving is all the ordering it needs.
 *
 * @module @workspace/mcp-google-ads
 */
import { serveStdio } from '@modelcontextprotocol/server/stdio'

import { loadEnv } from './load-env.util.js'
import { createServer } from './server.js'

loadEnv()

serveStdio(() => createServer())
