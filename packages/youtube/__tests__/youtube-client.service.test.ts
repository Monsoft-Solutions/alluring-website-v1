import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getMyChannel, listChannelVideos } from '../src/youtube-client.service'

const fetchMock =
    vi.fn<(url: string | URL, init?: RequestInit) => Promise<Response>>()

describe('YouTube client', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock)
        fetchMock.mockReset()
    })
    afterEach(() => vi.unstubAllGlobals())

    it("maps the token's channel", async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    items: [
                        {
                            id: 'UC123',
                            snippet: {
                                title: 'Alluring Plastic Surgery',
                                customUrl: '@alluringplasticsurgery',
                                thumbnails: {
                                    high: { url: 'https://img/h.jpg' },
                                },
                            },
                            contentDetails: {
                                relatedPlaylists: { uploads: 'UU123' },
                            },
                            statistics: {
                                subscriberCount: '120',
                                videoCount: '38',
                                viewCount: '9000',
                            },
                        },
                    ],
                })
            )
        )
        const channel = await getMyChannel('token')
        expect(channel).toEqual({
            id: 'UC123',
            title: 'Alluring Plastic Surgery',
            customUrl: '@alluringplasticsurgery',
            thumbnailUrl: 'https://img/h.jpg',
            uploadsPlaylistId: 'UU123',
            subscriberCount: 120,
            videoCount: 38,
            viewCount: 9000,
        })
        const [url, init] = fetchMock.mock.calls[0]!
        expect(String(url)).toContain('mine=true')
        expect((init?.headers as Record<string, string>).Authorization).toBe(
            'Bearer token'
        )
    })

    it('returns null when the account has no channel', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(JSON.stringify({ items: [] }))
        )
        expect(await getMyChannel('token')).toBeNull()
    })

    it('lists uploads with their privacy', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    nextPageToken: 'p2',
                    items: [
                        {
                            snippet: {
                                title: 'A',
                                thumbnails: { default: { url: 'u' } },
                            },
                            contentDetails: {
                                videoId: 'v1',
                                videoPublishedAt: '2026-09-01T00:00:00Z',
                            },
                            status: { privacyStatus: 'public' },
                        },
                    ],
                })
            )
        )
        const page = await listChannelVideos('token', 'UU123', {
            maxResults: 99,
        })
        expect(page.items[0]).toMatchObject({
            videoId: 'v1',
            privacyStatus: 'public',
        })
        expect(page.nextPageToken).toBe('p2')
        expect(String(fetchMock.mock.calls[0]![0])).toContain('maxResults=50')
    })
})
