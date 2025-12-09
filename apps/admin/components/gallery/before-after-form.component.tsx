'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import {
    createBeforeAfterPair,
    updateBeforeAfterPair,
    type BeforeAfterPairFormData,
} from '@/lib/actions/gallery.action'
import {
    PROCEDURE_OPTIONS,
    getProcedureSlugByName,
} from '@/lib/constants/procedure.constant'

type MediaOption = {
    id: string
    title: string
    url: string
    type: 'image' | 'video'
}

type BeforeAfterFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    mediaOptions: MediaOption[]
    initialData?: BeforeAfterPairFormData & { id: string }
    mode: 'create' | 'edit'
}

export function BeforeAfterFormDialog({
    open,
    onOpenChange,
    mediaOptions,
    initialData,
    mode,
}: BeforeAfterFormDialogProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<BeforeAfterPairFormData>({
        beforeMediaId: initialData?.beforeMediaId ?? '',
        afterMediaId: initialData?.afterMediaId ?? '',
        procedureType: initialData?.procedureType ?? '',
        procedureSlug: initialData?.procedureSlug ?? null,
        patientInfo: initialData?.patientInfo ?? '',
        timeframe: initialData?.timeframe ?? '',
        isFeatured: initialData?.isFeatured ?? false,
        displayOrder: initialData?.displayOrder ?? 0,
    })

    // Sync form data when initialData or open changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                // Edit mode: populate form with existing data
                setFormData({
                    beforeMediaId: initialData.beforeMediaId ?? '',
                    afterMediaId: initialData.afterMediaId ?? '',
                    procedureType: initialData.procedureType ?? '',
                    procedureSlug: initialData.procedureSlug ?? null,
                    patientInfo: initialData.patientInfo ?? '',
                    timeframe: initialData.timeframe ?? '',
                    isFeatured: initialData.isFeatured ?? false,
                    displayOrder: initialData.displayOrder ?? 0,
                })
            } else {
                // Create mode: reset form to defaults
                setFormData({
                    beforeMediaId: '',
                    afterMediaId: '',
                    procedureType: '',
                    procedureSlug: null,
                    patientInfo: '',
                    timeframe: '',
                    isFeatured: false,
                    displayOrder: 0,
                })
            }
            // Clear any previous errors when opening dialog
            setError(null)
        }
    }, [open, initialData])

    const handleChange = (
        field: keyof BeforeAfterPairFormData,
        value: string | number | boolean | null
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setError(null)
    }

    const handleSubmit = async () => {
        startTransition(async () => {
            try {
                if (mode === 'create') {
                    const result = await createBeforeAfterPair(formData)
                    if (result.success) {
                        onOpenChange(false)
                        router.refresh()
                        // Reset form
                        setFormData({
                            beforeMediaId: '',
                            afterMediaId: '',
                            procedureType: '',
                            procedureSlug: null,
                            patientInfo: '',
                            timeframe: '',
                            isFeatured: false,
                            displayOrder: 0,
                        })
                    } else {
                        setError(result.error ?? 'Failed to create pair')
                    }
                } else if (initialData?.id) {
                    const result = await updateBeforeAfterPair(
                        initialData.id,
                        formData
                    )
                    if (result.success) {
                        onOpenChange(false)
                        router.refresh()
                    } else {
                        setError(result.error ?? 'Failed to update pair')
                    }
                }
            } catch {
                setError('An unexpected error occurred')
            }
        })
    }

    // Filter to only show images
    const imageOptions = mediaOptions.filter((m) => m.type === 'image')

    // Get selected images for preview
    const beforeImage = imageOptions.find(
        (m) => m.id === formData.beforeMediaId
    )
    const afterImage = imageOptions.find((m) => m.id === formData.afterMediaId)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[600px]'>
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create'
                            ? 'Create Before & After Pair'
                            : 'Edit Before & After Pair'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Select before and after images to create a comparison pair.'
                            : 'Update the details of this before & after comparison.'}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
                        {error}
                    </div>
                )}

                <div className='space-y-4 py-4'>
                    {/* Image Selection */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label>Before Image</Label>
                            <Select
                                value={formData.beforeMediaId}
                                onValueChange={(value) =>
                                    handleChange('beforeMediaId', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Select before image' />
                                </SelectTrigger>
                                <SelectContent>
                                    {imageOptions.map((media) => (
                                        <SelectItem
                                            key={media.id}
                                            value={media.id}
                                        >
                                            {media.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {beforeImage && (
                                <div className='relative aspect-square w-full overflow-hidden rounded-lg border'>
                                    <Image
                                        src={beforeImage.url}
                                        alt={beforeImage.title}
                                        fill
                                        className='object-cover'
                                        sizes='200px'
                                    />
                                    <div className='absolute right-0 bottom-0 left-0 bg-black/60 px-2 py-1 text-xs text-white'>
                                        Before
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <Label>After Image</Label>
                            <Select
                                value={formData.afterMediaId}
                                onValueChange={(value) =>
                                    handleChange('afterMediaId', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Select after image' />
                                </SelectTrigger>
                                <SelectContent>
                                    {imageOptions.map((media) => (
                                        <SelectItem
                                            key={media.id}
                                            value={media.id}
                                        >
                                            {media.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {afterImage && (
                                <div className='relative aspect-square w-full overflow-hidden rounded-lg border'>
                                    <Image
                                        src={afterImage.url}
                                        alt={afterImage.title}
                                        fill
                                        className='object-cover'
                                        sizes='200px'
                                    />
                                    <div className='absolute right-0 bottom-0 left-0 bg-black/60 px-2 py-1 text-xs text-white'>
                                        After
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Procedure Type */}
                    <div className='space-y-2'>
                        <Label>Procedure</Label>
                        <Select
                            value={formData.procedureType ?? ''}
                            onValueChange={(value) => {
                                // Set both the display name and the slug
                                const slug = getProcedureSlugByName(value)
                                setFormData((prev) => ({
                                    ...prev,
                                    procedureType: value,
                                    procedureSlug: slug,
                                }))
                                setError(null)
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder='Select procedure' />
                            </SelectTrigger>
                            <SelectContent>
                                {PROCEDURE_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.name}
                                        value={option.name}
                                    >
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className='text-muted-foreground text-xs'>
                            This links the before/after pair to the procedure
                            page
                        </p>
                    </div>

                    {/* Timeframe */}
                    <div className='space-y-2'>
                        <Label htmlFor='timeframe'>Timeframe</Label>
                        <Input
                            id='timeframe'
                            value={formData.timeframe ?? ''}
                            onChange={(e) =>
                                handleChange('timeframe', e.target.value)
                            }
                            placeholder='e.g., 3 months post-op'
                        />
                    </div>

                    {/* Patient Info */}
                    <div className='space-y-2'>
                        <Label htmlFor='patientInfo'>
                            Patient Notes (Anonymized)
                        </Label>
                        <Textarea
                            id='patientInfo'
                            value={formData.patientInfo ?? ''}
                            onChange={(e) =>
                                handleChange('patientInfo', e.target.value)
                            }
                            placeholder="e.g., Female, 35, 5'4, initial consultation..."
                            rows={3}
                        />
                        <p className='text-muted-foreground text-xs'>
                            Do not include any identifying patient information
                        </p>
                    </div>

                    {/* Display Order */}
                    <div className='space-y-2'>
                        <Label htmlFor='displayOrder'>Display Order</Label>
                        <Input
                            id='displayOrder'
                            type='number'
                            value={formData.displayOrder ?? 0}
                            onChange={(e) =>
                                handleChange(
                                    'displayOrder',
                                    parseInt(e.target.value, 10) || 0
                                )
                            }
                        />
                    </div>

                    {/* Featured */}
                    <div className='flex items-center space-x-2'>
                        <Checkbox
                            id='isFeatured'
                            checked={formData.isFeatured}
                            onCheckedChange={(checked) =>
                                handleChange('isFeatured', !!checked)
                            }
                        />
                        <Label
                            htmlFor='isFeatured'
                            className='text-sm font-normal'
                        >
                            Feature this comparison
                        </Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant='outline'
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            isPending ||
                            !formData.beforeMediaId ||
                            !formData.afterMediaId
                        }
                    >
                        {isPending && (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        {mode === 'create' ? 'Create Pair' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
