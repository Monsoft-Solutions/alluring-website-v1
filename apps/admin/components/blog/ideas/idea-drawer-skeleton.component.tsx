import { Skeleton } from '@workspace/ui/components/skeleton'
import { Separator } from '@workspace/ui/components/separator'

export function DrawerSkeleton() {
    return (
        <div className='space-y-6'>
            <div>
                <div className='mb-2 flex gap-2'>
                    <Skeleton className='h-5 w-20' />
                    <Skeleton className='h-5 w-16' />
                </div>
                <Skeleton className='mb-2 h-6 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
            </div>
            <div className='flex gap-2'>
                <Skeleton className='h-10 flex-1' />
                <Skeleton className='h-10 w-20' />
            </div>
            <Separator />
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                    <Skeleton className='mb-2 h-4 w-32' />
                    <Skeleton className='ml-6 h-16 w-full' />
                </div>
            ))}
        </div>
    )
}
