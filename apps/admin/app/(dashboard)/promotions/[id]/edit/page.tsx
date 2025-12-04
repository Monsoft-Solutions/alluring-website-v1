import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react'

import { env } from '@/env'
import { Button } from '@workspace/ui/components/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog'

import { PromotionForm } from '@/components/promotions/promotion-form.component'
import { getPromotionById } from '@/lib/queries/promotion.query'
import { deletePromotion } from '@/lib/actions/promotion.action'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function EditPromotionPage({
    params,
}: {
    params: Params
}) {
    const { id } = await params
    const promotion = await getPromotionById(id)

    if (!promotion) {
        notFound()
    }

    // Transform dates for the form
    const initialData = {
        id: promotion.id,
        title: promotion.title,
        slug: promotion.slug,
        description: promotion.description,
        excerpt: promotion.excerpt,
        status: promotion.status,
        type: promotion.type,
        discountValue: promotion.discountValue,
        discountTypeValue: promotion.discountTypeValue,
        startsAt: promotion.startsAt,
        endsAt: promotion.endsAt,
        isAutoActivate: promotion.isAutoActivate,
        isAutoExpire: promotion.isAutoExpire,
        imageUrl: promotion.imageUrl,
        imageAlt: promotion.imageAlt,
        videoUrl: promotion.videoUrl,
        thumbnailUrl: promotion.thumbnailUrl,
        linkType: promotion.linkType,
        procedureSlug: promotion.procedureSlug,
        customUrl: promotion.customUrl,
        ctaText: promotion.ctaText,
        priority: promotion.priority,
        modalDelaySeconds: promotion.modalDelaySeconds,
    }

    async function handleDelete() {
        'use server'
        const result = await deletePromotion(id)

        if (!result.success) {
            throw new Error(result.error ?? 'Failed to delete promotion')
        }

        redirect('/promotions')
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <Button variant='ghost' size='sm' asChild>
                        <Link href='/promotions'>
                            <ArrowLeft className='mr-2 h-4 w-4' />
                            Back to Promotions
                        </Link>
                    </Button>
                </div>

                <div className='flex items-center gap-2'>
                    {promotion.status === 'active' && (
                        <Button variant='outline' size='sm' asChild>
                            <a
                                href={`${env.NEXT_PUBLIC_WEB_URL.replace(/\/+$/, '')}/promotions/${promotion.slug}`}
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                <ExternalLink className='mr-2 h-4 w-4' />
                                View Live
                            </a>
                        </Button>
                    )}

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant='destructive' size='sm'>
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Delete Promotion
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete &ldquo;
                                    {promotion.title}&rdquo;? This action cannot
                                    be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <form action={handleDelete}>
                                    <AlertDialogAction
                                        type='submit'
                                        className='bg-red-600 hover:bg-red-700'
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </form>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div>
                <h1 className='text-2xl font-semibold'>Edit Promotion</h1>
                <p className='text-muted-foreground'>
                    Update promotion details and settings
                </p>
            </div>

            <PromotionForm initialData={initialData} mode='edit' />
        </div>
    )
}
