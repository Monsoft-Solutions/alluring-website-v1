import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'

import { PostForm } from '@/components/blog/post-form.component'
import { getAuthorsForSelect, getBlogPostById } from '@/lib/queries/blog.query'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function EditBlogPostPage({ params }: PageProps) {
    const { id } = await params
    const [post, authors] = await Promise.all([
        getBlogPostById(id),
        getAuthorsForSelect(),
    ])

    if (!post) {
        notFound()
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <Button variant='ghost' size='sm' asChild>
                        <Link href='/blog/posts'>
                            <ArrowLeft className='mr-2 h-4 w-4' />
                            Back to Posts
                        </Link>
                    </Button>
                </div>
                <div className='flex items-center gap-2'>
                    <StatusBadge status={post.status} />
                    {post.status === 'published' && (
                        <Button variant='outline' size='sm' asChild>
                            <Link
                                href={`/blog/${post.slug}`}
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                View Live
                                <ExternalLink className='ml-2 h-3 w-3' />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div>
                <h1 className='text-2xl font-semibold'>Edit Post</h1>
                <p className='text-muted-foreground'>
                    Update your blog post content and settings
                </p>
            </div>

            <PostForm
                authors={authors}
                mode='edit'
                initialData={{
                    id: post.id,
                    title: post.title,
                    slug: post.slug,
                    content: post.content,
                    metaDescription: post.metaDescription,
                    metaTitle: post.metaTitle,
                    metaKeywords: post.metaKeywords,
                    excerpt: post.excerpt,
                    authorId: post.authorId,
                    status: post.status ?? 'draft',
                    featuredImageUrl: post.featuredImageUrl,
                    readingTime: post.readingTime,
                }}
            />
        </div>
    )
}

function StatusBadge({
    status,
}: {
    status: 'draft' | 'readyToPublish' | 'published' | null
}) {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
        published: 'default',
        readyToPublish: 'secondary',
        draft: 'outline',
    }

    const labels: Record<string, string> = {
        published: 'Published',
        readyToPublish: 'Ready to Publish',
        draft: 'Draft',
    }

    const statusKey = status ?? 'draft'

    return (
        <Badge variant={variants[statusKey] ?? 'outline'}>
            {labels[statusKey] ?? 'Draft'}
        </Badge>
    )
}
