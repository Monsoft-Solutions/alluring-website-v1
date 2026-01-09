'use client'

import { Loader2 } from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { TabsContent } from '@workspace/ui/components/tabs'

import type { ContentTabProps } from './pipeline-edit-dialog.type'
import { PostEditor } from '../../editor.component'

/**
 * Content tab for the pipeline post edit dialog
 * Handles title and main content editing
 */
export function ContentTab({
    title,
    setTitle,
    content,
    setContent,
    isLoadingDetail,
    markDirty,
    blogPostId,
}: ContentTabProps) {
    return (
        <TabsContent value='content' className='m-0 h-full'>
            <div className='flex h-full flex-col'>
                <div className='border-b p-4'>
                    <Label className='text-xs font-medium text-stone-500'>
                        Title
                    </Label>
                    <Input
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value)
                            markDirty()
                        }}
                        placeholder='Post title'
                        className='mt-1 border-0 bg-transparent p-0 text-lg font-semibold shadow-none focus-visible:ring-0'
                    />
                </div>
                <div className='flex-1 overflow-auto p-4'>
                    {isLoadingDetail ? (
                        <div className='flex h-full items-center justify-center'>
                            <div className='flex flex-col items-center gap-2 text-stone-400'>
                                <Loader2 className='h-6 w-6 animate-spin' />
                                <p className='text-sm'>Loading content...</p>
                            </div>
                        </div>
                    ) : (
                        <PostEditor
                            content={content}
                            onChange={(val) => {
                                setContent(val)
                                markDirty()
                            }}
                            placeholder='Start writing your post content...'
                            blogPostId={blogPostId}
                        />
                    )}
                </div>
            </div>
        </TabsContent>
    )
}
