import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { FolderOpen, GitCompareArrows, Plus } from 'lucide-react'
import Link from 'next/link'

import { GalleryStatsGrid } from '@/components/dashboard/gallery-stats-grid.component'
import { RecentMediaCard } from '@/components/dashboard/recent-media-card.component'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export const metadata = {
    title: 'Gallery Dashboard | Admin',
    description: 'Manage your media library and before/after comparisons',
}

export default function GalleryDashboardPage() {
    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Gallery</h1>
                    <p className='text-muted-foreground'>
                        Manage your media library and before/after comparisons
                    </p>
                </div>
                <Button asChild>
                    <Link href='/gallery/media/new'>
                        <Plus className='mr-2 h-4 w-4' />
                        Upload Media
                    </Link>
                </Button>
            </div>

            {/* Stats Grid - Independent component */}
            <GalleryStatsGrid />

            {/* Recent Uploads - Independent component */}
            <RecentMediaCard />

            {/* Quick Actions */}
            <div className='grid gap-4 md:grid-cols-3'>
                <QuickActionCard
                    title='Upload Media'
                    description='Add new images or videos to your gallery'
                    href='/gallery/media/new'
                    icon={<Plus className='h-5 w-5' />}
                />
                <QuickActionCard
                    title='Create Group'
                    description='Organize media into collections'
                    href='/gallery/groups'
                    icon={<FolderOpen className='h-5 w-5' />}
                />
                <QuickActionCard
                    title='Add Before/After'
                    description='Create a new transformation comparison'
                    href='/gallery/before-after'
                    icon={<GitCompareArrows className='h-5 w-5' />}
                />
            </div>
        </div>
    )
}

function QuickActionCard({
    title,
    description,
    href,
    icon,
}: {
    title: string
    description: string
    href: string
    icon: React.ReactNode
}) {
    return (
        <Link href={href}>
            <Card className='transition-colors hover:bg-stone-50'>
                <CardContent className='flex items-center gap-4 p-6'>
                    <div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg'>
                        {icon}
                    </div>
                    <div>
                        <h3 className='font-medium'>{title}</h3>
                        <p className='text-muted-foreground text-sm'>
                            {description}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
