'use client'

/**
 * Her message, played like an Instagram story: full screen, vertical, with
 * sound and captions, and a button that takes the visitor straight to the
 * form.
 *
 * Nothing about the video loads with the page. The triggers — the story ring
 * in the hero and the arch in "A message from me" — are server-rendered
 * buttons marked `data-drk-play="<placement>"`; one listener here catches a
 * tap on either and opens this dialog, and only then is the `<video>`
 * mounted and played (a tap is what lets it play with sound on iOS). Closing
 * the dialog unmounts it, which stops the download.
 *
 * Captions: the cut has English burned in, plus English and Spanish WebVTT
 * tracks. The Spanish page turns the Spanish track on; the English page
 * leaves the tracks off so the burned-in captions don't show twice.
 *
 * Events: `drk_video_open` (with the placement), `drk_video_progress` at
 * 25 / 50 / 75 / 100 %, and `drk_video_cta` when the button is tapped.
 */

import { useEffect, useRef, useState } from 'react'

import type { ConsultChatLang } from '@/components/shared/consult-chat/consult-chat.types'

import { DRK_EVENTS } from './drk-config'
import type { DrkPlayerCopy } from './drk-copy'
import { focusDrkForm } from './drk-focus'
import type { DrkVideo } from './drk-media'
import { trackDrkEvent } from './drk-tracking'

const MILESTONES = [25, 50, 75] as const

interface DrkPlayerProps {
    readonly lang: ConsultChatLang
    readonly video: DrkVideo
    readonly copy: DrkPlayerCopy
    readonly handle: string
    readonly avatarSrc: string
    /** The avatar is a full portrait to zoom to her face. */
    readonly avatarCrop?: boolean
}

export function DrkPlayer({
    lang,
    video,
    copy,
    handle,
    avatarSrc,
    avatarCrop = false,
}: DrkPlayerProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [open, setOpen] = useState(false)
    const [ended, setEnded] = useState(false)
    const [failed, setFailed] = useState(false)
    const [progress, setProgress] = useState(0)
    const reached = useRef(new Set<number>())
    const langRef = useRef(lang)

    useEffect(() => {
        langRef.current = lang
    }, [lang])

    useEffect(() => {
        if (!video.src) return
        const onClick = (event: MouseEvent) => {
            if (!(event.target instanceof Element)) return
            const trigger = event.target.closest<HTMLElement>('[data-drk-play]')
            if (!trigger) return
            event.preventDefault()
            reached.current = new Set()
            setEnded(false)
            setFailed(false)
            setProgress(0)
            setOpen(true)
            const dialog = dialogRef.current
            if (dialog && !dialog.open) dialog.showModal()
            trackDrkEvent(DRK_EVENTS.videoOpen, langRef.current, {
                placement: trigger.dataset.drkPlay || 'unknown',
            })
        }
        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
    }, [video.src])

    // Mounted by the tap that opened the dialog, so play() is allowed with
    // sound. If the browser still refuses, the native controls remain.
    useEffect(() => {
        if (!open) return
        const element = videoRef.current
        if (!element) return
        element.play().catch(() => {})
    }, [open])

    const close = () => dialogRef.current?.close()

    const onTimeUpdate = () => {
        const element = videoRef.current
        if (!element || !element.duration) return
        const percent = (element.currentTime / element.duration) * 100
        setProgress(percent)
        for (const milestone of MILESTONES) {
            if (percent < milestone || reached.current.has(milestone)) continue
            reached.current.add(milestone)
            trackDrkEvent(DRK_EVENTS.videoProgress, lang, {
                percent: milestone,
            })
        }
    }

    const onEnded = () => {
        setProgress(100)
        setEnded(true)
        if (reached.current.has(100)) return
        reached.current.add(100)
        trackDrkEvent(DRK_EVENTS.videoProgress, lang, { percent: 100 })
    }

    const replay = () => {
        const element = videoRef.current
        if (!element) return
        setEnded(false)
        element.currentTime = 0
        element.play().catch(() => {})
    }

    const toForm = (from: 'end-card' | 'player') => {
        trackDrkEvent(DRK_EVENTS.videoCta, lang, { placement: from })
        close()
        // After the dialog has gone, so the page can scroll.
        window.requestAnimationFrame(() => focusDrkForm())
    }

    if (!video.src) return null

    const tracks = [
        { src: video.captionsEn, srcLang: 'en', label: copy.captionsEn },
        { src: video.captionsEs, srcLang: 'es', label: copy.captionsEs },
    ].filter((track) => track.src)

    return (
        <dialog
            ref={dialogRef}
            className='drk-player'
            aria-labelledby='drk-player-title'
            onClose={() => {
                videoRef.current?.pause()
                setOpen(false)
            }}
        >
            <div className='drk-player__frame'>
                <div className='drk-player__bar' aria-hidden='true'>
                    <span style={{ transform: `scaleX(${progress / 100})` }} />
                </div>
                <header className='drk-player__head'>
                    <span
                        className={`drk-player__avatar${avatarCrop ? ' drk-player__avatar--crop' : ''}`}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element -- a 32px crop of an image the page already loaded */}
                        <img src={avatarSrc} alt='' width={32} height={32} />
                    </span>
                    <span className='drk-player__who'>
                        <strong>{handle}</strong>
                        <span id='drk-player-title'>{copy.title}</span>
                    </span>
                    <button
                        type='button'
                        className='drk-player__close'
                        onClick={close}
                        aria-label={copy.close}
                    >
                        <svg
                            viewBox='0 0 24 24'
                            width='22'
                            height='22'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            aria-hidden='true'
                        >
                            <path d='M6 6l12 12M18 6 6 18' />
                        </svg>
                    </button>
                </header>

                {open && (
                    <video
                        ref={videoRef}
                        className='drk-player__video'
                        src={video.src}
                        poster={video.poster}
                        width={720}
                        height={1280}
                        controls
                        playsInline
                        preload='auto'
                        aria-labelledby='drk-player-title'
                        crossOrigin={tracks.length ? 'anonymous' : undefined}
                        onTimeUpdate={onTimeUpdate}
                        onEnded={onEnded}
                        onPlay={() => setEnded(false)}
                        onError={() => setFailed(true)}
                    >
                        {tracks.map((track) => (
                            <track
                                key={track.srcLang}
                                kind='captions'
                                src={track.src}
                                srcLang={track.srcLang}
                                label={track.label}
                                default={
                                    lang === 'es' && track.srcLang === 'es'
                                }
                            />
                        ))}
                    </video>
                )}

                {failed && (
                    <p className='drk-player__error' role='alert'>
                        {copy.unavailable}
                    </p>
                )}

                {ended && (
                    <div className='drk-player__end'>
                        <p className='drk-player__end-title'>{copy.endTitle}</p>
                        <button
                            type='button'
                            className='drk-btn drk-btn--gold'
                            onClick={() => toForm('end-card')}
                        >
                            {copy.cta}
                        </button>
                        <button
                            type='button'
                            className='drk-player__replay'
                            onClick={replay}
                        >
                            {copy.replay}
                        </button>
                    </div>
                )}

                {!ended && (
                    <div className='drk-player__foot'>
                        <button
                            type='button'
                            className='drk-btn drk-btn--gold'
                            onClick={() => toForm('player')}
                        >
                            {copy.cta}
                        </button>
                    </div>
                )}
            </div>
        </dialog>
    )
}
