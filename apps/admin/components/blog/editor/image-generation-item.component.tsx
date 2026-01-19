'use client'

import {
    Check,
    ImageIcon,
    Loader2,
    X,
    BarChart,
    Megaphone,
    Palette,
    Camera,
    type LucideIcon,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { cn } from '@workspace/ui/lib/utils'

import type { GeneratedImageWithUIState } from '@/lib/hooks/auto-inline-images.type'
import type { UseAutoInlineImagesReturn } from '@/lib/hooks/use-auto-inline-images.hook'

const IMAGE_TYPE_ICONS: Record<string, LucideIcon> = {
    infographic: BarChart,
    marketing: Megaphone,
    illustration: Palette,
    photo: Camera,
} as const

type ImageGenerationItemProps = {
    image: GeneratedImageWithUIState
    index: number
    analysis: UseAutoInlineImagesReturn['analysis']
    onInsert: () => void
}

/**
 * Individual image generation item showing status, thumbnail, and insert button
 */
export function ImageGenerationItem({
    image,
    index,
    analysis,
    onInsert,
}: ImageGenerationItemProps) {
    const opportunity = analysis?.opportunities.find(
        (opp) => opp.id === image.opportunityId
    )

    const Icon = IMAGE_TYPE_ICONS[image.imageType] ?? ImageIcon

    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                image.status === 'success' && 'border-green-200 bg-green-50',
                image.status === 'error' && 'border-red-200 bg-red-50',
                image.isGenerating && 'border-blue-200 bg-blue-50'
            )}
        >
            {/* Thumbnail / Status Icon */}
            <div className='flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white'>
                {image.isGenerating ? (
                    <Loader2 className='h-6 w-6 animate-spin text-blue-500' />
                ) : image.status === 'success' && image.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={image.imageUrl}
                        alt={image.altText ?? 'Generated image'}
                        className='h-full w-full object-cover'
                    />
                ) : image.status === 'error' ? (
                    <X className='h-6 w-6 text-red-500' />
                ) : (
                    <Icon className='text-muted-foreground h-6 w-6' />
                )}
            </div>

            {/* Content */}
            <div className='flex min-w-0 flex-1 flex-col gap-1'>
                <div className='flex items-center gap-2'>
                    <span className='text-xs font-medium'>
                        Image {index + 1}
                    </span>
                    <Badge variant='outline' className='text-xs'>
                        {image.imageType}
                    </Badge>
                    {image.status === 'success' && (
                        <Badge
                            variant='secondary'
                            className='bg-green-100 text-green-700'
                        >
                            <Check className='mr-1 h-3 w-3' />
                            Ready
                        </Badge>
                    )}
                    {image.isGenerating && (
                        <Badge
                            variant='secondary'
                            className='bg-blue-100 text-blue-700'
                        >
                            Generating...
                        </Badge>
                    )}
                </div>

                {opportunity && (
                    <p className='text-muted-foreground line-clamp-2 text-xs'>
                        {opportunity.suggestedSubject}
                    </p>
                )}

                {image.error && (
                    <p className='text-xs text-red-600'>{image.error}</p>
                )}
            </div>

            {/* Insert Button */}
            {image.status === 'success' && image.imageUrl && (
                <Button
                    variant='ghost'
                    size='sm'
                    onClick={onInsert}
                    className='shrink-0'
                >
                    Insert
                </Button>
            )}
        </div>
    )
}
