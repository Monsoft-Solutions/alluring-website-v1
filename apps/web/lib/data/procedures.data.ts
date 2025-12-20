import type { Procedure } from '@/lib/types/procedure.type'

// Import individual procedure data files
import { breastAugmentationMiami } from './procedures/breast-augmentation-miami.data'
import { breastLiftMiami } from './procedures/breast-lift-miami.data'
import { breastReductionMiami } from './procedures/breast-reduction-miami.data'
import { liposuctionMiami } from './procedures/liposuction-miami.data'
import { brazilianButtLiftBblMiami } from './procedures/brazilian-butt-lift-bbl-miami.data'
import { tummyTuckMiami } from './procedures/tummy-tuck-miami.data'
import { mommyMakeoverMiami } from './procedures/mommy-makeover-miami.data'
import { faceliftMiami } from './procedures/facelift-miami.data'
import { blepharoplastyMiami } from './procedures/blepharoplasty-miami.data'

export const procedures: Procedure[] = [
    breastAugmentationMiami,
    breastLiftMiami,
    breastReductionMiami,
    liposuctionMiami,
    brazilianButtLiftBblMiami,
    tummyTuckMiami,
    mommyMakeoverMiami,
    faceliftMiami,
    blepharoplastyMiami,
]

export const getProcedureBySlug = (slug: string): Procedure | undefined => {
    return procedures.find((procedure) => procedure.slug === slug)
}

export const getProceduresByCategory = (
    category: 'face' | 'breast' | 'body' | 'combined'
): Procedure[] => {
    return procedures.filter((procedure) => procedure.category === category)
}
