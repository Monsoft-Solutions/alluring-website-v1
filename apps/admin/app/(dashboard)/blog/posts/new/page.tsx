import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { PostForm } from '@/components/blog/post-form.component'
import { getAuthorsForSelect } from '@/lib/queries/blog.query'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export default async function NewBlogPostPage() {
    const authors = await getAuthorsForSelect()

    return (
        <div className='space-y-6'>
            <div className='flex items-center gap-4'>
                <Button variant='ghost' size='sm' asChild>
                    <Link href='/blog/posts'>
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        Back to Posts
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className='text-2xl font-semibold'>Create New Post</h1>
                <p className='text-muted-foreground'>
                    Write and publish a new blog post
                </p>
            </div>

            <PostForm authors={authors} mode='create' />
        </div>
    )
}
