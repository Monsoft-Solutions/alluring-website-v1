import { Loader2, Save, Eye, Send } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'

type PostFormActionsProps = {
    mode: 'create' | 'edit'
    status: 'draft' | 'readyToPublish' | 'published'
    isPending: boolean
    onSave: (status?: 'draft' | 'readyToPublish' | 'published') => void
}

export function PostFormActions({
    mode,
    status,
    isPending,
    onSave,
}: PostFormActionsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
                <Button
                    className='w-full'
                    onClick={() => onSave()}
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                        <Save className='mr-2 h-4 w-4' />
                    )}
                    Save {mode === 'create' ? 'Draft' : 'Changes'}
                </Button>
                {mode === 'edit' && status !== 'published' && (
                    <Button
                        variant='outline'
                        className='w-full'
                        onClick={() => onSave('readyToPublish')}
                        disabled={isPending}
                    >
                        <Eye className='mr-2 h-4 w-4' />
                        Mark Ready to Publish
                    </Button>
                )}
                {mode === 'edit' && (
                    <Button
                        variant='default'
                        className='w-full bg-green-600 hover:bg-green-700'
                        onClick={() => onSave('published')}
                        disabled={isPending}
                    >
                        <Send className='mr-2 h-4 w-4' />
                        Publish Now
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
