import { Loader2, Check } from 'lucide-react'

type StepIndicatorProps = {
    icon: React.ComponentType<{ className?: string }>
    label: string
    status: 'pending' | 'loading' | 'complete'
}

export function StepIndicator({
    icon: Icon,
    label,
    status,
}: StepIndicatorProps) {
    return (
        <div className='flex items-center gap-3'>
            <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    status === 'complete'
                        ? 'bg-green-100'
                        : status === 'loading'
                          ? 'bg-amber-100'
                          : 'bg-stone-100'
                }`}
            >
                {status === 'loading' ? (
                    <Loader2 className='h-4 w-4 animate-spin text-amber-600' />
                ) : status === 'complete' ? (
                    <Check className='h-4 w-4 text-green-600' />
                ) : (
                    <Icon className='text-muted-foreground h-4 w-4' />
                )}
            </div>
            <span
                className={`text-sm ${
                    status === 'complete'
                        ? 'font-medium text-green-700'
                        : status === 'loading'
                          ? 'font-medium text-amber-700'
                          : 'text-muted-foreground'
                }`}
            >
                {label}
            </span>
        </div>
    )
}
