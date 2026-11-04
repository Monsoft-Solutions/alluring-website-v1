import { cn } from '@workspace/ui/lib/utils'

import {
    moduleBody,
    moduleButtonPrimary,
} from '@/components/procedures/module-kit/module-ui.constant'

/**
 * A booking prompt inside a long section, so a phone reader at a decision
 * point doesn't have to wait for the next form. It goes to the page's form.
 */
export function BblBookPrompt({ note }: { note?: string }) {
    return (
        <div className='mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6'>
            <a href='#book' className={moduleButtonPrimary}>
                Book your consultation
            </a>
            {note && <p className={cn(moduleBody, 'sm:flex-1')}>{note}</p>}
        </div>
    )
}
