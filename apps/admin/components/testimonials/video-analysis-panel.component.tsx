'use client'

import { useState, useTransition } from 'react'
import {
    Loader2,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    ArrowRight,
    RefreshCw,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import { Badge } from '@workspace/ui/components/badge'

import { analyzeTestimonialVideoAction } from '@/lib/actions/testimonial.action'
import type { TestimonialMetadata } from '@workspace/db/schema'

type VideoAnalysis = NonNullable<TestimonialMetadata['videoAnalysis']>

type VideoAnalysisPanelProps = {
    testimonialId: string
    /** Whether the testimonial has video media attached */
    hasVideo: boolean
    /** Existing analysis from metadata if available */
    existingAnalysis?: VideoAnalysis | null
    /** Callback when a field value should be used in the form */
    onUseValue: (
        field: 'patientName' | 'procedure' | 'quote' | 'longDescription',
        value: string
    ) => void
}

export function VideoAnalysisPanel({
    testimonialId,
    hasVideo,
    existingAnalysis,
    onUseValue,
}: VideoAnalysisPanelProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [analysis, setAnalysis] = useState<VideoAnalysis | null>(
        existingAnalysis ?? null
    )
    const [isTranscriptOpen, setIsTranscriptOpen] = useState(false)
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const handleAnalyze = () => {
        startTransition(async () => {
            setError(null)
            const result = await analyzeTestimonialVideoAction(testimonialId)

            if (result.success && result.analysis) {
                setAnalysis({
                    transcript: result.analysis.transcript,
                    keyQuote: result.analysis.keyQuote,
                    patientName: result.analysis.patientName,
                    procedure: result.analysis.procedure,
                    longDescription: result.analysis.longDescription,
                    analyzedAt: new Date().toISOString(),
                    language: result.analysis.language,
                })
            } else {
                setError(result.error ?? 'Failed to analyze video')
            }
        })
    }

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    const handleUseValue = (
        field: 'patientName' | 'procedure' | 'quote' | 'longDescription',
        value: string
    ) => {
        onUseValue(field, value)
    }

    if (!hasVideo) {
        return (
            <Card className='border-dashed'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-base'>
                        <Sparkles className='h-4 w-4' />
                        AI Video Analysis
                    </CardTitle>
                    <CardDescription>
                        Add a video to enable AI-powered transcript extraction
                        and analysis.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'>
                    <Sparkles className='h-4 w-4' />
                    AI Video Analysis
                </CardTitle>
                <CardDescription>
                    Extract transcript, key quotes, and generate marketing
                    content using AI.
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                {/* Error Message */}
                {error && (
                    <div className='rounded-md bg-red-50 p-3'>
                        <p className='text-sm text-red-600'>{error}</p>
                    </div>
                )}

                {/* Analyze Button */}
                {!analysis && (
                    <Button
                        onClick={handleAnalyze}
                        disabled={isPending}
                        className='w-full'
                    >
                        {isPending ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Analyzing Video...
                            </>
                        ) : (
                            <>
                                <Sparkles className='mr-2 h-4 w-4' />
                                Analyze Video with AI
                            </>
                        )}
                    </Button>
                )}

                {/* Analysis Results */}
                {analysis && (
                    <div className='space-y-4'>
                        {/* Re-analyze button */}
                        <div className='flex items-center justify-between'>
                            <Badge variant='secondary' className='text-xs'>
                                Analyzed{' '}
                                {new Date(analysis.analyzedAt).toLocaleString()}
                            </Badge>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={handleAnalyze}
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                    <RefreshCw className='h-4 w-4' />
                                )}
                                <span className='ml-1'>Re-analyze</span>
                            </Button>
                        </div>

                        {/* Patient Name */}
                        {analysis.patientName && (
                            <AnalysisField
                                label='Patient Name'
                                value={analysis.patientName}
                                onCopy={() =>
                                    handleCopy(
                                        analysis.patientName!,
                                        'patientName'
                                    )
                                }
                                onUse={() =>
                                    handleUseValue(
                                        'patientName',
                                        analysis.patientName!
                                    )
                                }
                                isCopied={copiedField === 'patientName'}
                            />
                        )}

                        {/* Procedure */}
                        {analysis.procedure && (
                            <AnalysisField
                                label='Procedure'
                                value={analysis.procedure}
                                onCopy={() =>
                                    handleCopy(analysis.procedure!, 'procedure')
                                }
                                onUse={() =>
                                    handleUseValue(
                                        'procedure',
                                        analysis.procedure!
                                    )
                                }
                                isCopied={copiedField === 'procedure'}
                            />
                        )}

                        {/* Language Badge */}
                        {analysis.language && (
                            <div className='flex items-center gap-2'>
                                <span className='text-muted-foreground text-sm'>
                                    Language:
                                </span>
                                <Badge variant='outline'>
                                    {analysis.language}
                                </Badge>
                            </div>
                        )}

                        {/* Key Quote */}
                        <div className='rounded-lg border bg-amber-50/50 p-4'>
                            <div className='mb-2 flex items-center justify-between'>
                                <span className='text-sm font-medium text-amber-800'>
                                    Key Quote
                                </span>
                                <div className='flex gap-1'>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className='h-7 text-xs'
                                        onClick={() =>
                                            handleCopy(
                                                analysis.keyQuote,
                                                'keyQuote'
                                            )
                                        }
                                    >
                                        {copiedField === 'keyQuote' ? (
                                            <Check className='mr-1 h-3 w-3' />
                                        ) : (
                                            <Copy className='mr-1 h-3 w-3' />
                                        )}
                                        Copy
                                    </Button>
                                    <Button
                                        variant='secondary'
                                        size='sm'
                                        className='h-7 text-xs'
                                        onClick={() =>
                                            handleUseValue(
                                                'quote',
                                                analysis.keyQuote
                                            )
                                        }
                                    >
                                        <ArrowRight className='mr-1 h-3 w-3' />
                                        Use as Quote
                                    </Button>
                                </div>
                            </div>
                            <p className='text-sm leading-relaxed text-amber-900 italic'>
                                &ldquo;{analysis.keyQuote}&rdquo;
                            </p>
                        </div>

                        {/* Long Description */}
                        <div className='rounded-lg border bg-stone-50 p-4'>
                            <div className='mb-2 flex items-center justify-between'>
                                <span className='text-sm font-medium'>
                                    Marketing Description
                                </span>
                                <div className='flex gap-1'>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className='h-7 text-xs'
                                        onClick={() =>
                                            handleCopy(
                                                analysis.longDescription,
                                                'longDescription'
                                            )
                                        }
                                    >
                                        {copiedField === 'longDescription' ? (
                                            <Check className='mr-1 h-3 w-3' />
                                        ) : (
                                            <Copy className='mr-1 h-3 w-3' />
                                        )}
                                        Copy
                                    </Button>
                                    <Button
                                        variant='secondary'
                                        size='sm'
                                        className='h-7 text-xs'
                                        onClick={() =>
                                            handleUseValue(
                                                'longDescription',
                                                analysis.longDescription
                                            )
                                        }
                                    >
                                        <ArrowRight className='mr-1 h-3 w-3' />
                                        Use as Description
                                    </Button>
                                </div>
                            </div>
                            <p className='text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap'>
                                {analysis.longDescription}
                            </p>
                        </div>

                        {/* Transcript (Collapsible) */}
                        <Collapsible
                            open={isTranscriptOpen}
                            onOpenChange={setIsTranscriptOpen}
                        >
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant='outline'
                                    className='w-full justify-between'
                                >
                                    <span>Full Transcript</span>
                                    {isTranscriptOpen ? (
                                        <ChevronUp className='h-4 w-4' />
                                    ) : (
                                        <ChevronDown className='h-4 w-4' />
                                    )}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className='pt-3'>
                                <div className='rounded-lg border bg-stone-50 p-4'>
                                    <div className='mb-2 flex justify-end'>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            className='h-7 text-xs'
                                            onClick={() =>
                                                handleCopy(
                                                    analysis.transcript,
                                                    'transcript'
                                                )
                                            }
                                        >
                                            {copiedField === 'transcript' ? (
                                                <Check className='mr-1 h-3 w-3' />
                                            ) : (
                                                <Copy className='mr-1 h-3 w-3' />
                                            )}
                                            Copy Transcript
                                        </Button>
                                    </div>
                                    <p className='text-muted-foreground max-h-64 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap'>
                                        {analysis.transcript}
                                    </p>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

type AnalysisFieldProps = {
    label: string
    value: string
    onCopy: () => void
    onUse: () => void
    isCopied: boolean
}

function AnalysisField({
    label,
    value,
    onCopy,
    onUse,
    isCopied,
}: AnalysisFieldProps) {
    return (
        <div className='flex items-center justify-between rounded-lg border bg-stone-50 p-3'>
            <div>
                <span className='text-muted-foreground text-xs'>{label}</span>
                <p className='text-sm font-medium'>{value}</p>
            </div>
            <div className='flex gap-1'>
                <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 text-xs'
                    onClick={onCopy}
                >
                    {isCopied ? (
                        <Check className='mr-1 h-3 w-3' />
                    ) : (
                        <Copy className='mr-1 h-3 w-3' />
                    )}
                    Copy
                </Button>
                <Button
                    variant='secondary'
                    size='sm'
                    className='h-7 text-xs'
                    onClick={onUse}
                >
                    <ArrowRight className='mr-1 h-3 w-3' />
                    Use
                </Button>
            </div>
        </div>
    )
}
