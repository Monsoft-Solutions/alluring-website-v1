export type BeforeAfterPairListItem = {
    id: string
    beforeMediaId: string
    beforeMediaUrl: string
    beforeMediaTitle: string
    afterMediaId: string
    afterMediaUrl: string
    afterMediaTitle: string
    procedureType: string | null
    procedureSlug: string | null
    patientInfo: string | null
    timeframe: string | null
    isFeatured: boolean
    displayOrder: number
    createdAt: Date
}

export type BeforeAfterPairDetail = {
    id: string
    beforeMediaId: string
    afterMediaId: string
    procedureType: string | null
    patientInfo: string | null
    timeframe: string | null
    isFeatured: boolean
    displayOrder: number
    createdAt: Date
    updatedAt: Date
}
