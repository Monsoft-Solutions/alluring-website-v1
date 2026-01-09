import { Badge } from '@workspace/ui/components/badge'

import type { PipelineStatus } from '@/lib/types/blog/blog-action.type'

type StatusBadgeProps = {
    status: PipelineStatus | null
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const variants: Record<
        string,
        'default' | 'secondary' | 'outline' | 'destructive'
    > = {
        published: 'default',
        scheduled: 'default',
        ready_to_publish: 'secondary',
        draft: 'outline',
        ideation: 'outline',
        generate: 'secondary',
        ai_review: 'secondary',
        generate_metadata: 'secondary',
        generate_image: 'secondary',
    }

    const labels: Record<string, string> = {
        published: 'Published',
        scheduled: 'Scheduled',
        ready_to_publish: 'Ready to Publish',
        draft: 'Draft',
        ideation: 'Ideation',
        generate: 'Generating',
        ai_review: 'AI Review',
        generate_metadata: 'Extracting',
        generate_image: 'Image Gen',
    }

    const statusKey = status ?? 'draft'

    return (
        <Badge variant={variants[statusKey] ?? 'outline'}>
            {labels[statusKey] ?? 'Draft'}
        </Badge>
    )
}
