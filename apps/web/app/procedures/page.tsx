import { procedures } from '@/lib/data/procedures.data'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { ProceduresPageContent } from '@/components/procedures/procedures-page-content.component'

export const metadata = toNextMetadata(seoConfig, {
    canonical: '/procedures',
    title: 'Procedures | Transform Your Look with Confidence',
    description:
        'Discover our comprehensive range of cosmetic procedures at Alluring Plastic Surgery Miami. Expert surgeons, natural results, and personalized care.',
    keywords: [
        'plastic surgery miami',
        'cosmetic surgery miami',
        'breast augmentation',
        'brazilian butt lift',
        'tummy tuck',
        'mommy makeover',
    ],
})

export default function ProceduresPage() {
    return <ProceduresPageContent procedures={procedures} />
}
