/**
 * Floating Feedback Button Component
 *
 * Floating action button for beta feedback and bug reporting.
 * Visible on all pages during beta testing, provides quick access
 * to feedback form and bug reporter.
 *
 * @module components/feedback/floating-feedback-button
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { Bug, MessageSquarePlus, X } from 'lucide-react'
import { useState } from 'react'

import { BetaFeedbackForm } from './beta-feedback-form.component'
import { BugReportForm } from './bug-report-form.component'

export function FloatingFeedbackButton() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
    const [isBugReportOpen, setIsBugReportOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev)
    }

    const openFeedback = () => {
        setIsMenuOpen(false)
        setIsFeedbackOpen(true)
    }

    const openBugReport = () => {
        setIsMenuOpen(false)
        setIsBugReportOpen(true)
    }

    return (
        <>
            {/* Floating Button Container */}
            <div className='items-left fixed bottom-4 left-4 z-50 flex flex-col gap-3'>
                {/* Menu Items */}
                <div
                    className={cn(
                        'flex flex-col gap-2 transition-all duration-300',
                        isMenuOpen
                            ? 'pointer-events-auto translate-y-0 opacity-100'
                            : 'pointer-events-none translate-y-4 opacity-0'
                    )}
                >
                    {/* Full Feedback Button */}
                    <button
                        onClick={openFeedback}
                        className={cn(
                            'group flex items-center gap-3 rounded-full py-2 pr-3 pl-4 shadow-lg transition-all duration-200',
                            'bg-white text-stone-900 hover:bg-stone-50',
                            'ring-1 ring-stone-200'
                        )}
                        aria-label='Provide website feedback'
                    >
                        <span className='text-sm font-medium whitespace-nowrap'>
                            Website Feedback
                        </span>
                        <div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full'>
                            <MessageSquarePlus className='text-primary h-4 w-4' />
                        </div>
                    </button>

                    {/* Bug Report Button */}
                    <button
                        onClick={openBugReport}
                        className={cn(
                            'group flex items-center gap-3 rounded-full py-2 pr-3 pl-4 shadow-lg transition-all duration-200',
                            'bg-white text-stone-900 hover:bg-stone-50',
                            'ring-1 ring-stone-200'
                        )}
                        aria-label='Report a bug'
                    >
                        <span className='text-sm font-medium whitespace-nowrap'>
                            Report a Bug
                        </span>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-red-50'>
                            <Bug className='h-4 w-4 text-red-600' />
                        </div>
                    </button>
                </div>

                {/* Main Toggle Button */}
                <button
                    onClick={toggleMenu}
                    className={cn(
                        'group relative flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-300',
                        'bg-primary hover:bg-primary/90 text-primary-foreground',
                        'focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none',
                        isMenuOpen && 'rotate-0'
                    )}
                    aria-label={
                        isMenuOpen ? 'Close menu' : 'Open feedback menu'
                    }
                    aria-expanded={isMenuOpen}
                >
                    {/* Pulse animation when closed */}
                    {!isMenuOpen && (
                        <span className='bg-primary absolute inset-0 animate-ping rounded-full opacity-25' />
                    )}

                    {/* Icon */}
                    <span
                        className={cn(
                            'relative transition-transform duration-300',
                            isMenuOpen && 'rotate-90'
                        )}
                    >
                        {isMenuOpen ? (
                            <X className='h-6 w-6' />
                        ) : (
                            <MessageSquarePlus className='h-6 w-6' />
                        )}
                    </span>

                    {/* Beta badge */}
                    {!isMenuOpen && (
                        <span className='absolute -top-1 -right-1 flex h-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white shadow'>
                            FEEDBACK
                        </span>
                    )}
                </button>
            </div>

            {/* Backdrop when menu is open */}
            {isMenuOpen && (
                <div
                    className='fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]'
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden='true'
                />
            )}

            {/* Feedback Form Dialog */}
            <BetaFeedbackForm
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />

            {/* Bug Report Form Dialog */}
            <BugReportForm
                isOpen={isBugReportOpen}
                onClose={() => setIsBugReportOpen(false)}
            />
        </>
    )
}
