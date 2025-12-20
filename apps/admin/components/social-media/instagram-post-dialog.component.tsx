'use client'

import type { ReactNode } from 'react'
import { useMemo, useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@workspace/ui/components/tabs'
import { Badge } from '@workspace/ui/components/badge'
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Star,
    StarOff,
    ExternalLink,
    Sparkles,
} from 'lucide-react'

import type { InstagramPostListItem } from '@/lib/types/social-media.type'
import type { GalleryGroupWithSlug } from '@/lib/types/gallery-group.type'
import {
    toggleInstagramPostPublished,
    toggleInstagramPostFeatured,
} from '@/lib/actions/social-media.action'
import { AnalysisEditForm } from './analysis-edit-form.component'

type ProfileInfo = {
    handle: string | null
    profilePictureUrl: string | null
    fullName: string | null
}

type InstagramPostDialogProps = {
    post: InstagramPostListItem | null
    profile?: ProfileInfo | null
    isOpen: boolean
    onClose: () => void
    galleryGroups?: GalleryGroupWithSlug[]
}

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}

function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
}

function formatCaptionWithHashtags(caption: string): ReactNode {
    const parts = caption.split(/(#\w+)/g)
    return parts.map((part, index) => {
        if (part.startsWith('#')) {
            return (
                <span key={index} className='text-blue-600 dark:text-blue-400'>
                    {part}
                </span>
            )
        }
        return part
    })
}

export function InstagramPostDialog({
    post,
    profile,
    isOpen,
    onClose,
    galleryGroups = [],
}: InstagramPostDialogProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [activeTab, setActiveTab] = useState('details')
    const [groups, setGroups] = useState<GalleryGroupWithSlug[]>(galleryGroups)
    const [currentMediaGroupIds, setCurrentMediaGroupIds] = useState<string[]>(
        []
    )

    // Fetch gallery groups if not provided
    useEffect(() => {
        if (isOpen && groups.length === 0) {
            fetch('/api/gallery/groups')
                .then((res) => res.json())
                .then((data) => setGroups(data.groups || []))
                .catch((err) =>
                    console.error('Failed to fetch gallery groups:', err)
                )
        }
    }, [isOpen, groups.length])

    const mediaItems = useMemo(() => {
        if (!post) return []

        const hasCarouselMedia =
            post.mediaType === 'carousel' &&
            (post.carouselMedia?.length ?? 0) > 0

        if (hasCarouselMedia) {
            return post.carouselMedia ?? []
        }

        return [post.media]
    }, [post])

    const boundedIndex =
        mediaItems.length > 0
            ? Math.min(currentImageIndex, mediaItems.length - 1)
            : 0

    // Fetch current media's group assignments when Analysis tab is active
    useEffect(() => {
        if (
            isOpen &&
            activeTab === 'analysis' &&
            post &&
            mediaItems.length > 0
        ) {
            const mediaId = mediaItems[boundedIndex]?.id
            if (mediaId) {
                fetch(`/api/gallery/media/${mediaId}/groups`)
                    .then((res) => res.json())
                    .then((data) =>
                        setCurrentMediaGroupIds(data.groupIds || [])
                    )
                    .catch((err) =>
                        console.error('Failed to fetch media groups:', err)
                    )
            }
        }
    }, [isOpen, activeTab, post, boundedIndex, mediaItems])

    if (!post) return null

    const handleTogglePublished = () => {
        startTransition(async () => {
            await toggleInstagramPostPublished(post.id, !post.isPublished)
            router.refresh()
        })
    }

    const handleToggleFeatured = () => {
        startTransition(async () => {
            await toggleInstagramPostFeatured(post.id, !post.isFeatured)
            router.refresh()
        })
    }

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) =>
            prev > 0 ? prev - 1 : mediaItems.length - 1
        )
    }

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev < mediaItems.length - 1 ? prev + 1 : 0
        )
    }

    const isCarousel = mediaItems.length > 1
    const currentMedia = mediaItems[boundedIndex] ?? post.media

    return (
        <Dialog
            key={post.id}
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent
                size='xl'
                className='max-h-[95vh] max-w-7xl gap-0 overflow-hidden p-0'
                showCloseButton={true}
            >
                <DialogTitle className='sr-only'>
                    Instagram Post Details
                </DialogTitle>
                <DialogDescription className='sr-only'>
                    View and manage this Instagram post
                </DialogDescription>
                <div className='grid h-[90vh] grid-cols-1 md:grid-cols-[1fr_400px]'>
                    {/* Left: Image/Carousel - Taking more space now */}
                    <div className='relative flex min-h-[300px] w-full items-center justify-center overflow-hidden bg-black'>
                        {currentMedia.type === 'video' ? (
                            <video
                                key={currentMedia.id}
                                src={currentMedia.url}
                                controls
                                className='h-full w-full object-contain'
                            />
                        ) : (
                            <Image
                                src={currentMedia.url}
                                alt={
                                    post.caption?.substring(0, 100) ??
                                    'Instagram post'
                                }
                                fill
                                className='object-contain'
                                sizes='(max-width: 768px) 100vw, 70vw'
                                priority
                            />
                        )}

                        {/* Carousel navigation */}
                        {isCarousel && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    className='absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform hover:scale-105'
                                    aria-label='Previous image'
                                >
                                    <ChevronLeft className='h-6 w-6' />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className='absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform hover:scale-105'
                                    aria-label='Next image'
                                >
                                    <ChevronRight className='h-6 w-6' />
                                </button>

                                {/* Carousel dots */}
                                <div className='absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2'>
                                    {mediaItems.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                setCurrentImageIndex(index)
                                            }
                                            className={`h-2 w-2 rounded-full transition-colors ${
                                                index === boundedIndex
                                                    ? 'bg-blue-500'
                                                    : 'bg-white/60'
                                            }`}
                                            aria-label={`Go to image ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: Info panel - Fixed width */}
                    <div className='bg-background flex h-full w-full flex-col overflow-hidden'>
                        {/* Header with profile info */}
                        {profile && (
                            <div className='flex items-center justify-between gap-3 border-b px-4 py-4'>
                                <div className='flex items-center gap-3'>
                                    {profile.profilePictureUrl ? (
                                        <div className='relative h-8 w-8 overflow-hidden rounded-full border'>
                                            <Image
                                                src={profile.profilePictureUrl}
                                                alt={
                                                    profile.handle || 'Profile'
                                                }
                                                fill
                                                className='object-cover'
                                            />
                                        </div>
                                    ) : (
                                        <div className='bg-muted h-8 w-8 rounded-full' />
                                    )}
                                    <div className='flex flex-col'>
                                        <span className='text-sm font-semibold'>
                                            {profile.handle}
                                        </span>
                                    </div>
                                </div>
                                {post.analysisStatus !== 'pending' && (
                                    <Badge
                                        variant='secondary'
                                        className='gap-1'
                                    >
                                        <Sparkles className='h-3 w-3' />
                                        {post.analysisStatus}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Tabs for Details and Analysis */}
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className='flex h-full flex-col'
                        >
                            <TabsList className='w-full justify-start rounded-none border-b px-4'>
                                <TabsTrigger value='details'>
                                    Details
                                </TabsTrigger>
                                {post.analysisStatus !== 'pending' && (
                                    <TabsTrigger value='analysis'>
                                        <Sparkles className='mr-1.5 h-3 w-3' />
                                        Analysis
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            {/* Details Tab */}
                            <TabsContent
                                value='details'
                                className='m-0 flex h-full flex-col overflow-hidden'
                            >
                                {/* Caption - scrollable */}
                                <div className='flex-1 overflow-auto p-4'>
                                    {post.caption ? (
                                        <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                                            {formatCaptionWithHashtags(
                                                post.caption
                                            )}
                                        </p>
                                    ) : (
                                        <p className='text-muted-foreground text-sm'>
                                            No caption
                                        </p>
                                    )}
                                </div>

                                {/* Stats: Likes, plays, timestamp */}
                                <div className='border-t px-4 py-3'>
                                    <div className='mb-2 flex items-center justify-between'>
                                        <div className='flex gap-4'>
                                            <p className='text-sm font-semibold'>
                                                {formatNumber(post.likeCount)}{' '}
                                                likes
                                            </p>
                                            <p className='text-sm font-semibold'>
                                                {formatNumber(
                                                    post.commentCount
                                                )}{' '}
                                                comments
                                            </p>
                                        </div>
                                    </div>

                                    {post.playCount !== null && (
                                        <p className='text-muted-foreground text-xs'>
                                            {formatNumber(post.playCount)} plays
                                        </p>
                                    )}
                                    <p className='text-muted-foreground mt-1 text-xs uppercase'>
                                        {formatRelativeTime(
                                            new Date(post.takenAt)
                                        )}
                                    </p>
                                </div>

                                {/* Admin actions */}
                                <div className='flex flex-col gap-2 border-t px-4 py-4'>
                                    <div className='grid grid-cols-2 gap-2'>
                                        <Button
                                            variant={
                                                post.isPublished
                                                    ? 'outline'
                                                    : 'default'
                                            }
                                            size='sm'
                                            onClick={handleTogglePublished}
                                            disabled={isPending}
                                            className='w-full'
                                        >
                                            {post.isPublished ? (
                                                <>
                                                    <EyeOff className='mr-1.5 h-4 w-4' />
                                                    Unpublish
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className='mr-1.5 h-4 w-4' />
                                                    Publish
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant={
                                                post.isFeatured
                                                    ? 'outline'
                                                    : 'secondary'
                                            }
                                            size='sm'
                                            onClick={handleToggleFeatured}
                                            disabled={isPending}
                                            className='w-full'
                                        >
                                            {post.isFeatured ? (
                                                <>
                                                    <StarOff className='mr-1.5 h-4 w-4' />
                                                    Unfeature
                                                </>
                                            ) : (
                                                <>
                                                    <Star className='mr-1.5 h-4 w-4' />
                                                    Feature
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        asChild
                                        className='w-full'
                                    >
                                        <a
                                            href={post.permalink}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                        >
                                            <ExternalLink className='mr-1.5 h-4 w-4' />
                                            View on Instagram
                                        </a>
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* Analysis Tab */}
                            {post.analysisStatus !== 'pending' && (
                                <TabsContent
                                    value='analysis'
                                    className='m-0 flex-1 overflow-auto p-4'
                                >
                                    <div className='space-y-4'>
                                        <div>
                                            <h3 className='mb-2 font-semibold'>
                                                AI Analysis Results
                                            </h3>
                                            {currentMedia.type === 'image' && (
                                                <AnalysisEditForm
                                                    key={currentMedia.id}
                                                    mediaId={currentMedia.id}
                                                    currentAnalysis={
                                                        currentMedia.aiAnalysis ??
                                                        null
                                                    }
                                                    currentGroupIds={
                                                        currentMediaGroupIds
                                                    }
                                                    galleryGroups={groups}
                                                    onSave={() => {
                                                        router.refresh()
                                                        // Re-fetch group IDs after save
                                                        fetch(
                                                            `/api/gallery/media/${currentMedia.id}/groups`
                                                        )
                                                            .then((res) =>
                                                                res.json()
                                                            )
                                                            .then((data) =>
                                                                setCurrentMediaGroupIds(
                                                                    data.groupIds ||
                                                                        []
                                                                )
                                                            )
                                                            .catch((err) =>
                                                                console.error(
                                                                    'Failed to fetch updated groups:',
                                                                    err
                                                                )
                                                            )
                                                    }}
                                                />
                                            )}
                                            {currentMedia.type === 'video' && (
                                                <p className='text-muted-foreground text-sm'>
                                                    Analysis is only available
                                                    for images.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
