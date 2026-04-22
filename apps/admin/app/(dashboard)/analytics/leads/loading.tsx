import { Skeleton } from '@workspace/ui/components/skeleton'

export default function LoadingLeadTrends() {
    return (
        <div className='space-y-6'>
            <Skeleton className='h-10 w-64' />
            <Skeleton className='h-14 w-full' />
            <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className='h-[88px] w-full' />
                ))}
            </div>
            <Skeleton className='h-[420px] w-full' />
        </div>
    )
}
