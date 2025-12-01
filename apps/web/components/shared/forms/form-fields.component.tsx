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
 * Includes autofill-resistant styling for dark theme
 */
function getInputStyles(variant: FormFieldVariant) {
    if (variant === 'dark') {
        return cn(
            'w-full border-b border-stone-700 bg-transparent py-3 text-white',
            'placeholder-stone-600 transition-colors focus:outline-none',
            'focus:border-gold-400',
            // Autofill-resistant styling for dark theme
            'autofill:bg-transparent autofill:text-white',
            'autofill:shadow-[inset_0_0_0px_1000px_transparent]',
            '[-webkit-text-fill-color:white]',
            '[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_rgb(28_25_23)_inset]',
            '[&:-webkit-autofill]:[-webkit-text-fill-color:white]',
            '[&:-webkit-autofill:hover]:[-webkit-box-shadow:0_0_0px_1000px_rgb(28_25_23)_inset]',
            '[&:-webkit-autofill:focus]:[-webkit-box-shadow:0_0_0px_1000px_rgb(28_25_23)_inset]'
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
function getLabelStyles(variant: FormFieldVariant, _required?: boolean) {
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

/**
 * FirstNameField - Pre-configured first name input field
 */
export function FirstNameField<TFieldValues extends FieldValues>({
    control,
    name,
    label = 'First Name',
    placeholder = 'First name',
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
 * LastNameField - Pre-configured last name input field
 */
export function LastNameField<TFieldValues extends FieldValues>({
    control,
    name,
    label = 'Last Name',
    placeholder = 'Last name',
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
 * Props for CheckboxField
 */
type CheckboxFieldProps<TFieldValues extends FieldValues> = Omit<
    BaseFieldProps<TFieldValues>,
    'placeholder'
> & {
    /** Content to render as the checkbox label (can include links) */
    readonly children: React.ReactNode
}

/**
 * CheckboxField - Pre-configured checkbox field for consent/agreement
 */
export function CheckboxField<TFieldValues extends FieldValues>({
    control,
    name,
    disabled = false,
    variant = 'light',
    required = false,
    className,
    children,
}: CheckboxFieldProps<TFieldValues>) {
    if (variant === 'dark') {
        return (
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem className={cn('group space-y-2', className)}>
                        <div className='flex items-start gap-3'>
                            <FormControl>
                                <input
                                    type='checkbox'
                                    id={name}
                                    checked={field.value as boolean}
                                    onChange={field.onChange}
                                    disabled={disabled}
                                    className={cn(
                                        'mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-stone-600',
                                        'text-gold-500 focus:ring-gold-400 bg-transparent focus:ring-offset-stone-900',
                                        'checked:bg-gold-500 checked:border-gold-500'
                                    )}
                                />
                            </FormControl>
                            <label
                                htmlFor={name}
                                className='cursor-pointer text-sm leading-relaxed text-stone-400'
                            >
                                {children}
                                {required && (
                                    <span className='text-gold-400 ml-1'>
                                        *
                                    </span>
                                )}
                            </label>
                        </div>
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
                <FormItem className={cn('space-y-2', className)}>
                    <div className='flex items-start gap-3'>
                        <FormControl>
                            <input
                                type='checkbox'
                                id={name}
                                checked={field.value as boolean}
                                onChange={field.onChange}
                                disabled={disabled}
                                className={cn(
                                    'border-border mt-1 h-4 w-4 shrink-0 cursor-pointer rounded',
                                    'bg-background text-primary focus:ring-primary focus:ring-offset-background'
                                )}
                            />
                        </FormControl>
                        <label
                            htmlFor={name}
                            className='text-muted-foreground cursor-pointer text-sm leading-relaxed'
                        >
                            {children}
                            {required && (
                                <span className='text-destructive ml-1'>*</span>
                            )}
                        </label>
                    </div>
                    <FormMessage className='text-xs' />
                </FormItem>
            )}
        />
    )
}

/**
 * Props for RatingField
 */
type RatingFieldProps<TFieldValues extends FieldValues> = Omit<
    BaseFieldProps<TFieldValues>,
    'placeholder'
> & {
    /** Minimum rating value */
    readonly min?: number
    /** Maximum rating value */
    readonly max?: number
    /** Labels for the rating scale (optional) */
    readonly ratingLabels?: Record<number, string>
    /** Whether to show labels inline */
    readonly showLabels?: boolean
}

/**
 * RatingField - Linear scale rating (1-5 by default)
 */
export function RatingField<TFieldValues extends FieldValues>({
    control,
    name,
    label,
    disabled = false,
    variant = 'light',
    required = false,
    className,
    min = 1,
    max = 5,
    ratingLabels,
    showLabels = true,
}: RatingFieldProps<TFieldValues>) {
    const labelStyles = getLabelStyles(variant, required)

    const ratings = Array.from({ length: max - min + 1 }, (_, i) => min + i)

    const getButtonStyles = (isSelected: boolean) => {
        if (variant === 'dark') {
            return cn(
                'h-10 w-10 rounded-full border-2 font-semibold transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-stone-900',
                isSelected
                    ? 'border-gold-500 bg-gold-500 text-stone-900'
                    : 'border-stone-600 bg-transparent text-stone-400 hover:border-gold-400 hover:text-gold-400'
            )
        }

        return cn(
            'h-10 w-10 rounded-full border-2 font-semibold transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground'
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
                                <span
                                    className={cn(
                                        'ml-1 text-xs',
                                        variant === 'dark'
                                            ? 'text-gold-400'
                                            : 'text-destructive'
                                    )}
                                >
                                    *
                                </span>
                            )}
                        </FormLabel>
                    )}
                    <FormControl>
                        <div className='space-y-2'>
                            <div
                                className='flex items-center gap-2'
                                role='radiogroup'
                                aria-label={label}
                            >
                                {ratings.map((rating) => (
                                    <button
                                        key={rating}
                                        type='button'
                                        disabled={disabled}
                                        onClick={() => field.onChange(rating)}
                                        className={getButtonStyles(
                                            field.value === rating
                                        )}
                                        role='radio'
                                        aria-checked={field.value === rating}
                                        aria-label={
                                            ratingLabels?.[rating] ||
                                            `${rating} out of ${max}`
                                        }
                                    >
                                        {rating}
                                    </button>
                                ))}
                            </div>
                            {showLabels && ratingLabels && (
                                <div
                                    className={cn(
                                        'flex justify-between text-xs',
                                        variant === 'dark'
                                            ? 'text-stone-500'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    <span>{ratingLabels[min]}</span>
                                    <span>{ratingLabels[max]}</span>
                                </div>
                            )}
                        </div>
                    </FormControl>
                    <FormMessage
                        className={cn(
                            'text-xs',
                            variant === 'dark' && 'text-red-400'
                        )}
                    />
                </FormItem>
            )}
        />
    )
}

/**
 * Props for RadioGroupField
 */
type RadioGroupFieldProps<TFieldValues extends FieldValues> = Omit<
    BaseFieldProps<TFieldValues>,
    'placeholder'
> & {
    /** Options for the radio group */
    readonly options: readonly {
        readonly value: string
        readonly label: string
    }[]
    /** Whether to include an "Other" option with text input */
    readonly includeOther?: boolean
    /** Name for the "Other" text field */
    readonly otherFieldName?: FieldPath<TFieldValues>
    /** Placeholder for "Other" text input */
    readonly otherPlaceholder?: string
    /** Layout direction */
    readonly direction?: 'horizontal' | 'vertical'
}

/**
 * RadioGroupField - Radio button group with optional "Other" text input
 */
export function RadioGroupField<TFieldValues extends FieldValues>({
    control,
    name,
    label,
    disabled = false,
    variant = 'light',
    required = false,
    className,
    options,
    includeOther = false,
    otherFieldName,
    otherPlaceholder = 'Please specify...',
    direction = 'vertical',
}: RadioGroupFieldProps<TFieldValues>) {
    const labelStyles = getLabelStyles(variant, required)

    const getRadioStyles = (isSelected: boolean) => {
        if (variant === 'dark') {
            return cn(
                'h-4 w-4 shrink-0 rounded-full border-2 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-1 focus:ring-offset-stone-900',
                isSelected
                    ? 'border-gold-500 bg-gold-500'
                    : 'border-stone-600 bg-transparent hover:border-gold-400'
            )
        }

        return cn(
            'h-4 w-4 shrink-0 rounded-full border-2 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
            isSelected
                ? 'border-primary bg-primary'
                : 'border-border bg-background hover:border-primary/60'
        )
    }

    const inputStyles = getInputStyles(variant)

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
                                <span
                                    className={cn(
                                        'ml-1 text-xs',
                                        variant === 'dark'
                                            ? 'text-gold-400'
                                            : 'text-destructive'
                                    )}
                                >
                                    *
                                </span>
                            )}
                        </FormLabel>
                    )}
                    <FormControl>
                        <div
                            className={cn(
                                'space-y-2',
                                direction === 'horizontal' &&
                                    'flex flex-wrap gap-4 space-y-0'
                            )}
                            role='radiogroup'
                            aria-label={label}
                        >
                            {options.map((option) => (
                                <label
                                    key={option.value}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-3',
                                        disabled &&
                                            'cursor-not-allowed opacity-50'
                                    )}
                                >
                                    <button
                                        type='button'
                                        disabled={disabled}
                                        onClick={() =>
                                            field.onChange(option.value)
                                        }
                                        className={getRadioStyles(
                                            field.value === option.value
                                        )}
                                        role='radio'
                                        aria-checked={
                                            field.value === option.value
                                        }
                                    >
                                        {field.value === option.value && (
                                            <span
                                                className={cn(
                                                    'block h-2 w-2 rounded-full',
                                                    variant === 'dark'
                                                        ? 'bg-stone-900'
                                                        : 'bg-primary-foreground'
                                                )}
                                            />
                                        )}
                                    </button>
                                    <span
                                        className={cn(
                                            'text-sm',
                                            variant === 'dark'
                                                ? 'text-stone-300'
                                                : 'text-foreground'
                                        )}
                                    >
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                            {includeOther && (
                                <label
                                    className={cn(
                                        'flex cursor-pointer items-center gap-3',
                                        disabled &&
                                            'cursor-not-allowed opacity-50'
                                    )}
                                >
                                    <button
                                        type='button'
                                        disabled={disabled}
                                        onClick={() => field.onChange('other')}
                                        className={getRadioStyles(
                                            field.value === 'other'
                                        )}
                                        role='radio'
                                        aria-checked={field.value === 'other'}
                                    >
                                        {field.value === 'other' && (
                                            <span
                                                className={cn(
                                                    'block h-2 w-2 rounded-full',
                                                    variant === 'dark'
                                                        ? 'bg-stone-900'
                                                        : 'bg-primary-foreground'
                                                )}
                                            />
                                        )}
                                    </button>
                                    <span
                                        className={cn(
                                            'text-sm',
                                            variant === 'dark'
                                                ? 'text-stone-300'
                                                : 'text-foreground'
                                        )}
                                    >
                                        Other
                                    </span>
                                </label>
                            )}
                        </div>
                    </FormControl>
                    {includeOther &&
                        field.value === 'other' &&
                        otherFieldName && (
                            <FormField
                                control={control}
                                name={otherFieldName}
                                render={({ field: otherField }) => (
                                    <FormItem className='mt-2 pl-7'>
                                        <FormControl>
                                            <input
                                                type='text'
                                                {...otherField}
                                                disabled={disabled}
                                                placeholder={otherPlaceholder}
                                                className={cn(
                                                    inputStyles,
                                                    'w-full'
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage
                                            className={cn(
                                                'text-xs',
                                                variant === 'dark' &&
                                                    'text-red-400'
                                            )}
                                        />
                                    </FormItem>
                                )}
                            />
                        )}
                    <FormMessage
                        className={cn(
                            'text-xs',
                            variant === 'dark' && 'text-red-400'
                        )}
                    />
                </FormItem>
            )}
        />
    )
}

/**
 * Props for YesNoField
 */
type YesNoFieldProps<TFieldValues extends FieldValues> = Omit<
    BaseFieldProps<TFieldValues>,
    'placeholder'
> & {
    /** Labels for yes/no options */
    readonly yesLabel?: string
    readonly noLabel?: string
}

/**
 * YesNoField - Simple yes/no toggle (boolean)
 */
export function YesNoField<TFieldValues extends FieldValues>({
    control,
    name,
    label,
    disabled = false,
    variant = 'light',
    required = false,
    className,
    yesLabel = 'Yes',
    noLabel = 'No',
}: YesNoFieldProps<TFieldValues>) {
    const labelStyles = getLabelStyles(variant, required)

    const getButtonStyles = (isSelected: boolean) => {
        if (variant === 'dark') {
            return cn(
                'flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-stone-900',
                isSelected
                    ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                    : 'border-stone-700 bg-transparent text-stone-400 hover:border-stone-500'
            )
        }

        return cn(
            'flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            isSelected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:border-border/80'
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
                                <span
                                    className={cn(
                                        'ml-1 text-xs',
                                        variant === 'dark'
                                            ? 'text-gold-400'
                                            : 'text-destructive'
                                    )}
                                >
                                    *
                                </span>
                            )}
                        </FormLabel>
                    )}
                    <FormControl>
                        <div className='flex gap-3' role='radiogroup'>
                            <button
                                type='button'
                                disabled={disabled}
                                onClick={() => field.onChange(false)}
                                className={getButtonStyles(
                                    field.value === false
                                )}
                                role='radio'
                                aria-checked={field.value === false}
                            >
                                {noLabel}
                            </button>
                            <button
                                type='button'
                                disabled={disabled}
                                onClick={() => field.onChange(true)}
                                className={getButtonStyles(
                                    field.value === true
                                )}
                                role='radio'
                                aria-checked={field.value === true}
                            >
                                {yesLabel}
                            </button>
                        </div>
                    </FormControl>
                    <FormMessage
                        className={cn(
                            'text-xs',
                            variant === 'dark' && 'text-red-400'
                        )}
                    />
                </FormItem>
            )}
        />
    )
}
