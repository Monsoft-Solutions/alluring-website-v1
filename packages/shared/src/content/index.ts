/**
 * @workspace/shared/content
 *
 * The contract between what the AI pipeline writes and what the blog renderer
 * can render. See `mdx-contract.constant.ts` for why it is centralised.
 */
export {
    MDX_RENDERER_COMPONENTS,
    MDX_WRITER_COMPONENTS,
    MDX_COMPONENT_SPECS,
    FIGURE_SRC_PLACEHOLDER,
    isResolvedImageSrc,
    BLOG_CTA_IDS,
    DEFAULT_BLOG_CTA_ID,
    BLOG_CTA_MARKER_PATTERN,
    buildCtaMarker,
    isBlogCtaId,
    isRenderableComponent,
    isWriterComponent,
    buildMdxComponentReference,
    type MdxComponentName,
    type MdxWriterComponentName,
    type MdxPropSpec,
    type MdxComponentSpec,
    type BlogCtaId,
} from './mdx-contract.constant'

export {
    serializeQuickAnswer,
    parseQuickAnswer,
    type QuickAnswerParts,
} from './quick-answer.util'

export {
    analyzeGeoStructure,
    runGeoAuditGate,
    BUSINESS_DOMAIN,
    GEO_AUDIT_THRESHOLDS,
    type GeoStructureAnalysis,
    type GeoAuditGateResult,
    type SectionHeading,
} from './geo-audit.util'
