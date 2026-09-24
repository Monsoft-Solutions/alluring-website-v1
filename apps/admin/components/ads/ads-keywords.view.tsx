'use client'

/**
 * /ads/keywords — where is money wasted? Keywords carry leads (Google's
 * click report names the keyword behind each lead); search terms are judged
 * on spend and Google's conversions, since no report names the term behind a
 * lead; landing pages carry the leads that landed on them.
 */
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, ClipboardCopy, Settings2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { Switch } from '@workspace/ui/components/switch'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs'
import { cn } from '@workspace/ui/lib/utils'

import { AdsHeader } from '@/components/ads/ads-header.component'
import { useAdsRange } from '@/components/ads/ads-range.context'
import {
    AdsChip,
    AdsEmpty,
    AdsPanel,
    AdsQueryState,
    CPL_TONE_CLASS,
    KpiRow,
    KpiTile,
    type ChipTone,
} from '@/components/ads/ads-ui.component'
import {
    useAdsKeywords,
    useAdsLandingPages,
    useAdsSearchTerms,
    useTermClasses,
    useTermClassMutations,
} from '@/hooks/use-ads.hook'
import type {
    AdsKeywordRow,
    AdsLandingPageRow,
    AdsSearchTermRow,
    TermClassName,
} from '@/lib/types/ads/ads.type'
import {
    costPerLeadTone,
    formatConversions,
    formatCount,
    formatMoney,
    formatMoneyWhole,
    formatPercent,
    humanizeEnum,
} from '@/lib/utils/ads/ads-format.util'
import { toExactMatchNegatives } from '@/lib/utils/ads/term-class.util'

const PAGE_SIZE = 50

/** The host of a final URL, or the raw value if it doesn't parse. */
function hostOf(url: string): string {
    try {
        return new URL(url).host
    } catch {
        return url
    }
}

const MATCH_TONES: Record<string, ChipTone> = {
    BROAD: 'warn',
    PHRASE: 'neutral',
    EXACT: 'good',
}

const CLASS_TONES: Record<TermClassName, ChipTone> = {
    brand: 'good',
    competitor: 'bad',
    procedure: 'gold',
    address: 'warn',
    other: 'neutral',
}

const TERM_CLASSES: TermClassName[] = [
    'brand',
    'competitor',
    'procedure',
    'address',
    'other',
]

function MoreRows({
    shown,
    total,
    onMore,
}: {
    shown: number
    total: number
    onMore: () => void
}) {
    if (shown >= total) return null
    return (
        <div className='flex justify-center p-3'>
            <Button variant='ghost' size='sm' onClick={onMore}>
                Show {Math.min(PAGE_SIZE, total - shown)} more of{' '}
                {total - shown}
            </Button>
        </div>
    )
}

// ============================================
// Tables
// ============================================

export function AdsKeywordsTable({
    keywords,
    hideCampaign = false,
}: {
    keywords: AdsKeywordRow[]
    hideCampaign?: boolean
}) {
    const [shown, setShown] = useState(PAGE_SIZE)
    if (keywords.length === 0) {
        return <AdsEmpty title='No keyword spent in this window' />
    }
    const accountCpl = (() => {
        const cost = keywords.reduce((sum, row) => sum + row.cost, 0)
        const leads = keywords.reduce((sum, row) => sum + row.leads, 0)
        return leads > 0 ? cost / leads : null
    })()

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead>Match</TableHead>
                        {!hideCampaign && <TableHead>Campaign</TableHead>}
                        <TableHead className='text-right'>Spend</TableHead>
                        <TableHead className='text-right'>Clicks</TableHead>
                        <TableHead className='text-right'>
                            Google conv.
                        </TableHead>
                        <TableHead className='text-right'>Leads</TableHead>
                        <TableHead className='text-right'>
                            Cost / lead
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {keywords.slice(0, shown).map((row) => {
                        const tone = costPerLeadTone(
                            row.costPerLead,
                            accountCpl,
                            row.leads,
                            row.cost
                        )
                        return (
                            <TableRow
                                key={`${row.adGroupId}-${row.keyword}-${row.matchType}`}
                            >
                                <TableCell className='max-w-[260px]'>
                                    <span className='font-medium'>
                                        {row.keyword}
                                    </span>
                                    <span className='text-muted-foreground block truncate text-xs'>
                                        {row.adGroupName}
                                        {row.qualityScore !== null &&
                                            ` · QS ${row.qualityScore}`}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <AdsChip
                                        tone={
                                            MATCH_TONES[row.matchType] ??
                                            'neutral'
                                        }
                                    >
                                        {humanizeEnum(row.matchType)}
                                    </AdsChip>
                                </TableCell>
                                {!hideCampaign && (
                                    <TableCell className='max-w-[200px] truncate text-xs'>
                                        {row.campaignName}
                                    </TableCell>
                                )}
                                <TableCell className='text-right tabular-nums'>
                                    {formatMoney(row.cost)}
                                </TableCell>
                                <TableCell className='text-right tabular-nums'>
                                    {formatCount(row.clicks)}
                                </TableCell>
                                <TableCell className='text-right tabular-nums'>
                                    {formatConversions(row.googleConversions)}
                                </TableCell>
                                <TableCell className='text-right font-medium tabular-nums'>
                                    {formatCount(row.leads)}
                                </TableCell>
                                <TableCell
                                    className={`text-right tabular-nums ${CPL_TONE_CLASS[tone]}`}
                                >
                                    {row.costPerLead !== null
                                        ? formatMoneyWhole(row.costPerLead)
                                        : 'no lead'}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            <MoreRows
                shown={shown}
                total={keywords.length}
                onMore={() => setShown((n) => n + PAGE_SIZE)}
            />
        </>
    )
}

export function AdsSearchTermsTable({
    terms,
    hideCampaign = false,
}: {
    terms: AdsSearchTermRow[]
    hideCampaign?: boolean
}) {
    const [shown, setShown] = useState(PAGE_SIZE)
    if (terms.length === 0) {
        return <AdsEmpty title='No search terms in this window' />
    }
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Search term</TableHead>
                        <TableHead>Class</TableHead>
                        {!hideCampaign && <TableHead>Campaign</TableHead>}
                        <TableHead className='text-right'>Spend</TableHead>
                        <TableHead className='text-right'>Clicks</TableHead>
                        <TableHead className='text-right'>
                            Google conv.
                        </TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {terms.slice(0, shown).map((row) => (
                        <TableRow key={`${row.campaignId}-${row.searchTerm}`}>
                            <TableCell className='max-w-[280px]'>
                                <span className='font-medium break-words'>
                                    {row.searchTerm}
                                </span>
                                <span className='text-muted-foreground block text-xs'>
                                    {row.matchTypes
                                        .map(humanizeEnum)
                                        .join(', ')}
                                </span>
                            </TableCell>
                            <TableCell>
                                <AdsChip tone={CLASS_TONES[row.termClass]}>
                                    {humanizeEnum(row.termClass)}
                                </AdsChip>
                            </TableCell>
                            {!hideCampaign && (
                                <TableCell className='max-w-[180px] truncate text-xs'>
                                    {row.campaignName}
                                </TableCell>
                            )}
                            <TableCell className='text-right tabular-nums'>
                                {formatMoney(row.cost)}
                            </TableCell>
                            <TableCell className='text-right tabular-nums'>
                                {formatCount(row.clicks)}
                            </TableCell>
                            <TableCell
                                className={cn(
                                    'text-right tabular-nums',
                                    row.googleConversions === 0 &&
                                        row.cost > 0 &&
                                        'text-rose-700'
                                )}
                            >
                                {formatConversions(row.googleConversions)}
                            </TableCell>
                            <TableCell>
                                <AdsChip
                                    tone={
                                        row.status === 'EXCLUDED'
                                            ? 'good'
                                            : row.status === 'ADDED'
                                              ? 'info'
                                              : 'neutral'
                                    }
                                >
                                    {row.status === 'EXCLUDED'
                                        ? 'Negative'
                                        : row.status === 'ADDED'
                                          ? 'Keyword'
                                          : 'Not negative'}
                                </AdsChip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <MoreRows
                shown={shown}
                total={terms.length}
                onMore={() => setShown((n) => n + PAGE_SIZE)}
            />
        </>
    )
}

export function AdsLandingPagesTable({
    pages,
}: {
    pages: AdsLandingPageRow[]
}) {
    if (pages.length === 0) {
        return <AdsEmpty title='No landing page spent in this window' />
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className='text-right'>Spend</TableHead>
                    <TableHead className='text-right'>Clicks</TableHead>
                    <TableHead className='text-right'>Google conv.</TableHead>
                    <TableHead className='text-right'>Leads</TableHead>
                    <TableHead className='text-right'>Cost / lead</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {pages.map((row) => (
                    <TableRow key={row.page}>
                        <TableCell className='max-w-[360px]'>
                            <span className='font-mono text-xs font-medium'>
                                {row.path}
                            </span>
                            <span
                                className='text-muted-foreground block truncate text-xs'
                                title={row.sampleUrl}
                            >
                                {hostOf(row.page)} · {row.urlVariants} tagged
                                URL
                                {row.urlVariants === 1 ? '' : 's'}
                            </span>
                        </TableCell>
                        <TableCell className='text-right tabular-nums'>
                            {formatMoney(row.cost)}
                        </TableCell>
                        <TableCell className='text-right tabular-nums'>
                            {formatCount(row.clicks)}
                        </TableCell>
                        <TableCell className='text-right tabular-nums'>
                            {formatConversions(row.googleConversions)}
                        </TableCell>
                        <TableCell className='text-right font-medium tabular-nums'>
                            {formatCount(row.leads)}
                        </TableCell>
                        <TableCell className='text-right tabular-nums'>
                            {row.costPerLead !== null
                                ? formatMoneyWhole(row.costPerLead)
                                : row.cost > 0
                                  ? 'no lead'
                                  : '—'}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

// ============================================
// Term class editor
// ============================================

function TermClassEditor() {
    const { data } = useTermClasses()
    const { save, remove } = useTermClassMutations()
    const [pattern, setPattern] = useState('')
    const [termClass, setTermClass] = useState<TermClassName>('competitor')
    const entries = data?.data ?? []

    const submit = () => {
        const value = pattern.trim()
        if (value.length < 2) return
        save.mutate(
            { pattern: value, termClass },
            {
                onSuccess: () => {
                    setPattern('')
                    toast.success(`“${value}” is now ${termClass}`)
                },
                onError: (error) =>
                    toast.error(
                        error instanceof Error ? error.message : 'Save failed'
                    ),
            }
        )
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='outline' size='sm'>
                    <Settings2 className='mr-2 h-4 w-4' />
                    Edit term classes
                </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-lg'>
                <DialogHeader>
                    <DialogTitle>Search term classes</DialogTitle>
                    <DialogDescription>
                        A term takes the class of the patterns it contains —
                        brand first, then competitor, address, procedure. Street
                        addresses and &ldquo;dr &lt;name&gt;&rdquo; or
                        &ldquo;&lt;name&gt; md&rdquo; terms are classed
                        automatically.
                    </DialogDescription>
                </DialogHeader>
                <form
                    className='flex flex-wrap gap-2'
                    onSubmit={(event) => {
                        event.preventDefault()
                        submit()
                    }}
                >
                    <Input
                        value={pattern}
                        onChange={(event) => setPattern(event.target.value)}
                        placeholder='e.g. vanity cosmetic'
                        aria-label='Pattern'
                        className='min-w-0 flex-1'
                    />
                    <Select
                        value={termClass}
                        onValueChange={(value) =>
                            setTermClass(value as TermClassName)
                        }
                    >
                        <SelectTrigger className='w-[140px]' aria-label='Class'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TERM_CLASSES.map((value) => (
                                <SelectItem key={value} value={value}>
                                    {humanizeEnum(value)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button type='submit' size='sm' disabled={save.isPending}>
                        Add
                    </Button>
                </form>
                <ul className='divide-y text-sm'>
                    {entries.map((entry) => (
                        <li
                            key={entry.id}
                            className='flex items-center justify-between gap-2 py-1.5'
                        >
                            <span className='min-w-0 truncate font-mono text-xs'>
                                {entry.pattern}
                            </span>
                            <span className='flex items-center gap-2'>
                                <AdsChip tone={CLASS_TONES[entry.termClass]}>
                                    {humanizeEnum(entry.termClass)}
                                </AdsChip>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-7 w-7'
                                    aria-label={`Remove ${entry.pattern}`}
                                    disabled={remove.isPending}
                                    onClick={() => remove.mutate(entry.id)}
                                >
                                    <Trash2 className='h-3.5 w-3.5' />
                                </Button>
                            </span>
                        </li>
                    ))}
                </ul>
            </DialogContent>
        </Dialog>
    )
}

// ============================================
// Tabs
// ============================================

function KeywordsTab() {
    const { range } = useAdsRange()
    const query = useAdsKeywords(range)
    return (
        <AdsQueryState query={query}>
            {(report) => {
                const share =
                    report.totals.cost > 0
                        ? report.totals.costWithNoLead / report.totals.cost
                        : null
                return (
                    <div className='space-y-4'>
                        <KpiRow>
                            <KpiTile
                                label='Keyword spend'
                                value={formatMoney(report.totals.cost)}
                                note='Search campaigns'
                            />
                            <KpiTile
                                label='Leads via a keyword'
                                value={formatCount(
                                    report.totals.leadsViaKeyword
                                )}
                                note={`+${formatCount(report.totals.leadsWithoutKeyword)} matched with no keyword (PMax)`}
                                accent
                            />
                            <KpiTile
                                label='Spend on keywords with 0 leads'
                                value={formatMoney(
                                    report.totals.costWithNoLead
                                )}
                                note={`${formatPercent(share)} of keyword spend`}
                                noteTone={
                                    share !== null && share > 0.3
                                        ? 'bad'
                                        : undefined
                                }
                            />
                        </KpiRow>
                        <AdsPanel contentClassName='p-0 sm:p-2'>
                            <AdsKeywordsTable keywords={report.keywords} />
                        </AdsPanel>
                    </div>
                )
            }}
        </AdsQueryState>
    )
}

function SearchTermsTab() {
    const { range } = useAdsRange()
    const query = useAdsSearchTerms(range)
    const [onlyWaste, setOnlyWaste] = useState(true)
    const [classFilter, setClassFilter] = useState<TermClassName | 'all'>('all')
    const [copied, setCopied] = useState(false)

    return (
        <AdsQueryState query={query}>
            {(report) => {
                const visible = report.terms.filter(
                    (term) =>
                        (!onlyWaste ||
                            (term.googleConversions === 0 && term.cost > 0)) &&
                        (classFilter === 'all' ||
                            term.termClass === classFilter)
                )
                const share =
                    report.totals.cost > 0
                        ? report.totals.costWithNoConversion /
                          report.totals.cost
                        : null
                const competitorTerms = report.competitorNegatives
                const copyNegatives = async () => {
                    const text = toExactMatchNegatives(competitorTerms)
                    try {
                        await navigator.clipboard.writeText(text)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                        toast.success(
                            `${competitorTerms.length} competitor terms copied as exact-match negatives`
                        )
                    } catch {
                        toast.error('Clipboard unavailable')
                    }
                }

                return (
                    <div className='space-y-4'>
                        <KpiRow>
                            <KpiTile
                                label='Search term spend'
                                value={formatMoney(report.totals.cost)}
                                note='Search campaigns; PMax terms are not exposed'
                            />
                            <KpiTile
                                label='Spend with no conversion'
                                value={formatMoney(
                                    report.totals.costWithNoConversion
                                )}
                                note={`${formatPercent(share)} of term spend`}
                                noteTone={
                                    share !== null && share > 0.5
                                        ? 'bad'
                                        : undefined
                                }
                                accent
                            />
                            {(['competitor', 'brand', 'address'] as const).map(
                                (name) => (
                                    <KpiTile
                                        key={name}
                                        label={`${humanizeEnum(name)} terms`}
                                        value={formatMoney(
                                            report.totals.byClass[name].cost
                                        )}
                                        note={`${formatCount(report.totals.byClass[name].terms)} terms`}
                                    />
                                )
                            )}
                        </KpiRow>
                        <AdsPanel
                            title={
                                onlyWaste
                                    ? 'Search terms with spend and no conversion'
                                    : 'Search terms'
                            }
                            description={`${formatCount(visible.length)} terms · ${formatMoney(visible.reduce((sum, term) => sum + term.cost, 0))}`}
                            actions={
                                <>
                                    <label className='flex items-center gap-2 text-xs'>
                                        <Switch
                                            checked={onlyWaste}
                                            onCheckedChange={setOnlyWaste}
                                            aria-label='Only terms with no conversion'
                                        />
                                        No conversion only
                                    </label>
                                    <Select
                                        value={classFilter}
                                        onValueChange={(value) =>
                                            setClassFilter(
                                                value as TermClassName | 'all'
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            className='h-8 w-[140px]'
                                            aria-label='Class filter'
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='all'>
                                                All classes
                                            </SelectItem>
                                            {TERM_CLASSES.map((value) => (
                                                <SelectItem
                                                    key={value}
                                                    value={value}
                                                >
                                                    {humanizeEnum(value)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => void copyNegatives()}
                                        disabled={competitorTerms.length === 0}
                                        title='Nothing is pushed to Google — paste the list into the account'
                                    >
                                        {copied ? (
                                            <Check className='mr-2 h-4 w-4' />
                                        ) : (
                                            <ClipboardCopy className='mr-2 h-4 w-4' />
                                        )}
                                        Copy competitor negatives (
                                        {competitorTerms.length})
                                    </Button>
                                    <TermClassEditor />
                                </>
                            }
                            contentClassName='p-0 sm:p-2'
                        >
                            <AdsSearchTermsTable terms={visible} />
                        </AdsPanel>
                        <p className='text-muted-foreground max-w-[80ch] text-xs'>
                            Google&apos;s click report names the keyword behind
                            each lead but never the search term, so terms are
                            judged on spend and Google&apos;s conversions.
                            Nothing here is pushed to Google.
                        </p>
                    </div>
                )
            }}
        </AdsQueryState>
    )
}

function LandingPagesTab() {
    const { range } = useAdsRange()
    const [expanded, setExpanded] = useState(false)
    const query = useAdsLandingPages(range, { expanded })
    return (
        <AdsQueryState query={query}>
            {(report) => (
                <AdsPanel
                    title={expanded ? 'Pages served' : 'Final URLs'}
                    description='Leads are paid leads whose first page was this path.'
                    actions={
                        <label className='flex items-center gap-2 text-xs'>
                            <Switch
                                checked={expanded}
                                onCheckedChange={setExpanded}
                                aria-label='Show pages served'
                            />
                            Pages served (incl. PMax URL expansion)
                        </label>
                    }
                    contentClassName='p-0 sm:p-2'
                >
                    <AdsLandingPagesTable pages={report.pages} />
                </AdsPanel>
            )}
        </AdsQueryState>
    )
}

type KeywordsTabName = 'keywords' | 'terms' | 'pages'

export function AdsKeywordsView() {
    const searchParams = useSearchParams()
    const initial = useMemo<KeywordsTabName>(() => {
        const tab = searchParams.get('tab')
        return tab === 'terms' || tab === 'pages' ? tab : 'keywords'
    }, [searchParams])
    const [tab, setTab] = useState<KeywordsTabName>(initial)

    return (
        <div className='space-y-6'>
            <AdsHeader
                title='Keywords & terms'
                description='Leads per keyword from the click report; search terms show where money went with nothing to show'
            />
            <Tabs
                value={tab}
                onValueChange={(value) => setTab(value as KeywordsTabName)}
                className='space-y-4'
            >
                <TabsList>
                    <TabsTrigger value='keywords'>Keywords</TabsTrigger>
                    <TabsTrigger value='terms'>Search terms</TabsTrigger>
                    <TabsTrigger value='pages'>Landing pages</TabsTrigger>
                </TabsList>
                <TabsContent value='keywords'>
                    <KeywordsTab />
                </TabsContent>
                <TabsContent value='terms'>
                    <SearchTermsTab />
                </TabsContent>
                <TabsContent value='pages'>
                    <LandingPagesTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
