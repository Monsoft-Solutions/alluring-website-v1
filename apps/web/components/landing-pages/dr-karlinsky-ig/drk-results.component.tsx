'use client'

/**
 * Her before-and-after photographs: a swipeable rail, each photo a button
 * that opens it larger in a lightbox on the page. No link leaves the page —
 * visitors tap before/afters (Clarity showed dead clicks where they
 * couldn't), and a gallery link is a way off a page with one job.
 *
 * Photos are shown whole on a dark mat: a pair cropped to fill a frame loses
 * half its point.
 */

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { fill } from './drk-config'
import type { DrkDictionary } from './drk-copy'
import type { DrkPhoto } from './drk-proof'

interface DrkResultsProps {
    readonly copy: DrkDictionary['results']
    readonly photos: readonly DrkPhoto[]
}

export function DrkResults({ copy, photos }: DrkResultsProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [index, setIndex] = useState<number | null>(null)
    const current = index === null ? null : photos[index]

    const show = (next: number) => {
        setIndex((next + photos.length) % photos.length)
    }

    const openAt = (next: number) => {
        show(next)
        const dialog = dialogRef.current
        if (dialog && !dialog.open) dialog.showModal()
    }

    const close = () => dialogRef.current?.close()

    useEffect(() => {
        if (index === null) return
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') show(index + 1)
            if (event.key === 'ArrowLeft') show(index - 1)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
        // `show` only closes over `photos.length`.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, photos.length])

    // A horizontal swipe in the lightbox moves between photos.
    const touchX = useRef<number | null>(null)

    return (
        <>
            <ul className='drk-rail' aria-label={copy.railLabel}>
                {photos.map((photo, position) => (
                    <li key={photo.id}>
                        <button
                            type='button'
                            className='drk-ba'
                            onClick={() => openAt(position)}
                            aria-label={fill(copy.open, {
                                caption: photo.caption || photo.alt,
                            })}
                        >
                            <span className='drk-ba__mat'>
                                <Image
                                    src={photo.src}
                                    fill
                                    sizes='(max-width: 640px) 72vw, 280px'
                                    loading='lazy'
                                    alt={photo.alt}
                                />
                            </span>
                            <span className='drk-ba__caption'>
                                <span>{photo.caption}</span>
                                <span
                                    className='drk-ba__tag'
                                    aria-hidden='true'
                                >
                                    {copy.before} · {copy.after}
                                </span>
                            </span>
                        </button>
                    </li>
                ))}
            </ul>

            <dialog
                ref={dialogRef}
                className='drk-lightbox'
                aria-label={current?.caption || copy.railLabel}
                onClose={() => setIndex(null)}
                onClick={(event) => {
                    if (event.target === event.currentTarget) close()
                }}
            >
                {current && index !== null && (
                    <div
                        className='drk-lightbox__in'
                        onTouchStart={(event) => {
                            touchX.current = event.touches[0]?.clientX ?? null
                        }}
                        onTouchEnd={(event) => {
                            const start = touchX.current
                            const end = event.changedTouches[0]?.clientX
                            touchX.current = null
                            if (start === null || end === undefined) return
                            if (Math.abs(end - start) < 48) return
                            show(end < start ? index + 1 : index - 1)
                        }}
                    >
                        <button
                            type='button'
                            className='drk-lightbox__close'
                            onClick={close}
                            aria-label={copy.close}
                        >
                            <CloseIcon />
                        </button>
                        <figure className='drk-lightbox__figure'>
                            <span className='drk-lightbox__mat'>
                                <Image
                                    key={current.id}
                                    src={current.src}
                                    fill
                                    sizes='(max-width: 700px) 100vw, 680px'
                                    alt={current.alt}
                                />
                            </span>
                            <figcaption>
                                <span>{current.caption}</span>
                                <span aria-live='polite'>
                                    {fill(copy.counter, {
                                        n: String(index + 1),
                                        total: String(photos.length),
                                    })}
                                </span>
                            </figcaption>
                        </figure>
                        {photos.length > 1 && (
                            <div className='drk-lightbox__nav'>
                                <button
                                    type='button'
                                    onClick={() => show(index - 1)}
                                    aria-label={copy.previous}
                                >
                                    <ChevronIcon flip />
                                </button>
                                <button
                                    type='button'
                                    onClick={() => show(index + 1)}
                                    aria-label={copy.next}
                                >
                                    <ChevronIcon />
                                </button>
                            </div>
                        )}
                        <p className='drk-lightbox__note'>{copy.disclaimer}</p>
                    </div>
                )}
            </dialog>
        </>
    )
}

function CloseIcon() {
    return (
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
    )
}

function ChevronIcon({ flip = false }: { readonly flip?: boolean }) {
    return (
        <svg
            viewBox='0 0 24 24'
            width='22'
            height='22'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
            style={flip ? { transform: 'scaleX(-1)' } : undefined}
        >
            <path d='m9 6 6 6-6 6' />
        </svg>
    )
}
