import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { AuthorForm } from '@/components/blog/author-form.component'

export default function NewAuthorPage() {
    return (
        <div className='space-y-6'>
            <div className='flex items-center gap-4'>
                <Button variant='ghost' size='sm' asChild>
                    <Link href='/blog/authors'>
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        Back to Authors
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className='text-2xl font-semibold'>Create New Author</h1>
                <p className='text-muted-foreground'>
                    Add a new author to write blog posts
                </p>
            </div>

            <AuthorForm mode='create' />
        </div>
    )
}
