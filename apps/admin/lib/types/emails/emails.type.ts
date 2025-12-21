export type EmailLogListItem = {
    id: string
    to: string
    from: string
    subject: string
    status: 'sent' | 'failed' | 'pending'
    resendEmailId: string | null
    error: string | null
    sentAt: Date
    contactSubmissionId: string | null
    contactName: string | null
    contactEmail: string | null
}

export type EmailFilters = {
    status?: 'sent' | 'failed' | 'pending' | 'all'
    startDate?: Date
    endDate?: Date
}

export type EmailStats = {
    total: number
    sent: number
    failed: number
    pending: number
    successRate: number
}

export type EmailLogById = EmailLogListItem & {
    contactPhone: string | null
    contactMessage: string | null
}
