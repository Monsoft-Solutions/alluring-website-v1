/**
 * @workspace/shared/seo
 *
 * Keyword ownership registry: one owner per query cluster, site-wide.
 */
export type {
    PageIntent,
    OwnedPageKind,
    OwnedPageStatus,
    MustNotTarget,
    OwnedPage,
    QueryOwnership,
    SimilarOwnedQuery,
} from './keyword-ownership.type'

export { MARKETING_PAGE_ENTRIES } from './keyword-ownership.constant'
export { BLOG_POST_ENTRIES } from './keyword-ownership-blog.constant'

export {
    getKeywordRegistry,
    normalizeQuery,
    resolveQueryOwner,
    resolveCanonicalOwner,
    getOwnerForUrl,
    findSimilarOwnedQueries,
    getRegistryIntegrityIssues,
} from './keyword-ownership.util'

export {
    evaluateTopicCandidate,
    type TopicCandidate,
    type TopicVerdict,
    type TopicVerdictKind,
    type EvaluateTopicOptions,
} from './topic-gate.util'
