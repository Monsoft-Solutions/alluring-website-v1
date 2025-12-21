import { Badge } from '@workspace/ui/components/badge'

type StatusBadgeProps = {
    status: 'draft' | 'readyToPublish' | 'published' | null
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
        published: 'default',
        readyToPublish: 'secondary',
        draft: 'outline',
    }

    const labels: Record<string, string> = {
        published: 'Published',
        readyToPublish: 'Ready to Publish',
        draft: 'Draft',
    }

    const statusKey = status ?? 'draft'

    return (
        <Badge variant={variants[statusKey] ?? 'outline'}>
            {labels[statusKey] ?? 'Draft'}
        </Badge>
    )
}
