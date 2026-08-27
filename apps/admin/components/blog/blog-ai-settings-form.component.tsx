/**
 * Blog AI Settings Form Component
 *
 * Edits the singleton blog pipeline configuration: which model runs each phase
 * and how hard it thinks (epic #194), the fal.ai image model and art
 * direction, plus the Autopilot and Content Refresh loops.
 *
 * @module components/blog/blog-ai-settings-form
 */
'use client'

import { useMemo, useState } from 'react'
import { Loader2, Save, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { ARTISTIC_IMAGE_STYLES, type ArtisticImageStyleId } from '@workspace/ai'
import type { OpenRouterCatalogModel } from '@workspace/ai/models/openrouter-catalog'
import type { ReasoningEffort } from '@workspace/ai/models/reasoning-effort.constant'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import { EffortSelect } from '@/components/blog/effort-select.component'
import {
    ModelCombobox,
    isOpenRouterModelId,
} from '@/components/blog/model-combobox.component'
import { useOpenRouterCatalog } from '@/hooks/use-openrouter-catalog.hook'
import { updateBlogAiConfig } from '@/lib/actions/blog-ai-config.action'
import type {
    AutopilotCadence,
    AutopilotMode,
    BlogAiConfig,
    RefreshMode,
} from '@/lib/queries/blog-ai-config.query'
import {
    IMAGE_MODELS,
    type ImageModelId,
} from '@/lib/services/fal-image-generation.service'

/**
 * Sentinel for the "auto" artistic style option.
 *
 * Radix selects cannot hold an empty-string value, so `null` is represented by
 * this token in the UI and mapped back to `null` on save.
 */
const AUTO_STYLE_VALUE = '__auto__'

/**
 * The seven configurable slots, in pipeline order.
 *
 * Declarative because the grid renders straight from it — adding a slot is a
 * row here plus a column in `blog_ai_config`, not another pair of `useState`
 * calls and another block of JSX.
 */
const PHASE_FIELDS = [
    {
        key: 'ideation',
        label: 'Ideation',
        hint: 'Topic generation — keyword and Search Console modes.',
        hasEffort: true,
    },
    {
        key: 'content',
        label: 'Content generation',
        hint: 'Research and drafting the post.',
        hasEffort: true,
    },
    {
        key: 'review',
        label: 'Reviews',
        hint: 'Shared by all seven review agents.',
        hasEffort: true,
    },
    {
        key: 'orchestrator',
        label: 'Orchestrator',
        hint: 'The editor pass that merges review findings back in.',
        hasEffort: true,
        canInherit: true,
    },
    {
        key: 'extraction',
        label: 'Metadata extraction',
        hint: 'SEO title, meta description, slug and FAQs.',
        hasEffort: true,
    },
    {
        key: 'imagePrompt',
        label: 'Image prompt',
        hint: 'Writes the featured-image concept and picks options.',
        hasEffort: true,
        isOptional: true,
    },
    {
        key: 'imageAlt',
        label: 'Image alt text',
        hint: 'One line of accessibility copy — no thinking needed.',
        hasEffort: false,
        isOptional: true,
    },
] as const

type PhaseKey = (typeof PHASE_FIELDS)[number]['key']

/** Model id + effort for one slot. An empty id means "unset". */
type PhaseSlot = { modelId: string; effort: ReasoningEffort }

/**
 * The effort that will actually be sent for a slot.
 *
 * A model the catalog reports as non-reasoning gets `none` regardless of what
 * is stored: the row's select is disabled and says so, and saving the stored
 * value anyway would keep emitting `reasoning: { effort }` on a model that
 * cannot use it. This keeps what the admin sees and what gets saved identical,
 * including for a config written before the model lost support.
 *
 * **Never clamps against the fallback snapshot.** That snapshot is a small,
 * hand-refreshed slice, so its capability flags go stale — clamping on them
 * would quietly rewrite a perfectly good `high` to `none` the first time an
 * admin saves during an OpenRouter outage, and the banner above the grid
 * promises the opposite ("Choices still save").
 */
function effortFor(
    slot: PhaseSlot,
    supportsReasoning: boolean | undefined,
    isCatalogStale: boolean
): ReasoningEffort {
    return supportsReasoning === false && !isCatalogStale ? 'none' : slot.effort
}

/** Every slot's current value, keyed by phase. */
type PhaseSlots = Record<PhaseKey, PhaseSlot>

/**
 * Seed the grid from the stored configuration.
 *
 * The orchestrator reads its *override* rather than the resolved id, so an
 * inherited slot stays inherited instead of being pinned on first save.
 */
function toPhaseSlots(config: BlogAiConfig): PhaseSlots {
    return {
        ideation: {
            modelId: config.ideationModelId,
            effort: config.ideationEffort,
        },
        content: {
            modelId: config.contentModelId,
            effort: config.contentEffort,
        },
        review: {
            modelId: config.reviewModelId,
            effort: config.reviewEffort,
        },
        orchestrator: {
            modelId: config.orchestratorModelIdOverride ?? '',
            effort: config.orchestratorEffort,
        },
        extraction: {
            modelId: config.extractionModelId,
            effort: config.extractionEffort,
        },
        imagePrompt: {
            modelId: config.imagePromptModelId ?? '',
            effort: config.imagePromptEffort,
        },
        imageAlt: { modelId: config.imageAltModelId ?? '', effort: 'none' },
    }
}

type BlogAiSettingsFormProps = {
    initialData: BlogAiConfig
}

export function BlogAiSettingsForm({ initialData }: BlogAiSettingsFormProps) {
    const catalog = useOpenRouterCatalog()
    const [slots, setSlots] = useState<PhaseSlots>(() =>
        toPhaseSlots(initialData)
    )

    /** Patch one slot without disturbing the others. */
    const patchSlot = (key: PhaseKey, patch: Partial<PhaseSlot>) =>
        setSlots((current) => ({
            ...current,
            [key]: { ...current[key], ...patch },
        }))

    const [imageModelId, setImageModelId] = useState<ImageModelId>(
        initialData.imageModelId
    )
    const [artisticStyleId, setArtisticStyleId] =
        useState<ArtisticImageStyleId | null>(initialData.artisticStyleId)
    const [autopilotMode, setAutopilotMode] = useState<AutopilotMode>(
        initialData.autopilotMode
    )
    const [autopilotIdeationCadence, setAutopilotIdeationCadence] =
        useState<AutopilotCadence>(initialData.autopilotIdeationCadence)
    const [autopilotContentCadence, setAutopilotContentCadence] =
        useState<AutopilotCadence>(initialData.autopilotContentCadence)
    const [autopilotPostsPerRun, setAutopilotPostsPerRun] = useState(
        initialData.autopilotPostsPerRun
    )
    const [autopilotDraftCap, setAutopilotDraftCap] = useState(
        initialData.autopilotDraftCap
    )
    const [autopilotIdeasPerRun, setAutopilotIdeasPerRun] = useState(
        initialData.autopilotIdeasPerRun
    )
    const [refreshMode, setRefreshMode] = useState<RefreshMode>(
        initialData.refreshMode
    )
    const [refreshStaleMonths, setRefreshStaleMonths] = useState(
        initialData.refreshStaleMonths
    )
    const [refreshPositionDropThreshold, setRefreshPositionDropThreshold] =
        useState(initialData.refreshPositionDropThreshold)
    const [refreshCooldownDays, setRefreshCooldownDays] = useState(
        initialData.refreshCooldownDays
    )
    const [refreshDraftCap, setRefreshDraftCap] = useState(
        initialData.refreshDraftCap
    )
    const [isSubmitting, setIsSubmitting] = useState(false)

    // A slot with an id that is neither in the catalog nor `vendor/model`
    // shaped cannot be saved — the server action rejects it anyway, so say so
    // here rather than round-tripping a failure.
    const invalidSlots = useMemo(
        () =>
            PHASE_FIELDS.filter(({ key }) => {
                const id = slots[key].modelId.trim()
                if (!id) return false
                return !catalog.byId.has(id) && !isOpenRouterModelId(id)
            }).map(({ label }) => label),
        [slots, catalog.byId]
    )

    // Required slots must hold something; the optional ones fall through to
    // their own code defaults when left empty.
    const emptyRequiredSlots = useMemo(
        () =>
            PHASE_FIELDS.filter(
                (field) =>
                    !('isOptional' in field && field.isOptional) &&
                    !('canInherit' in field && field.canInherit) &&
                    !slots[field.key].modelId.trim()
            ).map(({ label }) => label),
        [slots]
    )

    // What each slot will actually run with, after the orchestrator's inherit
    // fallback and the non-reasoning clamp. Render, save and the cost hint all
    // read this, so the three can never disagree.
    const resolved = useMemo(() => {
        const entries = PHASE_FIELDS.map((field) => {
            const slot = slots[field.key]
            const trimmed = slot.modelId.trim()
            const canInherit = 'canInherit' in field && field.canInherit
            const modelId =
                canInherit && !trimmed ? slots.review.modelId.trim() : trimmed
            const catalogEntry = catalog.byId.get(modelId)

            // An unset optional slot falls through to the function's own code
            // default. The catalog cannot speak for it, so leave the dial
            // enabled but `undefined` — which renders the honest "unverified"
            // note rather than a confident one about a model nobody picked.
            const supportsReasoning = catalogEntry?.supportsReasoning

            return [
                field.key,
                {
                    modelId,
                    catalogEntry,
                    supportsReasoning,
                    effort: effortFor(slot, supportsReasoning, catalog.isStale),
                },
            ] as const
        })

        return Object.fromEntries(entries) as Record<
            PhaseKey,
            {
                modelId: string
                catalogEntry: OpenRouterCatalogModel | undefined
                supportsReasoning: boolean | undefined
                effort: ReasoningEffort
            }
        >
    }, [slots, catalog.byId, catalog.isStale])

    // Input cost of one pass through the text phases, at list price. Counts the
    // *resolved* model, so an inherited orchestrator contributes the review
    // model's price rather than nothing. Effort raises *output* tokens, which
    // this cannot know in advance — hence the note beside it.
    const { inputCostPerM, pricedSlots, costedSlots } = useMemo(() => {
        const withEffort = PHASE_FIELDS.filter((field) => field.hasEffort)
        const prices = withEffort.map(
            ({ key }) => resolved[key].catalogEntry?.promptPricePerM ?? null
        )

        return {
            inputCostPerM: prices.reduce<number>(
                (total, price) => total + (price ?? 0),
                0
            ),
            pricedSlots: prices.filter((price) => price !== null).length,
            costedSlots: withEffort.length,
        }
    }, [resolved])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (invalidSlots.length > 0) {
            toast.error(
                `Fix the model id for ${invalidSlots.join(', ')} — use a listed model or a "vendor/model" id.`
            )
            return
        }

        if (emptyRequiredSlots.length > 0) {
            toast.error(`Pick a model for ${emptyRequiredSlots.join(', ')}.`)
            return
        }

        setIsSubmitting(true)

        try {
            const result = await updateBlogAiConfig({
                ideationModelId: slots.ideation.modelId.trim(),
                ideationEffort: resolved.ideation.effort,
                contentModelId: slots.content.modelId.trim(),
                contentEffort: resolved.content.effort,
                reviewModelId: slots.review.modelId.trim(),
                reviewEffort: resolved.review.effort,
                // Empty means "inherit Reviews"; the action normalizes to null.
                orchestratorModelId: slots.orchestrator.modelId.trim(),
                orchestratorEffort: resolved.orchestrator.effort,
                extractionModelId: slots.extraction.modelId.trim(),
                extractionEffort: resolved.extraction.effort,
                // Empty means "use the function's own code default".
                imagePromptModelId: slots.imagePrompt.modelId.trim(),
                imagePromptEffort: resolved.imagePrompt.effort,
                imageAltModelId: slots.imageAlt.modelId.trim(),
                imageModelId,
                artisticStyleId,
                autopilotMode,
                autopilotIdeationCadence,
                autopilotContentCadence,
                autopilotPostsPerRun,
                autopilotDraftCap,
                autopilotIdeasPerRun,
                refreshMode,
                refreshStaleMonths,
                refreshPositionDropThreshold,
                refreshCooldownDays,
                refreshDraftCap,
            })

            if (result.success) {
                toast.success('Blog AI settings saved')
            } else {
                toast.error(result.error ?? 'Failed to save settings')
            }
        } catch {
            toast.error('An error occurred while saving')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Models & thinking */}
            <Card>
                <CardHeader>
                    <CardTitle>Models &amp; thinking</CardTitle>
                    <CardDescription>
                        Which model runs each phase of the blog pipeline, and
                        how hard it thinks. Every model on{' '}
                        <a
                            href='https://openrouter.ai/models'
                            target='_blank'
                            rel='noreferrer'
                            className='underline underline-offset-2'
                        >
                            openrouter.ai/models
                        </a>{' '}
                        is available.
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {catalog.isStale && !catalog.isLoading && (
                        <p className='flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-600'>
                            <TriangleAlert className='mt-0.5 h-3.5 w-3.5 shrink-0' />
                            <span>
                                Showing a saved snapshot — the live OpenRouter
                                catalog could not be reached. Choices still
                                save; newly released models will not appear
                                until it recovers.
                            </span>
                        </p>
                    )}

                    <div
                        className='text-muted-foreground hidden gap-3 border-b pb-2 text-xs font-medium tracking-wide uppercase md:grid'
                        style={{
                            gridTemplateColumns: '13rem minmax(0,1fr) 11rem',
                        }}
                    >
                        <span>Phase</span>
                        <span>Model</span>
                        <span>Thinking</span>
                    </div>

                    <div className='divide-y'>
                        {PHASE_FIELDS.map((field) => {
                            const slot = slots[field.key]
                            const trimmedId = slot.modelId.trim()
                            const canInherit =
                                'canInherit' in field && field.canInherit
                            const isInheriting = canInherit && !trimmedId

                            // The orchestrator inherits Reviews when unset, so
                            // its effort is judged against the model that will
                            // actually run.
                            const {
                                modelId: resolvedId,
                                supportsReasoning,
                                effort: resolvedEffort,
                            } = resolved[field.key]

                            return (
                                <div
                                    key={field.key}
                                    className='grid gap-3 py-3 md:grid-cols-[13rem_minmax(0,1fr)_11rem] md:items-start'
                                >
                                    <div className='pt-1.5'>
                                        <Label
                                            htmlFor={`${field.key}-model`}
                                            className='text-sm font-medium'
                                        >
                                            {field.label}
                                        </Label>
                                        <p className='text-muted-foreground text-xs'>
                                            {field.hint}
                                        </p>
                                    </div>

                                    <div className='space-y-1.5'>
                                        {canInherit && (
                                            <label className='flex items-center gap-2 text-xs'>
                                                <Switch
                                                    checked={isInheriting}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        patchSlot(field.key, {
                                                            modelId: checked
                                                                ? ''
                                                                : slots.review
                                                                      .modelId,
                                                        })
                                                    }
                                                    aria-label='Inherit the review model'
                                                />
                                                <span className='text-muted-foreground'>
                                                    Inherit from Reviews
                                                    {isInheriting &&
                                                        resolvedId && (
                                                            <span className='ml-1 font-mono'>
                                                                ({resolvedId})
                                                            </span>
                                                        )}
                                                </span>
                                            </label>
                                        )}

                                        {!isInheriting && (
                                            <ModelCombobox
                                                id={`${field.key}-model`}
                                                ariaLabel={`${field.label} model`}
                                                value={slot.modelId}
                                                onChange={(modelId) =>
                                                    patchSlot(field.key, {
                                                        modelId,
                                                    })
                                                }
                                                models={catalog.models}
                                                isLoading={catalog.isLoading}
                                                isCatalogStale={catalog.isStale}
                                                placeholder={
                                                    'isOptional' in field &&
                                                    field.isOptional
                                                        ? 'Code default'
                                                        : 'Select a model'
                                                }
                                            />
                                        )}
                                    </div>

                                    {field.hasEffort ? (
                                        <EffortSelect
                                            id={`${field.key}-effort`}
                                            ariaLabel={`${field.label} reasoning effort`}
                                            value={resolvedEffort}
                                            onChange={(effort) =>
                                                patchSlot(field.key, { effort })
                                            }
                                            supportsReasoning={
                                                supportsReasoning
                                            }
                                        />
                                    ) : (
                                        <p className='text-muted-foreground pt-2 text-center text-xs'>
                                            —
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className='text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-1 border-t pt-3 text-xs'>
                        <span>
                            <span className='text-foreground font-medium tabular-nums'>
                                ${inputCostPerM.toFixed(2)}
                            </span>{' '}
                            per 1M input tokens across {pricedSlots} of{' '}
                            {costedSlots} text phases
                            {pricedSlots < costedSlots &&
                                ' — the rest run on a model the catalog has no price for'}
                        </span>
                        <span>
                            Raising thinking bills reasoning tokens as output —
                            the seven review agents multiply it.
                        </span>
                    </div>

                    <p className='text-muted-foreground border-t pt-3 text-xs'>
                        Every call routes through OpenRouter and needs{' '}
                        <code className='font-mono'>OPENROUTER_API_KEY</code> in
                        the environment.
                    </p>
                </CardContent>
            </Card>

            {/* Imagery */}
            <Card>
                <CardHeader>
                    <CardTitle>Imagery</CardTitle>
                    <CardDescription>
                        Model and art direction used for generated featured
                        images.
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='space-y-2'>
                        <div>
                            <Label htmlFor='image-model'>Image model</Label>
                            <p className='text-muted-foreground text-xs'>
                                fal.ai model used to render blog images.
                            </p>
                        </div>
                        <Select
                            value={imageModelId}
                            onValueChange={(value) =>
                                setImageModelId(value as ImageModelId)
                            }
                        >
                            <SelectTrigger id='image-model' className='w-full'>
                                <SelectValue placeholder='Select an image model' />
                            </SelectTrigger>
                            <SelectContent>
                                {IMAGE_MODELS.map((model) => (
                                    <SelectItem key={model.id} value={model.id}>
                                        <span className='flex flex-col items-start'>
                                            <span>{model.name}</span>
                                            <span className='text-muted-foreground text-xs'>
                                                {model.description}
                                            </span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <div>
                            <Label htmlFor='artistic-style'>
                                Default artistic style
                            </Label>
                            <p className='text-muted-foreground text-xs'>
                                Pin every image to one visual register, or let
                                the AI choose the best fit for each topic.
                            </p>
                        </div>
                        <Select
                            value={artisticStyleId ?? AUTO_STYLE_VALUE}
                            onValueChange={(value) =>
                                setArtisticStyleId(
                                    value === AUTO_STYLE_VALUE
                                        ? null
                                        : (value as ArtisticImageStyleId)
                                )
                            }
                        >
                            <SelectTrigger
                                id='artistic-style'
                                className='w-full'
                            >
                                <SelectValue placeholder='Select a style' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={AUTO_STYLE_VALUE}>
                                    <span className='flex flex-col items-start'>
                                        <span>
                                            Auto — pick per topic (recommended)
                                        </span>
                                        <span className='text-muted-foreground text-xs'>
                                            The AI selects the preset that best
                                            suits each post.
                                        </span>
                                    </span>
                                </SelectItem>
                                {ARTISTIC_IMAGE_STYLES.map((style) => (
                                    <SelectItem key={style.id} value={style.id}>
                                        <span className='flex flex-col items-start'>
                                            <span>{style.name}</span>
                                            <span className='text-muted-foreground line-clamp-2 text-xs'>
                                                {style.description}
                                            </span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Autopilot */}
            <Card>
                <CardHeader>
                    <CardTitle>Autopilot</CardTitle>
                    <CardDescription>
                        Scheduled content loop: ideas are generated on one
                        schedule, posts are written on another. Publishing
                        always stays manual.
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='space-y-2'>
                        <div>
                            <Label htmlFor='autopilot-mode'>Mode</Label>
                            <p className='text-muted-foreground text-xs'>
                                Off disables both schedules. Ideas mode is the
                                recommended starting point.
                            </p>
                        </div>
                        <Select
                            value={autopilotMode}
                            onValueChange={(value) =>
                                setAutopilotMode(value as AutopilotMode)
                            }
                        >
                            <SelectTrigger
                                id='autopilot-mode'
                                className='w-full'
                            >
                                <SelectValue placeholder='Select a mode' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='off'>
                                    <span className='flex flex-col items-start'>
                                        <span>Off</span>
                                        <span className='text-muted-foreground text-xs'>
                                            Nothing runs on a schedule.
                                        </span>
                                    </span>
                                </SelectItem>
                                <SelectItem value='ideas'>
                                    <span className='flex flex-col items-start'>
                                        <span>Ideas — approve topics</span>
                                        <span className='text-muted-foreground text-xs'>
                                            Autopilot proposes ideas; only
                                            topics you approve get written.
                                        </span>
                                    </span>
                                </SelectItem>
                                <SelectItem value='full'>
                                    <span className='flex flex-col items-start'>
                                        <span>Full — review drafts</span>
                                        <span className='text-muted-foreground text-xs'>
                                            Autopilot also writes unapproved
                                            topics; you review finished drafts.
                                        </span>
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='grid gap-6 sm:grid-cols-2'>
                        <div className='space-y-2'>
                            <div>
                                <Label htmlFor='ideation-cadence'>
                                    Idea generation schedule
                                </Label>
                                <p className='text-muted-foreground text-xs'>
                                    How often new topic ideas are proposed.
                                </p>
                            </div>
                            <Select
                                value={autopilotIdeationCadence}
                                onValueChange={(value) =>
                                    setAutopilotIdeationCadence(
                                        value as AutopilotCadence
                                    )
                                }
                            >
                                <SelectTrigger
                                    id='ideation-cadence'
                                    className='w-full'
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='daily'>Daily</SelectItem>
                                    <SelectItem value='weekdays'>
                                        Weekdays
                                    </SelectItem>
                                    <SelectItem value='weekly'>
                                        Weekly
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <div>
                                <Label htmlFor='content-cadence'>
                                    Writing schedule
                                </Label>
                                <p className='text-muted-foreground text-xs'>
                                    How often a queued topic is written.
                                </p>
                            </div>
                            <Select
                                value={autopilotContentCadence}
                                onValueChange={(value) =>
                                    setAutopilotContentCadence(
                                        value as AutopilotCadence
                                    )
                                }
                            >
                                <SelectTrigger
                                    id='content-cadence'
                                    className='w-full'
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='daily'>Daily</SelectItem>
                                    <SelectItem value='weekdays'>
                                        Weekdays
                                    </SelectItem>
                                    <SelectItem value='weekly'>
                                        Weekly
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='grid gap-6 sm:grid-cols-3'>
                        <div className='space-y-2'>
                            <Label htmlFor='posts-per-run'>Posts per run</Label>
                            <Input
                                id='posts-per-run'
                                type='number'
                                min={1}
                                max={3}
                                value={autopilotPostsPerRun}
                                onChange={(event) =>
                                    setAutopilotPostsPerRun(
                                        Number(event.target.value)
                                    )
                                }
                            />
                            <p className='text-muted-foreground text-xs'>
                                1–3 posts per writing run.
                            </p>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='draft-cap'>Draft cap</Label>
                            <Input
                                id='draft-cap'
                                type='number'
                                min={1}
                                max={20}
                                value={autopilotDraftCap}
                                onChange={(event) =>
                                    setAutopilotDraftCap(
                                        Number(event.target.value)
                                    )
                                }
                            />
                            <p className='text-muted-foreground text-xs'>
                                Writing pauses while this many drafts await
                                review.
                            </p>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='ideas-per-run'>
                                Idea queue size
                            </Label>
                            <Input
                                id='ideas-per-run'
                                type='number'
                                min={3}
                                max={10}
                                value={autopilotIdeasPerRun}
                                onChange={(event) =>
                                    setAutopilotIdeasPerRun(
                                        Number(event.target.value)
                                    )
                                }
                            />
                            <p className='text-muted-foreground text-xs'>
                                Ideas are topped up to this many pending.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content refresh */}
            <Card>
                <CardHeader>
                    <CardTitle>Content Refresh</CardTitle>
                    <CardDescription>
                        Scheduled decay detection for published posts: ranking
                        drops, CTR gaps, stale age and cannibalization feed a
                        refresh queue. Applying a refresh always stays behind a
                        review.
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='space-y-2'>
                        <div>
                            <Label htmlFor='refresh-mode'>Mode</Label>
                            <p className='text-muted-foreground text-xs'>
                                Off queues nothing. Suggest is the recommended
                                starting point.
                            </p>
                        </div>
                        <Select
                            value={refreshMode}
                            onValueChange={(value) =>
                                setRefreshMode(value as RefreshMode)
                            }
                        >
                            <SelectTrigger id='refresh-mode' className='w-full'>
                                <SelectValue placeholder='Select a mode' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='off'>
                                    <span className='flex flex-col items-start'>
                                        <span>Off</span>
                                        <span className='text-muted-foreground text-xs'>
                                            No detection, no queue.
                                        </span>
                                    </span>
                                </SelectItem>
                                <SelectItem value='suggest'>
                                    <span className='flex flex-col items-start'>
                                        <span>Suggest — approve refreshes</span>
                                        <span className='text-muted-foreground text-xs'>
                                            Decaying posts are queued; you start
                                            each refresh yourself.
                                        </span>
                                    </span>
                                </SelectItem>
                                <SelectItem value='auto'>
                                    <span className='flex flex-col items-start'>
                                        <span>Auto — review diffs</span>
                                        <span className='text-muted-foreground text-xs'>
                                            Top candidates are refreshed on a
                                            schedule; you review the diff before
                                            it applies.
                                        </span>
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='grid gap-6 sm:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label htmlFor='refresh-stale-months'>
                                Stale after (months)
                            </Label>
                            <Input
                                id='refresh-stale-months'
                                type='number'
                                min={1}
                                max={24}
                                value={refreshStaleMonths}
                                onChange={(event) =>
                                    setRefreshStaleMonths(
                                        Number(event.target.value)
                                    )
                                }
                            />
                            <p className='text-muted-foreground text-xs'>
                                Posts untouched this long are flagged stale.
                            </p>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='refresh-drop-threshold'>
                                Position drop threshold
                            </Label>
                            <Input
                                id='refresh-drop-threshold'
                                type='number'
                                min={0.5}
                                max={20}
                                step={0.5}
                                value={refreshPositionDropThreshold}
                                onChange={(event) =>
                                    setRefreshPositionDropThreshold(
                                        Number(event.target.value)
                                    )
                                }
                            />
                            <p className='text-muted-foreground text-xs'>
                                28-day ranking drop (site drift subtracted) that
                                flags decay.
                            </p>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='refresh-cooldown'>
                                Cooldown (days)
                            </Label>
                            <Input
                                id='refresh-cooldown'
                                type='number'
                                min={7}
                                max={365}
                                value={refreshCooldownDays}
                                onChange={(event) =>
                                    setRefreshCooldownDays(
                                        Number(event.target.value)
                                    )
                                }
                            />
                            <p className='text-muted-foreground text-xs'>
                                A refreshed or dismissed post cannot re-queue
                                for this long.
                            </p>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='refresh-draft-cap'>
                                Refresh draft cap
                            </Label>
                            <Input
                                id='refresh-draft-cap'
                                type='number'
                                min={1}
                                max={10}
                                value={refreshDraftCap}
                                onChange={(event) =>
                                    setRefreshDraftCap(
                                        Number(event.target.value)
                                    )
                                }
                            />
                            <p className='text-muted-foreground text-xs'>
                                Auto mode pauses while this many refresh drafts
                                await review.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className='flex justify-end'>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className='mr-2 h-4 w-4' />
                            Save Settings
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
