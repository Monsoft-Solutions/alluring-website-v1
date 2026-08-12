'use client'

import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { TabsContent } from '@workspace/ui/components/tabs'

import type { SeoTabProps } from './pipeline-edit-dialog.type'

/**
 * SEO tab for the pipeline post edit dialog
 * Handles meta title, description, keywords, and excerpt
 */
/** Matches the 40–70 word target the extraction prompt is held to. */
const QUICK_ANSWER_MIN_WORDS = 40
const QUICK_ANSWER_MAX_WORDS = 70

/** Counts words in the answer half only — the question is not part of the budget. */
function countAnswerWords(quickAnswer: string): number {
    const [first, ...rest] = quickAnswer.trim().split(/\n\s*\n/)
    const answer = rest.length > 0 ? rest.join('\n\n') : (first ?? '')

    return answer.split(/\s+/).filter((word) => word.length > 0).length
}

export function SeoTab({
    title,
    metaTitle,
    setMetaTitle,
    metaDescription,
    setMetaDescription,
    metaKeywords,
    setMetaKeywords,
    excerpt,
    setExcerpt,
    quickAnswer,
    setQuickAnswer,
    markDirty,
}: SeoTabProps) {
    const answerWords = countAnswerWords(quickAnswer)
    const answerWordsOffTarget =
        answerWords > 0 &&
        (answerWords < QUICK_ANSWER_MIN_WORDS ||
            answerWords > QUICK_ANSWER_MAX_WORDS)

    return (
        <TabsContent value='seo' className='m-0 h-full'>
            <ScrollArea className='h-full'>
                <div className='space-y-6 p-6'>
                    <div className='grid gap-6 md:grid-cols-2'>
                        {/* Meta Title */}
                        <div>
                            <Label className='text-xs font-medium text-stone-500'>
                                Meta Title
                            </Label>
                            <Input
                                value={metaTitle}
                                onChange={(e) => {
                                    setMetaTitle(e.target.value)
                                    markDirty()
                                }}
                                placeholder='SEO title (defaults to post title)'
                                className='mt-1'
                            />
                            <p className='mt-1 text-xs text-stone-400'>
                                {(metaTitle || title).length}/60 characters
                            </p>
                        </div>

                        {/* Meta Keywords */}
                        <div>
                            <Label className='text-xs font-medium text-stone-500'>
                                Meta Keywords
                            </Label>
                            <Input
                                value={metaKeywords}
                                onChange={(e) => {
                                    setMetaKeywords(e.target.value)
                                    markDirty()
                                }}
                                placeholder='keyword1, keyword2, keyword3'
                                className='mt-1'
                            />
                        </div>
                    </div>

                    {/* Meta Description */}
                    <div>
                        <Label className='text-xs font-medium text-stone-500'>
                            Meta Description
                        </Label>
                        <Textarea
                            value={metaDescription}
                            onChange={(e) => {
                                setMetaDescription(e.target.value)
                                markDirty()
                            }}
                            placeholder='Brief description for search results'
                            rows={3}
                            className='mt-1'
                        />
                        <p className='mt-1 text-xs text-stone-400'>
                            {metaDescription.length}/160 characters
                        </p>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <Label className='text-xs font-medium text-stone-500'>
                            Excerpt
                        </Label>
                        <Textarea
                            value={excerpt}
                            onChange={(e) => {
                                setExcerpt(e.target.value)
                                markDirty()
                            }}
                            placeholder='Short summary shown in blog listings'
                            rows={3}
                            className='mt-1'
                        />
                    </div>

                    {/* Quick Answer */}
                    <div>
                        <Label className='text-xs font-medium text-stone-500'>
                            Quick Answer
                        </Label>
                        <Textarea
                            value={quickAnswer}
                            onChange={(e) => {
                                setQuickAnswer(e.target.value)
                                markDirty()
                            }}
                            placeholder={
                                'How long do tummy tuck drains stay in?\n\nMost tummy tuck drains come out 7 to 14 days after surgery, once output falls below about 30 ml a day...'
                            }
                            rows={6}
                            className='mt-1'
                        />
                        <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1'>
                            <p className='text-xs text-stone-400'>
                                First line is the question, then a blank line,
                                then the answer. Shown above the article and
                                read aloud by voice search.
                            </p>
                            {answerWords > 0 && (
                                <p
                                    className={
                                        answerWordsOffTarget
                                            ? 'text-xs font-medium text-amber-600'
                                            : 'text-xs text-stone-400'
                                    }
                                >
                                    {answerWords} words in the answer (target{' '}
                                    {QUICK_ANSWER_MIN_WORDS}–
                                    {QUICK_ANSWER_MAX_WORDS})
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </TabsContent>
    )
}
