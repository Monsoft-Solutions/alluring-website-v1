'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

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
    createAuthor,
    updateAuthor,
    type AuthorFormData,
} from '@/lib/actions/author.action'

/**
 * Validates that a URL uses only http or https protocols
 * to prevent XSS attacks via javascript:, data:, or vbscript: URLs
 */
function isValidImageUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
        return false
    }
}

type AuthorFormProps = {
    initialData?: AuthorFormData & { id: string }
    mode: 'create' | 'edit'
}

export function AuthorForm({ initialData, mode }: AuthorFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<AuthorFormData>({
        name: initialData?.name ?? '',
        email: initialData?.email ?? '',
        bio: initialData?.bio ?? '',
        avatarUrl: initialData?.avatarUrl ?? '',
        website: initialData?.website ?? '',
        socialLinks: initialData?.socialLinks ?? {
            twitter: '',
            linkedin: '',
            github: '',
            instagram: '',
        },
        isActive: initialData?.isActive ?? true,
    })

    const handleChange = (
        field: keyof AuthorFormData,
        value: string | boolean
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setError(null)
    }

    const handleSocialChange = (
        platform: 'twitter' | 'linkedin' | 'github' | 'instagram',
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: value,
            },
        }))
    }

    const handleSave = async () => {
        startTransition(async () => {
            try {
                if (mode === 'create') {
                    const result = await createAuthor(formData)
                    if (result.success && result.id) {
                        toast.success('Author created')
                        router.push('/blog/authors')
                        router.refresh()
                    } else {
                        setError(result.error ?? 'Failed to create author')
                    }
                } else if (initialData?.id) {
                    const result = await updateAuthor(initialData.id, formData)
                    if (result.success) {
                        toast.success('Author updated')
                        router.push('/blog/authors')
                        router.refresh()
                    } else {
                        setError(result.error ?? 'Failed to update author')
                    }
                } else {
                    setError('Invalid author ID for update')
                }
            } catch (error) {
                console.error('Error saving author:', error)
                setError(
                    error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred'
                )
            }
        })
    }

    return (
        <div className='grid gap-6 lg:grid-cols-3'>
            {/* Main Form */}
            <div className='space-y-6 lg:col-span-2'>
                {error && (
                    <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800'>
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Author Information</CardTitle>
                        <CardDescription>
                            Basic author profile details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='name'>Name *</Label>
                                <Input
                                    id='name'
                                    value={formData.name}
                                    onChange={(e) =>
                                        handleChange('name', e.target.value)
                                    }
                                    placeholder='Author name'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='email'>Email *</Label>
                                <Input
                                    id='email'
                                    type='email'
                                    value={formData.email}
                                    onChange={(e) =>
                                        handleChange('email', e.target.value)
                                    }
                                    placeholder='author@example.com'
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='bio'>Bio</Label>
                            <Textarea
                                id='bio'
                                value={formData.bio ?? ''}
                                onChange={(e) =>
                                    handleChange('bio', e.target.value)
                                }
                                placeholder='Brief author biography...'
                                rows={4}
                            />
                        </div>

                        <div className='grid gap-4 sm:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='avatarUrl'>Avatar URL</Label>
                                <Input
                                    id='avatarUrl'
                                    value={formData.avatarUrl ?? ''}
                                    onChange={(e) =>
                                        handleChange(
                                            'avatarUrl',
                                            e.target.value
                                        )
                                    }
                                    placeholder='https://...'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='website'>Website</Label>
                                <Input
                                    id='website'
                                    value={formData.website ?? ''}
                                    onChange={(e) =>
                                        handleChange('website', e.target.value)
                                    }
                                    placeholder='https://...'
                                />
                            </div>
                        </div>

                        {formData.avatarUrl &&
                            isValidImageUrl(formData.avatarUrl) && (
                                <div className='flex items-center gap-4'>
                                    <div className='h-16 w-16 overflow-hidden rounded-full bg-stone-100'>
                                        <img
                                            src={formData.avatarUrl}
                                            alt='Avatar preview'
                                            className='h-full w-full object-cover'
                                        />
                                    </div>
                                    <span className='text-muted-foreground text-sm'>
                                        Avatar preview
                                    </span>
                                </div>
                            )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Social Links</CardTitle>
                        <CardDescription>
                            Optional social media profiles
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='grid gap-4 sm:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label htmlFor='twitter'>Twitter</Label>
                            <Input
                                id='twitter'
                                value={formData.socialLinks?.twitter ?? ''}
                                onChange={(e) =>
                                    handleSocialChange(
                                        'twitter',
                                        e.target.value
                                    )
                                }
                                placeholder='@username'
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='linkedin'>LinkedIn</Label>
                            <Input
                                id='linkedin'
                                value={formData.socialLinks?.linkedin ?? ''}
                                onChange={(e) =>
                                    handleSocialChange(
                                        'linkedin',
                                        e.target.value
                                    )
                                }
                                placeholder='linkedin.com/in/username'
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='github'>GitHub</Label>
                            <Input
                                id='github'
                                value={formData.socialLinks?.github ?? ''}
                                onChange={(e) =>
                                    handleSocialChange('github', e.target.value)
                                }
                                placeholder='github.com/username'
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='instagram'>Instagram</Label>
                            <Input
                                id='instagram'
                                value={formData.socialLinks?.instagram ?? ''}
                                onChange={(e) =>
                                    handleSocialChange(
                                        'instagram',
                                        e.target.value
                                    )
                                }
                                placeholder='@username'
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                        <Button
                            className='w-full'
                            onClick={handleSave}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <Save className='mr-2 h-4 w-4' />
                            )}
                            {mode === 'create'
                                ? 'Create Author'
                                : 'Save Changes'}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-2'>
                            <Label htmlFor='status'>Author Status</Label>
                            <Select
                                value={
                                    formData.isActive ? 'active' : 'inactive'
                                }
                                onValueChange={(value) =>
                                    handleChange('isActive', value === 'active')
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='active'>
                                        Active
                                    </SelectItem>
                                    <SelectItem value='inactive'>
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className='text-muted-foreground text-xs'>
                                Inactive authors won't appear in author
                                selection dropdowns
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
