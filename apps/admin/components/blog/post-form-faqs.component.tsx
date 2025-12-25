'use client'

import { useState } from 'react'
import { HelpCircle, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'

type FaqItem = {
    question: string
    answer: string
}

type PostFormFAQsProps = {
    blogPostId: string
    content: string
    primaryKeyword: string | null
    faqs: FaqItem[] | null
    onFaqsChange: (faqs: FaqItem[] | null) => void
}

export function PostFormFAQs({
    blogPostId,
    content,
    primaryKeyword,
    faqs,
    onFaqsChange,
}: PostFormFAQsProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

    const handleAddFaq = () => {
        const newFaq: FaqItem = { question: '', answer: '' }
        const updatedFaqs = [...(faqs ?? []), newFaq]
        onFaqsChange(updatedFaqs)
        setEditingIndex(updatedFaqs.length - 1)
    }

    const handleRemoveFaq = (index: number) => {
        const updatedFaqs = (faqs ?? []).filter((_, i) => i !== index)
        onFaqsChange(updatedFaqs.length > 0 ? updatedFaqs : null)
        if (editingIndex === index) {
            setEditingIndex(null)
        }
    }

    const handleUpdateFaq = (
        index: number,
        field: 'question' | 'answer',
        value: string
    ) => {
        if (!faqs) return

        const updatedFaqs = [...faqs]
        updatedFaqs[index] = {
            ...updatedFaqs[index]!,
            [field]: value,
        }
        onFaqsChange(updatedFaqs)
    }

    const handleGenerateFromContent = async () => {
        if (!content.trim()) {
            toast.error('Cannot generate FAQs from empty content')
            return
        }

        setIsGenerating(true)

        try {
            const response = await fetch('/api/blog/generate-faqs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    primaryKeyword: primaryKeyword ?? undefined,
                }),
            })

            const result = await response.json()

            if (result.success && result.faqs) {
                onFaqsChange(result.faqs)
                toast.success(
                    `Generated ${result.faqs.length} FAQ${result.faqs.length !== 1 ? 's' : ''}`
                )
            } else {
                toast.error(result.error ?? 'Failed to generate FAQs')
            }
        } catch (error) {
            console.error('Error generating FAQs:', error)
            toast.error('Failed to generate FAQs')
        } finally {
            setIsGenerating(false)
        }
    }

    const currentFaqs = faqs ?? []

    return (
        <Card>
            <CardHeader>
                <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                            <HelpCircle className='h-5 w-5' />
                            FAQ Schema
                        </CardTitle>
                        <CardDescription>
                            Add frequently asked questions for FAQ schema
                            markup. These will be used for structured data on
                            your blog post.
                        </CardDescription>
                    </div>
                    <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={handleAddFaq}
                    >
                        <Plus className='mr-2 h-4 w-4' />
                        Add FAQ
                    </Button>
                </div>
            </CardHeader>
            <CardContent className='space-y-4'>
                <Button
                    type='button'
                    variant='secondary'
                    onClick={handleGenerateFromContent}
                    disabled={isGenerating || !content.trim()}
                    className='w-full'
                >
                    <Sparkles className='mr-2 h-4 w-4' />
                    {isGenerating
                        ? 'Generating FAQs...'
                        : 'Generate from Content'}
                </Button>

                {currentFaqs.length === 0 ? (
                    <Alert>
                        <HelpCircle className='h-4 w-4' />
                        <AlertDescription>
                            No FAQs yet. Click &quot;Add FAQ&quot; to add one
                            manually, or use &quot;Generate from Content&quot;
                            to create FAQs automatically.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className='space-y-4'>
                        {currentFaqs.map((faq, index) => (
                            <div
                                key={index}
                                className='rounded-lg border border-gray-200 bg-gray-50 p-4'
                            >
                                <div className='mb-3 flex items-start justify-between'>
                                    <span className='text-muted-foreground text-sm font-medium'>
                                        FAQ #{index + 1}
                                    </span>
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => handleRemoveFaq(index)}
                                    >
                                        <Trash2 className='h-4 w-4 text-red-500' />
                                    </Button>
                                </div>

                                <div className='space-y-3'>
                                    <div>
                                        <Label
                                            htmlFor={`faq-question-${index}`}
                                            className='text-sm font-medium'
                                        >
                                            Question
                                        </Label>
                                        <Textarea
                                            id={`faq-question-${index}`}
                                            value={faq.question}
                                            onChange={(e) =>
                                                handleUpdateFaq(
                                                    index,
                                                    'question',
                                                    e.target.value
                                                )
                                            }
                                            placeholder='Enter the question...'
                                            rows={2}
                                            className='mt-1'
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor={`faq-answer-${index}`}
                                            className='text-sm font-medium'
                                        >
                                            Answer
                                        </Label>
                                        <Textarea
                                            id={`faq-answer-${index}`}
                                            value={faq.answer}
                                            onChange={(e) =>
                                                handleUpdateFaq(
                                                    index,
                                                    'answer',
                                                    e.target.value
                                                )
                                            }
                                            placeholder='Enter the answer...'
                                            rows={4}
                                            className='mt-1'
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
