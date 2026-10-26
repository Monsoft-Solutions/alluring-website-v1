/**
 * The consultation thread's starting prices, from the pricing resolver
 * (issue #354). The thread's copy (`site-chat-copy.ts`) is static and
 * leaves `prices` empty; each server component that renders a thread fills
 * it here, so an admin price edit or discount reaches the reply to the
 * first tap like every other surface.
 *
 * Plain text, since the reply is a chat message: "$4,400 (20% off $5,500)"
 * while a discount is on, followed by the Fla. Stat. 456.062 statement.
 *
 * @module components/shared/consult-chat/site-chat-prices
 */
import 'server-only'

import { getPricing } from '@/lib/queries/pricing.query'

import type { ConsultChatCopy, ConsultChatLang } from './consult-chat.types'
import {
    buildChatStartingPrices,
    type ChatStartingPrices,
} from './site-chat-copy'

/** The thread's starting prices from the live pricing. */
export async function getChatStartingPrices(): Promise<ChatStartingPrices> {
    return buildChatStartingPrices(await getPricing())
}

/**
 * A thread's copy with its prices filled in. A discounted price carries the
 * statement in the same message: the reply reads "{procedure} starts at
 * {price}. …", so the statement follows the figure as its own sentence.
 */
export async function withChatPrices<
    T extends {
        readonly copy: Readonly<Record<ConsultChatLang, ConsultChatCopy>>
    },
>(chat: T): Promise<T> {
    const { prices, statement } = await getChatStartingPrices()
    const filled = statement
        ? Object.fromEntries(
              Object.entries(prices).map(([value, price]) => [
                  value,
                  `${price}. ${statement.replace(/\.\s*$/, '')}`,
              ])
          )
        : prices
    const copy = Object.fromEntries(
        Object.entries(chat.copy).map(([lang, deck]) => [
            lang,
            deck.procedureReply
                ? {
                      ...deck,
                      procedureReply: {
                          ...deck.procedureReply,
                          prices: filled,
                      },
                  }
                : deck,
        ])
    ) as T['copy']
    return { ...chat, copy }
}
