'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2, Save, Eye, Send } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import {
    Card,
    CardContent,
    CardDescription,
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs'

import { PostEditor } from './editor.component'
import { ImageGenerationPanel } from './image-generation-panel.component'
import { GeneratedImagesGallery } from './generated-images-gallery.component'
import {
    createBlogPost,
    updateBlogPost,
    type BlogPostFormData,
} from '@/lib/actions/blog.action'

type Author = {
    id: string
    name: string
}

type PostFormProps = {
    authors: Author[]
    initialData?: BlogPostFormData & { id: string }
    mode: 'create' | 'edit'
}

export function PostForm({ authors, initialData, mode }: PostFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [galleryRefresh, setGalleryRefresh] = useState(0)

    const [formData, setFormData] = useState<BlogPostFormData>({
        title: initialData?.title ?? '',
        slug: initialData?.slug ?? '',
        content: initialData?.content ?? '',
        metaDescription: initialData?.metaDescription ?? '',
        metaTitle: initialData?.metaTitle ?? '',
        metaKeywords: initialData?.metaKeywords ?? '',
        excerpt: initialData?.excerpt ?? '',
        authorId: initialData?.authorId ?? '',
        status: initialData?.status ?? 'draft',
        featuredImageUrl: initialData?.featuredImageUrl ?? '',
        readingTime: initialData?.readingTime ?? null,
    })

    const handleChange = (
        field: keyof BlogPostFormData,
        value: string | number | null
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setError(null)
    }

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const handleTitleChange = (title: string) => {
        handleChange('title', title)
        if (mode === 'create' && !formData.slug) {
            handleChange('slug', generateSlug(title))
        }
    }

    const calculateReadingTime = (content: string) => {
        const text = content.replace(/<[^>]*>/g, '')
        const words = text.split(/\s+/).length
        return Math.ceil(words / 200) // 200 words per minute
    }

    const handleContentChange = (content: string) => {
        handleChange('content', content)
        handleChange('readingTime', calculateReadingTime(content))
    }

    const handleImageGenerated = (_imageId: string, imageUrl: string) => {
        // Update the featured image URL
        handleChange('featuredImageUrl', imageUrl)
        // Trigger gallery refresh
        setGalleryRefresh((prev) => prev + 1)
    }

    const handleSelectGeneratedImage = (_imageId: string, imageUrl: string) => {
        // Update the featured image URL
        handleChange('featuredImageUrl', imageUrl)
    }

    const getSuccessMessage = (
        isCreate: boolean,
        status?: 'draft' | 'readyToPublish' | 'published'
    ) => {
        if (isCreate) return 'Post created'
        if (status === 'published') return 'Post published'
        if (status === 'readyToPublish') return 'Post marked ready to publish'
        return 'Post saved'
    }

    const handleSave = (status?: 'draft' | 'readyToPublish' | 'published') => {
        const dataToSave = {
            ...formData,
            status: status ?? formData.status,
        }

        startTransition(async () => {
            try {
                if (mode === 'create') {
                    const result = await createBlogPost(dataToSave)
                    if (result.success && result.id) {
                        toast.success(getSuccessMessage(true, status))
                        router.push(`/blog/posts/${result.id}/edit`)
                        router.refresh()
                    } else {
                        setError(result.error ?? 'Failed to create post')
                    }
                } else if (initialData?.id) {
                    const result = await updateBlogPost(
                        initialData.id,
                        dataToSave
                    )
                    if (result.success) {
                        toast.success(getSuccessMessage(false, status))
                        router.refresh()
                    } else {
                        setError(result.error ?? 'Failed to update post')
                    }
                }
            } catch {
                setError('An unexpected error occurred')
            }
        })
    }

    return (
        <div className='grid gap-6 lg:grid-cols-3'>
            {/* Main Editor */}
            <div className='space-y-6 lg:col-span-2'>
                {error && (
                    <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800'>
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Content</CardTitle>
                        <CardDescription>
                            Write your blog post content
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='title'>Title</Label>
                            <Input
                                id='title'
                                value={formData.title}
                                onChange={(e) =>
                                    handleTitleChange(e.target.value)
                                }
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
                                    value={formData.slug}
                                    onChange={(e) =>
                                        handleChange('slug', e.target.value)
                                    }
                                    placeholder='post-url-slug'
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>Content</Label>
                            <PostEditor
                                content={formData.content}
                                onChange={handleContentChange}
                            />
                            {formData.readingTime && (
                                <p className='text-muted-foreground text-xs'>
                                    Estimated reading time:{' '}
                                    {formData.readingTime} min
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* AI Image Generation */}
                <ImageGenerationPanel
                    blogPostId={initialData?.id}
                    initialSummary={initialData?.aiSummary}
                    onImageGenerated={handleImageGenerated}
                />

                {/* Generated Images Gallery */}
                {initialData?.id && (
                    <GeneratedImagesGallery
                        blogPostId={initialData.id}
                        currentFeaturedImageUrl={formData.featuredImageUrl}
                        onSelectImage={handleSelectGeneratedImage}
                        refreshTrigger={galleryRefresh}
                    />
                )}
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                        <Button
                            className='w-full'
                            onClick={() => handleSave()}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <Save className='mr-2 h-4 w-4' />
                            )}
                            Save {mode === 'create' ? 'Draft' : 'Changes'}
                        </Button>
                        {mode === 'edit' && formData.status !== 'published' && (
                            <Button
                                variant='outline'
                                className='w-full'
                                onClick={() => handleSave('readyToPublish')}
                                disabled={isPending}
                            >
                                <Eye className='mr-2 h-4 w-4' />
                                Mark Ready to Publish
                            </Button>
                        )}
                        {mode === 'edit' && (
                            <Button
                                variant='default'
                                className='w-full bg-green-600 hover:bg-green-700'
                                onClick={() => handleSave('published')}
                                disabled={isPending}
                            >
                                <Send className='mr-2 h-4 w-4' />
                                Publish Now
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Post Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='author'>Author</Label>
                            <Select
                                value={formData.authorId ?? ''}
                                onValueChange={(value) =>
                                    handleChange('authorId', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Select author' />
                                </SelectTrigger>
                                <SelectContent>
                                    {authors.map((author) => (
                                        <SelectItem
                                            key={author.id}
                                            value={author.id}
                                        >
                                            {author.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='status'>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(
                                    value:
                                        | 'draft'
                                        | 'readyToPublish'
                                        | 'published'
                                ) => handleChange('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='draft'>Draft</SelectItem>
                                    <SelectItem value='readyToPublish'>
                                        Ready to Publish
                                    </SelectItem>
                                    <SelectItem value='published'>
                                        Published
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='featuredImage'>
                                Featured Image URL
                            </Label>
                            <Input
                                id='featuredImage'
                                value={formData.featuredImageUrl ?? ''}
                                onChange={(e) =>
                                    handleChange(
                                        'featuredImageUrl',
                                        e.target.value
                                    )
                                }
                                placeholder='https://...'
                            />
                            {formData.featuredImageUrl && (
                                <div className='relative mt-2 h-32 w-full overflow-hidden rounded-lg border'>
                                    <Image
                                        src={formData.featuredImageUrl}
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

                {/* SEO */}
                <Card>
                    <CardHeader>
                        <CardTitle>SEO</CardTitle>
                        <CardDescription>
                            Search engine optimization settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue='meta' className='w-full'>
                            <TabsList className='grid w-full grid-cols-2'>
                                <TabsTrigger value='meta'>Meta</TabsTrigger>
                                <TabsTrigger value='excerpt'>
                                    Excerpt
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent
                                value='meta'
                                className='space-y-4 pt-4'
                            >
                                <div className='space-y-2'>
                                    <Label htmlFor='metaTitle'>
                                        Meta Title
                                    </Label>
                                    <Input
                                        id='metaTitle'
                                        value={formData.metaTitle ?? ''}
                                        onChange={(e) =>
                                            handleChange(
                                                'metaTitle',
                                                e.target.value
                                            )
                                        }
                                        placeholder='SEO title (defaults to post title)'
                                    />
                                    <p className='text-muted-foreground text-xs'>
                                        {(formData.metaTitle ?? formData.title)
                                            .length || 0}
                                        /60 characters
                                    </p>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='metaDescription'>
                                        Meta Description
                                    </Label>
                                    <Textarea
                                        id='metaDescription'
                                        value={formData.metaDescription}
                                        onChange={(e) =>
                                            handleChange(
                                                'metaDescription',
                                                e.target.value
                                            )
                                        }
                                        placeholder='Brief description for search results'
                                        rows={3}
                                    />
                                    <p className='text-muted-foreground text-xs'>
                                        {formData.metaDescription.length}/160
                                        characters
                                    </p>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='metaKeywords'>
                                        Meta Keywords
                                    </Label>
                                    <Input
                                        id='metaKeywords'
                                        value={formData.metaKeywords ?? ''}
                                        onChange={(e) =>
                                            handleChange(
                                                'metaKeywords',
                                                e.target.value
                                            )
                                        }
                                        placeholder='keyword1, keyword2, keyword3'
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent
                                value='excerpt'
                                className='space-y-4 pt-4'
                            >
                                <div className='space-y-2'>
                                    <Label htmlFor='excerpt'>Excerpt</Label>
                                    <Textarea
                                        id='excerpt'
                                        value={formData.excerpt ?? ''}
                                        onChange={(e) =>
                                            handleChange(
                                                'excerpt',
                                                e.target.value
                                            )
                                        }
                                        placeholder='Short summary shown in blog listings'
                                        rows={4}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
