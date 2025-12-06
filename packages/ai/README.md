# @workspace/ai

Centralized AI package for the Alluring Plastic Surgery application. Consolidates all AI-related operations, models, prompts, and schemas built on top of the [Vercel AI SDK](https://sdk.vercel.ai/).

## Features

- **Core Wrappers**: Centralized configuration for AI SDK functions with telemetry
- **High-Level Functions**: Pre-built AI operations (intent classification, conversation analysis, chat streaming)
- **Type-Safe Schemas**: Zod schemas for structured AI outputs
- **Model Management**: Centralized model definitions with capability metadata
- **Domain-Specific Prompts**: Customizable system prompts for plastic surgery context
- **Telemetry**: Langfuse integration for AI observability

## Installation

This is a workspace package. Add it to your app's `package.json`:

```json
{
    "dependencies": {
        "@workspace/ai": "workspace:*"
    }
}
```

Required environment variables:

```bash
OPENAI_API_KEY=sk-...
LANGFUSE_SECRET_KEY=...  # Optional, for telemetry
LANGFUSE_PUBLIC_KEY=...  # Optional, for telemetry
```

## Quick Start

```typescript
// Import AI functions directly
import {
    analyzeConversation,
    classifyIntent,
    coreStreamText,
    generateQuickQuestions,
} from '@workspace/ai'
// Import model configuration
import { AVAILABLE_MODELS, DEFAULT_CHAT_MODEL_ID } from '@workspace/ai/models'
// Import prompts
import { generateSystemPrompt } from '@workspace/ai/prompts'
// Import schemas for structured outputs
import {
    type IntentClassification,
    intentClassificationSchema,
} from '@workspace/ai/schemas'
```

## Architecture

```
packages/ai/src/
├── core/                    # AI SDK wrappers with centralized config
│   ├── generate-object.core.ts
│   ├── generate-text.core.ts
│   ├── stream-object.core.ts
│   └── stream-text.core.ts
├── functions/               # High-level AI operations
│   ├── analyze-conversation.function.ts
│   ├── classify-intent.function.ts
│   ├── generate-quick-questions.function.ts
│   └── stream-chat.function.ts
├── schemas/                 # Zod schemas for structured outputs
│   ├── conversation-analysis.schema.ts
│   ├── intent-classification.schema.ts
│   └── quick-questions.schema.ts
├── models/                  # Model definitions and helpers
│   └── available-models.constant.ts
├── prompts/                 # Prompt templates
│   └── chat/
│       ├── system-prompt.prompt.ts
│       ├── intent-classification.prompt.ts
│       ├── conversation-analysis.prompt.ts
│       └── quick-questions.prompt.ts
└── telemetry/               # Observability configuration
    └── telemetry.config.ts
```

### Export Paths

The package provides multiple export paths for granular imports:

| Path                      | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `@workspace/ai`           | Main exports (all functions, schemas, models, prompts) |
| `@workspace/ai/core`      | Core wrapper functions only                            |
| `@workspace/ai/functions` | High-level AI operation functions                      |
| `@workspace/ai/schemas`   | Zod schemas and types                                  |
| `@workspace/ai/models`    | Model definitions and helpers                          |
| `@workspace/ai/prompts`   | Prompt templates and formatters                        |
| `@workspace/ai/telemetry` | Telemetry configuration                                |

## Core Functions

Core functions wrap the AI SDK with centralized configuration and telemetry.

### coreGenerateObject

Generate structured objects using a Zod schema:

```typescript
import { coreGenerateObject } from '@workspace/ai'
import { z } from 'zod'

const userSchema = z.object({
    name: z.string(),
    age: z.number(),
    interests: z.array(z.string()),
})

const result = await coreGenerateObject({
    schema: userSchema,
    system: 'You are a helpful assistant that extracts user information',
    prompt: 'Extract info from: John Doe is 30 years old and loves hiking and photography',
    modelId: 'gpt-4o-mini', // Optional, defaults to DEFAULT_CHAT_MODEL_ID
    temperature: 0.3, // Optional, defaults to 0.7
})

console.log(result.object)
// { name: 'John Doe', age: 30, interests: ['hiking', 'photography'] }
```

### coreGenerateText

Generate text responses (supports both prompt and messages):

```typescript
import { coreGenerateText } from '@workspace/ai'

// Simple prompt
const result = await coreGenerateText({
    system: 'You are a helpful assistant',
    prompt: 'Write a haiku about coding',
})

// Chat-based with messages
const chatResult = await coreGenerateText({
    system: 'You are a helpful assistant',
    messages: [
        { role: 'user', content: 'Hello!' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'How are you?' },
    ],
})
```

### coreStreamText

Stream text responses in real-time:

```typescript
import { coreStreamText } from '@workspace/ai'

const result = coreStreamText({
  system: 'You are a helpful assistant',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  modelId: 'gpt-4.1',
  smoothStreaming: true, // Enable word-by-word streaming
  onFinish: async ({ text }) => {
    await saveToDatabase(text)
  },
})

// Use in API route
return result.toTextStreamResponse()
```

### coreStreamObject

Stream structured objects progressively:

```typescript
import { coreStreamObject } from '@workspace/ai'

const { partialObjectStream } = coreStreamObject({
    schema: mySchema,
    system: 'Generate a user profile',
    prompt: 'Create a detailed profile for a tech enthusiast',
})

for await (const partialObject of partialObjectStream) {
    console.log(partialObject) // Partial object as it's generated
}
```

## High-Level Functions

Pre-built functions for common AI operations.

### classifyIntent

Classify conversation intent for lead qualification:

```typescript
import { classifyIntent } from '@workspace/ai'

const result = await classifyIntent([
    { role: 'user', content: 'How much does a BBL cost?' },
    {
        role: 'assistant',
        content: 'BBL pricing varies based on your specific needs...',
    },
    { role: 'user', content: 'I want to schedule a consultation' },
])

console.log(result)
// {
//   primaryIntent: 'consultation_request',
//   intentConfidence: 0.95,
//   detectedProcedures: ['bbl'],
//   tags: ['hot_lead', 'ready_to_book']
// }
```

### analyzeConversation

Comprehensive conversation analysis with lead profiling:

```typescript
import {
    analyzeConversation,
    calculateLeadScoreFromAnalysis,
} from '@workspace/ai'

const analysis = await analyzeConversation(messages)

console.log(analysis.primaryIntent) // 'consultation_request'
console.log(analysis.leadProfile.decisionStage) // 'ready_to_book'
console.log(analysis.psychographicData.motivations) // ['feel more confident']
console.log(analysis.actionableIntelligence.recommendedAction) // 'call_immediately'
console.log(analysis.conversationSummary) // 'Lead interested in BBL...'

// Calculate lead score
const { score, grade } = calculateLeadScoreFromAnalysis(analysis, {
    hasEmail: true,
    messageCount: 8,
    returningVisitor: true,
})
// score: 85, grade: 'A'
```

### streamChat

Simplified chat streaming with sensible defaults:

```typescript
import { streamChat } from '@workspace/ai'

const result = streamChat({
  systemPrompt: 'You are Sofia, a friendly assistant for Alluring Plastic Surgery',
  messages: contextMessages,
  temperature: 0.7,
  maxTokens: 1000,
  smoothStreaming: true,
  onFinish: async ({ text }) => {
    await saveChatMessage({ sessionId, role: 'assistant', content: text })
  },
})

return result.toTextStreamResponse()
```

### generateQuickQuestions

Generate contextual follow-up questions:

```typescript
import { generateQuickQuestions } from '@workspace/ai'

const questions = await generateQuickQuestions({
    messages: conversationHistory,
    lastResponse: assistantReply,
    detectedProcedures: ['bbl', 'tummy_tuck'],
})

console.log(questions)
// ['Do you offer financing options?', 'What is the recovery time?', 'Can I see before/after photos?']
```

## Schemas Reference

### Intent Classification Schema

```typescript
import {
    DETECTABLE_PROCEDURES,
    INTENT_TYPES,
    type IntentClassification,
    SESSION_TAGS,
    intentClassificationSchema,
} from '@workspace/ai/schemas'

// Available intent types
INTENT_TYPES // ['consultation_request', 'pricing_inquiry', 'procedure_info', ...]

// Detectable procedures
DETECTABLE_PROCEDURES // ['bbl', 'breast_augmentation', 'tummy_tuck', ...]

// Session tags
SESSION_TAGS // ['hot_lead', 'price_sensitive', 'ready_to_book', ...]
```

### Conversation Analysis Schema

```typescript
import {
    type ActionableIntelligence,
    BUDGET_INDICATORS,
    type ConversationAnalysis,
    DECISION_STAGES,
    FOLLOW_UP_PRIORITIES,
    type LeadProfile,
    type PsychographicData,
    RECOMMENDED_ACTIONS,
    TIMELINE_OPTIONS,
    conversationAnalysisSchema,
} from '@workspace/ai/schemas'
```

### Quick Questions Schema

```typescript
import {
    MAX_QUESTION_LENGTH,
    type QuickQuestions,
    quickQuestionsSchema,
} from '@workspace/ai/schemas'
```

## Model Configuration

### Available Models

```typescript
import {
    type AIModel,
    AVAILABLE_MODELS,
    DEFAULT_CHAT_MODEL_ID,
    DEFAULT_CLASSIFICATION_MODEL_ID,
    DEFAULT_CONVERSATION_ANALYSIS_MODEL_ID,
    type ModelTier,
    getModelById,
    getModelsByTier,
    getRecommendedModels,
    isValidModelId,
} from '@workspace/ai/models'

// Get all recommended models
const recommended = getRecommendedModels()

// Get models by pricing tier
const premiumModels = getModelsByTier('premium')

// Validate model ID
if (isValidModelId(userSelectedModel)) {
    // Use the model
}
```

### Default Models

| Use Case              | Default Model  | Constant                                 |
| --------------------- | -------------- | ---------------------------------------- |
| Chat                  | `gpt-4.1`      | `DEFAULT_CHAT_MODEL_ID`                  |
| Classification        | `gpt-4.1-nano` | `DEFAULT_CLASSIFICATION_MODEL_ID`        |
| Conversation Analysis | `gpt-4.1-mini` | `DEFAULT_CONVERSATION_ANALYSIS_MODEL_ID` |
| Quick Questions       | `gpt-4.1-mini` | `DEFAULT_QUICK_QUESTIONS_MODEL_ID`       |
| Deep Analysis         | `gpt-4.1`      | `DEFAULT_DEEP_DIVE_ANALYSIS_MODEL_ID`    |

## Prompts Reference

### System Prompts

```typescript
import {
    DEFAULT_CHAT_SYSTEM_PROMPT,
    type SystemPromptParams,
    generateSystemPrompt,
} from '@workspace/ai/prompts'

// Use default prompt
const systemPrompt = DEFAULT_CHAT_SYSTEM_PROMPT

// Generate customized prompt
const customPrompt = generateSystemPrompt({
    agentName: 'Maria',
    clinicName: 'Beauty Clinic',
    location: 'Los Angeles, CA',
    tagline: 'Your Beauty Journey Starts Here',
    specialties: ['facelift', 'rhinoplasty', 'botox'],
})
```

### Classification Prompts

```typescript
import {
    INTENT_CLASSIFICATION_SYSTEM_PROMPT,
    formatMessagesForClassification,
    getIntentClassificationPrompt,
} from '@workspace/ai/prompts'
```

### Analysis Prompts

```typescript
import {
    CONVERSATION_ANALYSIS_SYSTEM_PROMPT,
    formatMessagesForAnalysis,
    getConversationAnalysisPrompt,
} from '@workspace/ai/prompts'
```

## Integration Patterns

### API Route with Streaming

```typescript
// app/api/chat/route.ts
import {
    coreStreamText,
    createUIMessageStream,
    createUIMessageStreamResponse,
    generateQuickQuestions,
} from '@workspace/ai'
import { type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const { messages, sessionId } = await request.json()

    const stream = createUIMessageStream({
        execute: async ({ writer }) => {
            writer.write({ type: 'start' })

            let fullText = ''
            const result = coreStreamText({
                system: systemPrompt,
                messages,
                smoothStreaming: { chunking: 'word' },
            })

            for await (const part of result.fullStream) {
                if (part.type === 'text-delta') {
                    fullText += part.text
                    writer.write({ type: 'text-delta', delta: part.text })
                }
            }

            // Generate follow-up questions
            const questions = await generateQuickQuestions({
                messages,
                lastResponse: fullText,
            })

            if (questions.length > 0) {
                writer.write({
                    type: 'data-quick-questions',
                    data: { questions },
                })
            }

            writer.write({ type: 'finish' })
        },
    })

    return createUIMessageStreamResponse({ stream })
}
```

### Background Analysis

```typescript
import {
    analyzeConversation,
    calculateLeadScoreFromAnalysis,
} from '@workspace/ai'
import type { AnalysisMessage } from '@workspace/ai/schemas'

async function analyzeConversationAsync(
    sessionId: string,
    messages: Array<{ role: string; content: string }>
) {
    const analysisMessages: AnalysisMessage[] = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }))

    const analysis = await analyzeConversation(analysisMessages)

    if (analysis.primaryIntent !== 'unknown') {
        const { score, grade } = calculateLeadScoreFromAnalysis(analysis, {
            hasEmail: true,
            messageCount: messages.length,
        })

        await updateSessionAnalysis(sessionId, analysis, score, grade)
    }
}
```

## Adding New AI Features

### Step 1: Create Schema

```typescript
// src/schemas/my-feature.schema.ts
import { z } from 'zod'

export const myFeatureSchema = z.object({
    field1: z.string().describe('Description for the LLM'),
    field2: z.array(z.string()).describe('List of items'),
})

export type MyFeature = z.infer<typeof myFeatureSchema>
```

### Step 2: Create Prompt

```typescript
// src/prompts/my-feature.prompt.ts
export const MY_FEATURE_SYSTEM_PROMPT = `You are an expert at...`

export function getMyFeaturePrompt(input: string): string {
    return `Analyze this input: ${input}`
}
```

### Step 3: Create Function

```typescript
// src/functions/my-feature.function.ts
import { coreGenerateObject } from '../core'
import { DEFAULT_CHAT_MODEL_ID } from '../models/available-models.constant'
import {
    MY_FEATURE_SYSTEM_PROMPT,
    getMyFeaturePrompt,
} from '../prompts/my-feature.prompt'
import { type MyFeature, myFeatureSchema } from '../schemas/my-feature.schema'

export type MyFeatureOptions = {
    modelId?: string
    temperature?: number
}

export async function myFeature(
    input: string,
    options: MyFeatureOptions = {}
): Promise<MyFeature> {
    const { modelId = DEFAULT_CHAT_MODEL_ID, temperature = 0.5 } = options

    const result = await coreGenerateObject({
        modelId,
        schema: myFeatureSchema,
        system: MY_FEATURE_SYSTEM_PROMPT,
        prompt: getMyFeaturePrompt(input),
        temperature,
    })

    return result.object
}
```

### Step 4: Export from Package

Update the relevant index files to export your new schema, prompt, and function.

## Telemetry

The package integrates with Langfuse for AI observability. Telemetry is automatically included in all core functions via `experimental_telemetry: telemetryConfig`.

```typescript
import { telemetryConfig } from '@workspace/ai/telemetry'

// Telemetry is automatically enabled
// Traces are sent to Langfuse when LANGFUSE_ENABLED=true
```

## TypeScript Types

All types are exported and fully typed:

```typescript
import type {
    // Model types
    AIModel,
    ActionableIntelligence,
    AnalyzeConversationOptions,
    // Function option types
    ClassifyIntentOptions,
    ConversationAnalysis,
    CoreBaseOptions,
    CoreGenerateObjectOptions,
    // Core types
    CoreMessage,
    CoreStreamTextOptions,
    GenerateObjectResult,
    // Schema types
    IntentClassification,
    LeadProfile,
    ModelCapability,
    ModelProvider,
    ModelTier,
    PsychographicData,
    StreamChatOptions,
    StreamTextResult,
} from '@workspace/ai'
```

## Related Documentation

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Langfuse Documentation](https://langfuse.com/docs)
- [Zod Documentation](https://zod.dev/)
