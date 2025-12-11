'use client'

/**
 * Instagram Settings Form Component
 *
 * Form for configuring Instagram integration settings.
 *
 * @module components/social-media/instagram-settings-form
 */
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import {
    AlertTriangle,
    Loader2,
    Save,
    RotateCcw,
    Instagram,
} from 'lucide-react'

import {
    updateInstagramSettings,
    resetInstagramSyncCursor,
} from '@/lib/actions/social-media.action'
import { SyncAllButton } from '@/components/social-media/sync-all-button.component'

type InstagramSettingsFormProps = {
    initialData: {
        handle: string | null
        apiKey: string | null
        isEnabled: boolean
        lastSyncAt: Date | null
        lastSyncCursor: string | null
    } | null
}

export function InstagramSettingsForm({
    initialData,
}: InstagramSettingsFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isResetting, setIsResetting] = useState(false)

    const [handle, setHandle] = useState(initialData?.handle ?? '')
    const [apiKey, setApiKey] = useState(initialData?.apiKey ?? '')
    const [isEnabled, setIsEnabled] = useState(initialData?.isEnabled ?? true)
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        startTransition(async () => {
            const result = await updateInstagramSettings({
                handle: handle.replace('@', '').trim(),
                apiKey: apiKey.trim() || undefined,
                isEnabled,
            })

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'Settings saved successfully',
                })
                router.refresh()
            } else {
                setMessage({
                    type: 'error',
                    text: result.error ?? 'Failed to save settings',
                })
            }
        })
    }

    const handleResetCursor = async () => {
        setIsResetting(true)
        setMessage(null)

        const result = await resetInstagramSyncCursor()

        if (result.success) {
            setMessage({
                type: 'success',
                text: 'Sync cursor reset. Next sync will fetch from the beginning.',
            })
            router.refresh()
        } else {
            setMessage({
                type: 'error',
                text: result.error ?? 'Failed to reset cursor',
            })
        }

        setIsResetting(false)
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-6'>
            <Card>
                <CardHeader>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 via-pink-500 to-orange-500'>
                            <Instagram className='h-5 w-5 text-white' />
                        </div>
                        <div>
                            <CardTitle>Instagram Integration</CardTitle>
                            <CardDescription>
                                Configure your Instagram profile for content
                                syncing
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                    {/* Enable/Disable Toggle */}
                    <div className='flex items-center justify-between rounded-lg border p-4'>
                        <div>
                            <Label htmlFor='enabled' className='text-base'>
                                Enable Integration
                            </Label>
                            <p className='text-muted-foreground text-sm'>
                                Allow syncing posts from Instagram
                            </p>
                        </div>
                        <Switch
                            id='enabled'
                            checked={isEnabled}
                            onCheckedChange={setIsEnabled}
                        />
                    </div>

                    {/* Instagram Handle */}
                    <div className='space-y-2'>
                        <Label htmlFor='handle'>Instagram Handle</Label>
                        <div className='flex items-center gap-2'>
                            <span className='text-muted-foreground'>@</span>
                            <Input
                                id='handle'
                                placeholder='alluringplasticsurgery'
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                className='flex-1'
                            />
                        </div>
                        <p className='text-muted-foreground text-sm'>
                            The Instagram username without the @ symbol
                        </p>
                    </div>

                    {/* API Key */}
                    <div className='space-y-2'>
                        <Label htmlFor='apiKey'>ScrapeSocial API Key</Label>
                        <Input
                            id='apiKey'
                            type='password'
                            placeholder='Enter API key (optional if set in environment)'
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                        <p className='text-muted-foreground text-sm'>
                            API key for ScrapeSocial service. Can also be set
                            via SCRAPE_SOCIAL_API_KEY environment variable.
                        </p>
                    </div>

                    {/* Sync Status */}
                    {initialData?.lastSyncAt && (
                        <div className='rounded-lg border p-4'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium'>
                                        Last Synced
                                    </p>
                                    <p className='text-muted-foreground text-sm'>
                                        {new Date(
                                            initialData.lastSyncAt
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                {initialData.lastSyncCursor && (
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        onClick={handleResetCursor}
                                        disabled={isResetting}
                                    >
                                        {isResetting ? (
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        ) : (
                                            <RotateCcw className='mr-2 h-4 w-4' />
                                        )}
                                        Reset Sync
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sync All Posts Section */}
                    {handle && isEnabled && (
                        <div className='rounded-lg border border-amber-200 bg-amber-50 p-4'>
                            <div className='flex items-start gap-3'>
                                <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-amber-600' />
                                <div className='flex-1 space-y-3'>
                                    <div>
                                        <p className='font-medium text-amber-800'>
                                            Sync All Posts
                                        </p>
                                        <p className='text-sm text-amber-700'>
                                            Download and store all posts from
                                            your Instagram profile. This may
                                            take several minutes and will use
                                            API credits.
                                        </p>
                                    </div>
                                    <SyncAllButton
                                        disabled={!handle || !isEnabled}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Message */}
                    {message && (
                        <div
                            className={`rounded-lg p-3 text-sm ${
                                message.type === 'success'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className='flex justify-end'>
                        <Button type='submit' disabled={isPending}>
                            {isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <Save className='mr-2 h-4 w-4' />
                            )}
                            Save Settings
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
