/**
 * Open Graph image for the Dr. Victoria Karlinsky landing page.
 *
 * Composes the doctor's portrait into a 1200×630 frame with brand
 * chrome so previews on Instagram, WhatsApp, iMessage, and Twitter
 * land correctly cropped instead of getting letterboxed from the
 * native portrait aspect ratio.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export const alt =
    'Dr. Victoria Karlinsky · Triple Board-Certified Miami Cosmetic Surgeon'

export const size = { width: 1200, height: 630 } as const

export const contentType = 'image/png'

/**
 * Reads the portrait file from /public so it works in both dev and
 * production Node.js runtimes (the `new URL('./file', import.meta.url)`
 * pattern doesn't reliably resolve under Next.js's compiled output).
 */
function loadPortrait(): string | null {
    try {
        const file = path.join(
            process.cwd(),
            'public',
            'images',
            'surgeons',
            'dr-karlinsky-og.png'
        )
        const buffer = readFileSync(file)
        return `data:image/png;base64,${buffer.toString('base64')}`
    } catch (err) {
        console.error('[og] portrait read failed:', err)
        return null
    }
}

export default function OpenGraphImage() {
    const portraitSrc = loadPortrait()

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    backgroundColor: '#0c0a09',
                    position: 'relative',
                }}
            >
                {/* Portrait — left side */}
                <div
                    style={{
                        width: 540,
                        height: 630,
                        display: 'flex',
                        position: 'relative',
                    }}
                >
                    {portraitSrc ? (
                        <img
                            src={portraitSrc}
                            alt='Dr. Victoria Karlinsky'
                            width={540}
                            height={630}
                            style={{
                                width: 540,
                                height: 630,
                                objectFit: 'cover',
                                objectPosition: 'top',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 540,
                                height: 630,
                                display: 'flex',
                                backgroundColor: '#1c1917',
                            }}
                        />
                    )}
                    {/* Right-edge fade so portrait blends into dark canvas */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 220,
                            height: 630,
                            display: 'flex',
                            backgroundImage:
                                'linear-gradient(to right, rgba(12,10,9,0) 0%, rgba(12,10,9,0.92) 70%, rgba(12,10,9,1) 100%)',
                        }}
                    />
                </div>

                {/* Right column — text */}
                <div
                    style={{
                        flex: 1,
                        height: 630,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '64px 72px 64px 24px',
                    }}
                >
                    {/* Eyebrow */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            marginBottom: 32,
                        }}
                    >
                        <div
                            style={{
                                width: 10,
                                height: 10,
                                display: 'flex',
                                borderRadius: 9999,
                                backgroundColor: '#d4af37',
                            }}
                        />
                        <div
                            style={{
                                display: 'flex',
                                fontSize: 20,
                                color: '#fcd34d',
                                letterSpacing: 4,
                                textTransform: 'uppercase',
                                fontWeight: 600,
                            }}
                        >
                            Miami, FL · Now Booking
                        </div>
                    </div>

                    {/* Headline */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            color: '#ffffff',
                            fontSize: 76,
                            lineHeight: 1.05,
                            fontWeight: 500,
                        }}
                    >
                        <div style={{ display: 'flex' }}>Dr. Victoria</div>
                        <div
                            style={{
                                display: 'flex',
                                color: '#fcd34d',
                                fontStyle: 'italic',
                            }}
                        >
                            Karlinsky
                        </div>
                    </div>

                    {/* Sub */}
                    <div
                        style={{
                            display: 'flex',
                            marginTop: 28,
                            fontSize: 28,
                            color: '#d6d3d1',
                            fontWeight: 400,
                        }}
                    >
                        Triple Board-Certified · FACS Fellow
                    </div>

                    {/* CTA pill */}
                    <div style={{ marginTop: 44, display: 'flex' }}>
                        <div
                            style={{
                                display: 'flex',
                                backgroundColor: '#d4af37',
                                color: '#0c0a09',
                                fontWeight: 700,
                                fontSize: 22,
                                letterSpacing: 2,
                                textTransform: 'uppercase',
                                padding: '14px 28px',
                                borderRadius: 9999,
                            }}
                        >
                            Book a Free Consultation
                        </div>
                    </div>

                    {/* Brand footer */}
                    <div
                        style={{
                            marginTop: 'auto',
                            display: 'flex',
                            fontSize: 18,
                            color: '#a8a29e',
                            letterSpacing: 3,
                            textTransform: 'uppercase',
                            fontWeight: 600,
                        }}
                    >
                        Alluring Plastic Surgery · Miami
                    </div>
                </div>
            </div>
        ),
        { ...size }
    )
}
