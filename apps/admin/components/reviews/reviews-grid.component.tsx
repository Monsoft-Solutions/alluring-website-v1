'use client'

/**
 * Reviews Grid Component
 *
 * Displays a grid of Google reviews with actions.
 *
 * @module components/reviews/reviews-grid
 */
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Switch } from '@workspace/ui/components/switch'
import { Star, Eye, EyeOff, Award, Loader2 } from 'lucide-react'
import Image from 'next/image'

import {
    toggleReviewPublished,
    toggleReviewFeatured,
} from '@/lib/actions/google-reviews.action'
import type { GoogleReviewListItem } from '@/lib/queries/google-reviews.query'

type ReviewsGridProps = {
    reviews: GoogleReviewListItem[]
    total: number
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className='flex items-center gap-0.5'>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${
                        i < rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                    }`}
                />
            ))}
        </div>
    )
}

function ReviewCard({ review }: { review: GoogleReviewListItem }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [localPublished, setLocalPublished] = useState(review.isPublished)
    const [localFeatured, setLocalFeatured] = useState(review.isFeatured)

    const handlePublishedChange = (checked: boolean) => {
        setLocalPublished(checked)
        startTransition(async () => {
            await toggleReviewPublished(review.id, checked)
            router.refresh()
        })
    }

    const handleFeaturedChange = () => {
        const newFeatured = !localFeatured
        setLocalFeatured(newFeatured)
        startTransition(async () => {
            await toggleReviewFeatured(review.id, newFeatured)
            router.refresh()
        })
    }

    return (
        <Card
            className={`transition-all ${
                !localPublished ? 'opacity-60' : ''
            } ${localFeatured ? 'ring-2 ring-yellow-400' : ''}`}
        >
            <CardContent className='p-4'>
                {/* Header */}
                <div className='mb-3 flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                        {review.reviewerPhotoUrl ? (
                            <Image
                                src={review.reviewerPhotoUrl}
                                alt={review.reviewerName}
                                width={40}
                                height={40}
                                className='rounded-full'
                            />
                        ) : (
                            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-200'>
                                <span className='text-lg font-medium text-gray-600'>
                                    {review.reviewerName
                                        .charAt(0)
                                        .toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div>
                            <p className='font-medium'>{review.reviewerName}</p>
                            <StarRating rating={review.rating} />
                        </div>
                    </div>
                    <span className='text-muted-foreground text-sm'>
                        {new Date(review.reviewCreatedAt).toLocaleDateString()}
                    </span>
                </div>

                {/* Comment */}
                {review.comment && (
                    <p className='mb-3 line-clamp-4 text-sm text-gray-700'>
                        {review.comment}
                    </p>
                )}

                {/* Owner Reply */}
                {review.replyText && (
                    <div className='mb-3 rounded-lg bg-gray-50 p-3'>
                        <p className='mb-1 text-xs font-medium text-gray-500'>
                            Owner Reply
                        </p>
                        <p className='line-clamp-2 text-sm text-gray-600'>
                            {review.replyText}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className='flex items-center justify-between border-t pt-3'>
                    <div className='flex items-center gap-4'>
                        {/* Published Toggle */}
                        <div className='flex items-center gap-2'>
                            <Switch
                                checked={localPublished}
                                onCheckedChange={handlePublishedChange}
                                disabled={isPending}
                            />
                            <span className='text-muted-foreground text-sm'>
                                {localPublished ? (
                                    <Eye className='h-4 w-4' />
                                ) : (
                                    <EyeOff className='h-4 w-4' />
                                )}
                            </span>
                        </div>

                        {/* Featured Toggle */}
                        <Button
                            variant={localFeatured ? 'default' : 'outline'}
                            size='sm'
                            onClick={handleFeaturedChange}
                            disabled={isPending}
                            className={
                                localFeatured
                                    ? 'bg-yellow-500 hover:bg-yellow-600'
                                    : ''
                            }
                        >
                            {isPending ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                                <Award className='h-4 w-4' />
                            )}
                        </Button>
                    </div>

                    <span className='text-muted-foreground text-xs'>
                        Order: {review.displayOrder}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}

export function ReviewsGrid({ reviews, total }: ReviewsGridProps) {
    if (reviews.length === 0) {
        return (
            <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                    <Star className='mb-4 h-12 w-12 text-gray-300' />
                    <p className='text-muted-foreground text-lg'>
                        No reviews found
                    </p>
                    <p className='text-muted-foreground text-sm'>
                        Sync reviews from Google to see them here.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className='space-y-4'>
            <p className='text-muted-foreground text-sm'>
                Showing {reviews.length} of {total} reviews
            </p>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </div>
        </div>
    )
}
