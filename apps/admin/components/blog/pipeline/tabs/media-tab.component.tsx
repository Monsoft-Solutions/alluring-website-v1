'use client'

import Image from 'next/image'
import { Image as ImageIcon, Sparkles, Trash2 } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Label } from '@workspace/ui/components/label'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { TabsContent } from '@workspace/ui/components/tabs'

import type { MediaTabProps } from './pipeline-edit-dialog.type'
import { GeneratedImagesGallery } from '../../generated-images-gallery.component'

/**
 * Media tab for the pipeline post edit dialog
 * Handles featured image selection and generation
 */
export function MediaTab({
    featuredImageUrl,
    setFeaturedImageId,
    setFeaturedImageUrl,
    handleSelectGeneratedImage,
    galleryRefresh,
    setFeaturedImageDialogOpen,
    markDirty,
    blogPostId,
}: MediaTabProps) {
    return (
        <TabsContent value='media' className='m-0 h-full'>
            <ScrollArea className='h-full'>
                <div className='space-y-6 p-6'>
                    {/* Current Featured Image */}
                    <div>
                        <Label className='text-xs font-medium text-stone-500'>
                            Featured Image
                        </Label>
                        <div className='mt-2 flex items-start gap-4'>
                            {featuredImageUrl ? (
                                <div className='relative h-32 w-48 overflow-hidden rounded-lg border bg-stone-100'>
                                    <Image
                                        src={featuredImageUrl}
                                        alt='Featured image'
                                        fill
                                        className='object-cover'
                                    />
                                </div>
                            ) : (
                                <div className='flex h-32 w-48 items-center justify-center rounded-lg border-2 border-dashed border-stone-200 bg-stone-50'>
                                    <div className='text-center'>
                                        <ImageIcon className='mx-auto h-8 w-8 text-stone-300' />
                                        <p className='mt-1 text-xs text-stone-400'>
                                            No image
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className='space-y-2'>
                                <Button
                                    type='button'
                                    onClick={() =>
                                        setFeaturedImageDialogOpen(true)
                                    }
                                    disabled={!blogPostId}
                                >
                                    <Sparkles className='mr-2 h-4 w-4' />
                                    Generate Image
                                </Button>
                                {featuredImageUrl && (
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={() => {
                                            setFeaturedImageId(null)
                                            setFeaturedImageUrl(null)
                                            markDirty()
                                        }}
                                    >
                                        <Trash2 className='mr-2 h-4 w-4' />
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Generated Images Gallery */}
                    {blogPostId && (
                        <GeneratedImagesGallery
                            blogPostId={blogPostId}
                            currentFeaturedImageUrl={featuredImageUrl}
                            onSelectImage={handleSelectGeneratedImage}
                            refreshTrigger={galleryRefresh}
                        />
                    )}
                </div>
            </ScrollArea>
        </TabsContent>
    )
}
