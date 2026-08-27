/* eslint-disable no-restricted-properties -- this *is* an env module; see the note below. */

/**
 * Public environment values, with no schema library attached.
 *
 * **Client-reachable modules must import this, never `@/env`.** `@/env` calls
 * t3-env's `createEnv`, which needs a schema library, so importing it anywhere
 * in the client graph drags the whole of zod into the browser. zod v4's `z`
 * namespace carries every locale plus `toJSONSchema` and cannot be tree-shaken:
 * that is 48.8 KiB brotli, downloaded by routes like `/about` and `/blog` that
 * have no form and never validate anything (issue #210).
 *
 * Nothing is lost by reading the raw values here. Every variable is still
 * declared and validated by zod in `@/env`, which the server graph imports on
 * every render — so a malformed `NEXT_PUBLIC_GA_MEASUREMENT_ID` still fails the
 * build. The browser only ever needed the value, not the validator.
 *
 * Each read is written as a full `process.env.X` member expression because that
 * is the form Next's build-time inliner substitutes. Destructuring
 * (`const { NEXT_PUBLIC_X } = process.env`) silently yields `undefined` in the
 * browser.
 *
 * **The reads are getters, not plain properties, and that matters.** `@/env`
 * consumes this object as its `experimental__runtimeEnv`, and t3-env builds its
 * runtime environment as `{ ...process.env, ...experimental__runtimeEnv }` —
 * the snapshot spreads *last*, so an `undefined` here overwrites a value that
 * `process.env` had. Plain properties would be evaluated when this module is
 * first imported, which — because imports are hoisted — is *before* the
 * `dotenv.config()` calls at the top of `env.ts`. Any standalone script that
 * relies on that dotenv fallback would then see `undefined` for every public
 * variable. Getters defer each read to the moment t3-env spreads the object,
 * which happens inside `createEnv(...)`, after dotenv has run.
 *
 * Because `@/env` consumes this object, the two cannot drift: a variable added
 * to the `client` or `shared` schema without a matching entry here is a type
 * error at the `createEnv` call.
 */
export const publicEnv = {
    get NODE_ENV() {
        return process.env.NODE_ENV
    },

    // Site identity — used by lib/data/site-config.ts
    get NEXT_PUBLIC_SITE_URL() {
        return process.env.NEXT_PUBLIC_SITE_URL
    },
    get NEXT_PUBLIC_SITE_NAME() {
        return process.env.NEXT_PUBLIC_SITE_NAME
    },
    get NEXT_PUBLIC_SITE_DESCRIPTION() {
        return process.env.NEXT_PUBLIC_SITE_DESCRIPTION
    },
    get NEXT_PUBLIC_TWITTER_HANDLE() {
        return process.env.NEXT_PUBLIC_TWITTER_HANDLE
    },
    get NEXT_PUBLIC_FACEBOOK_APP_ID() {
        return process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    },
    get NEXT_PUBLIC_LOCALE() {
        return process.env.NEXT_PUBLIC_LOCALE
    },
    get NEXT_PUBLIC_ENABLE_INDEXING() {
        return process.env.NEXT_PUBLIC_ENABLE_INDEXING
    },

    // Analytics — used by lib/analytics/config.ts
    get NEXT_PUBLIC_GA_MEASUREMENT_ID() {
        return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    },
    get NEXT_PUBLIC_CLARITY_PROJECT_ID() {
        return process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
    },
    get NEXT_PUBLIC_GTM_ID() {
        return process.env.NEXT_PUBLIC_GTM_ID
    },
    get NEXT_PUBLIC_FACEBOOK_PIXEL_ID() {
        return process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID
    },

    // Feature flags
    get NEXT_PUBLIC_ENABLE_MOBILE_CALL_BUTTON() {
        return process.env.NEXT_PUBLIC_ENABLE_MOBILE_CALL_BUTTON
    },
    get NEXT_PUBLIC_ALLOW_CRAWLING() {
        return process.env.NEXT_PUBLIC_ALLOW_CRAWLING
    },
    get NEXT_PUBLIC_BETA_MODE() {
        return process.env.NEXT_PUBLIC_BETA_MODE
    },
    get NEXT_PUBLIC_CHAT_ENABLED() {
        return process.env.NEXT_PUBLIC_CHAT_ENABLED
    },
    get NEXT_PUBLIC_LOQUENT_CHAT_ENABLED() {
        return process.env.NEXT_PUBLIC_LOQUENT_CHAT_ENABLED
    },
    get NEXT_PUBLIC_ENABLE_COOKIE_BANNER() {
        return process.env.NEXT_PUBLIC_ENABLE_COOKIE_BANNER
    },
}
