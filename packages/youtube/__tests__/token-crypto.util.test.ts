import { afterEach, describe, expect, it, vi } from 'vitest'

import {
    decryptToken,
    encryptToken,
    generateEncryptionKey,
} from '../src/token-crypto.util'

describe('token crypto', () => {
    afterEach(() => vi.unstubAllEnvs())

    it('round-trips a token under the environment key', () => {
        vi.stubEnv('YOUTUBE_TOKEN_ENCRYPTION_KEY', generateEncryptionKey())
        const stored = encryptToken('1//refresh-token')
        expect(stored).toMatch(/^v1\.[\w-]+\.[\w-]+\.[\w-]+$/)
        expect(stored).not.toContain('refresh-token')
        expect(decryptToken(stored)).toBe('1//refresh-token')
    })

    it('uses a fresh IV, so the same token encrypts differently each time', () => {
        const key = generateEncryptionKey()
        expect(encryptToken('same', key)).not.toBe(encryptToken('same', key))
    })

    it('refuses a value encrypted under another key', () => {
        const stored = encryptToken('secret', generateEncryptionKey())
        expect(() => decryptToken(stored, generateEncryptionKey())).toThrow()
    })

    it('refuses a tampered ciphertext', () => {
        const key = generateEncryptionKey()
        const [v, iv, tag, data] = encryptToken('secret', key).split('.')
        const flipped = (data![0] === 'A' ? 'B' : 'A') + data!.slice(1)
        expect(() =>
            decryptToken([v, iv, tag, flipped].join('.'), key)
        ).toThrow()
    })

    it('names the missing variable', () => {
        vi.stubEnv('YOUTUBE_TOKEN_ENCRYPTION_KEY', '')
        expect(() => encryptToken('x')).toThrow(/YOUTUBE_TOKEN_ENCRYPTION_KEY/)
    })

    it('rejects a key of the wrong length', () => {
        const short = Buffer.alloc(16).toString('base64')
        expect(() => encryptToken('x', short)).toThrow(/32 bytes/)
    })
})
