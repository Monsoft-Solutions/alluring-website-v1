import {
    Lightbulb,
    Sparkles,
    Shield,
    FileText,
    ImageIcon,
    Pencil,
    CheckCircle,
    Calendar,
    Newspaper,
} from 'lucide-react'
import type {
    PipelineStatus,
    BlogPostPriority,
} from '@/lib/types/blog/blog-action.type'

/**
 * Stage configuration for the Kanban board
 */
export const STAGE_CONFIG: Record<
    PipelineStatus,
    {
        label: string
        icon: React.ComponentType<{ className?: string }>
        headerClass: string
        badgeClass: string
        description: string
        autoProcess: boolean
    }
> = {
    ideation: {
        label: 'Ideation',
        icon: Lightbulb,
        headerClass: 'border-stone-200 bg-stone-50',
        badgeClass: 'bg-stone-200 text-stone-700',
        description: 'Plan and research',
        autoProcess: false,
    },
    generate: {
        label: 'Generate',
        icon: Sparkles,
        headerClass: 'border-amber-200 bg-amber-50',
        badgeClass: 'bg-amber-200 text-amber-700',
        description: 'AI content generation',
        autoProcess: true,
    },
    ai_review: {
        label: 'AI Review',
        icon: Shield,
        headerClass: 'border-blue-200 bg-blue-50',
        badgeClass: 'bg-blue-200 text-blue-700',
        description: 'Quality review',
        autoProcess: true,
    },
    generate_metadata: {
        label: 'Metadata',
        icon: FileText,
        headerClass: 'border-purple-200 bg-purple-50',
        badgeClass: 'bg-purple-200 text-purple-700',
        description: 'Extract SEO data',
        autoProcess: true,
    },
    generate_image: {
        label: 'Image',
        icon: ImageIcon,
        headerClass: 'border-pink-200 bg-pink-50',
        badgeClass: 'bg-pink-200 text-pink-700',
        description: 'AI featured image',
        autoProcess: true,
    },
    draft: {
        label: 'Draft',
        icon: Pencil,
        headerClass: 'border-cyan-200 bg-cyan-50',
        badgeClass: 'bg-cyan-200 text-cyan-700',
        description: 'Human review',
        autoProcess: false,
    },
    ready_to_publish: {
        label: 'Ready',
        icon: CheckCircle,
        headerClass: 'border-emerald-200 bg-emerald-50',
        badgeClass: 'bg-emerald-200 text-emerald-700',
        description: 'Approved for publish',
        autoProcess: false,
    },
    scheduled: {
        label: 'Scheduled',
        icon: Calendar,
        headerClass: 'border-orange-200 bg-orange-50',
        badgeClass: 'bg-orange-200 text-orange-700',
        description: 'Publish scheduled',
        autoProcess: false,
    },
    published: {
        label: 'Published',
        icon: Newspaper,
        headerClass: 'border-green-200 bg-green-50',
        badgeClass: 'bg-green-200 text-green-700',
        description: 'Live on site',
        autoProcess: false,
    },
}

/**
 * Stage order for navigation
 */
export const STAGE_ORDER: PipelineStatus[] = [
    'ideation',
    'generate',
    'ai_review',
    'generate_metadata',
    'generate_image',
    'draft',
    'ready_to_publish',
    'scheduled',
    'published',
]

/**
 * Stage labels for UI
 */
export const STAGE_LABELS: Record<PipelineStatus, string> = {
    ideation: 'Ideation',
    generate: 'Generate',
    ai_review: 'AI Review',
    generate_metadata: 'Metadata',
    generate_image: 'Image',
    draft: 'Draft',
    ready_to_publish: 'Ready',
    scheduled: 'Scheduled',
    published: 'Published',
}

/**
 * Priority configuration
 */
export const PRIORITY_CONFIG: Record<
    BlogPostPriority,
    { label: string; class: string }
> = {
    low: { label: 'Low', class: 'bg-stone-100 text-stone-600' },
    medium: { label: 'Medium', class: 'bg-blue-100 text-blue-600' },
    high: { label: 'High', class: 'bg-amber-100 text-amber-600' },
    urgent: { label: 'Urgent', class: 'bg-red-100 text-red-600' },
}

export const PRIORITY_ORDER: BlogPostPriority[] = [
    'low',
    'medium',
    'high',
    'urgent',
]
