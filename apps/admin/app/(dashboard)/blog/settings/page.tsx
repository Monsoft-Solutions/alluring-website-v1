/**
 * Blog AI Settings Page
 *
 * Configure which AI models the blog content pipeline runs on.
 *
 * @module app/(dashboard)/blog/settings/page
 */
import { getBlogAiConfig } from '@/lib/queries/blog-ai-config.query'
import { BlogAiSettingsForm } from '@/components/blog/blog-ai-settings-form.component'
import { AutopilotStatusCard } from '@/components/blog/autopilot-status-card.component'

export const dynamic = 'force-dynamic'
// The Run-now server actions execute on this page's route segment; the
// manual ideation run needs ~60s (model call + gate), so the budget must
// comfortably exceed it — 30s killed manual runs mid-flight in production.
export const maxDuration = 300

export default async function BlogAiSettingsPage() {
    const config = await getBlogAiConfig()

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div>
                <h1 className='text-2xl font-semibold'>Blog AI Settings</h1>
                <p className='text-muted-foreground'>
                    Choose the models the blog pipeline uses to write, review
                    and illustrate posts.
                </p>
            </div>

            <AutopilotStatusCard />

            <BlogAiSettingsForm initialData={config} />
        </div>
    )
}
