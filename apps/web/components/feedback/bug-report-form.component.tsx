/**
 * Bug Report Form Component
 *
 * Quick bug report form for fast, low-friction bug reporting during beta testing.
 * Auto-detects device and browser info, pre-fills page URL.
 *
 * @module components/feedback/bug-report-form
 */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Form } from '@workspace/ui/components/form'
import { Bug, Loader2, Send, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
    EmailField,
    ImageUploadField,
    MessageField,
    NameField,
    SelectField,
} from '@/components/shared/forms/form-fields.component'
import {
    BUG_SEVERITY_OPTIONS,
    bugReportDefaultValues,
    type BugReportFormInput,
    bugReportFormSchema,
    detectDeviceInfo,
} from '@/lib/types/forms/bug-report.type'
import { detectUserEnvironment } from '@/lib/utils/user-agent.util'

type BugReportFormProps = {
    readonly isOpen: boolean
    readonly onClose: () => void
}

export function BugReportForm({ isOpen, onClose }: BugReportFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [screenshot, setScreenshot] = useState<File | null>(null)

    const form = useForm<BugReportFormInput>({
        resolver: zodResolver(bugReportFormSchema),
        defaultValues: bugReportDefaultValues,
        mode: 'onChange',
    })

    // Auto-detect device info when dialog opens
    useEffect(() => {
        if (isOpen && typeof window !== 'undefined') {
            // Use the shared detection utility for better accuracy
            const { browser, device, metadata } = detectUserEnvironment()

            // Legacy detection for browser version (not in shared utility)
            const legacyInfo = detectDeviceInfo()

            // Set basic info
            form.setValue('pageUrl', window.location.href)
            form.setValue('deviceType', device)
            form.setValue('browserType', browser)
            form.setValue('browserVersion', legacyInfo.browserVersion)
            form.setValue(
                'screenSize',
                `${metadata.viewportWidth}x${metadata.viewportHeight}`
            )
            form.setValue('userAgent', navigator.userAgent)

            // Set enhanced metadata
            form.setValue('screenWidth', metadata.screenWidth)
            form.setValue('screenHeight', metadata.screenHeight)
            form.setValue('viewportWidth', metadata.viewportWidth)
            form.setValue('viewportHeight', metadata.viewportHeight)
            form.setValue('devicePixelRatio', metadata.devicePixelRatio)
            form.setValue('timezone', metadata.timezone)
            form.setValue('language', metadata.language)
            form.setValue('referrer', metadata.referrer)
            form.setValue('connectionType', metadata.connectionType)
        }
    }, [isOpen, form])

    const handleSubmit = async (data: BugReportFormInput) => {
        setIsSubmitting(true)
        try {
            // Create FormData for multipart submission (to support file upload)
            const formData = new FormData()

            // Add all form fields as JSON
            formData.append('data', JSON.stringify(data))

            // Add screenshot if present
            if (screenshot) {
                formData.append('screenshot', screenshot)
            }

            const response = await fetch('/api/bug-report', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                setIsSuccess(true)
                setTimeout(() => {
                    onClose()
                    setIsSuccess(false)
                    form.reset()
                    setScreenshot(null)
                }, 2000)
            } else {
                const error = await response.json()
                console.error('Bug report submission failed:', error)
            }
        } catch (error) {
            console.error('Bug report submission error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        onClose()
        form.reset()
        setScreenshot(null)
    }

    const pageUrl = form.watch('pageUrl')

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className='max-h-[90vh] max-w-lg overflow-y-auto'>
                <DialogHeader className='relative'>
                    <button
                        onClick={handleClose}
                        className='text-muted-foreground hover:text-foreground absolute top-0 right-0 transition-colors'
                        aria-label='Close bug report form'
                    >
                        <X className='h-5 w-5' />
                    </button>
                    <DialogTitle className='flex items-center gap-2 font-serif text-xl'>
                        <Bug className='text-destructive h-5 w-5' />
                        Report a Bug
                    </DialogTitle>
                    <DialogDescription>
                        Found something broken? Let us know and we&apos;ll fix
                        it.
                    </DialogDescription>
                </DialogHeader>

                {isSuccess ? (
                    <div className='py-8 text-center'>
                        <div className='bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full'>
                            <Send className='h-6 w-6' />
                        </div>
                        <h3 className='mb-2 text-lg font-semibold'>
                            Bug Reported!
                        </h3>
                        <p className='text-muted-foreground text-sm'>
                            Thank you for helping us improve the website.
                        </p>
                    </div>
                ) : (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className='space-y-5'
                        >
                            {/* Page URL (auto-filled, read-only display) */}
                            <div className='space-y-2'>
                                <label className='text-foreground/90 text-sm font-semibold'>
                                    Page URL
                                </label>
                                <div className='bg-muted text-muted-foreground truncate rounded-md px-3 py-2 text-sm'>
                                    {pageUrl || 'Detecting...'}
                                </div>
                                <input
                                    type='hidden'
                                    {...form.register('pageUrl')}
                                />
                            </div>

                            {/* Bug Description */}
                            <MessageField
                                control={form.control}
                                name='description'
                                label='What happened?'
                                placeholder='Describe the bug you encountered...'
                                rows={3}
                                required
                            />

                            {/* Severity */}
                            <SelectField
                                control={form.control}
                                name='severity'
                                label='How severe is this bug?'
                                options={BUG_SEVERITY_OPTIONS}
                            />

                            {/* Steps to Reproduce (optional) */}
                            <MessageField
                                control={form.control}
                                name='stepsToReproduce'
                                label='Steps to reproduce (optional)'
                                placeholder='1. Go to...&#10;2. Click on...&#10;3. See error...'
                                rows={3}
                            />

                            {/* Screenshot Upload */}
                            <ImageUploadField
                                label='Screenshot'
                                value={screenshot}
                                onChange={setScreenshot}
                                disabled={isSubmitting}
                            />

                            {/* Expected vs Actual (collapsible details) */}
                            <details className='group'>
                                <summary className='text-muted-foreground hover:text-foreground cursor-pointer text-sm font-medium'>
                                    + Add more details (optional)
                                </summary>
                                <div className='mt-3 space-y-4'>
                                    <MessageField
                                        control={form.control}
                                        name='expectedBehavior'
                                        label='What did you expect to happen?'
                                        placeholder='I expected...'
                                        rows={2}
                                    />

                                    <MessageField
                                        control={form.control}
                                        name='actualBehavior'
                                        label='What actually happened?'
                                        placeholder='Instead...'
                                        rows={2}
                                    />
                                </div>
                            </details>

                            {/* Device/Browser Info (auto-detected, shown for transparency) */}
                            <div className='bg-muted/50 space-y-2 rounded-lg p-3'>
                                <p className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                                    Auto-detected Info
                                </p>
                                <div className='text-muted-foreground grid grid-cols-2 gap-2 text-xs'>
                                    <div>
                                        <span className='font-medium'>
                                            Device:
                                        </span>{' '}
                                        {form.watch('deviceType') || '...'}
                                    </div>
                                    <div>
                                        <span className='font-medium'>
                                            Browser:
                                        </span>{' '}
                                        {form.watch('browserType') || '...'}{' '}
                                        {form.watch('browserVersion')}
                                    </div>
                                    <div>
                                        <span className='font-medium'>
                                            Viewport:
                                        </span>{' '}
                                        {form.watch('screenSize') || '...'}
                                    </div>
                                    <div>
                                        <span className='font-medium'>
                                            Screen:
                                        </span>{' '}
                                        {form.watch('screenWidth') &&
                                        form.watch('screenHeight')
                                            ? `${form.watch('screenWidth')}x${form.watch('screenHeight')}`
                                            : '...'}
                                        {form.watch('devicePixelRatio') &&
                                        form.watch('devicePixelRatio') !== 1
                                            ? ` @${form.watch('devicePixelRatio')}x`
                                            : ''}
                                    </div>
                                </div>
                            </div>

                            {/* Reporter Info (optional) */}
                            <details className='group'>
                                <summary className='text-muted-foreground hover:text-foreground cursor-pointer text-sm font-medium'>
                                    + Your contact info (optional)
                                </summary>
                                <div className='mt-3 grid gap-4 sm:grid-cols-2'>
                                    <NameField
                                        control={form.control}
                                        name='reporterName'
                                        label='Name'
                                        placeholder='Your name'
                                        required={false}
                                    />
                                    <EmailField
                                        control={form.control}
                                        name='reporterEmail'
                                        label='Email'
                                        placeholder='your@email.com'
                                    />
                                </div>
                            </details>

                            {/* Submit Button */}
                            <div className='flex justify-end gap-3 border-t pt-4'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleClose}
                                >
                                    Cancel
                                </Button>
                                <Button type='submit' disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Bug className='mr-2 h-4 w-4' />
                                            Report Bug
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}
