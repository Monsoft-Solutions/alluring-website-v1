'use client'

/**
 * Small building blocks shared by the Ads console screens: status chips, KPI
 * tiles, panels and the loading / empty / error / not-configured states.
 */
import type { ReactNode } from 'react'
import { AlertCircle, Megaphone, RefreshCw } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { cn } from '@workspace/ui/lib/utils'

import type { CplTone } from '@/lib/utils/ads/ads-format.util'

// ============================================
// Chips
// ============================================

export type ChipTone = 'good' | 'warn' | 'bad' | 'info' | 'neutral' | 'gold'

const CHIP_TONES: Record<ChipTone, string> = {
    good: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    warn: 'bg-amber-50 text-amber-800 ring-amber-200',
    bad: 'bg-rose-50 text-rose-800 ring-rose-200',
    info: 'bg-sky-50 text-sky-800 ring-sky-200',
    neutral: 'bg-stone-100 text-stone-700 ring-stone-200',
    gold: 'bg-gold-50 text-gold-700 ring-gold-200',
}

export function AdsChip({
    tone = 'neutral',
    children,
    className,
    title,
}: {
    tone?: ChipTone
    children: ReactNode
    className?: string
    title?: string
}) {
    return (
        <span
            title={title}
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ring-1 ring-inset',
                CHIP_TONES[tone],
                className
            )}
        >
            {children}
        </span>
    )
}

/** Tailwind classes for a cost-per-lead cell. */
export const CPL_TONE_CLASS: Record<CplTone, string> = {
    good: 'font-semibold text-emerald-700',
    bad: 'font-semibold text-rose-700',
    neutral: '',
}

// ============================================
// Layout
// ============================================

export function AdsPanel({
    title,
    description,
    actions,
    children,
    className,
    contentClassName,
}: {
    title?: ReactNode
    description?: ReactNode
    actions?: ReactNode
    children: ReactNode
    className?: string
    contentClassName?: string
}) {
    return (
        <Card className={cn('min-w-0 gap-0 py-0', className)}>
            {(title || actions) && (
                <div className='flex flex-wrap items-baseline justify-between gap-2 border-b px-4 py-3'>
                    <div className='min-w-0'>
                        {title && (
                            <h2 className='text-sm font-semibold'>{title}</h2>
                        )}
                        {description && (
                            <p className='text-muted-foreground text-xs'>
                                {description}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div className='flex flex-wrap items-center gap-2'>
                            {actions}
                        </div>
                    )}
                </div>
            )}
            <CardContent className={cn('p-4', contentClassName)}>
                {children}
            </CardContent>
        </Card>
    )
}

export function KpiTile({
    label,
    value,
    note,
    noteTone,
    accent = false,
}: {
    label: string
    value: ReactNode
    note?: ReactNode
    noteTone?: 'good' | 'bad'
    accent?: boolean
}) {
    return (
        <div
            className={cn(
                'bg-card flex min-w-0 flex-col gap-1 rounded-xl border px-4 py-3',
                accent &&
                    'border-gold-300 from-gold-50 bg-gradient-to-b to-white'
            )}
        >
            <span className='text-muted-foreground text-xs font-medium'>
                {label}
            </span>
            <span className='text-2xl leading-tight font-semibold tracking-tight tabular-nums'>
                {value}
            </span>
            {note && (
                <span
                    className={cn(
                        'text-muted-foreground text-xs',
                        noteTone === 'good' && 'text-emerald-700',
                        noteTone === 'bad' && 'text-rose-700'
                    )}
                >
                    {note}
                </span>
            )}
        </div>
    )
}

export function KpiRow({ children }: { children: ReactNode }) {
    return (
        <div className='grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5'>
            {children}
        </div>
    )
}

// ============================================
// States
// ============================================

export function AdsLoading({ tiles = 5 }: { tiles?: number }) {
    return (
        <div className='space-y-4' aria-busy='true' aria-live='polite'>
            <div className='grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5'>
                {Array.from({ length: tiles }).map((_, i) => (
                    <Skeleton key={i} className='h-[88px] w-full' />
                ))}
            </div>
            <Skeleton className='h-[300px] w-full' />
            <Skeleton className='h-[260px] w-full' />
        </div>
    )
}

export function AdsError({
    message = 'Failed to load Ads data.',
    onRetry,
}: {
    message?: string
    onRetry?: () => void
}) {
    return (
        <Card>
            <CardContent className='flex flex-col items-center justify-center gap-3 py-12'>
                <AlertCircle className='h-5 w-5 text-rose-500' />
                <p className='text-muted-foreground text-sm'>{message}</p>
                {onRetry && (
                    <Button variant='outline' size='sm' onClick={onRetry}>
                        <RefreshCw className='mr-2 h-4 w-4' />
                        Retry
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

export function AdsEmpty({
    title,
    description,
}: {
    title: string
    description?: string
}) {
    return (
        <div className='flex flex-col items-center justify-center gap-1 py-10 text-center'>
            <p className='font-serif text-lg'>{title}</p>
            {description && (
                <p className='text-muted-foreground max-w-sm text-sm'>
                    {description}
                </p>
            )}
        </div>
    )
}

export function AdsNotConfigured() {
    return (
        <Card>
            <CardContent className='flex flex-col items-start gap-3 py-8'>
                <Megaphone className='text-gold-600 h-6 w-6' />
                <h2 className='font-serif text-xl'>
                    Google Ads isn&apos;t connected
                </h2>
                <p className='text-muted-foreground max-w-prose text-sm'>
                    The console reads the ad account through the Search Console
                    service account. Set <code>GOOGLE_ADS_CUSTOMER_ID</code>{' '}
                    (447-254-7809) next to <code>GOOGLE_CLIENT_EMAIL</code> and{' '}
                    <code>GOOGLE_PRIVATE_KEY</code> on the admin project, then
                    run <code>pnpm --filter admin backfill:ads</code> once.
                </p>
            </CardContent>
        </Card>
    )
}

/**
 * Render a report's standard states around its content: loading skeleton,
 * error with retry, not configured, then the children with the data.
 */
export function AdsQueryState<T>({
    query,
    children,
    loading,
}: {
    query: {
        isLoading: boolean
        error: unknown
        refetch: () => unknown
        data?: { configured: boolean; data: T | null }
    }
    children: (data: T) => ReactNode
    loading?: ReactNode
}) {
    if (query.isLoading) return <>{loading ?? <AdsLoading />}</>
    if (query.error) {
        return (
            <AdsError
                message={
                    query.error instanceof Error
                        ? query.error.message
                        : undefined
                }
                onRetry={() => void query.refetch()}
            />
        )
    }
    if (!query.data?.configured) return <AdsNotConfigured />
    if (query.data.data === null) {
        return <AdsEmpty title='Nothing to show for this window' />
    }
    return <>{children(query.data.data)}</>
}
