import { Badge } from '@workspace/ui/components/badge'

type PipelineStatus =
    | 'ideation'
    | 'generate'
    | 'ai_review'
    | 'generate_metadata'
    | 'draft'
    | 'ready_to_publish'
    | 'scheduled'
    | 'published'

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
    }

    const statusKey = status ?? 'draft'

    return (
        <Badge variant={variants[statusKey] ?? 'outline'}>
            {labels[statusKey] ?? 'Draft'}
        </Badge>
    )
}
