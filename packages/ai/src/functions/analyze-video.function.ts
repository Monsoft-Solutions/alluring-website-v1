/**
 * Analyze Video Function
 *
 * AI-powered video analysis for testimonial videos using Google Gemini.
 * Extracts transcript, key quote, patient name, procedure, and marketing description.
 *
 * @module @workspace/ai/functions/analyze-video
 */
import {
    GoogleGenAI,
    createPartFromUri,
    createUserContent,
    type FileState,
} from '@google/genai'

import {
    videoAnalysisSchema,
    type VideoAnalysisResult,
} from '../schemas/video-analysis.schema'
import { env } from '../env'

/**
 * Default model for video analysis
 * Gemini 2.5 Flash is cost-effective for video understanding
 */
const DEFAULT_VIDEO_MODEL_ID = 'gemini-2.5-flash'

/**
 * Build the analysis prompt, optionally including Instagram caption context
 */
function buildAnalysisPrompt(instagramCaption?: string | null): string {
    const captionContext = instagramCaption
        ? `

**ADDITIONAL CONTEXT - INSTAGRAM CAPTION**:
The following is the Instagram caption/description that accompanied this video. Use this to help identify the patient's name if it's mentioned here but not in the video:

---
${instagramCaption}
---
`
        : ''

    return `You are an AI assistant analyzing patient testimonial videos from a luxury plastic surgery clinic (Alluring Plastic Surgery in Miami, FL).
${captionContext}
Analyze this patient testimonial video and extract the following information:

1. **TRANSCRIPT**: Provide a complete, accurate transcription of everything spoken in the video. Include all dialogue exactly as spoken.

2. **PATIENT NAME**: Extract the patient's first name. Look for it in:
   - The video transcription (if they introduce themselves or are addressed by name)
   - The Instagram caption provided above (if available)
   Return null only if the name cannot be found in either source.

3. **PROCEDURE**: Identify what cosmetic procedure(s) the patient had done. Common procedures include:
   - BBL (Brazilian Butt Lift)
   - Breast Augmentation
   - Mommy Makeover
   - Tummy Tuck
   - Liposuction
   - Body Contouring
   - Facelift
   - Rhinoplasty
   Return null if the procedure is unclear or not mentioned.

4. **KEY QUOTE**: Identify the single most impactful, emotionally resonant quote (1-3 sentences) that captures the essence of the patient's positive experience. This should be a direct quote from the video that would work well in marketing materials.

5. **LONG DESCRIPTION**: Write a compelling 2-3 paragraph marketing description of this testimonial. Include:
   - The patient's transformation journey
   - Their emotional state before and after
   - Specific benefits they experienced
   - Why they would recommend the clinic
   Write in third person, professional tone suitable for a luxury plastic surgery website.

6. **LANGUAGE**: Identify the primary language spoken (e.g., "English", "Spanish").

Return your response as a JSON object with these exact fields:
- transcript: string
- patientName: string | null
- procedure: string | null
- keyQuote: string
- longDescription: string
- language: string

Be thorough and accurate. The transcript should capture everything said. The key quote should be word-for-word from the video.`
}

/**
 * Options for video analysis
 */
export type AnalyzeVideoOptions = {
    /** The URL of the video to analyze */
    videoUrl: string
    /** Optional Instagram caption to help extract patient name and context */
    instagramCaption?: string | null
    /** Model ID to use (defaults to gemini-2.5-flash) */
    modelId?: string
    /** Temperature for generation (defaults to 0.3 for consistent results) */
    temperature?: number
}

/**
 * Get MIME type from URL
 */
function getMimeType(url: string): string {
    const urlLower = url.toLowerCase()
    if (urlLower.includes('.mp4') || urlLower.includes('video/mp4')) {
        return 'video/mp4'
    }
    if (urlLower.includes('.mov')) {
        return 'video/quicktime'
    }
    if (urlLower.includes('.webm')) {
        return 'video/webm'
    }
    if (urlLower.includes('.avi')) {
        return 'video/x-msvideo'
    }
    // Default to mp4 as most common
    return 'video/mp4'
}

/**
 * Download video from URL and return as Blob
 */
async function downloadVideoAsBlob(url: string): Promise<Blob> {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`)
    }
    return response.blob()
}

/**
 * Analyze a testimonial video using Google Gemini
 *
 * Uses Gemini's video understanding capabilities to analyze testimonial videos
 * and extract structured data for the CMS.
 *
 * @param options - Analysis options including video URL
 * @returns Complete video analysis with transcript, key quote, and marketing description
 *
 * @example
 * ```typescript
 * const analysis = await analyzeTestimonialVideo({
 *   videoUrl: 'https://example.com/testimonial.mp4',
 * })
 * console.log(analysis.transcript)
 * console.log(analysis.keyQuote)
 * console.log(analysis.patientName) // 'Maria' or null
 * ```
 */
export async function analyzeTestimonialVideo(
    options: AnalyzeVideoOptions
): Promise<VideoAnalysisResult> {
    const {
        videoUrl,
        instagramCaption,
        modelId = DEFAULT_VIDEO_MODEL_ID,
        temperature = 0.3,
    } = options

    const apiKey = env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
        throw new Error(
            'GOOGLE_GENERATIVE_AI_API_KEY environment variable is required'
        )
    }

    const ai = new GoogleGenAI({ apiKey })

    // Download the video as a Blob
    const videoBlob = await downloadVideoAsBlob(videoUrl)
    const mimeType = getMimeType(videoUrl)

    // Upload video to Gemini Files API
    const uploadedFile = await ai.files.upload({
        file: videoBlob,
        config: {
            displayName: `testimonial-${Date.now()}.mp4`,
            mimeType,
        },
    })

    if (!uploadedFile.name) {
        throw new Error('Failed to upload video: no file name returned')
    }

    try {
        // Wait for file processing
        let fileStatus = await ai.files.get({ name: uploadedFile.name })
        let attempts = 0
        const maxAttempts = 60 // Max 3 minutes wait (60 * 3s)

        while (
            fileStatus.state === ('PROCESSING' as FileState) &&
            attempts < maxAttempts
        ) {
            await new Promise((resolve) => setTimeout(resolve, 3000))
            fileStatus = await ai.files.get({ name: uploadedFile.name })
            attempts++
        }

        if (fileStatus.state === ('FAILED' as FileState)) {
            throw new Error('Video processing failed')
        }

        if (fileStatus.state !== ('ACTIVE' as FileState)) {
            throw new Error(
                `Video processing timed out or failed. State: ${fileStatus.state}`
            )
        }

        // Build prompt with optional Instagram caption context
        const analysisPrompt = buildAnalysisPrompt(instagramCaption)

        // Generate content with video
        const response = await ai.models.generateContent({
            model: modelId,
            contents: createUserContent([
                createPartFromUri(uploadedFile.uri ?? '', mimeType),
                analysisPrompt,
            ]),
            config: {
                temperature,
                responseMimeType: 'application/json',
            },
        })

        const responseText = response.text
        if (!responseText) {
            throw new Error('No response text from Gemini')
        }

        // Parse the JSON response
        let parsedResponse: unknown
        try {
            // Clean up the response text - remove markdown code blocks if present
            let cleanText = responseText.trim()
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.slice(7)
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.slice(3)
            }
            if (cleanText.endsWith('```')) {
                cleanText = cleanText.slice(0, -3)
            }
            parsedResponse = JSON.parse(cleanText.trim())
        } catch {
            throw new Error(
                `Failed to parse Gemini response as JSON: ${responseText}`
            )
        }

        // Validate with schema
        const validatedResult = videoAnalysisSchema.parse(parsedResponse)

        // Return with metadata
        const result: VideoAnalysisResult = {
            ...validatedResult,
            analyzedAt: new Date().toISOString(),
            modelId,
        }

        return result
    } finally {
        // Clean up: delete the uploaded file
        try {
            await ai.files.delete({ name: uploadedFile.name })
        } catch (deleteError) {
            // Log but don't fail if delete fails
            console.warn('Failed to delete uploaded video file:', deleteError)
        }
    }
}

/**
 * Check if Google Generative AI is configured
 */
export function isGeminiConfigured(): boolean {
    return Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY)
}
