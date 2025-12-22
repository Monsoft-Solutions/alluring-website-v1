import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'

import { PostEditor } from './editor.component'

type PostFormBasicInfoProps = {
    title: string
    slug: string
    content: string
    readingTime: number | null
    blogPostId?: string
    onTitleChange: (title: string) => void
    onSlugChange: (slug: string) => void
    onContentChange: (content: string) => void
}

export function PostFormBasicInfo({
    title,
    slug,
    content,
    readingTime,
    blogPostId,
    onTitleChange,
    onSlugChange,
    onContentChange,
}: PostFormBasicInfoProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>Write your blog post content</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='space-y-2'>
                    <Label htmlFor='title'>Title</Label>
                    <Input
                        id='title'
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder='Enter post title'
                    />
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='slug'>URL Slug</Label>
                    <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground text-sm'>
                            /blog/
                        </span>
                        <Input
                            id='slug'
                            value={slug}
                            onChange={(e) => onSlugChange(e.target.value)}
                            placeholder='post-url-slug'
                        />
                    </div>
                </div>

                <div className='space-y-2'>
                    <Label>Content</Label>
                    <PostEditor
                        content={content}
                        onChange={onContentChange}
                        blogPostId={blogPostId}
                    />
                    {readingTime && (
                        <p className='text-muted-foreground text-xs'>
                            Estimated reading time: {readingTime} min
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
