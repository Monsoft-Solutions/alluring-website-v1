/**
 * Type definitions for useAutoInlineImages hook
 *
 * @module @/lib/hooks/auto-inline-images
 */
import type {
    GeneratedInlineImage,
    InlineImageAnalysis,
    PipelineMetrics,
} from '@workspace/ai'
import type { AutoInlineImagePipelineStep } from '@workspace/ai/pipelines'

/**
 * Progress state for the auto inline image generation
 */
export type AutoInlineImageProgress = {
    step: AutoInlineImagePipelineStep
    progress: number
    message: string
}

/**
 * Generated image with UI state
 */
export type GeneratedImageWithUIState = GeneratedInlineImage & {
    isGenerating: boolean
}

/**
 * Complete result from the auto inline image generation
 */
export type AutoInlineImageResult = {
    success: boolean
    analysis?: InlineImageAnalysis
    generatedImages: GeneratedInlineImage[]
    metrics?: PipelineMetrics
    error?: string
}

/**
 * Options for generating auto inline images
 */
export type GenerateAutoInlineImagesOptions = {
    content: string
    title: string
    blogPostId: string
    maxImages?: number
    imageModel?: 'gpt-image-1.5' | 'nano-banana-pro'
}

/**
 * Return type for the useAutoInlineImages hook
 */
export type UseAutoInlineImagesReturn = {
    /** Whether generation is in progress */
    isGenerating: boolean
    /** Current progress information */
    progress: AutoInlineImageProgress | null
    /** Analysis result from content analysis phase */
    analysis: InlineImageAnalysis | null
    /** Array of generated images with their statuses */
    generatedImages: GeneratedImageWithUIState[]
    /** Final result after completion */
    result: AutoInlineImageResult | null
    /** Error message if failed */
    error: string | null
    /** Start the auto inline image generation */
    generate: (options: GenerateAutoInlineImagesOptions) => Promise<void>
    /** Cancel the current generation */
    cancel: () => void
    /** Reset all state */
    reset: () => void
}

/**
 * SSE Event types for auto inline images
 */
export type AutoInlineImagesSseEvent =
    | {
          type: 'progress'
          data: {
              step: AutoInlineImagePipelineStep
              progress: number
              message: string
          }
      }
    | {
          type: 'analysis'
          data: {
              analysis: InlineImageAnalysis
          }
      }
    | {
          type: 'image'
          data: {
              opportunityId: string
              status: 'generating' | 'success' | 'error'
              imageUrl?: string
              altText?: string
              error?: string
          }
      }
    | {
          type: 'complete'
          data: {
              success: boolean
              analysis: InlineImageAnalysis
              generatedImages: GeneratedInlineImage[]
              metrics: PipelineMetrics
          }
      }
    | {
          type: 'error'
          data: {
              success: false
              error: string
          }
      }
