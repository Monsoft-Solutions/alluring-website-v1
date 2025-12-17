#!/usr/bin/env node

/**
 * Wrapper script to load environment variables before running the TypeScript implementation
 * This is necessary because ESM imports are hoisted and execute before top-level code
 */

const path = require('path')
const dotenv = require('dotenv')

// Load .env.local from apps/web directory
const localEnvPath = path.join(__dirname, '../.env.local')
console.log('📁 Loading environment from:', localEnvPath)

const result = dotenv.config({ path: localEnvPath })
if (result.error) {
    console.warn(
        '⚠️  Warning: Could not load .env.local:',
        result.error.message
    )
    console.warn(
        '⚠️  The script will continue but may fail if environment variables are missing'
    )
} else {
    console.log('✅ Loaded .env.local successfully')
}

// Verify critical environment variables are loaded
const criticalVars = [
    'POSTGRES_URL',
    'BLOG_API_KEY',
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
]

const missingVars = criticalVars.filter((varName) => !process.env[varName])

if (missingVars.length > 0) {
    console.error('❌ Missing critical environment variables:', missingVars)
    console.error(
        'Please ensure .env.local exists in apps/web/ and contains all required variables'
    )
    process.exit(1)
}

// Now run tsx with the implementation file
const { spawn } = require('child_process')

const implPath = path.join(__dirname, 'update-google-index-impl.ts')

console.log('🚀 Starting Google indexing script...\n')

// Use tsx from PATH (globally installed or in node_modules)
const child = spawn('tsx', [implPath], {
    stdio: 'inherit',
    env: process.env,
    shell: true, // Use shell to resolve tsx from PATH
})

child.on('exit', (code) => {
    process.exit(code || 0)
})

child.on('error', (error) => {
    console.error('❌ Failed to start tsx:', error.message)
    console.error('Please ensure tsx is installed: pnpm add -D tsx')
    process.exit(1)
})
