/**
 * Open Graph image for Melissa Juvier's page.
 *
 * Her link travels mostly through DMs and bio links, where the preview card
 * is the first impression — so it is her face, her name and the one thing
 * the link offers, composed to 1200×630 rather than letterboxed from the
 * portrait. Bilingual, because the same link is shared in both languages.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export const alt =
    'Melissa Juvier, patient coordinator at Alluring Plastic Surgery, Miami'

export const size = { width: 1200, height: 630 } as const

export const contentType = 'image/png'

/** Read from /public so it resolves in dev and in the compiled output alike. */
function loadPortrait(): string | null {
    try {
        const file = path.join(
            process.cwd(),
            'public',
            'images',
            'team',
            'melissa-juvier-og.jpg'
        )
        return `data:image/jpeg;base64,${readFileSync(file).toString('base64')}`
    } catch (err) {
        console.error('[og] melissa portrait read failed:', err)
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
                    backgroundColor: '#0d0a08',
                    backgroundImage:
                        'radial-gradient(ellipse at 100% 0%, rgba(216,189,126,0.22), rgba(13,10,9,0) 60%)',
                }}
            >
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
                            alt='Melissa Juvier'
                            width={540}
                            height={630}
                            style={{
                                width: 540,
                                height: 630,
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 540,
                                height: 630,
                                display: 'flex',
                                backgroundColor: '#1d1713',
                            }}
                        />
                    )}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 200,
                            height: 630,
                            display: 'flex',
                            backgroundImage:
                                'linear-gradient(to right, rgba(13,10,8,0) 0%, rgba(13,10,8,0.9) 75%, rgba(13,10,8,1) 100%)',
                        }}
                    />
                </div>

                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '56px 64px 56px 28px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            marginBottom: 26,
                            fontSize: 19,
                            color: '#d8bd7e',
                            letterSpacing: 4,
                            textTransform: 'uppercase',
                            fontWeight: 600,
                        }}
                    >
                        <div
                            style={{
                                width: 10,
                                height: 10,
                                display: 'flex',
                                borderRadius: 9999,
                                backgroundColor: '#d8bd7e',
                            }}
                        />
                        Patient coordinator · Miami
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            fontSize: 40,
                            color: '#e9dfcf',
                            fontStyle: 'italic',
                        }}
                    >
                        Hi, I’m
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 104,
                            lineHeight: 1,
                            color: '#f1dfae',
                            fontStyle: 'italic',
                        }}
                    >
                        Melissa.
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            marginTop: 26,
                            fontSize: 28,
                            lineHeight: 1.35,
                            color: '#d6cbbd',
                        }}
                    >
                        Your person at Alluring, from your first question to
                        your last follow-up.
                    </div>

                    <div style={{ marginTop: 36, display: 'flex' }}>
                        <div
                            style={{
                                display: 'flex',
                                backgroundImage:
                                    'linear-gradient(135deg, #f4e2ad, #b8944f)',
                                color: '#1a1209',
                                fontWeight: 700,
                                fontSize: 22,
                                letterSpacing: 1,
                                padding: '14px 30px',
                                borderRadius: 9999,
                            }}
                        >
                            Message me · Escríbeme
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop: 'auto',
                            display: 'flex',
                            fontSize: 17,
                            color: '#a79c90',
                            letterSpacing: 3,
                            textTransform: 'uppercase',
                            fontWeight: 600,
                        }}
                    >
                        Alluring Plastic Surgery · Free consultation
                    </div>
                </div>
            </div>
        ),
        { ...size }
    )
}
