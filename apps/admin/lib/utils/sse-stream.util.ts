/**
 * Server-Sent Events (SSE) Stream Utility
 *
 * Type-safe SSE stream creation for real-time progress updates in API routes.
 *
 * @module @/lib/utils/sse-stream
 */

/**
 * SSE stream sender interface
 */
export type SseStreamSender<
    TEvent extends string,
    TPayloadMap extends Record<TEvent, unknown>,
> = {
    /** The ReadableStream to return in the Response */
    stream: ReadableStream<Uint8Array>
    /** Send an SSE event with typed payload */
    send: <E extends TEvent>(event: E, data: TPayloadMap[E]) => void
    /** Close the stream */
    close: () => void
}

/**
 * Create a type-safe Server-Sent Events stream
 *
 * @example
 * ```typescript
 * type Events = {
 *   progress: { step: string; percent: number }
 *   complete: { success: true; result: string }
 *   error: { success: false; error: string }
 * }
 *
 * const { stream, send, close } = createSseStreamSender<'progress' | 'complete' | 'error', Events>()
 *
 * send('progress', { step: 'analyzing', percent: 10 })
 * send('complete', { success: true, result: 'Done!' })
 * close()
 *
 * return new Response(stream, {
 *   headers: {
 *     'Content-Type': 'text/event-stream',
 *     'Cache-Control': 'no-cache',
 *     Connection: 'keep-alive',
 *   },
 * })
 * ```
 */
export function createSseStreamSender<
    TEvent extends string,
    TPayloadMap extends Record<TEvent, unknown>,
>(): SseStreamSender<TEvent, TPayloadMap> {
    const encoder = new TextEncoder()
    let controller: ReadableStreamDefaultController<Uint8Array> | null = null
    let isClosed = false

    const stream = new ReadableStream<Uint8Array>({
        start(c) {
            controller = c
        },
    })

    const send = <E extends TEvent>(event: E, data: TPayloadMap[E]) => {
        if (isClosed) {
            console.warn(
                `[SSE] Attempted to send event "${String(event)}" after stream was closed`
            )
            return
        }

        if (controller) {
            const message = `event: ${String(event)}\ndata: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(message))
        }
    }

    const close = () => {
        if (!isClosed && controller) {
            isClosed = true
            controller.close()
            controller = null
        }
    }

    return { stream, send, close }
}
