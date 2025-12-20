import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { PromotionForm } from '@/components/promotions/promotion-form.component'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export default function NewPromotionPage() {
    return (
        <div className='space-y-6'>
            <div className='flex items-center gap-4'>
                <Button variant='ghost' size='sm' asChild>
                    <Link href='/promotions'>
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        Back to Promotions
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className='text-2xl font-semibold'>Create New Promotion</h1>
                <p className='text-muted-foreground'>
                    Set up a new promotional campaign
                </p>
            </div>

            <PromotionForm mode='create' />
        </div>
    )
}
