/**
 * Dr. Karlinsky's verified credentials now live in the claims canon module,
 * `@workspace/shared/claims/surgeon` (issue #354), so the admin and
 * `packages/ai` read the same sentences. This file re-exports them so
 * existing imports keep working; import from the shared module in new code.
 *
 * @module
 */
export {
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
    KARLINSKY_CREDENTIALS,
    KARLINSKY_ABS_CERTIFIED_ON,
    KARLINSKY_FLORIDA_LICENSE,
    FLORIDA_UNAPPROVED_BOARD_STATEMENT,
    karlinskyRecords,
} from '@workspace/shared/claims/surgeon'
