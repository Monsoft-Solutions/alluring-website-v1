'use client'

/**
 * Google Reviews Settings Form Component
 *
 * Form for configuring Google Business Profile integration.
 *
 * @module components/reviews/google-reviews-settings-form
 */
import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import {
    Loader2,
    Star,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Unplug,
} from 'lucide-react'

import {
    getBusinessAccounts,
    getBusinessLocations,
    saveBusinessLocation,
    toggleGoogleReviewsEnabled,
    disconnectGoogleReviews,
    type GoogleBusinessAccount,
    type GoogleBusinessLocation,
} from '@/lib/actions/google-reviews.action'

type GoogleReviewsSettingsFormProps = {
    oauthConfigured: boolean
    initialData: {
        accountId: string | null
        locationId: string | null
        locationName: string | null
        isEnabled: boolean
        lastSyncAt: Date | null
        totalReviewsCount: number | null
        averageRating: string | null
        isConnected: boolean
    } | null
}

export function GoogleReviewsSettingsForm({
    oauthConfigured,
    initialData,
}: GoogleReviewsSettingsFormProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    // Connection state
    const isConnected = initialData?.isConnected ?? false

    // Form state
    const [isEnabled, setIsEnabled] = useState(initialData?.isEnabled ?? false)
    const [accounts, setAccounts] = useState<GoogleBusinessAccount[]>([])
    const [locations, setLocations] = useState<GoogleBusinessLocation[]>([])
    const [selectedAccount, setSelectedAccount] = useState<string>(
        initialData?.accountId ?? ''
    )
    const [selectedLocation, setSelectedLocation] = useState<string>(
        initialData?.locationId ?? ''
    )
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)
    const [isLoadingLocations, setIsLoadingLocations] = useState(false)

    // Messages from URL params
    const successParam = searchParams.get('success')
    const errorParam = searchParams.get('error')
    const messageParam = searchParams.get('message')

    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    // Set message from URL params on mount
    useEffect(() => {
        if (successParam === 'connected') {
            setMessage({
                type: 'success',
                text: 'Successfully connected to Google Business Profile!',
            })
        } else if (errorParam) {
            setMessage({
                type: 'error',
                text: messageParam ?? `OAuth error: ${errorParam}`,
            })
        }
    }, [successParam, errorParam, messageParam])

    // Load accounts when connected
    useEffect(() => {
        if (isConnected && accounts.length === 0) {
            loadAccounts()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected])

    // Load locations when account changes
    useEffect(() => {
        if (selectedAccount && selectedAccount !== initialData?.accountId) {
            loadLocations(selectedAccount)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAccount])

    const loadAccounts = async () => {
        setIsLoadingAccounts(true)
        const result = await getBusinessAccounts()
        if (result.success && result.accounts) {
            setAccounts(result.accounts)
        } else {
            setMessage({
                type: 'error',
                text: result.error ?? 'Failed to load business accounts',
            })
        }
        setIsLoadingAccounts(false)
    }

    const loadLocations = async (accountId: string) => {
        setIsLoadingLocations(true)
        const result = await getBusinessLocations(accountId)
        if (result.success && result.locations) {
            setLocations(result.locations)
        } else {
            setMessage({
                type: 'error',
                text: result.error ?? 'Failed to load locations',
            })
        }
        setIsLoadingLocations(false)
    }

    const handleSaveLocation = () => {
        if (!selectedAccount || !selectedLocation) return

        const location = locations.find((l) => l.name === selectedLocation)
        if (!location) return

        setMessage(null)
        startTransition(async () => {
            const result = await saveBusinessLocation(
                selectedAccount,
                selectedLocation,
                location.title
            )

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'Business location saved successfully',
                })
                router.refresh()
            } else {
                setMessage({
                    type: 'error',
                    text: result.error ?? 'Failed to save location',
                })
            }
        })
    }

    const handleToggleEnabled = (checked: boolean) => {
        setIsEnabled(checked)
        startTransition(async () => {
            await toggleGoogleReviewsEnabled(checked)
            router.refresh()
        })
    }

    const handleDisconnect = () => {
        startTransition(async () => {
            const result = await disconnectGoogleReviews()
            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'Disconnected from Google Business Profile',
                })
                router.refresh()
            } else {
                setMessage({
                    type: 'error',
                    text: result.error ?? 'Failed to disconnect',
                })
            }
        })
    }

    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500'>
                            <Star className='h-5 w-5 text-white' />
                        </div>
                        <div>
                            <CardTitle>Google Reviews Integration</CardTitle>
                            <CardDescription>
                                Connect your Google Business Profile to sync and
                                display reviews
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                    {/* OAuth Not Configured Warning */}
                    {!oauthConfigured && (
                        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
                            <p className='font-medium text-yellow-800'>
                                OAuth not configured
                            </p>
                            <p className='text-sm text-yellow-700'>
                                Set GOOGLE_BUSINESS_CLIENT_ID,
                                GOOGLE_BUSINESS_CLIENT_SECRET, and
                                GOOGLE_BUSINESS_REDIRECT_URI environment
                                variables to enable Google Reviews integration.
                            </p>
                        </div>
                    )}

                    {/* Connection Status */}
                    <div className='flex items-center justify-between rounded-lg border p-4'>
                        <div className='flex items-center gap-3'>
                            {isConnected ? (
                                <CheckCircle2 className='h-5 w-5 text-green-500' />
                            ) : (
                                <XCircle className='h-5 w-5 text-gray-400' />
                            )}
                            <div>
                                <p className='font-medium'>
                                    {isConnected
                                        ? 'Connected to Google'
                                        : 'Not Connected'}
                                </p>
                                {isConnected && initialData?.locationName && (
                                    <p className='text-muted-foreground text-sm'>
                                        {initialData.locationName}
                                    </p>
                                )}
                            </div>
                        </div>
                        {isConnected ? (
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleDisconnect}
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <Unplug className='mr-2 h-4 w-4' />
                                )}
                                Disconnect
                            </Button>
                        ) : (
                            <Button asChild disabled={!oauthConfigured}>
                                <a href='/api/google/auth'>
                                    <ExternalLink className='mr-2 h-4 w-4' />
                                    Connect Google
                                </a>
                            </Button>
                        )}
                    </div>

                    {/* Account Selection (if connected but no location selected) */}
                    {isConnected && !initialData?.locationId && (
                        <div className='space-y-4 rounded-lg border p-4'>
                            <p className='font-medium'>
                                Select Your Business Location
                            </p>

                            {/* Account Selector */}
                            <div className='space-y-2'>
                                <Label>Business Account</Label>
                                <Select
                                    value={selectedAccount}
                                    onValueChange={setSelectedAccount}
                                    disabled={isLoadingAccounts}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select an account' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((account) => (
                                            <SelectItem
                                                key={account.name}
                                                value={account.name}
                                            >
                                                {account.accountName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {isLoadingAccounts && (
                                    <p className='text-muted-foreground text-sm'>
                                        Loading accounts...
                                    </p>
                                )}
                            </div>

                            {/* Location Selector */}
                            {selectedAccount && (
                                <div className='space-y-2'>
                                    <Label>Business Location</Label>
                                    <Select
                                        value={selectedLocation}
                                        onValueChange={setSelectedLocation}
                                        disabled={isLoadingLocations}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select a location' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locations.map((location) => (
                                                <SelectItem
                                                    key={location.name}
                                                    value={location.name}
                                                >
                                                    {location.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {isLoadingLocations && (
                                        <p className='text-muted-foreground text-sm'>
                                            Loading locations...
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Save Location Button */}
                            {selectedLocation && (
                                <Button
                                    onClick={handleSaveLocation}
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    ) : null}
                                    Save Location
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Enable/Disable Toggle */}
                    {isConnected && initialData?.locationId && (
                        <div className='flex items-center justify-between rounded-lg border p-4'>
                            <div>
                                <Label className='text-base'>
                                    Enable Integration
                                </Label>
                                <p className='text-muted-foreground text-sm'>
                                    Show Google reviews on the website
                                </p>
                            </div>
                            <Switch
                                checked={isEnabled}
                                onCheckedChange={handleToggleEnabled}
                                disabled={isPending}
                            />
                        </div>
                    )}

                    {/* Stats */}
                    {initialData && initialData.totalReviewsCount !== null && (
                        <div className='grid gap-4 rounded-lg border p-4 md:grid-cols-3'>
                            <div>
                                <p className='text-muted-foreground text-sm'>
                                    Total Reviews
                                </p>
                                <p className='text-2xl font-semibold'>
                                    {initialData.totalReviewsCount}
                                </p>
                            </div>
                            {initialData.averageRating && (
                                <div>
                                    <p className='text-muted-foreground text-sm'>
                                        Average Rating
                                    </p>
                                    <p className='text-2xl font-semibold'>
                                        {parseFloat(
                                            initialData.averageRating
                                        ).toFixed(1)}
                                        <Star className='ml-1 inline h-5 w-5 fill-yellow-400 text-yellow-400' />
                                    </p>
                                </div>
                            )}
                            {initialData.lastSyncAt && (
                                <div>
                                    <p className='text-muted-foreground text-sm'>
                                        Last Synced
                                    </p>
                                    <p className='text-sm'>
                                        {new Date(
                                            initialData.lastSyncAt
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Message */}
                    {message && (
                        <div
                            className={`rounded-lg p-3 text-sm ${
                                message.type === 'success'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                            }`}
                        >
                            {message.text}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
