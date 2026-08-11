/**
 * Blog AI Model Field Component
 *
 * One model picker: a provider-grouped select of curated models plus a
 * free-text OpenRouter override. Used for both the content and review model
 * fields on the Blog AI Settings page.
 *
 * @module components/blog/blog-ai-model-field
 */
'use client'

import { AVAILABLE_MODELS, type ModelProvider } from '@workspace/ai'
import { Badge } from '@workspace/ui/components/badge'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

/**
 * Provider display order and labels for the grouped select.
 */
const PROVIDER_GROUPS: ReadonlyArray<{
    provider: ModelProvider
    label: string
}> = [
    { provider: 'anthropic', label: 'Anthropic' },
    { provider: 'openai', label: 'OpenAI' },
    { provider: 'openrouter', label: 'OpenRouter' },
]

/**
 * An OpenRouter id is anything shaped `vendor/model`.
 *
 * Mirrors `isValidModelId` in `@workspace/ai` so the inline hint matches what
 * the server action will accept.
 */
export function isOpenRouterModelId(value: string): boolean {
    return value.includes('/') && value.length > 3
}

type BlogAiModelFieldProps = {
    /** DOM id prefix — must be unique per field on the page */
    id: string
    label: string
    description: string
    /** Curated model id backing the select */
    selectedModelId: string
    /** Free-text OpenRouter override. Empty means "use the select". */
    customModelId: string
    onSelectedModelIdChange: (value: string) => void
    onCustomModelIdChange: (value: string) => void
}

export function BlogAiModelField({
    id,
    label,
    description,
    selectedModelId,
    customModelId,
    onSelectedModelIdChange,
    onCustomModelIdChange,
}: BlogAiModelFieldProps) {
    const trimmedCustom = customModelId.trim()
    const hasCustom = trimmedCustom.length > 0
    const isCustomValid = isOpenRouterModelId(trimmedCustom)

    // The custom input wins whenever it holds anything, so the "active" line
    // tells the admin exactly which id will reach the pipeline.
    const activeModelId = hasCustom ? trimmedCustom : selectedModelId

    return (
        <div className='space-y-3'>
            <div>
                <Label htmlFor={`${id}-select`}>{label}</Label>
                <p className='text-muted-foreground text-xs'>{description}</p>
            </div>

            <Select
                value={selectedModelId}
                onValueChange={onSelectedModelIdChange}
                disabled={hasCustom}
            >
                <SelectTrigger id={`${id}-select`} className='w-full'>
                    <SelectValue placeholder='Select a model' />
                </SelectTrigger>
                <SelectContent>
                    {PROVIDER_GROUPS.map(({ provider, label: groupLabel }) => (
                        <SelectGroup key={provider}>
                            <SelectLabel>{groupLabel}</SelectLabel>
                            {AVAILABLE_MODELS.filter(
                                (model) => model.provider === provider
                            ).map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                    <span className='flex items-center gap-2'>
                                        <span>{model.name}</span>
                                        <Badge
                                            variant={
                                                model.recommended
                                                    ? 'secondary'
                                                    : 'outline'
                                            }
                                        >
                                            {model.tier}
                                        </Badge>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    ))}
                </SelectContent>
            </Select>

            <div className='space-y-1.5'>
                <Label htmlFor={`${id}-custom`} className='text-xs font-normal'>
                    Custom OpenRouter model{' '}
                    <span className='text-muted-foreground'>
                        (overrides the selection above)
                    </span>
                </Label>
                <Input
                    id={`${id}-custom`}
                    value={customModelId}
                    onChange={(event) =>
                        onCustomModelIdChange(event.target.value)
                    }
                    placeholder='vendor/model — any model on openrouter.ai/models'
                    className='font-mono text-sm'
                    aria-invalid={hasCustom && !isCustomValid}
                />
                {hasCustom && !isCustomValid && (
                    <p className='text-sm text-red-500'>
                        Must be an OpenRouter id in <code>vendor/model</code>{' '}
                        form, e.g. <code>google/gemini-3.6-flash</code>.
                    </p>
                )}
            </div>

            <p className='text-muted-foreground text-xs'>
                Active:{' '}
                <code className='text-foreground font-mono'>
                    {activeModelId}
                </code>
                {hasCustom && ' (custom)'}
            </p>
        </div>
    )
}
