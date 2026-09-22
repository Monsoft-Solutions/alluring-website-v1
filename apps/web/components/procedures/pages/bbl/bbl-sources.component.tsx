import { cn } from '@workspace/ui/lib/utils'

import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { ReviewedBy } from '@/components/procedures/sections/reviewed-by.component'
import { sourceAnchorId } from '@/components/procedures/sections/sources-list.component'
import {
    bblSources,
    type BblSource,
} from '@/lib/data/procedures/facts/bbl.facts'

import { bblContainer } from './bbl-ui.constant'

/**
 * A source's date as the list prints it. The facts file holds full dates,
 * year-months or bare years, depending on what the source states.
 */
function sourceDate(date: string): string {
    const [year = 0, month, day] = date.split('-').map(Number)
    if (!month) return String(year)

    return new Date(Date.UTC(year, month - 1, day || 1)).toLocaleDateString(
        'en-US',
        {
            year: 'numeric',
            month: 'long',
            ...(day && { day: 'numeric' }),
            timeZone: 'UTC',
        }
    )
}

function sourceByline(source: BblSource): string {
    return [
        source.publisher,
        source.authors,
        source.date && sourceDate(source.date),
    ]
        .filter(Boolean)
        .join(', ')
}

/**
 * "Where do these figures come from?" Every published source in
 * `bbl.facts.ts`, in the order the facts file lists them. The practice's own
 * figures are stated as ours in the copy, not cited, so they are not listed.
 *
 * Each item carries `#source-{id}`, which the safety section's citations and
 * the fact table's `CitationLinks` point at. There is no reviewer line until
 * #247 names one: the page shows "Last updated" only.
 */
export function BblSources({ updatedOn }: { updatedOn?: string }) {
    const cited = bblSources.filter((source) => source.url)

    return (
        <div className='bbl-defer bg-stone-50'>
            <AnswerBlock
                id='sources'
                question='Where do these figures come from?'
                className={cn(bblContainer, 'py-12 md:py-24')}
                answer="Every recovery, results and safety figure on this page, and the national average cost, comes from the sources below, checked in September 2026. Where a figure is one surgeon's advice rather than a society's guidance, we say so. Your own surgeon's instructions always come first, and they may differ from these general ranges."
            >
                <ol
                    data-copy-check='data'
                    className='mt-8 flex max-w-[50rem] list-decimal flex-col gap-3.5 pl-7 text-base leading-[1.55] text-stone-700 tabular-nums marker:text-stone-400'
                >
                    {cited.map((source) => (
                        <li
                            key={source.id}
                            id={sourceAnchorId(source.id)}
                            className='scroll-mt-32 pl-1.5 lg:scroll-mt-40'
                        >
                            <a
                                href={source.url}
                                rel='noopener noreferrer'
                                target='_blank'
                                className='font-bold text-stone-900 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-900'
                            >
                                {source.title ?? source.publisher}
                            </a>
                            <p className='mt-0.5 text-stone-600'>
                                {sourceByline(source)}
                            </p>
                        </li>
                    ))}
                </ol>
                <div
                    data-copy-check='data'
                    className='mt-9 max-w-[50rem] border-t border-stone-200 pt-6'
                >
                    <ReviewedBy
                        updatedOn={updatedOn}
                        className='text-base text-stone-700'
                    />
                </div>
            </AnswerBlock>
        </div>
    )
}
