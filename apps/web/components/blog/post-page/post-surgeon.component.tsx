import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { ModuleSurgeonCredentials } from '@/components/procedures/module-kit/module-surgeon.component'
import {
    moduleContainer,
    moduleLink,
} from '@/components/procedures/module-kit/module-ui.constant'

import { SURGEON_COPY } from './post-page.copy'

/**
 * Who operates: her portrait with her name (`KARLINSKY_NAME`) and her
 * credentials exactly as the procedure pages print them
 * (`ModuleSurgeonCredentials`), each linked to the
 * issuing body's record, with the Florida statement beside the American Board
 * of Cosmetic Surgery line. It names no reviewer: she has not reviewed the
 * post.
 */
export function PostSurgeon() {
    return (
        <section
            aria-labelledby='post-surgeon-title'
            className='border-t border-stone-200 bg-white'
        >
            <div className={cn(moduleContainer, 'py-14 md:py-20')}>
                {/* Her name is the portrait's caption, so the heading
                    doesn't repeat it. */}
                <h2
                    id='post-surgeon-title'
                    className='font-serif text-[1.875rem] leading-[1.1] font-normal tracking-[-0.01em] text-stone-900 md:text-[2.375rem]'
                >
                    {SURGEON_COPY.heading.lead}
                    <em>{SURGEON_COPY.heading.em}</em>
                </h2>
                <div className='max-w-[52rem]'>
                    <ModuleSurgeonCredentials />
                </div>
                <Link
                    href='/dr-karlinsky'
                    className={cn(
                        moduleLink,
                        'mt-8 inline-block text-[1.0625rem] font-bold'
                    )}
                >
                    {SURGEON_COPY.profileLink}
                </Link>
            </div>
        </section>
    )
}
