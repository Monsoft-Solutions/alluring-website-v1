import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'

import { AuthorForm } from '@/components/blog/author-form.component'
import { getAuthorById } from '@/lib/queries/blog.query'

export const dynamic = 'force-dynamic'

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function EditAuthorPage({ params }: PageProps) {
    const { id } = await params
    const author = await getAuthorById(id)

    if (!author) {
        notFound()
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <Button variant='ghost' size='sm' asChild>
                        <Link href='/blog/authors'>
                            <ArrowLeft className='mr-2 h-4 w-4' />
                            Back to Authors
                        </Link>
                    </Button>
                </div>
                <Badge variant={author.isActive ? 'default' : 'secondary'}>
                    {author.isActive ? 'Active' : 'Inactive'}
                </Badge>
            </div>

            <div>
                <h1 className='text-2xl font-semibold'>Edit Author</h1>
                <p className='text-muted-foreground'>
                    Update author profile and settings
                </p>
            </div>

            <AuthorForm
                mode='edit'
                initialData={{
                    id: author.id,
                    name: author.name,
                    email: author.email,
                    bio: author.bio,
                    avatarUrl: author.avatarUrl,
                    website: author.website,
                    socialLinks: author.socialLinks,
                    isActive: author.isActive,
                }}
            />
        </div>
    )
}
