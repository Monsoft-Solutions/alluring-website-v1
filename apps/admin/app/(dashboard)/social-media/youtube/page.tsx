/**
 * YouTube Page (epic #303, step 1)
 *
 * Connect the Alluring channel, see who connected it and when, and a live
 * read of the latest uploads that proves the connection works.
 *
 * @module app/(dashboard)/social-media/youtube/page
 */
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@workspace/ui/components/alert'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import {
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    Lock,
    PlugZap,
    RefreshCw,
    TriangleAlert,
    Youtube,
} from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'

import { YouTubeDisconnectButton } from '@/components/social-media/youtube/youtube-disconnect-button.component'
import {
    YOUTUBE_CHANNEL_HANDLE,
    YOUTUBE_OAUTH_START_PATH,
    youtubeRedirectUri,
} from '@/lib/constants/youtube.constant'
import { getYouTubeOverview } from '@/lib/queries/youtube.query'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

type SearchParams = Promise<{
    success?: string
    error?: string
    message?: string
}>

/** Banner text for each result the callback can send back. */
function resultBanner(params: Awaited<SearchParams>): {
    tone: 'success' | 'error'
    title: string
    text: string
} | null {
    const detail = params.message ?? ''
    if (params.success === 'connected') {
        return {
            tone: 'success',
            title: 'YouTube connected',
            text: `The admin can now manage ${YOUTUBE_CHANNEL_HANDLE}.`,
        }
    }
    const errors: Record<string, [string, string]> = {
        not_configured: [
            'YouTube isn’t set up on this server',
            'Add YOUTUBE_OAUTH_CLIENT_ID, YOUTUBE_OAUTH_CLIENT_SECRET and YOUTUBE_TOKEN_ENCRYPTION_KEY to the admin environment, then try again.',
        ],
        cancelled: [
            'Nothing was connected',
            'You cancelled on Google’s screen.',
        ],
        oauth_failed: ['Google returned an error', detail],
        state_mismatch: [
            'The sign-in expired',
            'It took longer than 10 minutes or finished in another tab. Click Connect YouTube again.',
        ],
        no_code: [
            'Google didn’t finish the sign-in',
            'Click Connect YouTube again.',
        ],
        no_refresh_token: [
            'Google didn’t return a lasting token',
            'Remove the app under Google Account → Security → Third-party access, then connect again.',
        ],
        no_channel: [
            'That account has no YouTube channel',
            'Click Connect YouTube again and choose Alluring Plastic Surgery in Google’s channel chooser.',
        ],
        wrong_channel: [
            'Wrong channel',
            `You picked ${detail}. Only ${YOUTUBE_CHANNEL_HANDLE} can be connected. Click Connect YouTube again and choose it.`,
        ],
        connect_failed: ['Connecting failed', detail],
    }
    const entry = params.error ? errors[params.error] : undefined
    if (params.error) {
        return {
            tone: 'error',
            title: entry?.[0] ?? 'Connecting failed',
            text: entry?.[1] || detail || params.error,
        }
    }
    return null
}

function formatCount(value: number | null | undefined): string {
    return value == null ? '—' : value.toLocaleString('en-US')
}

function formatDate(value: Date | string | null | undefined): string {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export default async function YouTubePage({
    searchParams,
}: {
    searchParams: SearchParams
}) {
    const [params, overview, headerList] = await Promise.all([
        searchParams,
        getYouTubeOverview(),
        headers(),
    ])
    const banner = resultBanner(params)
    const { configured, connection, channel, videos, liveError } = overview

    const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
    const proto =
        headerList.get('x-forwarded-proto') ??
        (host?.startsWith('localhost') ? 'http' : 'https')
    const redirectUri = host ? youtubeRedirectUri(`${proto}://${host}`) : null

    const needsReconnect = connection?.status === 'needs_reconnect'

    return (
        <div className='space-y-6'>
            <div className='flex items-center gap-4'>
                <Button asChild variant='ghost' size='icon'>
                    <Link
                        href='/social-media'
                        aria-label='Back to Social Media'
                    >
                        <ArrowLeft className='h-4 w-4' />
                    </Link>
                </Button>
                <div>
                    <h1 className='text-2xl font-semibold'>YouTube</h1>
                    <p className='text-muted-foreground'>
                        The channel the admin publishes to
                    </p>
                </div>
            </div>

            {banner && (
                <Alert
                    variant={
                        banner.tone === 'error' ? 'destructive' : 'default'
                    }
                >
                    {banner.tone === 'error' ? (
                        <TriangleAlert className='h-4 w-4' />
                    ) : (
                        <CheckCircle2 className='h-4 w-4' />
                    )}
                    <AlertTitle>{banner.title}</AlertTitle>
                    <AlertDescription>{banner.text}</AlertDescription>
                </Alert>
            )}

            {!configured && (
                <Card>
                    <CardHeader>
                        <CardTitle>Finish the Google setup first</CardTitle>
                        <CardDescription>
                            The admin needs its own OAuth client from Google
                            Cloud project vernisai-1739236652392.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-3 text-sm'>
                        <p>Add these to the admin environment:</p>
                        <ul className='list-disc space-y-1 pl-5 font-mono text-xs'>
                            <li>YOUTUBE_OAUTH_CLIENT_ID</li>
                            <li>YOUTUBE_OAUTH_CLIENT_SECRET</li>
                            <li>YOUTUBE_TOKEN_ENCRYPTION_KEY</li>
                        </ul>
                        {redirectUri && (
                            <p>
                                Register this redirect URI on the OAuth client:{' '}
                                <code className='bg-muted rounded px-1.5 py-0.5 text-xs'>
                                    {redirectUri}
                                </code>
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className='flex flex-wrap items-center justify-between gap-4'>
                        <div className='flex items-center gap-3'>
                            {connection?.channelThumbnailUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={connection.channelThumbnailUrl}
                                    alt=''
                                    className='h-10 w-10 rounded-full object-cover'
                                />
                            ) : (
                                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-red-600'>
                                    <Youtube className='h-5 w-5 text-white' />
                                </div>
                            )}
                            <div>
                                <CardTitle>
                                    {connection?.channelTitle ??
                                        'Not connected'}
                                </CardTitle>
                                <CardDescription>
                                    {connection
                                        ? (connection.channelHandle ??
                                          connection.channelId)
                                        : `Connect ${YOUTUBE_CHANNEL_HANDLE} to manage it from here`}
                                </CardDescription>
                            </div>
                        </div>
                        {connection && (
                            <Badge
                                variant={
                                    needsReconnect ? 'destructive' : 'success'
                                }
                            >
                                {needsReconnect
                                    ? 'Needs reconnect'
                                    : 'Connected'}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className='space-y-5'>
                    {needsReconnect && (
                        <Alert variant='destructive'>
                            <TriangleAlert className='h-4 w-4' />
                            <AlertTitle>
                                Google stopped accepting the connection
                            </AlertTitle>
                            <AlertDescription>
                                <p>
                                    Nothing will publish until someone clicks
                                    Reconnect. This happens when the password
                                    changes, the manager role is removed, or
                                    access is revoked.
                                </p>
                                {connection?.lastError && (
                                    <p className='font-mono text-xs'>
                                        Google said: {connection.lastError}
                                    </p>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {connection && (
                        <dl className='grid grid-cols-2 gap-4 text-sm lg:grid-cols-4'>
                            {channel && (
                                <>
                                    <div className='rounded-lg border p-3'>
                                        <dt className='text-muted-foreground'>
                                            Subscribers
                                        </dt>
                                        <dd className='mt-1 text-xl font-semibold tabular-nums'>
                                            {formatCount(
                                                channel.subscriberCount
                                            )}
                                        </dd>
                                    </div>
                                    <div className='rounded-lg border p-3'>
                                        <dt className='text-muted-foreground'>
                                            Videos
                                        </dt>
                                        <dd className='mt-1 text-xl font-semibold tabular-nums'>
                                            {formatCount(channel.videoCount)}
                                        </dd>
                                    </div>
                                </>
                            )}
                            <div className='rounded-lg border p-3'>
                                <dt className='text-muted-foreground'>
                                    Connected by
                                </dt>
                                <dd className='mt-1 font-medium break-all'>
                                    {connection.connectedEmail ?? '—'}
                                </dd>
                            </div>
                            <div className='rounded-lg border p-3'>
                                <dt className='text-muted-foreground'>
                                    Connected on
                                </dt>
                                <dd className='mt-1 font-medium'>
                                    {formatDate(connection.connectedAt)}
                                </dd>
                            </div>
                        </dl>
                    )}

                    {liveError && !needsReconnect && (
                        <p className='text-destructive text-sm'>
                            Couldn’t read the channel just now: {liveError}
                        </p>
                    )}

                    <div className='flex flex-wrap items-center gap-3'>
                        {configured && (
                            <Button
                                asChild
                                variant={connection ? 'outline' : 'default'}
                            >
                                {/* A plain link: the route redirects to Google. */}
                                <a href={YOUTUBE_OAUTH_START_PATH}>
                                    {connection ? (
                                        <RefreshCw className='mr-2 h-4 w-4' />
                                    ) : (
                                        <PlugZap className='mr-2 h-4 w-4' />
                                    )}
                                    {connection
                                        ? 'Reconnect'
                                        : 'Connect YouTube'}
                                </a>
                            </Button>
                        )}
                        {connection && (
                            <YouTubeDisconnectButton
                                channelTitle={connection.channelTitle}
                            />
                        )}
                    </div>

                    {!connection && configured && (
                        <p className='text-muted-foreground text-sm'>
                            Sign in with a Google account that manages the
                            channel. When Google asks which account or channel
                            to use, pick{' '}
                            <strong>Alluring Plastic Surgery</strong>, not your
                            personal one.
                        </p>
                    )}
                </CardContent>
            </Card>

            {connection && !needsReconnect && (
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>
                            Latest uploads
                        </CardTitle>
                        <CardDescription>
                            Read live from YouTube, private videos included
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {videos.length === 0 ? (
                            <p className='text-muted-foreground text-sm'>
                                {liveError
                                    ? 'Unavailable right now.'
                                    : 'No uploads yet.'}
                            </p>
                        ) : (
                            <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                                {videos.map((video) => (
                                    <li
                                        key={video.videoId}
                                        className='flex gap-3 rounded-lg border p-2'
                                    >
                                        {video.thumbnailUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={video.thumbnailUrl}
                                                alt=''
                                                className='aspect-video w-28 shrink-0 rounded object-cover'
                                            />
                                        ) : (
                                            <div className='bg-muted aspect-video w-28 shrink-0 rounded' />
                                        )}
                                        <div className='min-w-0 space-y-1'>
                                            <p className='line-clamp-2 text-sm font-medium'>
                                                {video.title}
                                            </p>
                                            <div className='text-muted-foreground flex flex-wrap items-center gap-2 text-xs'>
                                                <span>
                                                    {formatDate(
                                                        video.publishedAt
                                                    )}
                                                </span>
                                                {video.privacyStatus &&
                                                    video.privacyStatus !==
                                                        'public' && (
                                                        <Badge
                                                            variant='secondary'
                                                            className='gap-1'
                                                        >
                                                            <Lock className='h-3 w-3' />
                                                            {
                                                                video.privacyStatus
                                                            }
                                                        </Badge>
                                                    )}
                                            </div>
                                            <a
                                                href={`https://studio.youtube.com/video/${video.videoId}/edit`}
                                                target='_blank'
                                                rel='noreferrer'
                                                className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs'
                                            >
                                                Open in Studio
                                                <ExternalLink className='h-3 w-3' />
                                            </a>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            )}

            <p className='text-muted-foreground text-xs'>
                Until Google finishes its YouTube API audit of this project,
                every video uploaded from the admin stays private on YouTube.
            </p>
        </div>
    )
}
