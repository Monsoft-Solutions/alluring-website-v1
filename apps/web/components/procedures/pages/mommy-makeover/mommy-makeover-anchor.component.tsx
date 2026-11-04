/**
 * An empty anchor for a section's old id. Live blog posts still link
 * `#how-much-does-a-mommy-makeover-cost`, `#am-i-a-good-candidate` and
 * `#recovery-getting-back-to-your-family` from before the rebuild; these keep
 * those links landing on the right section. New links use the section's own id.
 *
 * Not a `section`, so `SectionViewTracker` doesn't count it, and it carries the
 * same scroll margin as the section it sits above.
 */
export function MommyMakeoverAnchor({ id }: { id: string }) {
    return (
        <span
            id={id}
            aria-hidden='true'
            className='block scroll-mt-32 lg:scroll-mt-40'
        />
    )
}
