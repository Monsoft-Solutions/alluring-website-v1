'use client'

import { FileText, Lightbulb, Plus, Target, Trash2, Users } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { TabsContent } from '@workspace/ui/components/tabs'

import { CONTENT_TYPE_LABELS } from '@/lib/constants/blog-ideas.constant'
import type { PlanningTabProps } from './pipeline-edit-dialog.type'

const CONTENT_TYPE_OPTIONS = Object.entries(CONTENT_TYPE_LABELS).map(
    ([value, label]) => ({ value, label })
)

/**
 * Planning tab for the pipeline post edit dialog
 * Handles topic, content type, audience, angle, and FAQs
 */
export function PlanningTab({
    planningData,
    handlePlanningChange,
    faqs,
    handleAddFaq,
    handleRemoveFaq,
    handleUpdateFaq,
}: PlanningTabProps) {
    return (
        <TabsContent value='planning' className='m-0 h-full'>
            <ScrollArea className='h-full'>
                <div className='space-y-6 p-6'>
                    <div className='grid gap-6 md:grid-cols-2'>
                        {/* Topic */}
                        <div>
                            <Label className='flex items-center gap-1 text-xs font-medium text-stone-500'>
                                <Target className='h-3 w-3' />
                                Topic
                            </Label>
                            <Input
                                value={planningData.topic || ''}
                                onChange={(e) =>
                                    handlePlanningChange(
                                        'topic',
                                        e.target.value
                                    )
                                }
                                placeholder='Main topic or theme'
                                className='mt-1'
                            />
                        </div>

                        {/* Content Type */}
                        <div>
                            <Label className='flex items-center gap-1 text-xs font-medium text-stone-500'>
                                <FileText className='h-3 w-3' />
                                Content Type
                            </Label>
                            <Select
                                value={planningData.contentType || ''}
                                onValueChange={(v) =>
                                    handlePlanningChange('contentType', v)
                                }
                            >
                                <SelectTrigger className='mt-1'>
                                    <SelectValue placeholder='Select content type' />
                                </SelectTrigger>
                                <SelectContent>
                                    {CONTENT_TYPE_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Target Audience */}
                    <div>
                        <Label className='flex items-center gap-1 text-xs font-medium text-stone-500'>
                            <Users className='h-3 w-3' />
                            Target Audience
                        </Label>
                        <Textarea
                            value={planningData.targetAudience || ''}
                            onChange={(e) =>
                                handlePlanningChange(
                                    'targetAudience',
                                    e.target.value
                                )
                            }
                            placeholder='Who is this content for?'
                            rows={2}
                            className='mt-1'
                        />
                    </div>

                    {/* Unique Angle */}
                    <div>
                        <Label className='flex items-center gap-1 text-xs font-medium text-stone-500'>
                            <Lightbulb className='h-3 w-3' />
                            Unique Angle
                        </Label>
                        <Textarea
                            value={planningData.uniqueAngle || ''}
                            onChange={(e) =>
                                handlePlanningChange(
                                    'uniqueAngle',
                                    e.target.value
                                )
                            }
                            placeholder='What makes this different?'
                            rows={2}
                            className='mt-1'
                        />
                    </div>

                    {/* FAQs Section */}
                    <div className='border-t pt-6'>
                        <div className='mb-4 flex items-center justify-between'>
                            <Label className='text-sm font-medium'>
                                FAQ Schema
                            </Label>
                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={handleAddFaq}
                            >
                                <Plus className='mr-1 h-3 w-3' />
                                Add FAQ
                            </Button>
                        </div>

                        {faqs.length === 0 ? (
                            <div className='rounded-lg border border-dashed border-stone-200 bg-stone-50 p-4 text-center'>
                                <p className='text-sm text-stone-500'>
                                    No FAQs yet. Add questions for FAQ schema
                                    markup.
                                </p>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {faqs.map((faq, index) => (
                                    <div
                                        key={index}
                                        className='rounded-lg border bg-stone-50 p-4'
                                    >
                                        <div className='mb-2 flex items-center justify-between'>
                                            <span className='text-xs font-medium text-stone-500'>
                                                FAQ #{index + 1}
                                            </span>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='sm'
                                                onClick={() =>
                                                    handleRemoveFaq(index)
                                                }
                                            >
                                                <Trash2 className='h-3 w-3 text-red-500' />
                                            </Button>
                                        </div>
                                        <div className='space-y-2'>
                                            <Textarea
                                                value={faq.question}
                                                onChange={(e) =>
                                                    handleUpdateFaq(
                                                        index,
                                                        'question',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder='Question...'
                                                rows={1}
                                                className='text-sm'
                                            />
                                            <Textarea
                                                value={faq.answer}
                                                onChange={(e) =>
                                                    handleUpdateFaq(
                                                        index,
                                                        'answer',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder='Answer...'
                                                rows={2}
                                                className='text-sm'
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </TabsContent>
    )
}
