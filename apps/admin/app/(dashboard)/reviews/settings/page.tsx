/**
 * Google Reviews Settings Page
 *
 * Configure Google Business Profile integration.
 *
 * @module app/(dashboard)/reviews/settings/page
 */
import { Button } from '@workspace/ui/components/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { getGoogleReviewsSettings } from '@/lib/queries/google-reviews.query'
import { GoogleReviewsSettingsForm } from '@/components/reviews/google-reviews-settings-form.component'
import { isGoogleOAuthConfigured } from '@/lib/services/google-reviews/google-oauth.service'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export default async function GoogleReviewsSettingsPage() {
    const settings = await getGoogleReviewsSettings()

    // Check if OAuth is complete (has tokens)
    const isConnected = !!(settings?.accessToken && settings?.refreshToken)

    // Check OAuth config on server
    const oauthConfigured = isGoogleOAuthConfigured()

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center gap-4'>
                <Button asChild variant='ghost' size='icon'>
                    <Link href='/reviews'>
                        <ArrowLeft className='h-4 w-4' />
                    </Link>
                </Button>
                <div>
                    <h1 className='text-2xl font-semibold'>
                        Google Reviews Settings
                    </h1>
                    <p className='text-muted-foreground'>
                        Configure Google Business Profile integration
                    </p>
                </div>
            </div>

            {/* Settings Form */}
            <GoogleReviewsSettingsForm
                oauthConfigured={oauthConfigured}
                initialData={
                    settings
                        ? {
                              accountId: settings.accountId,
                              locationId: settings.locationId,
                              locationName: settings.locationName,
                              isEnabled: settings.isEnabled,
                              lastSyncAt: settings.lastSyncAt,
                              totalReviewsCount: settings.totalReviewsCount,
                              averageRating: settings.averageRating,
                              isConnected,
                          }
                        : null
                }
            />
        </div>
    )
}
