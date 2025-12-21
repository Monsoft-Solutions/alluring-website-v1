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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs'

type PostFormSEOProps = {
    title: string
    metaTitle: string | null
    metaDescription: string
    metaKeywords: string | null
    excerpt: string | null
    onMetaTitleChange: (value: string) => void
    onMetaDescriptionChange: (value: string) => void
    onMetaKeywordsChange: (value: string) => void
    onExcerptChange: (value: string) => void
}

export function PostFormSEO({
    title,
    metaTitle,
    metaDescription,
    metaKeywords,
    excerpt,
    onMetaTitleChange,
    onMetaDescriptionChange,
    onMetaKeywordsChange,
    onExcerptChange,
}: PostFormSEOProps) {
    return (
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
                        <TabsTrigger value='excerpt'>Excerpt</TabsTrigger>
                    </TabsList>
                    <TabsContent value='meta' className='space-y-4 pt-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='metaTitle'>Meta Title</Label>
                            <Input
                                id='metaTitle'
                                value={metaTitle ?? ''}
                                onChange={(e) =>
                                    onMetaTitleChange(e.target.value)
                                }
                                placeholder='SEO title (defaults to post title)'
                            />
                            <p className='text-muted-foreground text-xs'>
                                {(metaTitle ?? title).length || 0}/60 characters
                            </p>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='metaDescription'>
                                Meta Description
                            </Label>
                            <Textarea
                                id='metaDescription'
                                value={metaDescription}
                                onChange={(e) =>
                                    onMetaDescriptionChange(e.target.value)
                                }
                                placeholder='Brief description for search results'
                                rows={3}
                            />
                            <p className='text-muted-foreground text-xs'>
                                {metaDescription.length}/160 characters
                            </p>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='metaKeywords'>Meta Keywords</Label>
                            <Input
                                id='metaKeywords'
                                value={metaKeywords ?? ''}
                                onChange={(e) =>
                                    onMetaKeywordsChange(e.target.value)
                                }
                                placeholder='keyword1, keyword2, keyword3'
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value='excerpt' className='space-y-4 pt-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='excerpt'>Excerpt</Label>
                            <Textarea
                                id='excerpt'
                                value={excerpt ?? ''}
                                onChange={(e) =>
                                    onExcerptChange(e.target.value)
                                }
                                placeholder='Short summary shown in blog listings'
                                rows={4}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
