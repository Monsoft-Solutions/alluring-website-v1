import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'

export default function BlogPostsLoading() {
    return (
        <div className='space-y-6'>
            {/* Header Skeleton */}
            <div className='flex items-center justify-between'>
                <div>
                    <Skeleton className='h-8 w-32' />
                    <Skeleton className='mt-2 h-4 w-48' />
                </div>
                <div className='flex items-center gap-3'>
                    <Skeleton className='h-9 w-32' />
                    <Skeleton className='h-9 w-28' />
                </div>
            </div>

            {/* Table Skeleton */}
            <Card>
                <CardContent className='p-0'>
                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead className='border-b'>
                                <tr>
                                    <th className='p-4 text-left'>
                                        <Skeleton className='h-4 w-12' />
                                    </th>
                                    <th className='p-4 text-left'>
                                        <Skeleton className='h-4 w-16' />
                                    </th>
                                    <th className='p-4 text-left'>
                                        <Skeleton className='h-4 w-16' />
                                    </th>
                                    <th className='p-4 text-left'>
                                        <Skeleton className='h-4 w-12' />
                                    </th>
                                    <th className='p-4 text-right'>
                                        <Skeleton className='ml-auto h-4 w-12' />
                                    </th>
                                    <th className='p-4 text-left'>
                                        <Skeleton className='h-4 w-20' />
                                    </th>
                                    <th className='p-4 text-left'>
                                        <Skeleton className='h-4 w-16' />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} className='border-b'>
                                        <td className='p-4'>
                                            <Skeleton className='h-12 w-16' />
                                        </td>
                                        <td className='p-4'>
                                            <div className='space-y-1'>
                                                <Skeleton className='h-4 w-48' />
                                                <Skeleton className='h-3 w-32' />
                                            </div>
                                        </td>
                                        <td className='p-4'>
                                            <Skeleton className='h-4 w-20' />
                                        </td>
                                        <td className='p-4'>
                                            <Skeleton className='h-5 w-16' />
                                        </td>
                                        <td className='p-4 text-right'>
                                            <Skeleton className='ml-auto h-4 w-12' />
                                        </td>
                                        <td className='p-4'>
                                            <Skeleton className='h-4 w-20' />
                                        </td>
                                        <td className='p-4'>
                                            <div className='flex items-center gap-1'>
                                                <Skeleton className='h-8 w-8' />
                                                <Skeleton className='h-8 w-8' />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination Skeleton */}
            <div className='flex items-center justify-center gap-2'>
                <Skeleton className='h-9 w-24' />
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-9 w-20' />
            </div>
        </div>
    )
}
