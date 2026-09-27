/**
 * YouTube test upload (epic #303, step 1)
 *
 * Uploads one video from a URL to the connected channel as PRIVATE, using
 * the token stored by Connect YouTube. Proves the connection and the
 * resumable upload end to end before anything else is built on them.
 * Runs against whatever database the local env points at.
 *
 * Usage:
 *   pnpm --filter admin youtube:test-upload -- <video-url>
 *   pnpm --filter admin youtube:test-upload -- <video-url> --title "My test"
 */
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

function argValue(flag: string): string | undefined {
    const index = process.argv.indexOf(flag)
    return index >= 0 ? process.argv[index + 1] : undefined
}

async function main() {
    const sourceUrl = process.argv
        .slice(2)
        .find((arg) => /^https?:\/\//.test(arg))
    if (!sourceUrl) {
        console.error(
            'Usage: pnpm --filter admin youtube:test-upload -- <video-url> [--title "…"]'
        )
        process.exit(1)
    }

    // Imported after dotenv so @workspace/db reads the right POSTGRES_URL.
    const { uploadVideoFromUrl } = await import('@workspace/youtube')
    const { getYouTubeAccessToken } = await import(
        '../lib/services/youtube/youtube-connection.service'
    )

    const { accessToken, connection } = await getYouTubeAccessToken()
    console.log(
        `Uploading to ${connection.channelTitle} (${connection.channelHandle ?? connection.channelId}) as PRIVATE…`
    )

    const started = Date.now()
    const video = await uploadVideoFromUrl(accessToken, {
        sourceUrl,
        metadata: {
            title:
                argValue('--title') ??
                `Admin upload test ${new Date().toISOString().slice(0, 16)}`,
            description:
                'Private test upload from the Alluring admin. Safe to delete.',
            tags: ['test'],
            privacyStatus: 'private',
        },
        onSession: () =>
            console.log('Upload session opened; sending the file…'),
    })

    console.log(
        `Done in ${Math.round((Date.now() - started) / 1000)}s: ${video.videoId} (${video.privacyStatus}, ${video.uploadStatus})`
    )
    console.log(
        `Studio: https://studio.youtube.com/video/${video.videoId}/edit`
    )
    process.exit(0)
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
})
