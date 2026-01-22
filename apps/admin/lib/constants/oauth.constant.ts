/**
 * OAuth-related constants
 *
 * Shared configuration for OAuth flows (Google, etc.)
 */

/**
 * Cookie name for storing OAuth state parameter
 * Used for CSRF protection during OAuth flow
 */
export const OAUTH_STATE_COOKIE = 'oauth_state'

/**
 * Max age for OAuth state cookie in seconds (10 minutes)
 * Should be long enough for user to complete OAuth flow
 */
export const OAUTH_STATE_COOKIE_MAX_AGE = 600
