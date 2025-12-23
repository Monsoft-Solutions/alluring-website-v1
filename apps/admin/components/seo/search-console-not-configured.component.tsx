'use client'

import { Settings, ExternalLink } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'

/**
 * Component displayed when Google Search Console is not configured.
 * Provides setup instructions.
 */
export function SearchConsoleNotConfigured() {
    return (
        <Card className='border-dashed'>
            <CardHeader className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100'>
                    <Settings className='h-8 w-8 text-stone-400' />
                </div>
                <CardTitle className='text-xl'>
                    Google Search Console Not Configured
                </CardTitle>
                <CardDescription className='mx-auto max-w-md'>
                    Connect your Google Search Console to see search analytics,
                    discover content opportunities, and track your SEO
                    performance.
                </CardDescription>
            </CardHeader>
            <CardContent className='text-center'>
                <div className='mx-auto max-w-lg space-y-4'>
                    <div className='rounded-lg bg-stone-50 p-4 text-left'>
                        <h4 className='mb-3 font-medium'>Setup Instructions</h4>
                        <ol className='text-muted-foreground space-y-2 text-sm'>
                            <li>
                                <span className='mr-2 font-medium text-stone-700'>
                                    1.
                                </span>
                                Enable the Search Console API in your Google
                                Cloud Console
                            </li>
                            <li>
                                <span className='mr-2 font-medium text-stone-700'>
                                    2.
                                </span>
                                Create a service account (or use your existing
                                Google Indexing service account)
                            </li>
                            <li>
                                <span className='mr-2 font-medium text-stone-700'>
                                    3.
                                </span>
                                In Google Search Console, go to Settings → Users
                                and permissions
                            </li>
                            <li>
                                <span className='mr-2 font-medium text-stone-700'>
                                    4.
                                </span>
                                Add the service account email with
                                &quot;Full&quot; access
                            </li>
                            <li>
                                <span className='mr-2 font-medium text-stone-700'>
                                    5.
                                </span>
                                Add these environment variables to your admin
                                app:
                            </li>
                        </ol>
                        <pre className='mt-3 overflow-x-auto rounded bg-stone-900 p-3 text-xs text-stone-100'>
                            {`GOOGLE_CLIENT_EMAIL=your-service@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"`}
                        </pre>
                    </div>
                    <div className='flex justify-center gap-3'>
                        <Button variant='outline' asChild>
                            <a
                                href='https://console.cloud.google.com/apis/library/searchconsole.googleapis.com'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                Enable API
                                <ExternalLink className='ml-2 h-4 w-4' />
                            </a>
                        </Button>
                        <Button variant='outline' asChild>
                            <a
                                href='https://search.google.com/search-console'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                Open Search Console
                                <ExternalLink className='ml-2 h-4 w-4' />
                            </a>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
