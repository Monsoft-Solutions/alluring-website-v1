import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

import { moduleH3 } from './module-ui.constant'

export type ModuleComparisonColumn = {
    /** Stable key, e.g. "saline". */
    key: string
    /** The option as the column names it, e.g. "Saline implants". */
    label: string
}

export type ModuleComparisonRow = {
    /** What the row compares, e.g. "What fills it". */
    label: string
    /** One cell per column, in the columns' order. */
    cells: ReactNode[]
}

/**
 * Two or more options side by side: saline vs silicone, mini vs full vs
 * extended tummy tuck. A real table: a caption, a column header per option
 * and a row header per thing compared, so screen readers announce "Silicone,
 * feel: …" and AI engines read the matrix as one.
 *
 * From `md` it is a table. Below `md` each row stacks: the row's label, then
 * each option's cell under that option's name. A phone keeps the options
 * being compared next to each other, one question at a time, and nothing is
 * hidden behind a sideways scroll that a reader has to discover; the page
 * never scrolls sideways. The names repeated in the cells are
 * `aria-hidden`: assistive technology gets them from the column headers,
 * and the explicit table roles keep those headers when the rows restyle to
 * blocks. From `md` the options' columns share the width equally; the kit
 * sizes it for two to four options.
 *
 * Server component; no client JavaScript.
 */
export function ModuleComparison({
    caption,
    columns,
    rows,
    rowLabel,
    note,
    className,
}: {
    /** Names the table, shown over it as the block's heading. */
    caption: string
    columns: ModuleComparisonColumn[]
    rows: ModuleComparisonRow[]
    /** Header over the row labels, e.g. "Compare". Empty when unset. */
    rowLabel?: string
    /** A line under the table: a source, or what the surgeon decides. */
    note?: ReactNode
    className?: string
}) {
    for (const row of rows) {
        if (row.cells.length !== columns.length) {
            throw new Error(
                `ModuleComparison row "${row.label}" has ${row.cells.length} cells for ${columns.length} columns`
            )
        }
    }

    return (
        <div className={cn('mt-10 md:mt-11', className)}>
            {/* The roles restate the elements' own: a table whose rows are
                restyled as blocks can lose its table semantics in some
                browsers, and with them the column headers. */}
            <table
                role='table'
                className='block w-full border-collapse text-left tabular-nums md:table md:table-fixed'
            >
                <caption
                    className={cn(moduleH3, 'block text-left md:table-caption')}
                >
                    {caption}
                </caption>
                <thead role='rowgroup' className='max-md:sr-only'>
                    <tr role='row'>
                        {rowLabel ? (
                            <th
                                role='columnheader'
                                scope='col'
                                className='pt-5 pr-5 pb-3 align-bottom text-[0.9375rem] leading-[1.45] font-bold text-stone-500 md:w-[11rem]'
                            >
                                {rowLabel}
                            </th>
                        ) : (
                            <td role='cell' className='md:w-[11rem]' />
                        )}
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                role='columnheader'
                                scope='col'
                                className='pt-5 pr-5 pb-3 align-bottom text-base leading-[1.45] font-bold text-stone-900 last:pr-0'
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody
                    role='rowgroup'
                    className='mt-4 block md:mt-0 md:table-row-group'
                >
                    {rows.map((row) => (
                        <tr
                            key={row.label}
                            role='row'
                            className='block border-t border-stone-200 py-4 last:border-b md:table-row md:py-0'
                        >
                            <th
                                role='rowheader'
                                scope='row'
                                className='block text-[1.0625rem] leading-[1.45] font-bold text-stone-900 md:table-cell md:py-3.5 md:pr-5 md:align-top md:text-base md:leading-[1.55]'
                            >
                                {row.label}
                            </th>
                            {row.cells.map((cell, index) => (
                                <td
                                    key={columns[index]!.key}
                                    role='cell'
                                    className='mt-2 grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-x-4 text-[1.0625rem] leading-[1.55] text-stone-700 md:mt-0 md:table-cell md:py-3.5 md:pr-5 md:align-top md:text-base md:last:pr-0'
                                >
                                    <span
                                        aria-hidden='true'
                                        className='text-[0.9375rem] leading-[1.6] font-bold text-stone-500 md:hidden'
                                    >
                                        {columns[index]!.label}
                                    </span>
                                    <span>{cell}</span>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {note && (
                <p className='mt-4 max-w-[41.25rem] text-[0.9375rem] leading-[1.55] text-stone-600 md:text-base md:leading-[1.6]'>
                    {note}
                </p>
            )}
        </div>
    )
}
