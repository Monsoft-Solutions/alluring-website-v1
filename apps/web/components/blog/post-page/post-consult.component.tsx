import type { ReactNode } from 'react'

import { SiteConsultChat } from '@/components/shared/consult-chat/site-consult-chat.component'
import {
    SITE_CHAT_LEAD_KEY,
    SITE_CHAT_THANK_YOU_PATH,
} from '@/components/shared/consult-chat/site-chat.constants'
import { HOME_CHAT } from '@/components/shared/consult-chat/site-chat-copy'
import type { PostProcedure } from '@/lib/blog/post-procedure.util'
import type { ReaderStage } from '@/lib/blog/reader-stage.util'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

import { POST_CONSULT_ID, threadCopy } from './post-page.copy'

type PostConsultProps = {
    procedure: PostProcedure | null
    stage: ReaderStage
    /** The post's path, e.g. "/how-many-massages-after-bbl". */
    path: string
    title: string
    /** The live promotion's title, stored on the lead. */
    offer?: string
    /** The offer bubble, in both languages (`postOfferIntro`). */
    intro?: { en: ReactNode; es: ReactNode }
}

/**
 * The post's one form: the consultation thread the home, contact and specials
 * pages use, placed at the post's split point. The post's procedure is
 * highlighted as the first answer, and every "Get my … price" link on the page
 * answers it on the way here.
 *
 * The lead is a blog lead: its subject names the procedure, and its notes say
 * which post it came from and whether the reader was recovering or planning.
 */
export function PostConsult({
    procedure,
    stage,
    path,
    title,
    offer,
    intro,
}: PostConsultProps) {
    const copy = threadCopy(procedure, stage)

    return (
        <section aria-labelledby='post-consult-title' className='bp-consult'>
            <div className='mb-7 max-w-[36rem]'>
                <p className='text-gold-700 text-xs font-semibold tracking-[0.18em] uppercase'>
                    {copy.eyebrow}
                </p>
                <h2
                    id='post-consult-title'
                    className='mt-3 font-serif text-[1.875rem] leading-[1.1] font-normal tracking-[-0.01em] text-balance text-stone-900 md:text-[2.375rem]'
                >
                    {copy.heading.lead}
                    <em>{copy.heading.em}</em>
                </h2>
                <p className='mt-4 text-[1.0625rem] leading-[1.6] text-stone-700'>
                    {copy.lead}
                </p>
            </div>

            <SiteConsultChat
                id={POST_CONSULT_ID}
                copy={HOME_CHAT.copy}
                staff={HOME_CHAT.staff}
                source={CONTACT_SOURCES.BLOG_LEAD}
                formName='blog_chat'
                thankYouPath={SITE_CHAT_THANK_YOU_PATH}
                leadStorageKey={SITE_CHAT_LEAD_KEY}
                subjectPrefix='Blog lead'
                noteLines={[
                    `Page: ${path} (blog)`,
                    `Post: ${title}`,
                    `Reader: ${stage}`,
                ]}
                offer={offer}
                intro={intro}
                defaultProcedure={procedure?.chatValue}
            />
        </section>
    )
}
