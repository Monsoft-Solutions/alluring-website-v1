'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

export const ExitIntentPopup = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [hasTriggered, setHasTriggered] = useState(false)

    useEffect(() => {
        // Check if previously dismissed in this session
        if (typeof window !== 'undefined') {
            const hasSeen = sessionStorage.getItem('alluring_popup_seen')
            if (hasSeen) {
                setHasTriggered(true)
                return
            }
        }

        const handleExitIntent = (e: MouseEvent) => {
            // Desktop: Trigger when mouse leaves top of viewport
            if (e.clientY <= 0 && window.innerWidth >= 1024 && !hasTriggered) {
                setIsVisible(true)
                setHasTriggered(true)
            }
        }

        const handleScroll = () => {
            // Mobile/Tablet: Trigger at 70% scroll depth
            if (window.innerWidth < 1024 && !hasTriggered) {
                const scrollTop = window.scrollY
                const docHeight = document.documentElement.scrollHeight
                const winHeight = window.innerHeight
                const scrollPercent = (scrollTop + winHeight) / docHeight

                if (scrollPercent > 0.7) {
                    setIsVisible(true)
                    setHasTriggered(true)
                }
            }
        }

        document.addEventListener('mouseleave', handleExitIntent)
        window.addEventListener('scroll', handleScroll)

        return () => {
            document.removeEventListener('mouseleave', handleExitIntent)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [hasTriggered])

    const handleClose = () => {
        setIsVisible(false)
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('alluring_popup_seen', 'true')
        }
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <div className='pointer-events-none fixed inset-0 z-[100] flex items-end justify-center p-0 md:items-end md:justify-end md:p-6'>
                    {/* Mobile Backdrop - only visible on small screens to focus attention */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className='pointer-events-auto absolute inset-0 bg-black/40 backdrop-blur-sm md:hidden'
                    />

                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 300,
                        }}
                        className='border-gold-500/30 pointer-events-auto relative w-full overflow-hidden rounded-t-2xl border-t bg-stone-900 shadow-2xl md:w-[400px] md:rounded-xl md:border'
                    >
                        {/* Gold Top Line decoration */}
                        <div className='from-gold-600 via-gold-300 to-gold-600 absolute top-0 right-0 left-0 h-1 bg-gradient-to-r'></div>

                        <div className='p-6 md:p-8'>
                            <button
                                onClick={handleClose}
                                className='absolute top-4 right-4 rounded-full bg-stone-800/50 p-1 text-stone-500 transition-colors hover:text-white'
                            >
                                <X size={16} />
                            </button>

                            <div className='mb-3 flex items-center gap-2'>
                                <div className='bg-gold-500/10 rounded-full p-1.5'>
                                    <Sparkles className='text-gold-400 h-3 w-3' />
                                </div>
                                <span className='text-gold-400 text-xs font-bold tracking-widest uppercase'>
                                    Don&apos;t Miss Out
                                </span>
                            </div>

                            <h3 className='mb-2 font-serif text-xl leading-tight text-white md:text-2xl'>
                                Plan Your Transformation
                            </h3>
                            <p className='mb-6 text-sm leading-relaxed text-stone-400 md:text-base'>
                                Slots are filling up fast. Get a priority
                                consultation and a personalized quote sent to
                                your phone.
                            </p>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    handleClose()
                                }}
                                className='space-y-3'
                            >
                                <div className='space-y-1'>
                                    <input
                                        type='text'
                                        placeholder='Your Name'
                                        className='focus:border-gold-400 w-full rounded-sm border border-stone-700 bg-stone-800/50 px-4 py-3 text-base text-white placeholder-stone-500 transition-colors focus:outline-none'
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <input
                                        type='tel'
                                        placeholder='Phone Number'
                                        className='focus:border-gold-400 w-full rounded-sm border border-stone-700 bg-stone-800/50 px-4 py-3 text-base text-white placeholder-stone-500 transition-colors focus:outline-none'
                                    />
                                </div>

                                <Button
                                    variant='gold'
                                    size='md'
                                    className='w-full justify-center !py-3 text-sm'
                                >
                                    Check Availability
                                </Button>
                            </form>

                            <p className='mt-4 text-center text-xs text-stone-600'>
                                Respecting your privacy. No spam.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
