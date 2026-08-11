/**
 * Autopilot Notification Service
 *
 * Transactional emails for the autopilot loop, sent to the practice owner:
 * - Draft ready: a content run produced a post awaiting review.
 * - Run failed: a job errored and autopilot is paused until acknowledged.
 * - Draft cap reached: reviews are piling up (throttled to one per 24h).
 *
 * Deliberately admin-local and dependency-light (plain inline HTML, no
 * react-email): the full email stack lives in apps/web and pulling it in
 * here would couple the two apps. Every send is logged to the shared
 * email_log table; when the Resend env vars are missing the service no-ops
 * with a log line — a missing email must never fail a run.
 *
 * @module @/lib/services/autopilot-notification.service
 */
import { and, desc, gte, like } from 'drizzle-orm'
import { Resend } from 'resend'

import { db } from '@workspace/db/client'
import { emailLog } from '@workspace/db/schema/emails'

import { env } from '@/env'

const SUBJECT_PREFIX = '[Autopilot]'

function getResendConfig(): {
    resend: Resend
    from: string
    to: string
} | null {
    if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !env.OWNER_EMAIL) {
        console.log(
            '[Autopilot Notify] Email env not configured (RESEND_API_KEY / RESEND_FROM_EMAIL / OWNER_EMAIL) — skipping notification'
        )
        return null
    }
    return {
        resend: new Resend(env.RESEND_API_KEY),
        from: env.RESEND_FROM_EMAIL,
        to: env.OWNER_EMAIL,
    }
}

function adminLink(path: string): string {
    return env.ADMIN_BASE_URL
        ? `${env.ADMIN_BASE_URL.replace(/\/$/, '')}${path}`
        : path
}

/** Brand-minimal HTML shell (stone ground, gold accent, serif heading). */
function emailShell(heading: string, bodyHtml: string): string {
    return `<!doctype html>
<html>
<body style="margin:0;padding:32px 16px;background:#fafaf9;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#292524;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:8px;padding:32px;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#a8a29e;">Alluring Plastic Surgery · Blog Autopilot</p>
        <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:500;color:#1c1917;">${heading}</h1>
        ${bodyHtml}
    </div>
</body>
</html>`
}

async function sendAndLog(subject: string, html: string): Promise<void> {
    const config = getResendConfig()
    if (!config) return

    try {
        const { data, error } = await config.resend.emails.send({
            from: config.from,
            to: config.to,
            subject,
            html,
        })

        await db.insert(emailLog).values({
            to: config.to,
            from: config.from,
            subject,
            status: error ? 'failed' : 'sent',
            resendEmailId: data?.id ?? null,
            error: error ? error.message : null,
        })

        if (error) {
            console.error(`[Autopilot Notify] Resend error: ${error.message}`)
        } else {
            console.log(`[Autopilot Notify] Sent "${subject}"`)
        }
    } catch (error) {
        // Never let a notification failure propagate into the run
        console.error('[Autopilot Notify] Failed to send:', error)
    }
}

/** A content run produced a Draft awaiting human review. */
export async function notifyAutopilotDraftReady(input: {
    postId: string
    title: string
    qualityScore: number | null
}): Promise<void> {
    const score =
        input.qualityScore !== null ? `${input.qualityScore}/100` : 'not scored'
    const subject = `${SUBJECT_PREFIX} Draft ready: ${input.title}`
    const html = emailShell(
        'A new draft is ready for review',
        `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;">Autopilot wrote <strong>${input.title}</strong> and it is now in Draft.</p>
         <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">Review quality score: <strong>${score}</strong>. Low scores deserve review attention first.</p>
         <a href="${adminLink(`/blog/pipeline`)}" style="display:inline-block;background:#1c1917;color:#fafaf9;text-decoration:none;font-size:14px;padding:10px 20px;border-radius:6px;">Review in the pipeline</a>`
    )
    await sendAndLog(subject, html)
}

/** A run failed; autopilot pauses that job until acknowledged in settings. */
export async function notifyAutopilotFailure(input: {
    runId: string
    kind: 'ideation' | 'content'
    topicTitle?: string
    error: string
}): Promise<void> {
    const subject = `${SUBJECT_PREFIX} ${input.kind === 'content' ? 'Content' : 'Ideation'} run failed`
    const html = emailShell(
        `The ${input.kind} run failed`,
        `${
            input.topicTitle
                ? `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;">While working on: <strong>${input.topicTitle}</strong></p>`
                : ''
        }
         <p style="margin:0 0 12px;font-size:15px;line-height:1.6;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:12px;color:#7f1d1d;">${input.error}</p>
         <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">Autopilot will not run this job again until the failure is acknowledged in Blog AI Settings.</p>
         <a href="${adminLink(`/blog/settings`)}" style="display:inline-block;background:#1c1917;color:#fafaf9;text-decoration:none;font-size:14px;padding:10px 20px;border-radius:6px;">Open settings</a>`
    )
    await sendAndLog(subject, html)
}

/**
 * The draft cap paused content runs. Throttled: sent at most once per 24h
 * (checked against email_log).
 */
export async function notifyAutopilotDraftCap(input: {
    draftCount: number
    cap: number
}): Promise<void> {
    const subject = `${SUBJECT_PREFIX} Paused: ${input.draftCount} drafts awaiting review`

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const [recent] = await db
        .select({ id: emailLog.id })
        .from(emailLog)
        .where(
            and(
                like(emailLog.subject, `${SUBJECT_PREFIX} Paused:%`),
                gte(emailLog.sentAt, dayAgo)
            )
        )
        .orderBy(desc(emailLog.sentAt))
        .limit(1)
    if (recent) {
        console.log('[Autopilot Notify] Draft-cap reminder throttled (24h)')
        return
    }

    const html = emailShell(
        'Autopilot is paused — drafts need review',
        `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;"><strong>${input.draftCount}</strong> posts are sitting in Draft (cap: ${input.cap}). Content runs stay paused until the queue is reviewed.</p>
         <a href="${adminLink(`/blog/pipeline`)}" style="display:inline-block;background:#1c1917;color:#fafaf9;text-decoration:none;font-size:14px;padding:10px 20px;border-radius:6px;">Review drafts</a>`
    )
    await sendAndLog(subject, html)
}
