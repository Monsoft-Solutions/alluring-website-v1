import { redirect } from 'next/navigation'

type AcceptInvitationPageProps = {
    params: Promise<{
        id: string
    }>
}

/**
 * Accept Invitation Redirect Page
 *
 * Redirects to signup with the invitation ID as a query parameter.
 * This allows users to create an account and automatically join the organization.
 */
export default async function AcceptInvitationPage({
    params,
}: AcceptInvitationPageProps) {
    const { id } = await params

    // Redirect to signup with invitation ID
    redirect(`/signup?invitation=${id}`)
}
