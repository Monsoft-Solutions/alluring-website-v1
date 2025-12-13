'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ExternalLink, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'

import { removeMediaFromGroup } from '@/lib/actions/gallery-bulk.action'
import type { GalleryMediaListItem } from '@/lib/queries/gallery.query'

type CurrentMediaGridProps = {
    groupId: string
    groupMedia: GalleryMediaListItem[]
    onMediaRemoved: (mediaId: string) => void
}

export function CurrentMediaGrid({
    groupId,
    groupMedia,
    onMediaRemoved,
}: CurrentMediaGridProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleRemoveMedia = async (mediaId: string) => {
        if (!confirm('Remove this media from the group?')) return

        startTransition(async () => {
            const result = await removeMediaFromGroup(groupId, [mediaId])

            if (result.success) {
                toast.success('Media removed from group')
                onMediaRemoved(mediaId)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to remove media')
            }
        })
    }

    if (groupMedia.length === 0) {
        return (
            <div className='text-muted-foreground py-8 text-center'>
                No media in this group yet. Upload new media or select from the
                gallery.
            </div>
        )
    }

    return (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {groupMedia.map((media) => (
                <div
                    key={media.id}
                    className='group relative overflow-hidden rounded-lg border bg-white'
                >
                    <div className='relative aspect-square'>
                        <Image
                            src={media.thumbnailUrl || media.url}
                            alt={media.title}
                            fill
                            className='object-cover'
                            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                        />
                    </div>
                    <div className='p-3'>
                        <div className='mb-2 flex items-start justify-between gap-2'>
                            <p className='line-clamp-2 text-sm font-medium'>
                                {media.title}
                            </p>
                            <Badge
                                variant={
                                    media.status === 'published'
                                        ? 'default'
                                        : 'secondary'
                                }
                                className='shrink-0'
                            >
                                {media.status}
                            </Badge>
                        </div>
                        <div className='flex gap-2'>
                            <Button
                                variant='outline'
                                size='sm'
                                className='flex-1'
                                asChild
                            >
                                <Link href={`/gallery/media/${media.id}/edit`}>
                                    <ExternalLink className='mr-1 h-3 w-3' />
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleRemoveMedia(media.id)}
                                disabled={isPending}
                            >
                                <Trash2 className='h-3 w-3' />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
