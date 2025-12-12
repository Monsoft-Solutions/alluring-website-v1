/**
 * Concurrency Utility
 *
 * Utilities for managing concurrent async operations with configurable limits.
 *
 * @module @workspace/shared/utils/concurrency
 */

/**
 * Run async tasks with a concurrency limit
 *
 * Executes multiple async tasks in parallel while limiting the number of
 * concurrent operations. Useful for rate limiting API calls, controlling
 * resource usage, and managing parallel processing.
 *
 * @param tasks - Array of async functions to execute
 * @param limit - Maximum number of concurrent tasks
 * @returns Array of results in the same order as input tasks
 *
 * @example
 * ```typescript
 * const tasks = urls.map(url => () => fetch(url))
 * const results = await runWithConcurrency(tasks, 5)
 *
 * for (const result of results) {
 *   if (result.status === 'fulfilled') {
 *     console.log('Success:', result.value)
 *   } else {
 *     console.error('Error:', result.reason)
 *   }
 * }
 * ```
 */
export async function runWithConcurrency<T>(
    tasks: Array<() => Promise<T>>,
    limit: number
): Promise<Array<PromiseSettledResult<T>>> {
    const results: Array<PromiseSettledResult<T>> = []
    const executing: Array<Promise<void>> = []

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]!
        const resultIndex = i

        const promise = task()
            .then((value) => {
                results[resultIndex] = { status: 'fulfilled', value }
            })
            .catch((reason) => {
                results[resultIndex] = { status: 'rejected', reason }
            })
            .then(() => {
                // Remove from executing array when done
                const idx = executing.indexOf(promise as Promise<void>)
                if (idx > -1) executing.splice(idx, 1)
            })

        executing.push(promise as Promise<void>)

        // If we've reached the concurrency limit, wait for one to finish
        if (executing.length >= limit) {
            await Promise.race(executing)
        }
    }

    // Wait for all remaining tasks to complete
    await Promise.all(executing)

    return results
}
