'use client'

/**
 * "Message Melissa" — the consultation request, written as a text thread.
 *
 * Visitors arrive from Melissa's bio link, where they already talk to her in
 * DMs, so the form borrows that shape. The thread itself is the shared
 * `ConsultChat` (#274); this file supplies her face, her lead source, her
 * thank-you page and her page's `mj-*` styling.
 */

import Image from 'next/image'

import { ConsultChat } from '@/components/shared/consult-chat/consult-chat.component'
import type { ConsultChatStaffLabels } from '@/components/shared/consult-chat/consult-chat.types'

import type { MjDictionary, MjLang } from './mj-copy'
import {
    MJ_AVATAR,
    MJ_CHAT_ID,
    MJ_LEAD_STORAGE_KEY,
    MJ_PAGE_PATH,
    MJ_SOURCE,
    MJ_THANK_YOU_PATH,
} from './mj-config'

interface MjChatFormProps {
    readonly lang: MjLang
    readonly copy: MjDictionary['chat']
    readonly staff: ConsultChatStaffLabels
}

const NOTE_LINES = [
    'Coordinator: Melissa Juvier (her personal page)',
    `Landing page: ${MJ_PAGE_PATH}`,
] as const

export function MjChatForm({ lang, copy, staff }: MjChatFormProps) {
    return (
        <ConsultChat
            id={MJ_CHAT_ID}
            lang={lang}
            copy={copy}
            staff={staff}
            avatar={
                <Image
                    src={MJ_AVATAR.src}
                    width={MJ_AVATAR.width}
                    height={MJ_AVATAR.height}
                    sizes='48px'
                    alt=''
                />
            }
            source={MJ_SOURCE}
            formName='melissa_juvier_chat'
            thankYouPath={MJ_THANK_YOU_PATH}
            leadStorageKey={MJ_LEAD_STORAGE_KEY}
            subject={(procedure) => `Melissa Juvier lead: ${procedure}`}
            noteLines={NOTE_LINES}
            classPrefix='mj'
            dataLayerEvents={{
                step: 'mj_chat_step',
                attempt: 'mj_lead_attempt',
            }}
        />
    )
}
