'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

const PROGRESS_MARKS = [25, 50, 75] as const

/** The file name without its extension: the media's slug on Blob. */
function videoName(video: HTMLVideoElement) {
    const src = video.currentSrc || video.src
    return (
        src
            .split('/')
            .pop()
            ?.split('?')[0]
            ?.replace(/\.\w+$/, '') ?? ''
    )
}

/**
 * Gallery interaction events that need no per-component wiring.
 *
 * Mounted once in the gallery layout, it listens on the document for:
 * - video playback anywhere in the gallery (the lightbox and the watch
 *   pages): `gallery_video_start`, `gallery_video_progress` at 25/50/75%
 *   and `gallery_video_complete`. Media events don't bubble, so the
 *   listeners run in the capture phase.
 * - taps on a procedure link marked `data-gallery-nav`:
 *   `gallery_procedure_click`.
 *
 * Renders nothing.
 */
export function GalleryTracker() {
    const { track } = useAnalyticsEvent()
    const pathname = usePathname()

    useEffect(() => {
        // Marks already sent, per video element and source
        const sent = new WeakMap<HTMLVideoElement, Set<string>>()

        const once = (video: HTMLVideoElement, mark: string) => {
            const key = `${videoName(video)}:${mark}`
            const marks = sent.get(video) ?? new Set<string>()
            sent.set(video, marks)
            if (marks.has(key)) return false
            marks.add(key)
            return true
        }

        // The tracker only mounts on gallery pages, and the lightbox renders
        // in a portal outside the layout, so any <video> here is gallery media
        const galleryVideo = (event: Event) =>
            event.target instanceof HTMLVideoElement ? event.target : null

        // The lightbox names its current slide on <html> (GalleryMediaGrid);
        // a watch page carries the slug in its path
        const mediaSlug = (video: HTMLVideoElement) => {
            if (video.closest('.yarl__root')) {
                return (
                    document.documentElement.dataset.galleryMedia ??
                    videoName(video)
                )
            }
            return pathname.startsWith('/gallery/media/')
                ? pathname.split('/').pop()
                : videoName(video)
        }

        const params = (video: HTMLVideoElement) => ({
            media_slug: mediaSlug(video),
            media_type: 'video',
            video_duration: Number.isFinite(video.duration)
                ? Math.round(video.duration)
                : undefined,
            player: video.closest('.yarl__root') ? 'lightbox' : 'page',
        })

        const onPlay = (event: Event) => {
            const video = galleryVideo(event)
            if (!video || !once(video, 'start')) return
            track('gallery_video_start', params(video), { sendToClarity: true })
        }

        const onTimeUpdate = (event: Event) => {
            const video = galleryVideo(event)
            if (!video || !video.duration) return
            const percent = (video.currentTime / video.duration) * 100
            for (const mark of PROGRESS_MARKS) {
                if (percent >= mark && once(video, String(mark))) {
                    track('gallery_video_progress', {
                        ...params(video),
                        video_percent: mark,
                    })
                }
            }
        }

        const onEnded = (event: Event) => {
            const video = galleryVideo(event)
            if (!video || !once(video, 'complete')) return
            track('gallery_video_complete', params(video), {
                sendToClarity: true,
            })
        }

        const onClick = (event: MouseEvent) => {
            const link =
                event.target instanceof Element
                    ? event.target.closest<HTMLAnchorElement>(
                          'a[data-gallery-nav]'
                      )
                    : null
            if (!link) return
            track('gallery_procedure_click', {
                procedure: link.dataset.galleryProcedure ?? 'all',
                nav_location: link.dataset.galleryNav,
                from_path: pathname,
            })
        }

        document.addEventListener('play', onPlay, true)
        document.addEventListener('timeupdate', onTimeUpdate, true)
        document.addEventListener('ended', onEnded, true)
        document.addEventListener('click', onClick)
        return () => {
            document.removeEventListener('play', onPlay, true)
            document.removeEventListener('timeupdate', onTimeUpdate, true)
            document.removeEventListener('ended', onEnded, true)
            document.removeEventListener('click', onClick)
        }
    }, [track, pathname])

    return null
}
