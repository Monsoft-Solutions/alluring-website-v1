/**
 * SEO Digest Notification Service
 *
 * The weekly `[SEO]` email for the refresh loop (epic #144): cannibalization
 * findings with their competing URLs and registry owner, plus snapshot sync
 * health. Phases 3 and 5 extend it with refresh-queue entries and measured
 * outcomes — one digest, not three separate mails (plan §0).
 *
 * Follows the autopilot notification conventions: admin-local, plain inline
 * HTML, every send logged to email_log, no-op with a log line when the
 * Resend env vars are missing — a missing email must never fail a run.
 * Throttled to one digest per 6 days via email_log, so the daily cron tick
 * can't double-send a week.
 *
 * @module @/lib/services/seo-digest-notification.service
 */
import { and, desc, gte, like } from 'drizzle-orm'
import { Resend } from 'resend'

import { db } from '@workspace/db/client'
import { emailLog } from '@workspace/db/schema/emails'
import type { CannibalizationFinding } from '@workspace/db/types'

import { env } from '@/env'
import type { SnapshotStatus } from '@/lib/queries/gsc-snapshot.query'
import type {
    DigestQueueEntry,
    DigestRefreshOutcome,
} from '@/lib/queries/content-refresh.query'

const SUBJECT_PREFIX = '[SEO]'

/** Throttle window: one digest per 6 days survives a daily cron tick. */
const DIGEST_THROTTLE_MS = 6 * 24 * 60 * 60 * 1000

function getResendConfig(): {
    resend: Resend
    from: string
    to: string
} | null {
    if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !env.OWNER_EMAIL) {
        console.log(
            '[SEO Digest] Email env not configured (RESEND_API_KEY / RESEND_FROM_EMAIL / OWNER_EMAIL) — skipping digest'
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
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#a8a29e;">Alluring Plastic Surgery · SEO Health</p>
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
            console.error(`[SEO Digest] Resend error: ${error.message}`)
        } else {
            console.log(`[SEO Digest] Sent "${subject}"`)
        }
    } catch (error) {
        // Never let a notification failure propagate into the run
        console.error('[SEO Digest] Failed to send:', error)
    }
}

function findingRow(finding: CannibalizationFinding): string {
    const kindLabel =
        finding.kind === 'shared-impressions'
            ? 'Split impressions'
            : 'Top URL flip-flop'

    const pages = finding.pages
        .slice(0, 3)
        .map(
            (page) =>
                `<li style="margin:2px 0;font-size:13px;line-height:1.5;color:#44403c;">${page.page} — ${Math.round(page.share * 100)}% of impressions, pos ${page.position.toFixed(1)}</li>`
        )
        .join('')

    const owner = finding.owner
        ? `<p style="margin:4px 0 0;font-size:13px;color:#78716c;">Owner (${finding.owner.source === 'registry' ? 'registry' : 'top performer'}): <strong>${finding.owner.url}</strong></p>`
        : ''

    return `<div style="margin:0 0 14px;padding:12px 14px;border:1px solid #e7e5e4;border-radius:6px;">
        <p style="margin:0 0 2px;font-size:14px;"><strong>${finding.query}</strong> · ${kindLabel} · ${finding.totalImpressions} impressions</p>
        <ul style="margin:6px 0 0;padding-left:18px;">${pages}</ul>
        ${owner}
    </div>`
}

const QUEUE_STATUS_LABELS: Record<DigestQueueEntry['status'], string> = {
    pending: 'pending',
    in_progress: 'running',
    ready_for_review: 'awaiting review',
    applied: 'already applied',
    dismissed: 'dismissed',
    failed: 'failed',
}

function queueRow(entry: DigestQueueEntry): string {
    const sources = [
        ...new Set(entry.sources.map((signal) => signal.source)),
    ].join(', ')
    return `<li style="margin:2px 0;font-size:13px;line-height:1.5;color:#44403c;"><strong>${entry.postTitle}</strong> — ${sources} · score ${entry.score.toFixed(1)} · ${QUEUE_STATUS_LABELS[entry.status]}</li>`
}

const VERDICT_COLORS: Record<
    DigestRefreshOutcome['outcome']['verdict'],
    string
> = {
    improved: 'color:#065f46;',
    flat: 'color:#57534e;',
    declined: 'color:#b91c1c;',
}

function outcomeRow(entry: DigestRefreshOutcome): string {
    const { before, after, verdict } = entry.outcome
    const rollback =
        verdict === 'declined'
            ? `<p style="margin:2px 0 0;font-size:13px;color:#78716c;">Consider a rollback: <a href="${adminLink(`/blog/refresh/${entry.candidateId}`)}" style="color:#b91c1c;">review this refresh</a>.</p>`
            : ''
    return `<div style="margin:0 0 10px;">
        <p style="margin:0;font-size:13px;line-height:1.5;color:#44403c;"><strong>${entry.postTitle}</strong> — <strong style="${VERDICT_COLORS[verdict]}">${verdict}</strong> · clicks ${before.clicks} → ${after.clicks} · position ${before.avgPosition.toFixed(1)} → ${after.avgPosition.toFixed(1)}</p>
        ${rollback}
    </div>`
}

/**
 * Send the weekly SEO digest (throttled to one per 6 days).
 *
 * @returns Whether a digest was actually sent
 */
export async function notifySeoWeeklyDigest(input: {
    weekStart: string
    weekEnd: string
    findings: CannibalizationFinding[]
    snapshot: SnapshotStatus
    /** Refresh candidates detected in the digest window (Phase 5). */
    queueEntries: DigestQueueEntry[]
    /** 28-day outcomes measured in the digest window (Phase 5). */
    outcomes: DigestRefreshOutcome[]
}): Promise<boolean> {
    const throttleCutoff = new Date(Date.now() - DIGEST_THROTTLE_MS)
    const [recent] = await db
        .select({ id: emailLog.id })
        .from(emailLog)
        .where(
            and(
                like(emailLog.subject, `${SUBJECT_PREFIX} Weekly digest%`),
                gte(emailLog.sentAt, throttleCutoff)
            )
        )
        .orderBy(desc(emailLog.sentAt))
        .limit(1)
    if (recent) {
        console.log('[SEO Digest] Throttled (sent within the last 6 days)')
        return false
    }

    const subject = `${SUBJECT_PREFIX} Weekly digest: ${input.findings.length} cannibalization ${input.findings.length === 1 ? 'finding' : 'findings'}`

    const findingsHtml =
        input.findings.length > 0
            ? input.findings.slice(0, 10).map(findingRow).join('')
            : `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#44403c;">No queries where our pages compete against each other this week. Clean.</p>`

    const truncated =
        input.findings.length > 10
            ? `<p style="margin:0 0 12px;font-size:13px;color:#78716c;">…and ${input.findings.length - 10} more in the dashboard.</p>`
            : ''

    const queueHtml =
        input.queueEntries.length > 0
            ? `<p style="margin:0 0 6px;font-size:14px;"><strong>Refresh queue this week</strong> — ${input.queueEntries.length} candidate${input.queueEntries.length === 1 ? '' : 's'}:</p>
               <ul style="margin:0 0 16px;padding-left:18px;">${input.queueEntries.slice(0, 10).map(queueRow).join('')}</ul>`
            : `<p style="margin:0 0 16px;font-size:13px;color:#78716c;">Refresh queue: no new candidates this week.</p>`

    const outcomesHtml =
        input.outcomes.length > 0
            ? `<p style="margin:0 0 6px;font-size:14px;"><strong>Refresh outcomes</strong> — 28-day results measured this week:</p>
               <div style="margin:0 0 16px;">${input.outcomes.map(outcomeRow).join('')}</div>`
            : ''

    const syncLine = input.snapshot.lastRun
        ? `Snapshots: ${input.snapshot.coveredDays} days stored (${input.snapshot.earliestDate ?? '—'} → ${input.snapshot.latestDate ?? '—'}), last sync ${input.snapshot.lastRun.status}.`
        : `Snapshots: no sync has run yet.`

    const html = emailShell(
        `SEO health — week of ${input.weekStart}`,
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Cannibalization check for <strong>${input.weekStart} → ${input.weekEnd}</strong>:</p>
         ${findingsHtml}
         ${truncated}
         ${queueHtml}
         ${outcomesHtml}
         <p style="margin:0 0 20px;font-size:13px;color:#78716c;">${syncLine}</p>
         <a href="${adminLink(`/seo`)}" style="display:inline-block;background:#1c1917;color:#fafaf9;text-decoration:none;font-size:14px;padding:10px 20px;border-radius:6px;">Open the SEO dashboard</a>`
    )

    await sendAndLog(subject, html)
    return true
}

/**
 * Tell the admin a refreshed draft is waiting on the diff review screen
 * (epic #144, #148). Not throttled — each refresh is one actionable event.
 */
export async function notifyRefreshReadyForReview(input: {
    candidateId: string
    postTitle: string
    changeSummary: string | null
}): Promise<void> {
    const subject = `${SUBJECT_PREFIX} Refresh ready for review: ${input.postTitle}`

    const summaryHtml = input.changeSummary
        ? `<ul style="margin:0 0 20px;padding-left:18px;">${input.changeSummary
              .split('\n')
              .filter((line) => line.trim().length > 0)
              .map(
                  (line) =>
                      `<li style="margin:4px 0;font-size:14px;line-height:1.5;color:#44403c;">${line.replace(/^[-•]\s*/, '')}</li>`
              )
              .join('')}</ul>`
        : `<p style="margin:0 0 20px;font-size:14px;color:#78716c;">Open the review screen for the full diff.</p>`

    const html = emailShell(
        'A refreshed draft is ready',
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;"><strong>${input.postTitle}</strong> has been refreshed and awaits your review. Nothing changes on the live site until you apply it.</p>
         ${summaryHtml}
         <a href="${adminLink(`/blog/refresh/${input.candidateId}`)}" style="display:inline-block;background:#1c1917;color:#fafaf9;text-decoration:none;font-size:14px;padding:10px 20px;border-radius:6px;">Review the changes</a>`
    )

    await sendAndLog(subject, html)
}
