/**
 * Blog AI Settings Form Component
 *
 * Edits the singleton blog pipeline model configuration: which models run
 * content generation, review/orchestration and image generation, plus the
 * default artistic image style.
 *
 * @module components/blog/blog-ai-settings-form
 */
'use client'

import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import {
    ARTISTIC_IMAGE_STYLES,
    AVAILABLE_MODELS,
    type ArtisticImageStyleId,
} from '@workspace/ai'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import {
    BlogAiModelField,
    isOpenRouterModelId,
} from '@/components/blog/blog-ai-model-field.component'
import { updateBlogAiConfig } from '@/lib/actions/blog-ai-config.action'
import type {
    AutopilotCadence,
    AutopilotMode,
    BlogAiConfig,
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
 * Fallback shown in the select when the stored model is a custom OpenRouter id.
 */
const FALLBACK_SELECT_MODEL_ID = 'claude-opus-5'

/**
 * Split a stored model id into select value + custom override.
 *
 * A stored id that is not in the curated registry can only have come from the
 * custom field, so it is restored there.
 */
function splitStoredModelId(storedModelId: string): {
    selected: string
    custom: string
} {
    const isCurated = AVAILABLE_MODELS.some(
        (model) => model.id === storedModelId
    )

    return isCurated
        ? { selected: storedModelId, custom: '' }
        : { selected: FALLBACK_SELECT_MODEL_ID, custom: storedModelId }
}

type BlogAiSettingsFormProps = {
    initialData: BlogAiConfig
}

export function BlogAiSettingsForm({ initialData }: BlogAiSettingsFormProps) {
    const initialIdeation = splitStoredModelId(initialData.ideationModelId)
    const initialContent = splitStoredModelId(initialData.contentModelId)
    const initialReview = splitStoredModelId(initialData.reviewModelId)
    const initialExtraction = splitStoredModelId(initialData.extractionModelId)

    const [ideationModelId, setIdeationModelId] = useState(
        initialIdeation.selected
    )
    const [customIdeationModelId, setCustomIdeationModelId] = useState(
        initialIdeation.custom
    )
    const [contentModelId, setContentModelId] = useState(
        initialContent.selected
    )
    const [customContentModelId, setCustomContentModelId] = useState(
        initialContent.custom
    )
    const [reviewModelId, setReviewModelId] = useState(initialReview.selected)
    const [customReviewModelId, setCustomReviewModelId] = useState(
        initialReview.custom
    )
    const [extractionModelId, setExtractionModelId] = useState(
        initialExtraction.selected
    )
    const [customExtractionModelId, setCustomExtractionModelId] = useState(
        initialExtraction.custom
    )
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
    const [isSubmitting, setIsSubmitting] = useState(false)

    const trimmedIdeationCustom = customIdeationModelId.trim()
    const trimmedContentCustom = customContentModelId.trim()
    const trimmedReviewCustom = customReviewModelId.trim()
    const trimmedExtractionCustom = customExtractionModelId.trim()

    // A non-empty custom field always wins over the select.
    const effectiveIdeationModelId = trimmedIdeationCustom || ideationModelId
    const effectiveContentModelId = trimmedContentCustom || contentModelId
    const effectiveReviewModelId = trimmedReviewCustom || reviewModelId
    const effectiveExtractionModelId =
        trimmedExtractionCustom || extractionModelId

    const hasInvalidCustom =
        (trimmedIdeationCustom.length > 0 &&
            !isOpenRouterModelId(trimmedIdeationCustom)) ||
        (trimmedContentCustom.length > 0 &&
            !isOpenRouterModelId(trimmedContentCustom)) ||
        (trimmedReviewCustom.length > 0 &&
            !isOpenRouterModelId(trimmedReviewCustom)) ||
        (trimmedExtractionCustom.length > 0 &&
            !isOpenRouterModelId(trimmedExtractionCustom))

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (hasInvalidCustom) {
            toast.error('Fix the custom OpenRouter model id before saving')
            return
        }

        setIsSubmitting(true)

        try {
            const result = await updateBlogAiConfig({
                ideationModelId: effectiveIdeationModelId,
                contentModelId: effectiveContentModelId,
                reviewModelId: effectiveReviewModelId,
                extractionModelId: effectiveExtractionModelId,
                imageModelId,
                artisticStyleId,
                autopilotMode,
                autopilotIdeationCadence,
                autopilotContentCadence,
                autopilotPostsPerRun,
                autopilotDraftCap,
                autopilotIdeasPerRun,
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
            {/* Text models */}
            <Card>
                <CardHeader>
                    <CardTitle>Text Models</CardTitle>
                    <CardDescription>
                        Models used by the blog pipeline for writing and
                        reviewing posts.
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <BlogAiModelField
                        id='ideation-model'
                        label='Ideation model'
                        description='Generates blog topic ideas — both keyword-based and Search Console modes.'
                        selectedModelId={ideationModelId}
                        customModelId={customIdeationModelId}
                        onSelectedModelIdChange={setIdeationModelId}
                        onCustomModelIdChange={setCustomIdeationModelId}
                    />

                    <BlogAiModelField
                        id='content-model'
                        label='Content model'
                        description='Runs the generation phase — research and drafting the post.'
                        selectedModelId={contentModelId}
                        customModelId={customContentModelId}
                        onSelectedModelIdChange={setContentModelId}
                        onCustomModelIdChange={setCustomContentModelId}
                    />

                    <BlogAiModelField
                        id='review-model'
                        label='Review model'
                        description='Runs the review and orchestration phase — the editing agents.'
                        selectedModelId={reviewModelId}
                        customModelId={customReviewModelId}
                        onSelectedModelIdChange={setReviewModelId}
                        onCustomModelIdChange={setCustomReviewModelId}
                    />

                    <BlogAiModelField
                        id='extraction-model'
                        label='Metadata model'
                        description='Runs the metadata phase — SEO title, meta description, slug and FAQs.'
                        selectedModelId={extractionModelId}
                        customModelId={customExtractionModelId}
                        onSelectedModelIdChange={setExtractionModelId}
                        onCustomModelIdChange={setCustomExtractionModelId}
                    />

                    <p className='text-muted-foreground border-t pt-4 text-xs'>
                        OpenRouter models require{' '}
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
