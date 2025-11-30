/**
 * Form Field Components
 *
 * Reusable form field components that work with react-hook-form.
 * Support both light and dark theme variants with consistent styling.
 *
 * @module components/shared/forms/form-fields
 */
'use client'

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { cn } from '@workspace/ui/lib/utils'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'

/**
 * Theme variant for form fields
 */
export type FormFieldVariant = 'light' | 'dark'

/**
 * Base props for all form field components
 */
type BaseFieldProps<TFieldValues extends FieldValues> = {
    /** react-hook-form control */
    readonly control: Control<TFieldValues>
    /** Field name (must match form schema) */
    readonly name: FieldPath<TFieldValues>
    /** Field label */
    readonly label?: string
    /** Placeholder text */
    readonly placeholder?: string
    /** Whether the field is disabled */
    readonly disabled?: boolean
    /** Theme variant */
    readonly variant?: FormFieldVariant
    /** Whether the field is required (shows asterisk) */
    readonly required?: boolean
    /** Additional class names for the container */
    readonly className?: string
}

/**
 * Get input styles based on variant
 */
function getInputStyles(variant: FormFieldVariant) {
    if (variant === 'dark') {
        return cn(
            'w-full border-b border-stone-700 bg-transparent py-3 text-white',
            'placeholder-stone-600 transition-colors focus:outline-none',
            'focus:border-gold-400'
        )
    }

    return cn(
        'h-12 transition-all duration-200',
        'border-border/60 hover:border-border/80',
        'focus:border-primary/60 focus:ring-primary/20'
    )
}

/**
 * Get label styles based on variant
 */
function getLabelStyles(variant: FormFieldVariant, required?: boolean) {
    const base =
        variant === 'dark'
            ? 'text-gold-400 text-xs font-bold tracking-widest uppercase transition-colors group-focus-within:text-white'
            : 'text-foreground/90 text-sm font-semibold'

    return base
}

/**
 * NameField - Pre-configured name input field
 */
export function NameField<TFieldValues extends FieldValues>({
    control,
    name,
    label = 'Full Name',
    placeholder = 'Your name',
    disabled = false,
    variant = 'light',
    required = true,
    className,
}: BaseFieldProps<TFieldValues>) {
    const inputStyles = getInputStyles(variant)
    const labelStyles = getLabelStyles(variant, required)

    if (variant === 'dark') {
        return (
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem className={cn('group space-y-2', className)}>
                        <FormLabel className={labelStyles}>
                            {label}
                            {required && ' *'}
                        </FormLabel>
                        <FormControl>
                            <input
                                type='text'
                                {...field}
                                disabled={disabled}
                                placeholder={placeholder}
                                className={inputStyles}
                            />
                        </FormControl>
                        <FormMessage className='text-xs text-red-400' />
                    </FormItem>
                )}
            />
        )
    }

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn('space-y-3', className)}>
                    <FormLabel className={labelStyles}>
                        {label}
                        {required && (
                            <span className='text-destructive ml-1 text-xs'>
                                *
                            </span>
                        )}
                    </FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            disabled={disabled}
                            placeholder={placeholder}
                            aria-label={label}
                            className={inputStyles}
                        />
                    </FormControl>
                    <FormMessage className='text-xs' />
                </FormItem>
            )}
        />
    )
}

/**
 * EmailField - Pre-configured email input field
 */
export function EmailField<TFieldValues extends FieldValues>({
    control,
    name,
    label = 'Email',
    placeholder = 'your@email.com',
    disabled = false,
    variant = 'light',
    required = false,
    className,
}: BaseFieldProps<TFieldValues>) {
    const inputStyles = getInputStyles(variant)
    const labelStyles = getLabelStyles(variant, required)

    if (variant === 'dark') {
        return (
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem className={cn('group space-y-2', className)}>
                        <FormLabel className={labelStyles}>
                            {label}
                            {required && ' *'}
                            {!required && (
                                <span className='ml-1 font-normal text-stone-500'>
                                    (Optional)
                                </span>
                            )}
                        </FormLabel>
                        <FormControl>
                            <input
                                type='email'
                                {...field}
                                disabled={disabled}
                                placeholder={placeholder}
                                className={inputStyles}
                            />
                        </FormControl>
                        <FormMessage className='text-xs text-red-400' />
                    </FormItem>
                )}
            />
        )
    }

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn('space-y-3', className)}>
                    <FormLabel className={labelStyles}>
                        {label}
                        {required && (
                            <span className='text-destructive ml-1 text-xs'>
                                *
                            </span>
                        )}
                    </FormLabel>
                    <FormControl>
                        <Input
                            type='email'
                            {...field}
                            disabled={disabled}
                            placeholder={placeholder}
                            aria-label={label}
                            className={inputStyles}
                        />
                    </FormControl>
                    <FormMessage className='text-xs' />
                </FormItem>
            )}
        />
    )
}

/**
 * PhoneField - Pre-configured phone input field
 */
export function PhoneField<TFieldValues extends FieldValues>({
    control,
    name,
    label = 'Phone',
    placeholder = '(555) 555-5555',
    disabled = false,
    variant = 'light',
    required = false,
    className,
}: BaseFieldProps<TFieldValues>) {
    const inputStyles = getInputStyles(variant)
    const labelStyles = getLabelStyles(variant, required)

    if (variant === 'dark') {
        return (
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem className={cn('group space-y-2', className)}>
                        <FormLabel className={labelStyles}>
                            {label}
                            {required && ' *'}
                        </FormLabel>
                        <FormControl>
                            <input
                                type='tel'
                                {...field}
                                disabled={disabled}
                                placeholder={placeholder}
                                className={inputStyles}
                            />
                        </FormControl>
                        <FormMessage className='text-xs text-red-400' />
                    </FormItem>
                )}
            />
        )
    }

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn('space-y-3', className)}>
                    <FormLabel className={labelStyles}>
                        {label}
                        {required && (
                            <span className='text-destructive ml-1 text-xs'>
                                *
                            </span>
                        )}
                    </FormLabel>
                    <FormControl>
                        <Input
                            type='tel'
                            {...field}
                            disabled={disabled}
                            placeholder={placeholder}
                            aria-label={label}
                            className={inputStyles}
                        />
                    </FormControl>
                    <FormMessage className='text-xs' />
                </FormItem>
            )}
        />
    )
}

/**
 * Props for SubjectField
 */
type SubjectFieldProps<TFieldValues extends FieldValues> =
    BaseFieldProps<TFieldValues>

/**
 * SubjectField - Pre-configured subject input field
 */
export function SubjectField<TFieldValues extends FieldValues>({
    control,
    name,
    label = 'Subject',
    placeholder = 'Subject of your message',
    disabled = false,
    variant = 'light',
    required = false,
    className,
}: SubjectFieldProps<TFieldValues>) {
    const inputStyles = getInputStyles(variant)
    const labelStyles = getLabelStyles(variant, required)

    if (variant === 'dark') {
        return (
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem className={cn('group space-y-2', className)}>
                        <FormLabel className={labelStyles}>
                            {label}
                            {required && ' *'}
                        </FormLabel>
                        <FormControl>
                            <input
                                type='text'
                                {...field}
                                disabled={disabled}
                                placeholder={placeholder}
                                className={inputStyles}
                            />
                        </FormControl>
                        <FormMessage className='text-xs text-red-400' />
                    </FormItem>
                )}
            />
        )
    }

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn('space-y-3', className)}>
                    <FormLabel className={labelStyles}>
                        {label}
                        {required && (
                            <span className='text-destructive ml-1 text-xs'>
                                *
                            </span>
                        )}
                    </FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            disabled={disabled}
                            placeholder={placeholder}
                            aria-label={label}
                            className={inputStyles}
                        />
                    </FormControl>
                    <FormMessage className='text-xs' />
                </FormItem>
            )}
        />
    )
}

/**
 * Props for MessageField
 */
type MessageFieldProps<TFieldValues extends FieldValues> =
    BaseFieldProps<TFieldValues> & {
        /** Number of rows for textarea */
        readonly rows?: number
    }

/**
 * MessageField - Pre-configured message textarea field
 */
export function MessageField<TFieldValues extends FieldValues>({
    control,
    name,
    label = 'Message',
    placeholder = 'Your message...',
    disabled = false,
    variant = 'light',
    required = false,
    className,
    rows = 4,
}: MessageFieldProps<TFieldValues>) {
    const labelStyles = getLabelStyles(variant, required)

    if (variant === 'dark') {
        const textareaStyles = cn(
            'w-full resize-none border-b border-stone-700 bg-transparent py-3 text-white',
            'placeholder-stone-600 transition-colors focus:outline-none',
            'focus:border-gold-400'
        )

        return (
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem className={cn('group space-y-2', className)}>
                        <FormLabel className={labelStyles}>
                            {label}
                            {required && ' *'}
                            {!required && (
                                <span className='ml-1 font-normal text-stone-500'>
                                    (Optional)
                                </span>
                            )}
                        </FormLabel>
                        <FormControl>
                            <textarea
                                {...field}
                                disabled={disabled}
                                placeholder={placeholder}
                                rows={rows}
                                className={textareaStyles}
                            />
                        </FormControl>
                        <FormMessage className='text-xs text-red-400' />
                    </FormItem>
                )}
            />
        )
    }

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn('space-y-3', className)}>
                    <FormLabel className={labelStyles}>
                        {label}
                        {required && (
                            <span className='text-destructive ml-1 text-xs'>
                                *
                            </span>
                        )}
                    </FormLabel>
                    <FormControl>
                        <Textarea
                            {...field}
                            disabled={disabled}
                            placeholder={placeholder}
                            aria-label={label}
                            rows={rows}
                            className={cn(
                                'min-h-[120px] resize-none transition-all duration-200',
                                'border-border/60 hover:border-border/80',
                                'focus:border-primary/60 focus:ring-primary/20'
                            )}
                        />
                    </FormControl>
                    <FormMessage className='text-xs' />
                </FormItem>
            )}
        />
    )
}

/**
 * Props for SelectField
 */
type SelectFieldProps<TFieldValues extends FieldValues> =
    BaseFieldProps<TFieldValues> & {
        /** Options for the select */
        readonly options: readonly {
            readonly value: string
            readonly label: string
        }[]
    }

/**
 * SelectField - Pre-configured select field
 */
export function SelectField<TFieldValues extends FieldValues>({
    control,
    name,
    label,
    disabled = false,
    variant = 'light',
    required = false,
    className,
    options,
}: SelectFieldProps<TFieldValues>) {
    const labelStyles = getLabelStyles(variant, required)

    if (variant === 'dark') {
        const selectStyles = cn(
            'w-full border-b border-stone-700 bg-transparent py-3 text-white',
            'transition-colors focus:outline-none focus:border-gold-400'
        )

        return (
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem className={cn('group space-y-2', className)}>
                        {label && (
                            <FormLabel className={labelStyles}>
                                {label}
                                {required && ' *'}
                            </FormLabel>
                        )}
                        <FormControl>
                            <select
                                {...field}
                                disabled={disabled}
                                className={selectStyles}
                            >
                                {options.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                        className='bg-stone-900 text-white'
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </FormControl>
                        <FormMessage className='text-xs text-red-400' />
                    </FormItem>
                )}
            />
        )
    }

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn('space-y-3', className)}>
                    {label && (
                        <FormLabel className={labelStyles}>
                            {label}
                            {required && (
                                <span className='text-destructive ml-1 text-xs'>
                                    *
                                </span>
                            )}
                        </FormLabel>
                    )}
                    <FormControl>
                        <select
                            {...field}
                            disabled={disabled}
                            className={cn(
                                'h-12 w-full rounded-md border px-3 transition-all duration-200',
                                'border-border/60 bg-background hover:border-border/80',
                                'focus:border-primary/60 focus:ring-primary/20 focus:outline-none'
                            )}
                        >
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </FormControl>
                    <FormMessage className='text-xs' />
                </FormItem>
            )}
        />
    )
}
