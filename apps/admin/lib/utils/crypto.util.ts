/**
 * Edge-Compatible Cryptographic Utilities
 *
 * Provides HMAC-SHA256 token signing and verification using Web Crypto API.
 * Compatible with both Node.js and Edge runtime.
 */

/**
 * Token payload structure for admin authentication
 */
export type TokenPayload = {
    prefix: 'admin'
    issuedAt: number // Unix timestamp (ms)
    expiresAt: number // Unix timestamp (ms)
}

/**
 * Encodes a string to base64 using Edge-compatible APIs
 * @param str - String to encode
 * @returns Base64-encoded string
 */
function base64Encode(str: string): string {
    // Use TextEncoder for UTF-8 encoding
    const bytes = new TextEncoder().encode(str)
    // Convert Uint8Array to binary string
    const binaryString = Array.from(bytes, (byte) =>
        String.fromCharCode(byte)
    ).join('')
    // Use btoa for base64 encoding (available in Edge)
    return btoa(binaryString)
}

/**
 * Decodes a base64 string using Edge-compatible APIs
 * @param base64 - Base64-encoded string
 * @returns Decoded string
 */
function base64Decode(base64: string): string {
    try {
        // Use atob for base64 decoding (available in Edge)
        const binaryString = atob(base64)
        // Convert binary string to Uint8Array
        const bytes = Uint8Array.from(binaryString, (char) =>
            char.charCodeAt(0)
        )
        // Use TextDecoder for UTF-8 decoding
        return new TextDecoder().decode(bytes)
    } catch {
        throw new Error('Invalid base64 string')
    }
}

/**
 * Converts an ArrayBuffer to a base64 string
 * @param buffer - ArrayBuffer to convert
 * @returns Base64-encoded string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    const binaryString = Array.from(bytes, (byte) =>
        String.fromCharCode(byte)
    ).join('')
    return btoa(binaryString)
}

/**
 * Converts a base64 string to a Uint8Array (BufferSource for Web Crypto API)
 * @param base64 - Base64-encoded string
 * @returns Uint8Array that can be used with crypto.subtle operations
 */
function base64ToArrayBuffer(base64: string): BufferSource {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
}

/**
 * Creates an HMAC key from a secret string
 * @param secret - Secret key string
 * @returns CryptoKey for HMAC operations
 */
async function importHmacKey(secret: string): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)

    return await crypto.subtle.importKey(
        'raw',
        keyData,
        {
            name: 'HMAC',
            hash: 'SHA-256',
        },
        false,
        ['sign', 'verify']
    )
}

/**
 * Signs a token payload with HMAC-SHA256
 *
 * @param payload - JSON string to sign
 * @param secret - Secret key for HMAC
 * @returns Signed token in format: base64(payload).base64(signature)
 *
 * @example
 * const token = await signToken(
 *   JSON.stringify({ prefix: 'admin', issuedAt: Date.now(), expiresAt: Date.now() + 3600000 }),
 *   'my-secret-key'
 * )
 */
export async function signToken(
    payload: string,
    secret: string
): Promise<string> {
    // Encode payload to base64
    const encodedPayload = base64Encode(payload)

    // Import HMAC key
    const key = await importHmacKey(secret)

    // Sign the encoded payload
    const encoder = new TextEncoder()
    const data = encoder.encode(encodedPayload)
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, data)

    // Convert signature to base64
    const encodedSignature = arrayBufferToBase64(signatureBuffer)

    // Return token in format: payload.signature
    return `${encodedPayload}.${encodedSignature}`
}

/**
 * Verifies and decodes a signed token
 *
 * @param token - Signed token in format: base64(payload).base64(signature)
 * @param secret - Secret key for HMAC verification
 * @returns Decoded token payload, or null if verification fails
 *
 * @example
 * const payload = await verifyToken(cookieValue, 'my-secret-key')
 * if (payload && payload.expiresAt > Date.now()) {
 *   // Token is valid and not expired
 * }
 */
export async function verifyToken(
    token: string,
    secret: string
): Promise<TokenPayload | null> {
    try {
        // Split token into payload and signature
        const parts = token.split('.')
        if (parts.length !== 2) {
            return null
        }

        const [encodedPayload, encodedSignature] = parts

        // Ensure both parts exist
        if (!encodedPayload || !encodedSignature) {
            return null
        }

        // Import HMAC key
        const key = await importHmacKey(secret)

        // Verify signature
        const encoder = new TextEncoder()
        const data = encoder.encode(encodedPayload)
        const signature = base64ToArrayBuffer(encodedSignature)

        const isValid = await crypto.subtle.verify('HMAC', key, signature, data)

        if (!isValid) {
            return null
        }

        // Decode and parse payload
        const payloadString = base64Decode(encodedPayload)
        const payload = JSON.parse(payloadString) as TokenPayload

        // Validate payload structure
        if (
            !payload ||
            typeof payload !== 'object' ||
            payload.prefix !== 'admin' ||
            typeof payload.issuedAt !== 'number' ||
            typeof payload.expiresAt !== 'number'
        ) {
            return null
        }

        return payload
    } catch {
        // Any error in verification process means invalid token
        return null
    }
}
