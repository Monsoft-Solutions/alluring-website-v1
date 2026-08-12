/**
 * Pipeline Hooks
 *
 * TanStack Query hooks for the blog content pipeline Kanban.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { fetchApi, buildUrl } from '@/lib/utils/api-client.util'
import type {
    PostsByStatus,
    PipelineStats,
    PipelinePostItem,
} from '@/lib/types/pipeline.type'
import type {
    PipelineStatus,
    BlogPostPriority,
} from '@/lib/types/blog/blog-action.type'
import type { PipelinePostDetail } from '@/lib/types/blog/pipeline-post-detail.type'
import {
    updatePipelineStatus,
    updatePostPriority,
    createPipelinePost,
    updatePipelinePost,
    duplicateBlogPost,
    deleteBlogPost,
    approveIdea,
    rejectIdea,
} from '@/lib/actions/blog.action'
import type {
    CreatePipelinePostData,
    UpdatePipelinePostData,
} from '@/lib/types/blog/blog-action.type'

// Re-export for consumers
export type { PipelinePostDetail }

/**
 * Query keys for pipeline data
 */
export const pipelineKeys = {
    all: ['admin', 'pipeline'] as const,
    kanban: () => [...pipelineKeys.all, 'kanban'] as const,
    stats: () => [...pipelineKeys.all, 'stats'] as const,
    detail: (id: string) => [...pipelineKeys.all, 'detail', id] as const,
} as const

/**
 * Check if any posts in the data are currently processing
 */
function hasProcessingPosts(data: PostsByStatus | undefined): boolean {
    if (!data) return false
    return Object.values(data).some((posts) =>
        posts.some((post) => post.pipelineProcessingStatus === 'processing')
    )
}

/**
 * Hook to fetch posts grouped by status for Kanban view
 * Automatically polls every 3 seconds when posts are processing
 */
export function usePipelineKanban() {
    return useQuery({
        queryKey: pipelineKeys.kanban(),
        queryFn: () =>
            fetchApi<PostsByStatus>(
                buildUrl('/api/blog/pipeline', { view: 'kanban' })
            ),
        staleTime: 5_000, // 5 seconds
        refetchInterval: (query) => {
            // Poll every 3 seconds when posts are processing
            if (hasProcessingPosts(query.state.data)) {
                return 3000
            }
            // Otherwise, don't auto-refetch
            return false
        },
    })
}

/**
 * Hook to fetch pipeline stats
 */
export function usePipelineStats() {
    return useQuery({
        queryKey: pipelineKeys.stats(),
        queryFn: () =>
            fetchApi<PipelineStats>(
                buildUrl('/api/blog/pipeline', { view: 'stats' })
            ),
        staleTime: 30_000,
    })
}

/**
 * Hook to fetch full post details for editing
 */
export function usePipelinePostDetail(id: string | null) {
    return useQuery({
        queryKey: pipelineKeys.detail(id ?? ''),
        queryFn: () =>
            fetchApi<PipelinePostDetail>(buildUrl(`/api/blog/pipeline/${id}`)),
        enabled: !!id,
        staleTime: 10_000,
    })
}

/**
 * Hook to update post pipeline status (for Kanban drag-and-drop)
 */
export function useUpdatePipelineStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: PipelineStatus }) =>
            updatePipelineStatus(id, status),
        onMutate: async ({ id, status }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: pipelineKeys.kanban() })

            // Snapshot the previous value
            const previousKanban = queryClient.getQueryData<PostsByStatus>(
                pipelineKeys.kanban()
            )

            // Optimistically update the kanban
            if (previousKanban) {
                const updatedKanban = { ...previousKanban }

                // Find and remove the post from its current status
                let movedPost: PipelinePostItem | undefined
                for (const statusKey of Object.keys(
                    updatedKanban
                ) as PipelineStatus[]) {
                    const idx = updatedKanban[statusKey].findIndex(
                        (p) => p.id === id
                    )
                    if (idx !== -1) {
                        movedPost = updatedKanban[statusKey][idx]
                        updatedKanban[statusKey] = [
                            ...updatedKanban[statusKey].slice(0, idx),
                            ...updatedKanban[statusKey].slice(idx + 1),
                        ]
                        break
                    }
                }

                // Add to the new status
                if (movedPost) {
                    updatedKanban[status] = [
                        { ...movedPost, status },
                        ...updatedKanban[status],
                    ]
                }

                queryClient.setQueryData(pipelineKeys.kanban(), updatedKanban)
            }

            return { previousKanban }
        },
        onError: (_, __, context) => {
            // Rollback on error
            if (context?.previousKanban) {
                queryClient.setQueryData(
                    pipelineKeys.kanban(),
                    context.previousKanban
                )
            }
        },
        onSettled: async () => {
            // Refetch to ensure consistency
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: pipelineKeys.kanban(),
                }),
                queryClient.invalidateQueries({
                    queryKey: pipelineKeys.stats(),
                }),
            ])
        },
    })
}

/**
 * Hook to update post priority
 */
export function useUpdatePostPriority() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            priority,
        }: {
            id: string
            priority: BlogPostPriority
        }) => updatePostPriority(id, priority),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: pipelineKeys.kanban(),
            })
        },
    })
}

/**
 * Hook to create a new pipeline post
 */
export function useCreatePipelinePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreatePipelinePostData) => createPipelinePost(data),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: pipelineKeys.kanban(),
                }),
                queryClient.invalidateQueries({
                    queryKey: pipelineKeys.stats(),
                }),
            ])
        },
    })
}

/**
 * Hook to trigger pipeline processing for a post
 * Calls the appropriate API endpoint based on the post's current status
 */
export function useTriggerPipeline() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            status,
        }: {
            id: string
            status:
                | 'generate'
                | 'ai_review'
                | 'generate_metadata'
                | 'generate_image'
        }) => {
            const endpoint = {
                generate: `/api/blog/posts/${id}/pipeline/generate`,
                ai_review: `/api/blog/posts/${id}/pipeline/review`,
                generate_metadata: `/api/blog/posts/${id}/pipeline/extract`,
                generate_image: `/api/blog/posts/${id}/pipeline/generate-image`,
            }[status]

            return fetchApi(endpoint, { method: 'POST' })
        },
        onMutate: async ({ id, status }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: pipelineKeys.kanban() })

            // Snapshot the previous value
            const previousKanban = queryClient.getQueryData<PostsByStatus>(
                pipelineKeys.kanban()
            )

            // Optimistically update to show processing state
            if (previousKanban) {
                const updatedKanban = { ...previousKanban }
                const idx = updatedKanban[status].findIndex((p) => p.id === id)
                if (idx !== -1) {
                    const post = updatedKanban[status][idx]
                    if (post) {
                        updatedKanban[status] = [
                            ...updatedKanban[status].slice(0, idx),
                            {
                                ...post,
                                pipelineProcessingStatus: 'processing' as const,
                            },
                            ...updatedKanban[status].slice(idx + 1),
                        ]
                        queryClient.setQueryData(
                            pipelineKeys.kanban(),
                            updatedKanban
                        )
                    }
                }
            }

            return { previousKanban }
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: pipelineKeys.kanban(),
                }),
                queryClient.invalidateQueries({
                    queryKey: pipelineKeys.stats(),
                }),
            ])
        },
        onError: (error, _, context) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Pipeline processing failed'
            )
            // Rollback on error
            if (context?.previousKanban) {
                queryClient.setQueryData(
                    pipelineKeys.kanban(),
                    context.previousKanban
                )
            }
        },
    })
}

/**
 * Hook to update a pipeline post from the edit dialog
 * Combines title, status, priority, keywords, content, and planning data
 */
export function useUpdatePipelinePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdatePipelinePostData
        }) => updatePipelinePost(id, data),
        onMutate: async ({ id, data }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: pipelineKeys.kanban() })

            // Snapshot the previous value
            const previousKanban = queryClient.getQueryData<PostsByStatus>(
                pipelineKeys.kanban()
            )

            // Optimistically update the kanban
            if (previousKanban) {
                const updatedKanban = { ...previousKanban }

                // Find the post and update it
                for (const statusKey of Object.keys(
                    updatedKanban
                ) as PipelineStatus[]) {
                    const idx = updatedKanban[statusKey].findIndex(
                        (p) => p.id === id
                    )
                    if (idx !== -1) {
                        const post = updatedKanban[statusKey][idx]
                        if (!post) continue

                        // If status changed, move to new column
                        if (statusKey !== data.status) {
                            // Remove from old column
                            updatedKanban[statusKey] = [
                                ...updatedKanban[statusKey].slice(0, idx),
                                ...updatedKanban[statusKey].slice(idx + 1),
                            ]
                            // Add to new column with updated data
                            updatedKanban[data.status] = [
                                {
                                    ...post,
                                    title: data.title,
                                    status: data.status,
                                    priority: data.priority,
                                    primaryKeyword: data.primaryKeyword ?? null,
                                    planningData: data.planningData ?? null,
                                },
                                ...updatedKanban[data.status],
                            ]
                        } else {
                            // Update in place
                            updatedKanban[statusKey] = [
                                ...updatedKanban[statusKey].slice(0, idx),
                                {
                                    ...post,
                                    title: data.title,
                                    status: data.status,
                                    priority: data.priority,
                                    primaryKeyword: data.primaryKeyword ?? null,
                                    planningData: data.planningData ?? null,
                                },
                                ...updatedKanban[statusKey].slice(idx + 1),
                            ]
                        }
                        break
                    }
                }

                queryClient.setQueryData(pipelineKeys.kanban(), updatedKanban)
            }

            return { previousKanban }
        },
        onError: (_, __, context) => {
            // Rollback on error
            if (context?.previousKanban) {
                queryClient.setQueryData(
                    pipelineKeys.kanban(),
                    context.previousKanban
                )
            }
        },
        onSettled: async () => {
            // Refetch to ensure consistency
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: pipelineKeys.kanban(),
                }),
                queryClient.invalidateQueries({
                    queryKey: pipelineKeys.stats(),
                }),
            ])
        },
    })
}

/**
 * Hook to duplicate a pipeline post
 */
export function useDuplicatePipelinePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => duplicateBlogPost(id),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success('Post duplicated successfully')
                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: pipelineKeys.kanban(),
                    }),
                    queryClient.invalidateQueries({
                        queryKey: pipelineKeys.stats(),
                    }),
                ])
            } else {
                toast.error(result.error || 'Failed to duplicate post')
            }
        },
        onError: (error) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to duplicate post'
            )
        },
    })
}

/**
 * Hook to delete a pipeline post
 */
export function useDeletePipelinePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteBlogPost(id),
        onMutate: async (id) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: pipelineKeys.kanban() })

            // Snapshot the previous value
            const previousKanban = queryClient.getQueryData<PostsByStatus>(
                pipelineKeys.kanban()
            )

            // Optimistically remove the post
            if (previousKanban) {
                const updatedKanban = { ...previousKanban }
                for (const statusKey of Object.keys(
                    updatedKanban
                ) as PipelineStatus[]) {
                    updatedKanban[statusKey] = updatedKanban[statusKey].filter(
                        (p) => p.id !== id
                    )
                }
                queryClient.setQueryData(pipelineKeys.kanban(), updatedKanban)
            }

            return { previousKanban }
        },
        onSuccess: (result) => {
            if (result.success) {
                toast.success('Post deleted successfully')
            } else {
                toast.error(result.error || 'Failed to delete post')
            }
        },
        onError: (error, _, context) => {
            toast.error(
                error instanceof Error ? error.message : 'Failed to delete post'
            )
            // Rollback on error
            if (context?.previousKanban) {
                queryClient.setQueryData(
                    pipelineKeys.kanban(),
                    context.previousKanban
                )
            }
        },
        onSettled: async () => {
            // Refetch to ensure consistency
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: pipelineKeys.kanban(),
                }),
                queryClient.invalidateQueries({
                    queryKey: pipelineKeys.stats(),
                }),
            ])
        },
    })
}

/**
 * Auto-processing stages (shown as "processing" while a retry is in flight)
 */
const AUTO_PROCESS_STAGES = [
    'generate',
    'ai_review',
    'generate_metadata',
    'generate_image',
] as const
type AutoProcessStage = (typeof AUTO_PROCESS_STAGES)[number]

function isAutoProcessStage(status: string): status is AutoProcessStage {
    return AUTO_PROCESS_STAGES.includes(status as AutoProcessStage)
}

/**
 * Hook to retry an errored or stuck pipeline post
 * One server-side call frees the processing flag, re-runs the failed phase,
 * and chains the rest of the pipeline
 */
export function useRetryProcessing() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) =>
            fetchApi(`/api/blog/posts/${id}/pipeline/retry`, {
                method: 'POST',
            }),
        onMutate: async (id) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: pipelineKeys.kanban() })

            // Snapshot the previous value
            const previousKanban = queryClient.getQueryData<PostsByStatus>(
                pipelineKeys.kanban()
            )

            // Optimistically update the post's processing status to show it's retrying
            if (previousKanban) {
                const updatedKanban = { ...previousKanban }
                for (const statusKey of Object.keys(
                    updatedKanban
                ) as PipelineStatus[]) {
                    const idx = updatedKanban[statusKey].findIndex(
                        (p) => p.id === id
                    )
                    if (idx !== -1) {
                        const post = updatedKanban[statusKey][idx]
                        if (post) {
                            // For auto-process stages, show as processing (will retry)
                            // For other stages, show as idle
                            const newProcessingStatus = isAutoProcessStage(
                                statusKey
                            )
                                ? 'processing'
                                : 'idle'

                            updatedKanban[statusKey] = [
                                ...updatedKanban[statusKey].slice(0, idx),
                                {
                                    ...post,
                                    pipelineProcessingStatus:
                                        newProcessingStatus as
                                            | 'idle'
                                            | 'processing'
                                            | 'error',
                                    processingError: null,
                                },
                                ...updatedKanban[statusKey].slice(idx + 1),
                            ]
                        }
                        break
                    }
                }
                queryClient.setQueryData(pipelineKeys.kanban(), updatedKanban)
            }

            return { previousKanban }
        },
        onSuccess: () => {
            toast.success('Retrying pipeline processing...')
        },
        onError: (error, _, context) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to retry processing'
            )
            // Rollback on error
            if (context?.previousKanban) {
                queryClient.setQueryData(
                    pipelineKeys.kanban(),
                    context.previousKanban
                )
            }
        },
        onSettled: async () => {
            // Refetch to ensure consistency
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: pipelineKeys.kanban(),
                }),
                queryClient.invalidateQueries({
                    queryKey: pipelineKeys.stats(),
                }),
            ])
        },
    })
}

/**
 * Hook to approve a pending autopilot idea (joins the writing queue)
 */
export function useApproveIdea() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => approveIdea(id),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success('Idea approved — queued for writing')
            } else {
                toast.error(result.error ?? 'Failed to approve idea')
            }
            await queryClient.invalidateQueries({
                queryKey: pipelineKeys.kanban(),
            })
        },
        onError: () => {
            toast.error('Failed to approve idea')
        },
    })
}

/**
 * Hook to reject an idea (leaves the board, never re-proposed)
 */
export function useRejectIdea() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            rejectIdea(id, reason),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success('Idea rejected')
            } else {
                toast.error(result.error ?? 'Failed to reject idea')
            }
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: pipelineKeys.kanban(),
                }),
                queryClient.invalidateQueries({
                    queryKey: pipelineKeys.stats(),
                }),
            ])
        },
        onError: () => {
            toast.error('Failed to reject idea')
        },
    })
}
