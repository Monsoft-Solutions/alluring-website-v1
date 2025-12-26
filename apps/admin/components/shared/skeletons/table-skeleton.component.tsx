import { Skeleton } from '@workspace/ui/components/skeleton'

type TableSkeletonProps = {
    /** Number of rows to display. Default: 5 */
    rows?: number
    /** Number of columns to display. Default: 4 */
    columns?: number
    /** Whether to show a header row. Default: false */
    showHeader?: boolean
    /** Custom widths for each column (e.g., ['flex-1', 'w-20', 'w-16']) */
    columnWidths?: string[]
}

/**
 * Configurable table skeleton for loading states.
 */
export function TableSkeleton({
    rows = 5,
    columns = 4,
    showHeader = false,
    columnWidths,
}: TableSkeletonProps) {
    const getColumnClass = (index: number): string => {
        if (columnWidths && columnWidths[index]) {
            return `h-4 ${columnWidths[index]}`
        }
        return index === 0 ? 'h-4 flex-1' : 'h-4 w-16'
    }

    return (
        <div className='space-y-3'>
            {showHeader && (
                <div className='flex items-center gap-4 pb-2'>
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton
                            key={`header-${i}`}
                            className={getColumnClass(i)}
                        />
                    ))}
                </div>
            )}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className='flex items-center gap-4'>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            className={getColumnClass(colIndex)}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}
