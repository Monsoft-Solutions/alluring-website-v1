/**
 * Reasoning Effort Select Component
 *
 * How hard the model for one pipeline phase should think (epic #194). The
 * vocabulary is OpenRouter's own — it translates effort to each vendor's
 * native knob server-side.
 *
 * @module components/blog/effort-select
 */
'use client'

import {
    REASONING_EFFORTS,
    type ReasoningEffort,
} from '@workspace/ai/models/reasoning-effort.constant'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { cn } from '@workspace/ui/lib/utils'

/**
 * Why each rung exists, shown under the select for the chosen value.
 *
 * `none` is the one that matters: it emits no provider option at all, so the
 * model keeps whatever thinking behaviour it has by default. Explicitly
 * sending `none` would *disable* reasoning on models that think by default.
 */
const EFFORT_HINTS: Record<ReasoningEffort, string> = {
    none: 'Model default — nothing is sent.',
    minimal: 'A brief pass before answering.',
    low: 'Light reasoning. A good first step up.',
    medium: 'Balanced reasoning.',
    high: 'Deep reasoning — noticeably more output tokens.',
    xhigh: 'Maximum reasoning. Expensive on multi-agent phases.',
}

type EffortSelectProps = {
    /** DOM id — must be unique per field on the page */
    id: string
    value: ReasoningEffort
    onChange: (value: ReasoningEffort) => void
    /**
     * Whether the catalog reports the chosen model as reasoning-capable.
     * `undefined` means the model is not in the catalog — a typed custom id —
     * where effort is sent but may be ignored.
     */
    supportsReasoning: boolean | undefined
    /** Accessible label, since the grid header is the only visible one */
    ariaLabel: string
}

/**
 * A six-rung thinking dial for one pipeline phase.
 */
export function EffortSelect({
    id,
    value,
    onChange,
    supportsReasoning,
    ariaLabel,
}: EffortSelectProps) {
    const isUnverified = supportsReasoning === undefined
    const isDisabled = supportsReasoning === false

    const note = isDisabled
        ? 'This model has no reasoning parameter.'
        : isUnverified
          ? 'Unverified — effort is sent but may be ignored.'
          : EFFORT_HINTS[value]

    return (
        <div className='space-y-1'>
            <Select
                value={value}
                onValueChange={(next) => onChange(next as ReasoningEffort)}
                disabled={isDisabled}
            >
                <SelectTrigger
                    id={id}
                    aria-label={ariaLabel}
                    className='w-full text-xs'
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {REASONING_EFFORTS.map((effort) => (
                        <SelectItem key={effort} value={effort}>
                            <span className='font-mono text-xs'>{effort}</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p
                className={cn(
                    'text-xs',
                    isDisabled || isUnverified
                        ? 'text-amber-600'
                        : 'text-muted-foreground'
                )}
            >
                {note}
            </p>
        </div>
    )
}
