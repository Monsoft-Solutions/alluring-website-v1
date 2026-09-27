'use client'

/**
 * Disconnect YouTube button, with a confirmation step.
 *
 * @module components/social-media/youtube/youtube-disconnect-button
 */
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog'
import { Button } from '@workspace/ui/components/button'
import { Loader2, Unplug } from 'lucide-react'
import { useState, useTransition } from 'react'

import { disconnectYouTubeAction } from '@/lib/actions/youtube.action'

export function YouTubeDisconnectButton({
    channelTitle,
}: {
    channelTitle: string
}) {
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    function disconnect() {
        setError(null)
        startTransition(async () => {
            const result = await disconnectYouTubeAction()
            if (!result.success) setError(result.error ?? 'Disconnect failed')
        })
    }

    return (
        <div className='flex flex-col items-start gap-2'>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant='ghost' size='sm' disabled={pending}>
                        {pending ? (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                            <Unplug className='mr-2 h-4 w-4' />
                        )}
                        Disconnect
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Disconnect {channelTitle}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            The admin loses access to the channel and Google
                            revokes the token. Nothing on YouTube is deleted.
                            You can connect again at any time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep connected</AlertDialogCancel>
                        <AlertDialogAction onClick={disconnect}>
                            Disconnect
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {error && <p className='text-destructive text-sm'>{error}</p>}
        </div>
    )
}
