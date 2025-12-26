import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { fetchApi, buildUrl } from '@/lib/utils/api-client.util'
import type {
    BlogIdeaListItem,
    BlogIdeaDetail,
    IdeasByStage,
    IdeaStageStats,
    GetIdeasOptions,
} from '@/lib/queries/ideas.query'
import {
    createBlogIdea,
    updateBlogIdea,
    updateBlogIdeaStage,
    deleteBlogIdea,
    type BlogIdeaFormData,
} from '@/lib/actions/idea.action'

/**
 * Query keys for ideas data.
 * Centralized for easy cache invalidation.
 */
export const ideasKeys = {
    all: ['admin', 'ideas'] as const,
    list: (options?: GetIdeasOptions) =>
        [...ideasKeys.all, 'list', options] as const,
    kanban: () => [...ideasKeys.all, 'kanban'] as const,
    detail: (id: string) => [...ideasKeys.all, 'detail', id] as const,
    stats: () => [...ideasKeys.all, 'stats'] as const,
} as const

/**
 * Hook to fetch paginated list of blog ideas
 */
export function useIdeasList(options: GetIdeasOptions = {}) {
    const queryString = new URLSearchParams()

    if (options.page) queryString.set('page', String(options.page))
    if (options.pageSize) queryString.set('pageSize', String(options.pageSize))
    if (options.sortBy) queryString.set('sortBy', options.sortBy)
    if (options.sortOrder) queryString.set('sortOrder', options.sortOrder)
    if (options.stage) queryString.set('stage', options.stage)
    if (options.priority) queryString.set('priority', options.priority)
    if (options.contentType) queryString.set('contentType', options.contentType)
    if (options.search) queryString.set('search', options.search)
    queryString.set('view', 'list')

    return useQuery({
        queryKey: ideasKeys.list(options),
        queryFn: () =>
            fetchApi<{ ideas: BlogIdeaListItem[]; total: number }>(
                `/api/blog/ideas?${queryString.toString()}`
            ),
        staleTime: 30_000,
    })
}

/**
 * Hook to fetch ideas grouped by stage for Kanban view
 */
export function useIdeasKanban() {
    return useQuery({
        queryKey: ideasKeys.kanban(),
        queryFn: () =>
            fetchApi<IdeasByStage>(
                buildUrl('/api/blog/ideas', { view: 'kanban' })
            ),
        staleTime: 30_000,
    })
}

/**
 * Hook to fetch a single idea by ID
 */
export function useIdeaDetail(id: string) {
    return useQuery({
        queryKey: ideasKeys.detail(id),
        queryFn: () => fetchApi<BlogIdeaDetail>(`/api/blog/ideas/${id}`),
        staleTime: 30_000,
        enabled: !!id,
    })
}

/**
 * Hook to fetch idea stage stats
 */
export function useIdeasStats() {
    return useQuery({
        queryKey: ideasKeys.stats(),
        queryFn: () => fetchApi<IdeaStageStats>('/api/blog/ideas/stats'),
        staleTime: 30_000,
    })
}

/**
 * Hook to create a new idea
 */
export function useCreateIdea() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: BlogIdeaFormData) => createBlogIdea(data),
        onSuccess: async () => {
            // Invalidate all ideas queries
            await queryClient.invalidateQueries({ queryKey: ideasKeys.all })
        },
    })
}

/**
 * Hook to update an existing idea
 */
export function useUpdateIdea() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: Partial<BlogIdeaFormData>
        }) => updateBlogIdea(id, data),
        onSuccess: async (_, variables) => {
            // Invalidate specific idea and lists
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ideasKeys.detail(variables.id),
                }),
                queryClient.invalidateQueries({ queryKey: ideasKeys.list() }),
                queryClient.invalidateQueries({ queryKey: ideasKeys.kanban() }),
                queryClient.invalidateQueries({ queryKey: ideasKeys.stats() }),
            ])
        },
    })
}

/**
 * Hook to update idea stage (optimistic update for drag-and-drop)
 */
export function useUpdateIdeaStage() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            stage,
        }: {
            id: string
            stage:
                | 'backlog'
                | 'researching'
                | 'approved'
                | 'in_progress'
                | 'published'
        }) => updateBlogIdeaStage(id, stage),
        onMutate: async ({ id, stage }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ideasKeys.kanban() })

            // Snapshot the previous value
            const previousKanban = queryClient.getQueryData<IdeasByStage>(
                ideasKeys.kanban()
            )

            // Optimistically update the kanban
            if (previousKanban) {
                const updatedKanban = { ...previousKanban }

                // Find and remove the idea from its current stage
                let movedIdea: BlogIdeaListItem | undefined
                for (const stageKey of Object.keys(updatedKanban) as Array<
                    keyof IdeasByStage
                >) {
                    const idx = updatedKanban[stageKey].findIndex(
                        (i) => i.id === id
                    )
                    if (idx !== -1) {
                        movedIdea = updatedKanban[stageKey][idx]
                        updatedKanban[stageKey] = [
                            ...updatedKanban[stageKey].slice(0, idx),
                            ...updatedKanban[stageKey].slice(idx + 1),
                        ]
                        break
                    }
                }

                // Add to the new stage
                if (movedIdea) {
                    const newStage = stage as keyof IdeasByStage
                    updatedKanban[newStage] = [
                        { ...movedIdea, stage },
                        ...updatedKanban[newStage],
                    ]
                }

                queryClient.setQueryData(ideasKeys.kanban(), updatedKanban)
            }

            return { previousKanban }
        },
        onError: (_, __, context) => {
            // Rollback on error
            if (context?.previousKanban) {
                queryClient.setQueryData(
                    ideasKeys.kanban(),
                    context.previousKanban
                )
            }
        },
        onSettled: async () => {
            // Refetch to ensure consistency
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ideasKeys.kanban() }),
                queryClient.invalidateQueries({ queryKey: ideasKeys.stats() }),
            ])
        },
    })
}

/**
 * Hook to delete an idea
 */
export function useDeleteIdea() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteBlogIdea(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ideasKeys.all })
        },
    })
}
