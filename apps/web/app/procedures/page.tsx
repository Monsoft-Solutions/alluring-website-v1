import type { Metadata } from 'next'
import { procedures } from '@/lib/data/procedures.data'
import { ProceduresPageContent } from '@/components/procedures/procedures-page-content.component'

export const metadata: Metadata = {
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
}

export default function ProceduresPage() {
    return <ProceduresPageContent procedures={procedures} />
}
