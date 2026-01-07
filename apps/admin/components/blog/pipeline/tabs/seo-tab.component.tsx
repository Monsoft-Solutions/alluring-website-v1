'use client'

import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { TabsContent } from '@workspace/ui/components/tabs'

import type { SeoTabProps } from './pipeline-edit-dialog.type'

/**
 * SEO tab for the pipeline post edit dialog
 * Handles meta title, description, keywords, and excerpt
 */
export function SeoTab({
    title,
    metaTitle,
    setMetaTitle,
    metaDescription,
    setMetaDescription,
    metaKeywords,
    setMetaKeywords,
    excerpt,
    setExcerpt,
    markDirty,
}: SeoTabProps) {
    return (
        <TabsContent value='seo' className='m-0 h-full'>
            <ScrollArea className='h-full'>
                <div className='space-y-6 p-6'>
                    <div className='grid gap-6 md:grid-cols-2'>
                        {/* Meta Title */}
                        <div>
                            <Label className='text-xs font-medium text-stone-500'>
                                Meta Title
                            </Label>
                            <Input
                                value={metaTitle}
                                onChange={(e) => {
                                    setMetaTitle(e.target.value)
                                    markDirty()
                                }}
                                placeholder='SEO title (defaults to post title)'
                                className='mt-1'
                            />
                            <p className='mt-1 text-xs text-stone-400'>
                                {(metaTitle || title).length}/60 characters
                            </p>
                        </div>

                        {/* Meta Keywords */}
                        <div>
                            <Label className='text-xs font-medium text-stone-500'>
                                Meta Keywords
                            </Label>
                            <Input
                                value={metaKeywords}
                                onChange={(e) => {
                                    setMetaKeywords(e.target.value)
                                    markDirty()
                                }}
                                placeholder='keyword1, keyword2, keyword3'
                                className='mt-1'
                            />
                        </div>
                    </div>

                    {/* Meta Description */}
                    <div>
                        <Label className='text-xs font-medium text-stone-500'>
                            Meta Description
                        </Label>
                        <Textarea
                            value={metaDescription}
                            onChange={(e) => {
                                setMetaDescription(e.target.value)
                                markDirty()
                            }}
                            placeholder='Brief description for search results'
                            rows={3}
                            className='mt-1'
                        />
                        <p className='mt-1 text-xs text-stone-400'>
                            {metaDescription.length}/160 characters
                        </p>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <Label className='text-xs font-medium text-stone-500'>
                            Excerpt
                        </Label>
                        <Textarea
                            value={excerpt}
                            onChange={(e) => {
                                setExcerpt(e.target.value)
                                markDirty()
                            }}
                            placeholder='Short summary shown in blog listings'
                            rows={3}
                            className='mt-1'
                        />
                    </div>
                </div>
            </ScrollArea>
        </TabsContent>
    )
}
