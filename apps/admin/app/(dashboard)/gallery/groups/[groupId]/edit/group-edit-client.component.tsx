'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ImagePlus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs'

import { MediaSelectionDialog } from '@/components/shared/media-selection-dialog.component'
import { GroupDetailsForm } from './group-details-form.component'
import { CurrentMediaGrid } from './current-media-grid.component'
import { BulkUploadSection } from './bulk-upload-section.component'

import type {
    GalleryGroupDetail,
    GalleryGroupListItem,
    GalleryMediaListItem,
} from '@/lib/queries/gallery.query'

type GroupEditClientProps = {
    group: GalleryGroupDetail
    groupMedia: GalleryMediaListItem[]
    allGroups: GalleryGroupListItem[]
}

export function GroupEditClient({
    group,
    groupMedia: initialGroupMedia,
    allGroups,
}: GroupEditClientProps) {
    const router = useRouter()
    const [groupMedia, setGroupMedia] = useState(initialGroupMedia)
    const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false)

    // Sync local state when initial data changes (after router.refresh)
    useEffect(() => {
        setGroupMedia(initialGroupMedia)
    }, [initialGroupMedia])

    const handleMediaSelected = useCallback(
        async (mediaIds: string[]) => {
            router.refresh()
        },
        [router]
    )

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <Button variant='ghost' size='sm' asChild>
                        <Link href='/gallery/groups'>
                            <ChevronLeft className='mr-1 h-4 w-4' />
                            Back to Groups
                        </Link>
                    </Button>
                    <div>
                        <h1 className='text-2xl font-semibold'>Edit Group</h1>
                        <p className='text-muted-foreground'>
                            {group.name} • {groupMedia.length} media items
                        </p>
                    </div>
                </div>
            </div>

            {/* Group Details Form */}
            <GroupDetailsForm group={group} groupMedia={groupMedia} />

            {/* Media Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Group Media</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='current' className='w-full'>
                        <TabsList className='grid w-full grid-cols-3'>
                            <TabsTrigger value='current'>
                                Current Media ({groupMedia.length})
                            </TabsTrigger>
                            <TabsTrigger value='upload'>
                                Bulk Upload
                            </TabsTrigger>
                            <TabsTrigger value='select'>
                                Select from Gallery
                            </TabsTrigger>
                        </TabsList>

                        {/* Current Media Tab */}
                        <TabsContent value='current' className='space-y-4'>
                            <CurrentMediaGrid
                                groupId={group.id}
                                groupMedia={groupMedia}
                            />
                        </TabsContent>

                        {/* Bulk Upload Tab */}
                        <TabsContent value='upload' className='space-y-4'>
                            <BulkUploadSection groupId={group.id} />
                        </TabsContent>

                        {/* Select from Gallery Tab */}
                        <TabsContent value='select' className='space-y-4'>
                            <div className='text-center'>
                                <Button
                                    onClick={() => setIsMediaDialogOpen(true)}
                                >
                                    <ImagePlus className='mr-2 h-4 w-4' />
                                    Select Media from Gallery
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Media Selection Dialog */}
            <MediaSelectionDialog
                open={isMediaDialogOpen}
                onOpenChange={setIsMediaDialogOpen}
                onSelect={handleMediaSelected}
                groupId={group.id}
                excludeMediaIds={groupMedia.map((m) => m.id)}
            />
        </div>
    )
}
