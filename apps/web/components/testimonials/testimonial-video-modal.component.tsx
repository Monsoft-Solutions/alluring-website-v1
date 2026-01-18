'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@workspace/ui/components/dialog'

interface TestimonialVideoModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    videoUrl: string
    patientName: string
    procedure: string
}

export function TestimonialVideoModal({
    open,
    onOpenChange,
    videoUrl,
    patientName,
    procedure,
}: TestimonialVideoModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null)

    // Pause video when modal closes
    useEffect(() => {
        if (!open && videoRef.current) {
            videoRef.current.pause()
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-4xl border-0 bg-black/95 p-0'>
                <DialogTitle className='sr-only'>
                    Testimonial from {patientName} - {procedure}
                </DialogTitle>

                {/* Close button */}
                <button
                    onClick={() => onOpenChange(false)}
                    className='absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white'
                    aria-label='Close video'
                >
                    <X className='h-5 w-5' />
                </button>

                {/* Video player */}
                <div className='relative aspect-video w-full'>
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        autoPlay
                        className='h-full w-full'
                        poster={undefined}
                    >
                        <track kind='captions' />
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Patient info */}
                <div className='px-6 py-4'>
                    <p className='font-serif text-lg font-medium text-white'>
                        {patientName}
                    </p>
                    <p className='text-sm text-white/60'>{procedure}</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
