'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

type QuerySearchInputProps = {
    /** Current search value (controlled) */
    value: string
    /** Callback when search value changes (debounced) */
    onChange: (value: string) => void
    /** Placeholder text */
    placeholder?: string
    /** Debounce delay in milliseconds */
    debounceMs?: number
    /** Additional className for the container */
    className?: string
    /** Whether the input is disabled */
    disabled?: boolean
}

/**
 * Search input with debounce for query performance analysis.
 * Debounces the onChange callback to prevent excessive API calls.
 */
export function QuerySearchInput({
    value,
    onChange,
    placeholder = 'Search queries...',
    debounceMs = 300,
    className,
    disabled = false,
}: QuerySearchInputProps) {
    // Internal state for immediate input feedback
    const [internalValue, setInternalValue] = useState(value)

    // Sync external value changes to internal state
    useEffect(() => {
        setInternalValue(value)
    }, [value])

    // Debounced onChange callback
    const debouncedOnChange = useCallback(
        (newValue: string) => {
            const timeoutId = setTimeout(() => {
                onChange(newValue)
            }, debounceMs)

            return () => clearTimeout(timeoutId)
        },
        [onChange, debounceMs]
    )

    // Handle input changes
    useEffect(() => {
        if (internalValue !== value) {
            const cleanup = debouncedOnChange(internalValue)
            return cleanup
        }
    }, [internalValue, value, debouncedOnChange])

    const handleClear = () => {
        setInternalValue('')
        onChange('')
    }

    return (
        <div className={cn('relative', className)}>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
                type='text'
                value={internalValue}
                onChange={(e) => setInternalValue(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className='pr-9 pl-9'
            />
            {internalValue && (
                <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={handleClear}
                    disabled={disabled}
                    className='absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0 hover:bg-transparent'
                >
                    <X className='h-4 w-4' />
                    <span className='sr-only'>Clear search</span>
                </Button>
            )}
        </div>
    )
}
