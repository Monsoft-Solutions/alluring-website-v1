/**
 * Pricing Page (issue #354)
 *
 * The one place Alluring's prices are edited: every line of the price sheet,
 * each procedure's "starting at" line and discount, the site-wide default
 * discount, the Fla. Stat. 456.062 statement and the combination discounts.
 * The website, posts (through claim tokens), `llms*.txt` and the chat read
 * these on their next request after a save.
 *
 * @module app/(dashboard)/pricing/page
 */
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@workspace/ui/components/alert'
import { DatabaseZap } from 'lucide-react'

import { PricingForm } from '@/components/pricing/pricing-form.component'
import { getPricingRows } from '@/lib/queries/pricing.query'
import { toPricingFormValues } from '@/lib/utils/pricing-form.util'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export default async function PricingPage() {
    const rows = await getPricingRows()
    const tablesEmpty = rows.lines.length === 0

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-2xl font-semibold'>Pricing</h1>
                <p className='text-muted-foreground max-w-3xl'>
                    The practice&apos;s price list, as every page, blog post and
                    the chat show it. A discount shows the list price struck
                    through, then the discounted price, and carries the Florida
                    456.062 statement. Posts never type a price: they use claim
                    tokens such as{' '}
                    <code className='text-xs'>[[price:bbl]]</code>, which read
                    from here.
                </p>
            </div>

            {tablesEmpty && (
                <Alert variant='destructive'>
                    <DatabaseZap className='h-4 w-4' />
                    <AlertTitle>The pricing tables are empty</AlertTitle>
                    <AlertDescription>
                        Apply migration 0060 to this database before editing.
                        Until then the site shows the 2026-09-15 price sheet,
                        which is what you see below.
                    </AlertDescription>
                </Alert>
            )}

            <PricingForm
                initialValues={toPricingFormValues(rows)}
                readOnly={tablesEmpty}
            />
        </div>
    )
}
