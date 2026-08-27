/**
 * Model Combobox Component
 *
 * Searchable picker over the live OpenRouter catalog — every model OpenRouter
 * serves, not a curated constant (epic #194). Off-catalog ids can still be
 * typed, which is the escape hatch the old free-text field provided.
 *
 * @module components/blog/model-combobox
 */
'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, TriangleAlert, Zap } from 'lucide-react'

import type { OpenRouterCatalogModel } from '@workspace/ai/models/openrouter-catalog'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from '@workspace/ui/components/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover'
import { cn } from '@workspace/ui/lib/utils'

/**
 * How many matches render at once.
 *
 * The catalog is 400-odd models; mounting every row makes the popover janky on
 * open. Filtering is ours (`shouldFilter={false}`) precisely so this cap can
 * exist, and the footer says when it bit.
 */
const MAX_VISIBLE = 60

/**
 * An OpenRouter id is anything shaped `vendor/model`.
 *
 * Mirrors `isValidModelId` in `@workspace/ai` so the inline hint matches what
 * the server action will accept.
 */
export function isOpenRouterModelId(value: string): boolean {
    return value.includes('/') && value.length > 3
}

/** Render a per-1M price the way the catalog reports it. */
function formatPrice(pricePerM: number | null): string | null {
    if (pricePerM === null) return null
    return pricePerM >= 1
        ? `$${pricePerM.toFixed(2)}`
        : `$${pricePerM.toFixed(3)}`
}

/** Render a context window compactly: 1000000 → `1M`, 200000 → `200K`. */
function formatContext(tokens: number): string | null {
    if (!tokens) return null
    if (tokens >= 1_000_000) return `${Math.round(tokens / 1_000_000)}M`
    if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`
    return String(tokens)
}

type ModelComboboxProps = {
    /** DOM id — must be unique per field on the page */
    id: string
    /** The configured id, or `''` when the slot is unset */
    value: string
    onChange: (value: string) => void
    /** The full catalog; empty while loading or after a failed fetch */
    models: readonly OpenRouterCatalogModel[]
    /** Shown greyed when `value` is empty — e.g. the function's code default */
    placeholder?: string
    /** Disables the trigger while the catalog is in flight */
    isLoading?: boolean
    /**
     * True when `models` is the checked-in snapshot rather than the live
     * catalog. Suppresses the off-catalog warning: the snapshot is a ~20-model
     * slice, so most valid ids are legitimately absent from it and flagging
     * them would contradict the "catalog is stale" banner above the grid.
     */
    isCatalogStale?: boolean
    /** Accessible label, since the grid header is the only visible one */
    ariaLabel: string
}

/**
 * A searchable model picker backed by the live OpenRouter catalog.
 */
export function ModelCombobox({
    id,
    value,
    onChange,
    models,
    placeholder = 'Select a model',
    isLoading = false,
    isCatalogStale = false,
    ariaLabel,
}: ModelComboboxProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')

    const selected = useMemo(
        () => models.find((model) => model.id === value),
        [models, value]
    )

    // A configured id the live catalog does not return: either OpenRouter
    // retired it, or it was typed by hand. Flagged rather than silently
    // accepted — the pipeline's auto-retry does not cover a bad model id.
    //
    // Only meaningful against the *live* catalog. The fallback snapshot holds
    // ~20 models, so judging an id against it would flag most valid configs.
    const isOffCatalog =
        Boolean(value) && !selected && models.length > 0 && !isCatalogStale

    const { matches, hiddenCount } = useMemo(() => {
        // Match on every whitespace-separated token rather than the raw string.
        // Model ids interleave the version — "gemini flash" has to find
        // `google/gemini-3.6-flash`, which contains neither word adjacent to
        // the other. A plain substring test returns almost nothing here.
        const tokens = search.trim().toLowerCase().split(/\s+/).filter(Boolean)

        const filtered = tokens.length
            ? models.filter((model) => {
                  const haystack = `${model.id} ${model.name}`.toLowerCase()
                  return tokens.every((token) => haystack.includes(token))
              })
            : models

        return {
            matches: filtered.slice(0, MAX_VISIBLE),
            hiddenCount: Math.max(0, filtered.length - MAX_VISIBLE),
        }
    }, [models, search])

    // Let an unlisted id be used as typed — the catalog is a convenience, not
    // a whitelist, and the server action accepts any `vendor/model`.
    const typed = search.trim()
    const canUseTyped =
        isOpenRouterModelId(typed) && !models.some((m) => m.id === typed)

    const commit = (modelId: string) => {
        onChange(modelId)
        setSearch('')
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type='button'
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    aria-label={ariaLabel}
                    disabled={isLoading}
                    className={cn(
                        'w-full justify-between font-mono text-xs',
                        isOffCatalog && 'border-amber-500',
                        !value && 'text-muted-foreground'
                    )}
                >
                    <span className='truncate'>
                        {value || (isLoading ? 'Loading models…' : placeholder)}
                    </span>
                    <ChevronsUpDown className='ml-2 h-3.5 w-3.5 shrink-0 opacity-50' />
                </Button>
            </PopoverTrigger>

            <PopoverContent className='w-[min(30rem,90vw)] p-0' align='start'>
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder='Search 400+ models — try "gemini flash"'
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        {matches.length === 0 && !canUseTyped && (
                            <CommandEmpty>
                                {models.length === 0
                                    ? 'Catalog unavailable — type a vendor/model id.'
                                    : 'No model matches that search.'}
                            </CommandEmpty>
                        )}

                        {canUseTyped && (
                            <CommandItem
                                value={typed}
                                onSelect={() => commit(typed)}
                                className='gap-2'
                            >
                                <Check className='h-3.5 w-3.5 opacity-0' />
                                <span className='font-mono text-xs'>
                                    Use{' '}
                                    <span className='text-foreground'>
                                        {typed}
                                    </span>
                                </span>
                                <Badge variant='outline' className='ml-auto'>
                                    custom
                                </Badge>
                            </CommandItem>
                        )}

                        {matches.map((model) => {
                            const price = formatPrice(model.promptPricePerM)
                            const context = formatContext(model.contextLength)

                            return (
                                <CommandItem
                                    key={model.id}
                                    value={model.id}
                                    onSelect={() => commit(model.id)}
                                    className='gap-2'
                                >
                                    <Check
                                        className={cn(
                                            'h-3.5 w-3.5 shrink-0',
                                            model.id === value
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />
                                    <span className='truncate font-mono text-xs'>
                                        {model.id}
                                    </span>
                                    <span className='ml-auto flex shrink-0 items-center gap-1'>
                                        {context && (
                                            <Badge variant='outline'>
                                                {context}
                                            </Badge>
                                        )}
                                        {price && (
                                            <Badge variant='outline'>
                                                {price}
                                            </Badge>
                                        )}
                                        {model.supportsReasoning && (
                                            <Badge
                                                variant='secondary'
                                                title='Supports reasoning effort'
                                            >
                                                <Zap className='h-3 w-3' />
                                            </Badge>
                                        )}
                                        {model.isFreeVariant && (
                                            <Badge
                                                variant='outline'
                                                className='border-amber-500 text-amber-600'
                                                title='Free tier — heavily rate limited'
                                            >
                                                free
                                            </Badge>
                                        )}
                                    </span>
                                </CommandItem>
                            )
                        })}
                    </CommandList>

                    {hiddenCount > 0 && (
                        <p className='text-muted-foreground border-t px-3 py-2 text-xs'>
                            {hiddenCount} more match — keep typing to narrow.
                        </p>
                    )}
                </Command>
            </PopoverContent>

            {isOffCatalog && (
                <p className='mt-1 flex items-start gap-1 text-xs text-amber-600'>
                    <TriangleAlert className='mt-0.5 h-3 w-3 shrink-0' />
                    <span>
                        Not in the OpenRouter catalog. It will still be sent —
                        and will fail at call time if OpenRouter has retired it.
                    </span>
                </p>
            )}
        </Popover>
    )
}
