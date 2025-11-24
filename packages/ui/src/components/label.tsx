'use client'

import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@workspace/ui/lib/utils'

type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    ref?: React.Ref<React.ComponentRef<typeof LabelPrimitive.Root>>
}

/**
 * Label component that wraps Radix UI Label primitive.
 * Provides consistent styling and accessibility features for form labels.
 *
 * @example
 * <Label htmlFor="email">Email Address</Label>
 */
const Label = ({ className, ref, ...props }: LabelProps) => {
    return (
        <LabelPrimitive.Root
            ref={ref}
            data-slot='label'
            className={cn(
                'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                className
            )}
            {...props}
        />
    )
}

export { Label }
