import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

import {
    CitationLinks,
    type Citation,
} from '@/components/procedures/sections/sources-list.component'

/** One fact: a label, a value with its units, and where it comes from. */
export type Fact = {
    label: string
    value: ReactNode
    citations?: Citation[]
}

type FactTableProps = {
    facts: Fact[]
    /** Visible caption; also names the table for assistive technology. */
    caption?: string
    className?: string
}

/**
 * Facts as a two-column table, one fact per row.
 *
 * A real `<table>` with row headers rather than styled divs: it is the shape
 * AI engines and screen readers both read as label → value, and figures line
 * up with tabular numerals. Below `sm` each row stacks, label over value.
 * Rows are keyed by label, so labels must be unique within a table.
 *
 * Server component; no client JavaScript.
 */
export function FactTable({ facts, caption, className }: FactTableProps) {
    if (facts.length === 0) return null

    return (
        <table
            className={cn(
                'w-full border-collapse text-left tabular-nums',
                className
            )}
        >
            {caption && (
                <caption className='pb-4 text-left font-serif text-xl leading-[1.3] text-stone-900 md:text-2xl'>
                    {caption}
                </caption>
            )}
            <tbody>
                {facts.map((fact) => (
                    <tr
                        key={fact.label}
                        className='border-t border-stone-200 last:border-b'
                    >
                        <th
                            scope='row'
                            className='block pt-3 text-[0.9375rem] leading-[1.45] font-bold text-stone-900 sm:table-cell sm:w-[13.75rem] sm:py-3.5 sm:pr-6 sm:align-top sm:text-base sm:leading-[1.55]'
                        >
                            {fact.label}
                        </th>
                        <td className='block pt-1 pb-3 text-[1.0625rem] leading-normal text-stone-700 sm:table-cell sm:py-3.5 sm:align-top sm:leading-[1.55]'>
                            {fact.value}
                            <CitationLinks citations={fact.citations} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
