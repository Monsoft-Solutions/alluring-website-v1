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
 * up with tabular numerals. Server component; no client JavaScript.
 */
export function FactTable({ facts, caption, className }: FactTableProps) {
    if (facts.length === 0) return null

    return (
        <table
            className={cn(
                'w-full border-collapse text-left text-base tabular-nums',
                className
            )}
        >
            {caption && (
                <caption className='mb-3 text-left text-xs font-bold tracking-[0.14em] text-stone-500 uppercase'>
                    {caption}
                </caption>
            )}
            <tbody>
                {facts.map((fact) => (
                    <tr
                        key={fact.label}
                        className='border-b border-stone-200 last:border-b-0'
                    >
                        <th
                            scope='row'
                            className='w-2/5 py-3 pr-4 align-top text-sm font-bold text-stone-900'
                        >
                            {fact.label}
                        </th>
                        <td className='py-3 align-top text-stone-700'>
                            {fact.value}
                            <CitationLinks citations={fact.citations} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
