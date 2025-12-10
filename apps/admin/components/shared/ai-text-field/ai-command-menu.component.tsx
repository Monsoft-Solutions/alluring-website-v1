/**
 * AI Command Menu Component
 *
 * A command palette for AI text operations using shadcn Command + Popover.
 * Displays operations grouped by category with icons and descriptions.
 *
 * @module components/shared/ai-text-field/ai-command-menu.component
 */
'use client'

import { useState } from 'react'
import {
    Sparkles,
    Minimize2,
    Maximize2,
    Check,
    Briefcase,
    MessageCircle,
    Pencil,
    Search,
    Heart,
    HeartHandshake,
    Crown,
    PhoneCall,
    Loader2,
    X,
} from 'lucide-react'

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@workspace/ui/components/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'

import {
    type TextOperation,
    type OperationConfig,
    getOperationsByGroup,
} from './ai-text-field.type'

/**
 * Icon mapping for operations
 */
const IconMap = {
    Sparkles,
    Minimize2,
    Maximize2,
    Check,
    Briefcase,
    MessageCircle,
    Pencil,
    Search,
    Heart,
    HeartHandshake,
    Crown,
    PhoneCall,
} as const

type AICommandMenuProps = {
    /** Whether the menu is open */
    isOpen: boolean
    /** Handler to open/close the menu */
    onOpenChange: (open: boolean) => void
    /** Whether an operation is in progress */
    isLoading: boolean
    /** Handler when an operation is selected */
    onSelect: (operation: TextOperation, customInstruction?: string) => void
    /** Handler to cancel the current operation */
    onCancel: () => void
    /** The trigger element */
    children: React.ReactNode
}

/**
 * AI Command Menu
 *
 * Displays a command palette with AI text operations.
 */
export function AICommandMenu({
    isOpen,
    onOpenChange,
    isLoading,
    onSelect,
    onCancel,
    children,
}: AICommandMenuProps) {
    const [customInstruction, setCustomInstruction] = useState('')
    const [showCustomInput, setShowCustomInput] = useState(false)

    const generalOperations = getOperationsByGroup('general').filter(
        (op) => op.operation !== 'custom'
    )
    const industryOperations = getOperationsByGroup('industry')
    const customOperation = getOperationsByGroup('general').find(
        (op) => op.operation === 'custom'
    )

    const handleSelect = (operation: TextOperation) => {
        if (operation === 'custom') {
            setShowCustomInput(true)
            return
        }
        onSelect(operation)
        onOpenChange(false)
    }

    const handleCustomSubmit = () => {
        if (customInstruction.trim()) {
            onSelect('custom', customInstruction.trim())
            setCustomInstruction('')
            setShowCustomInput(false)
            onOpenChange(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setShowCustomInput(false)
            setCustomInstruction('')
        }
        onOpenChange(open)
    }

    const renderOperationItem = (op: OperationConfig) => {
        const Icon = IconMap[op.icon as keyof typeof IconMap]
        return (
            <CommandItem
                key={op.operation}
                onSelect={() => handleSelect(op.operation)}
                disabled={isLoading}
                className='flex items-center gap-2'
            >
                {Icon && <Icon className='h-4 w-4' />}
                <div className='flex flex-col'>
                    <span>{op.label}</span>
                    <span className='text-muted-foreground text-xs'>
                        {op.description}
                    </span>
                </div>
            </CommandItem>
        )
    }

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent className='w-72 p-0' align='start' sideOffset={5}>
                {isLoading ? (
                    <div className='flex flex-col items-center gap-3 p-6'>
                        <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
                        <p className='text-muted-foreground text-sm'>
                            Improving text...
                        </p>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={onCancel}
                            className='mt-2'
                        >
                            <X className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                ) : showCustomInput ? (
                    <div className='p-4'>
                        <p className='mb-3 text-sm font-medium'>
                            Custom Instruction
                        </p>
                        <Input
                            placeholder='e.g., Make it more exciting...'
                            value={customInstruction}
                            onChange={(e) =>
                                setCustomInstruction(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleCustomSubmit()
                                }
                                if (e.key === 'Escape') {
                                    setShowCustomInput(false)
                                }
                            }}
                            autoFocus
                        />
                        <div className='mt-3 flex gap-2'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setShowCustomInput(false)}
                                className='flex-1'
                            >
                                Back
                            </Button>
                            <Button
                                size='sm'
                                onClick={handleCustomSubmit}
                                disabled={!customInstruction.trim()}
                                className='flex-1'
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Command>
                        <CommandInput placeholder='Search operations...' />
                        <CommandList>
                            <CommandEmpty>No operations found.</CommandEmpty>
                            <CommandGroup heading='General'>
                                {generalOperations.map(renderOperationItem)}
                                {customOperation &&
                                    renderOperationItem(customOperation)}
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup heading='Industry-Specific'>
                                {industryOperations.map(renderOperationItem)}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                )}
            </PopoverContent>
        </Popover>
    )
}
