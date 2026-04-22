import { Slot } from '@radix-ui/react-slot'
import { ArrowRight } from 'lucide-react'
import type {
    ReactNode,
    ComponentPropsWithoutRef,
    ButtonHTMLAttributes,
} from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@workspace/ui/lib/utils'

/**
 * buttonVariants - CVA helper for generating button class names
 * Used by components like AlertDialog that need button styling
 */
const buttonVariants = cva(
    'relative overflow-hidden inline-flex items-center justify-center transition-all duration-500 font-sans tracking-[0.2em] uppercase text-sm font-bold group disabled:pointer-events-none disabled:opacity-50 w-auto active:scale-[0.98]',
    {
        variants: {
            variant: {
                default:
                    'bg-stone-900 text-white border border-stone-900 hover:bg-stone-800 hover:text-gold-200',
                primary:
                    'bg-stone-900 text-white border border-stone-900 hover:bg-stone-800 hover:text-gold-200',
                secondary:
                    'bg-stone-50 text-stone-900 border border-stone-200 hover:border-gold-400',
                outline:
                    'bg-transparent text-stone-900 border border-stone-300 hover:border-stone-900',
                gold: 'bg-gold-400 text-white border border-gold-400 hover:bg-gold-500',
                ghost: 'bg-transparent text-stone-500 hover:text-stone-900',
                destructive:
                    'bg-red-500 text-white border border-red-500 hover:bg-red-600',
                link: 'text-stone-900 underline-offset-4 hover:underline',
            },
            size: {
                default: 'px-8 py-4',
                sm: 'px-5 py-3',
                md: 'px-8 py-4',
                lg: 'px-10 py-5',
                icon: 'h-14 w-14 p-0',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:
        | 'primary'
        | 'secondary'
        | 'outline'
        | 'ghost'
        | 'gold'
        | 'default'
        | 'destructive'
        | 'link'
    size?: 'sm' | 'md' | 'lg' | 'icon' | 'default'
    withArrow?: boolean
    children?: ReactNode
    className?: string
    asChild?: boolean
}

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    withArrow = false,
    asChild = false,
    ...props
}: ButtonProps) => {
    // Map 'default' variant to 'primary' for internal use
    const effectiveVariant = variant === 'default' ? 'primary' : variant
    const effectiveSize = size === 'default' ? 'md' : size

    const buttonContent = (
        <>
            <span className='relative z-10 flex items-center'>
                {children}
                {withArrow && (
                    <ArrowRight className='ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
                )}
            </span>

            {/* Shine effect for primary/gold buttons */}
            {(effectiveVariant === 'primary' ||
                effectiveVariant === 'gold') && (
                <span className='absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]' />
            )}
        </>
    )

    const buttonClassName = cn(
        buttonVariants({ variant: effectiveVariant, size: effectiveSize }),
        // Add ghost underline effect that CVA can't handle cleanly
        effectiveVariant === 'ghost' &&
            "after:content-[''] after:block after:w-full after:h-[1px] after:bg-stone-900 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300",
        className
    )

    if (asChild) {
        // When using asChild, we let Radix Slot handle prop merging naturally
        // We DO NOT manipulate the child's structure (no wrapping, no adding elements)
        // This prevents nested interactive element issues and ensures proper HTML structure
        const standardProps =
            props as unknown as ComponentPropsWithoutRef<'button'>

        return (
            <Slot className={buttonClassName} {...standardProps}>
                {children}
            </Slot>
        )
    }

    return (
        <button type='button' className={buttonClassName} {...props}>
            {buttonContent}
        </button>
    )
}

export { Button, buttonVariants }
