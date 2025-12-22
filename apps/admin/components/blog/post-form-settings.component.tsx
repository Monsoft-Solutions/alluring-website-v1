import Image from 'next/image'

import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

type Author = {
    id: string
    name: string
}

type PostFormSettingsProps = {
    authors: Author[]
    authorId: string | null
    status: 'draft' | 'readyToPublish' | 'published'
    featuredImageUrl: string | null
    onAuthorChange: (authorId: string) => void
    onStatusChange: (status: 'draft' | 'readyToPublish' | 'published') => void
    onFeaturedImageChange: (url: string) => void
}

export function PostFormSettings({
    authors,
    authorId,
    status,
    featuredImageUrl,
    onAuthorChange,
    onStatusChange,
    onFeaturedImageChange,
}: PostFormSettingsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='space-y-2'>
                    <Label htmlFor='author'>Author</Label>
                    <Select
                        value={authorId ?? ''}
                        onValueChange={onAuthorChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder='Select author' />
                        </SelectTrigger>
                        <SelectContent>
                            {authors.map((author) => (
                                <SelectItem key={author.id} value={author.id}>
                                    {author.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='status'>Status</Label>
                    <Select value={status} onValueChange={onStatusChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='draft'>Draft</SelectItem>
                            <SelectItem value='readyToPublish'>
                                Ready to Publish
                            </SelectItem>
                            <SelectItem value='published'>Published</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='featuredImage'>Featured Image URL</Label>
                    <Input
                        id='featuredImage'
                        value={featuredImageUrl ?? ''}
                        onChange={(e) => onFeaturedImageChange(e.target.value)}
                        placeholder='https://...'
                    />
                    {featuredImageUrl && (
                        <div className='relative mt-2 h-32 w-full overflow-hidden rounded-lg border'>
                            <Image
                                src={featuredImageUrl}
                                alt='Featured'
                                fill
                                className='object-cover'
                                unoptimized
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
