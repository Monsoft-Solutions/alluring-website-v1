/**
 * Refresh-token encryption
 *
 * The refresh token can upload to the channel for as long as it lives, so
 * the database only ever sees it encrypted: AES-256-GCM with a key that
 * stays in the environment. A database dump alone can't reach the channel.
 *
 * Format: `v1.<iv>.<auth tag>.<ciphertext>`, each part base64url.
 *
 * @module @workspace/youtube — token crypto
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

import { readYouTubeEnv } from './env.js'
import { YouTubeNotConfiguredError } from './youtube-error.util.js'

const VERSION = 'v1'
const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 12
const KEY_BYTES = 32

/** A fresh key for YOUTUBE_TOKEN_ENCRYPTION_KEY. */
export function generateEncryptionKey(): string {
    return randomBytes(KEY_BYTES).toString('base64')
}

/** Decode and length-check a base64 key. */
function parseKey(key: string): Buffer {
    const bytes = Buffer.from(key, 'base64')
    if (bytes.length !== KEY_BYTES) {
        throw new Error(
            `YOUTUBE_TOKEN_ENCRYPTION_KEY must be ${KEY_BYTES} bytes of base64 (got ${bytes.length})`
        )
    }
    return bytes
}

/** The key from the environment, or a clear error naming the variable. */
function keyFromEnv(): Buffer {
    const key = readYouTubeEnv().YOUTUBE_TOKEN_ENCRYPTION_KEY
    if (!key)
        throw new YouTubeNotConfiguredError(['YOUTUBE_TOKEN_ENCRYPTION_KEY'])
    return parseKey(key)
}

/** Encrypt a secret for storage. `key` defaults to the environment's. */
export function encryptToken(plaintext: string, key?: string): string {
    const keyBytes = key ? parseKey(key) : keyFromEnv()
    const iv = randomBytes(IV_BYTES)
    const cipher = createCipheriv(ALGORITHM, keyBytes, iv)
    const ciphertext = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ])
    const tag = cipher.getAuthTag()
    return [
        VERSION,
        iv.toString('base64url'),
        tag.toString('base64url'),
        ciphertext.toString('base64url'),
    ].join('.')
}

/**
 * Decrypt a stored secret. Throws when the value was tampered with or was
 * encrypted under a different key.
 */
export function decryptToken(stored: string, key?: string): string {
    const keyBytes = key ? parseKey(key) : keyFromEnv()
    const parts = stored.split('.')
    if (parts.length !== 4 || parts[0] !== VERSION) {
        throw new Error('Unrecognized encrypted token format')
    }
    const [, iv, tag, ciphertext] = parts as [string, string, string, string]
    const decipher = createDecipheriv(
        ALGORITHM,
        keyBytes,
        Buffer.from(iv, 'base64url')
    )
    decipher.setAuthTag(Buffer.from(tag, 'base64url'))
    return Buffer.concat([
        decipher.update(Buffer.from(ciphertext, 'base64url')),
        decipher.final(),
    ]).toString('utf8')
}
