import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Loader2, Plus, Target, TrendingUp } from 'lucide-react'

import { OpportunityScore } from './opportunity-score.component'

type OpportunityCardProps = {
    keyword: string
    title: string
    opportunity: number
    volume?: string
    competition?: string
    contentType: string
    onAdd: () => void
    isAdding: boolean
}

export function OpportunityCard({
    keyword,
    title,
    opportunity,
    volume,
    competition,
    contentType,
    onAdd,
    isAdding,
}: OpportunityCardProps) {
    return (
        <div className='group rounded-lg border bg-stone-50 p-3 transition-colors hover:bg-white'>
            <div className='mb-2 flex items-start justify-between'>
                <div className='flex-1 pr-2'>
                    <h4 className='text-sm leading-tight font-medium'>
                        {title}
                    </h4>
                    <div className='mt-1 flex items-center gap-1 text-xs text-stone-500'>
                        <Target className='h-3 w-3' />
                        {keyword}
                    </div>
                </div>
                <div className='flex items-center gap-1'>
                    <OpportunityScore score={opportunity} />
                </div>
            </div>

            <div className='flex items-center justify-between'>
                <div className='flex flex-wrap gap-1'>
                    {volume && (
                        <Badge variant='outline' className='text-[10px]'>
                            <TrendingUp className='mr-0.5 h-2.5 w-2.5' />
                            {volume} Vol
                        </Badge>
                    )}
                    {competition && (
                        <Badge
                            variant='outline'
                            className={`text-[10px] ${
                                competition === 'Low'
                                    ? 'border-green-200 bg-green-50 text-green-700'
                                    : competition === 'Medium'
                                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                                      : 'border-red-200 bg-red-50 text-red-700'
                            }`}
                        >
                            {competition} Comp
                        </Badge>
                    )}
                    <Badge variant='secondary' className='text-[10px]'>
                        {contentType}
                    </Badge>
                </div>
                <Button
                    size='sm'
                    variant='ghost'
                    className='h-6 px-2 opacity-0 transition-opacity group-hover:opacity-100'
                    onClick={onAdd}
                    disabled={isAdding}
                >
                    {isAdding ? (
                        <Loader2 className='h-3 w-3 animate-spin' />
                    ) : (
                        <Plus className='h-3 w-3' />
                    )}
                </Button>
            </div>
        </div>
    )
}
