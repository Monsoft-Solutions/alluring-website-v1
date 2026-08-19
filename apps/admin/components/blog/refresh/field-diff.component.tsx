/**
 * Field Diff
 *
 * Server-rendered unified diff for one field of a refresh working copy vs
 * the live original (epic #144, #148). Line-based for the content body,
 * word-based for the short metadata fields — both from the `diff` package,
 * no client JS.
 *
 * @module components/blog/refresh/field-diff
 */
import { diffLines, diffWords } from 'diff'

const MAX_UNCHANGED_CONTEXT_LINES = 3

type FieldDiffProps = {
    label: string
    oldText: string | null
    newText: string | null
    /** Line diff (content body) instead of word diff (short fields). */
    mode?: 'lines' | 'words'
}

/**
 * One field's diff card. Unchanged fields collapse to a single quiet row so
 * the reviewer's attention goes where the changes are.
 */
export function FieldDiff({
    label,
    oldText,
    newText,
    mode = 'words',
}: FieldDiffProps) {
    const before = oldText ?? ''
    const after = newText ?? ''

    if (before === after) {
        return (
            <div className='rounded-md border border-dashed px-4 py-2'>
                <span className='text-sm font-medium'>{label}</span>
                <span className='text-muted-foreground ml-2 text-xs'>
                    Unchanged
                </span>
            </div>
        )
    }

    return (
        <div className='overflow-hidden rounded-md border'>
            <div className='bg-muted/50 border-b px-4 py-2 text-sm font-medium'>
                {label}
            </div>
            <div className='overflow-x-auto p-4 text-sm'>
                {mode === 'lines' ? (
                    <LineDiff before={before} after={after} />
                ) : (
                    <WordDiff before={before} after={after} />
                )}
            </div>
        </div>
    )
}

/** Word-level inline diff for short fields (titles, descriptions). */
function WordDiff({ before, after }: { before: string; after: string }) {
    const parts = diffWords(before, after)
    return (
        <p className='leading-relaxed whitespace-pre-wrap'>
            {parts.map((part, index) =>
                part.added ? (
                    <span
                        key={index}
                        className='rounded-sm bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                    >
                        {part.value}
                    </span>
                ) : part.removed ? (
                    <span
                        key={index}
                        className='rounded-sm bg-red-100 text-red-900 line-through dark:bg-red-950 dark:text-red-300'
                    >
                        {part.value}
                    </span>
                ) : (
                    <span key={index}>{part.value}</span>
                )
            )}
        </p>
    )
}

/**
 * Line-level unified diff for the content body: added/removed lines carry
 * their background; long unchanged runs collapse to their edges.
 */
function LineDiff({ before, after }: { before: string; after: string }) {
    const parts = diffLines(before, after)

    return (
        <pre className='font-mono text-xs leading-relaxed whitespace-pre-wrap'>
            {parts.map((part, index) => {
                const lines = part.value.replace(/\n$/, '').split('\n')

                if (part.added || part.removed) {
                    const className = part.added
                        ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                        : 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-300'
                    const prefix = part.added ? '+ ' : '- '
                    return (
                        <div key={index} className={className}>
                            {lines.map((line, lineIndex) => (
                                <div key={lineIndex}>
                                    {prefix}
                                    {line}
                                </div>
                            ))}
                        </div>
                    )
                }

                // Unchanged block: keep a little context, elide the middle.
                if (lines.length <= MAX_UNCHANGED_CONTEXT_LINES * 2 + 1) {
                    return (
                        <div key={index} className='text-muted-foreground'>
                            {lines.map((line, lineIndex) => (
                                <div key={lineIndex}> {line}</div>
                            ))}
                        </div>
                    )
                }
                return (
                    <div key={index} className='text-muted-foreground'>
                        {lines
                            .slice(0, MAX_UNCHANGED_CONTEXT_LINES)
                            .map((line, lineIndex) => (
                                <div key={`head-${lineIndex}`}> {line}</div>
                            ))}
                        <div className='text-muted-foreground/60 py-0.5 select-none'>
                            ⋯ {lines.length - MAX_UNCHANGED_CONTEXT_LINES * 2}{' '}
                            unchanged lines
                        </div>
                        {lines
                            .slice(-MAX_UNCHANGED_CONTEXT_LINES)
                            .map((line, lineIndex) => (
                                <div key={`tail-${lineIndex}`}> {line}</div>
                            ))}
                    </div>
                )
            })}
        </pre>
    )
}
