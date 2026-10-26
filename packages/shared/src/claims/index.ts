/**
 * @workspace/shared/claims
 *
 * The claims canon (docs/claims/canon.md, issue #354) as data and pure
 * functions: who the practice is, the surgeon's verified credentials, the
 * price sheet and its math, financing, contact, trust facts, the claim token
 * grammar and the prompt blocks. See README.md in this folder.
 *
 * This barrel is for server code, the admin and `packages/ai`. Client
 * components import the one subpath they need (`@workspace/shared/claims/pricing`
 * for the formatters) and receive resolved prices as props. The regex list
 * is not re-exported here: import `@workspace/shared/claims/patterns`.
 */
export * from './identity'
export * from './surgeon'
export * from './pricing'
export * from './prices'
export * from './financing'
export * from './contact'
export * from './trust'
export * from './tokens'
export * from './typed-prices'
export * from './prompt'
