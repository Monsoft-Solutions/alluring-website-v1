'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'

type PostFormKeywordsProps = {
    primaryKeyword: string | null
    secondaryKeywords: string[] | null
    onPrimaryKeywordChange: (value: string) => void
    onSecondaryKeywordsChange: (value: string[]) => void
}

export function PostFormKeywords({
    primaryKeyword,
    secondaryKeywords,
    onPrimaryKeywordChange,
    onSecondaryKeywordsChange,
}: PostFormKeywordsProps) {
    const [secondaryInput, setSecondaryInput] = useState('')

    const handleAddSecondaryKeyword = () => {
        const keyword = secondaryInput.trim()
        if (!keyword) return

        const currentKeywords = secondaryKeywords || []
        if (!currentKeywords.includes(keyword)) {
            onSecondaryKeywordsChange([...currentKeywords, keyword])
        }
        setSecondaryInput('')
    }

    const handleRemoveSecondaryKeyword = (keyword: string) => {
        const currentKeywords = secondaryKeywords || []
        onSecondaryKeywordsChange(currentKeywords.filter((k) => k !== keyword))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddSecondaryKeyword()
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Target Keywords</CardTitle>
                <CardDescription>
                    SEO keywords this content is optimized for
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='space-y-2'>
                    <Label htmlFor='primaryKeyword'>Primary Keyword</Label>
                    <Input
                        id='primaryKeyword'
                        value={primaryKeyword ?? ''}
                        onChange={(e) => onPrimaryKeywordChange(e.target.value)}
                        placeholder='main target keyword'
                    />
                    <p className='text-muted-foreground text-xs'>
                        The main keyword you&apos;re targeting with this content
                    </p>
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='secondaryKeywords'>
                        Secondary Keywords
                    </Label>
                    <div className='flex gap-2'>
                        <Input
                            id='secondaryKeywords'
                            value={secondaryInput}
                            onChange={(e) => setSecondaryInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder='supporting keyword'
                        />
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleAddSecondaryKeyword}
                            disabled={!secondaryInput.trim()}
                        >
                            Add
                        </Button>
                    </div>
                    <p className='text-muted-foreground text-xs'>
                        Supporting keywords and variations (press Enter to add)
                    </p>

                    {secondaryKeywords && secondaryKeywords.length > 0 && (
                        <div className='flex flex-wrap gap-2 pt-2'>
                            {secondaryKeywords.map((keyword) => (
                                <Badge
                                    key={keyword}
                                    variant='secondary'
                                    className='gap-1 pr-1'
                                >
                                    {keyword}
                                    <button
                                        type='button'
                                        onClick={() =>
                                            handleRemoveSecondaryKeyword(
                                                keyword
                                            )
                                        }
                                        className='hover:bg-muted ml-1 rounded-sm p-0.5 transition-colors'
                                        aria-label={`Remove ${keyword}`}
                                    >
                                        <X className='h-3 w-3' />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
