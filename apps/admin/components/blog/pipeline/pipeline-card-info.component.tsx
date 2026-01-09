'use client'

import { FileText, User } from 'lucide-react'

type PipelineCardInfoProps = {
    authorName: string | null
    wordCount?: number
    contentType?: string
}

export function PipelineCardInfo({
    authorName,
    wordCount,
    contentType,
}: PipelineCardInfoProps) {
    return (
        <div className='text-muted-foreground mt-2 flex items-center gap-3 text-xs'>
            {authorName && (
                <span className='flex items-center gap-1'>
                    <User className='h-3 w-3' />
                    {authorName}
                </span>
            )}

            {wordCount !== undefined && (
                <span className='flex items-center gap-1'>
                    <FileText className='h-3 w-3' />
                    {wordCount.toLocaleString()}
                </span>
            )}

            {contentType && (
                <span className='truncate'>
                    {contentType.replace(/_/g, ' ')}
                </span>
            )}
        </div>
    )
}
