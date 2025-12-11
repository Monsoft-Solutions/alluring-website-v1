/**
 * Social Media Settings Page
 *
 * Configure social media integrations.
 *
 * @module app/(dashboard)/social-media/settings/page
 */
import { Button } from '@workspace/ui/components/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { getInstagramSettings } from '@/lib/queries/social-media.query'
import { InstagramSettingsForm } from '@/components/social-media/instagram-settings-form.component'

export const dynamic = 'force-dynamic'

export default async function SocialMediaSettingsPage() {
    const settings = await getInstagramSettings()

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center gap-4'>
                <Button asChild variant='ghost' size='icon'>
                    <Link href='/social-media'>
                        <ArrowLeft className='h-4 w-4' />
                    </Link>
                </Button>
                <div>
                    <h1 className='text-2xl font-semibold'>
                        Social Media Settings
                    </h1>
                    <p className='text-muted-foreground'>
                        Configure social media integrations and API keys
                    </p>
                </div>
            </div>

            {/* Instagram Settings Form */}
            <InstagramSettingsForm
                initialData={
                    settings
                        ? {
                              handle: settings.handle,
                              apiKey: settings.apiKey,
                              isEnabled: settings.isEnabled,
                              lastSyncAt: settings.lastSyncAt,
                              lastSyncCursor: settings.lastSyncCursor,
                          }
                        : null
                }
            />
        </div>
    )
}
