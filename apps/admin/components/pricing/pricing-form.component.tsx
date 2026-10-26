/**
 * Pricing Form Component (issue #354)
 *
 * Edits the price sheet, each procedure's starting line and discount, and
 * the site-wide settings. Every change re-renders a live preview built with
 * the same functions the website uses (`buildPricingSnapshot`,
 * `getPriceDisplay`), so what the preview shows is what the site will print:
 * the list price struck through, then the discounted price, and the plain
 * text form meta descriptions and the chat use.
 *
 * Validation (`validatePricingForm`) runs on every change and again on the
 * server; warnings (`getPricingWarnings`, e.g. a discount without the
 * 456.062 statement) never block a save.
 *
 * @module components/pricing/pricing-form
 */
'use client'

import { useMemo, useState, useTransition } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Save } from 'lucide-react'

import {
    formatPriceText,
    formatTypicalRangeText,
    getPriceDisplay,
    getPricingWarnings,
    getTypicalRange,
    hasActiveDiscount,
    resolveDiscountPercent,
    type PriceDisplay,
} from '@workspace/shared/claims/pricing'
import { TYPICAL_RANGE_PROCEDURES } from '@workspace/shared/claims/prices'
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@workspace/ui/components/alert'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
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
import { Textarea } from '@workspace/ui/components/textarea'
import { cn } from '@workspace/ui/lib/utils'

import { savePricing } from '@/lib/actions/pricing.action'
import {
    errorFor,
    toPricingSnapshot,
    validatePricingForm,
    type PricingFormLine,
    type PricingFormProcedure,
    type PricingFormValues,
} from '@/lib/utils/pricing-form.util'

/** The Select's value for "no starting price". */
const NO_STARTING_LINE = '__none__'

/** A number input's value as the form stores it: NaN for an empty field. */
function toNumber(value: string): number {
    return value.trim() === '' ? Number.NaN : Number(value)
}

/** An optional number: `null` for an empty field. */
function toOptionalNumber(value: string): number | null {
    return value.trim() === '' ? null : Number(value)
}

function numberValue(value: number | null): string | number {
    return value === null || Number.isNaN(value) ? '' : value
}

/** A price as the website prints it, and its plain-text form under it. */
function PricePreview({ display }: { display: PriceDisplay | null }) {
    if (!display) {
        return (
            <span className='text-muted-foreground text-sm'>
                No price published
            </span>
        )
    }
    return (
        <span className='flex flex-col'>
            <span className='font-medium tabular-nums'>
                {display.discounted && (
                    <>
                        <del className='text-muted-foreground font-normal'>
                            {display.list}
                        </del>{' '}
                    </>
                )}
                {display.final}
                {display.suffix ? ` ${display.suffix}` : ''}
            </span>
            {display.discounted && (
                <span className='text-muted-foreground text-xs'>
                    Text: {formatPriceText(display)}
                </span>
            )}
        </span>
    )
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null
    return <p className='text-destructive mt-1 text-xs'>{message}</p>
}

type PricingFormProps = {
    initialValues: PricingFormValues
    /** Empty tables: show the fallback sheet, but nothing can be saved. */
    readOnly?: boolean
}

export function PricingForm({
    initialValues,
    readOnly = false,
}: PricingFormProps) {
    const [values, setValues] = useState(initialValues)
    const [saved, setSaved] = useState(initialValues)
    const [serverErrors, setServerErrors] = useState<
        { path: string; message: string }[]
    >([])
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)
    const [isSaving, startSaving] = useTransition()

    const snapshot = useMemo(() => toPricingSnapshot(values), [values])
    const warnings = useMemo(() => getPricingWarnings(snapshot), [snapshot])
    const errors = useMemo(
        () => [...validatePricingForm(values), ...serverErrors],
        [values, serverErrors]
    )
    const isDirty = JSON.stringify(values) !== JSON.stringify(saved)
    const discountOn = hasActiveDiscount(snapshot)

    function update(patch: Partial<PricingFormValues>) {
        setServerErrors([])
        setMessage(null)
        setValues((current) => ({ ...current, ...patch }))
    }

    function updateProcedure(
        procedure: string,
        patch: Partial<PricingFormProcedure>
    ) {
        setServerErrors([])
        setMessage(null)
        setValues((current) => ({
            ...current,
            procedures: current.procedures.map((row) =>
                row.procedure === procedure ? { ...row, ...patch } : row
            ),
        }))
    }

    function updateLine(
        procedure: string,
        key: string,
        patch: Partial<PricingFormLine>
    ) {
        setServerErrors([])
        setMessage(null)
        setValues((current) => ({
            ...current,
            procedures: current.procedures.map((row) =>
                row.procedure === procedure
                    ? {
                          ...row,
                          lines: row.lines.map((line) =>
                              line.key === key ? { ...line, ...patch } : line
                          ),
                      }
                    : row
            ),
        }))
    }

    function handleSave() {
        if (validatePricingForm(values).length > 0) {
            setMessage({
                type: 'error',
                text: 'Fix the highlighted fields before saving.',
            })
            return
        }
        startSaving(async () => {
            const result = await savePricing(values)
            if (result.success) {
                setValues(result.values)
                setSaved(result.values)
                setServerErrors([])
                setMessage({
                    type: 'success',
                    text:
                        result.changed > 0
                            ? 'Saved. The website shows the new prices on its next request.'
                            : 'Nothing changed.',
                })
            } else {
                setServerErrors(result.errors ?? [])
                setMessage({ type: 'error', text: result.error })
            }
        })
    }

    return (
        <div className='space-y-6'>
            {warnings.length > 0 && (
                <Alert variant='destructive'>
                    <AlertTriangle className='h-4 w-4' />
                    <AlertTitle>Check before publishing</AlertTitle>
                    <AlertDescription>
                        <ul className='mt-1 list-disc space-y-1 pl-4'>
                            {warnings.map((warning) => (
                                <li
                                    key={`${warning.code}-${warning.procedure}`}
                                >
                                    {warning.message}
                                </li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {/* Site-wide settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Site-wide</CardTitle>
                    <CardDescription>
                        The default discount applies to every procedure whose
                        own discount is empty. The combination discount is a
                        fixed amount off the total, never a percentage.
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='grid gap-6 md:grid-cols-3'>
                        <div>
                            <Label htmlFor='default-discount'>
                                Default discount (%)
                            </Label>
                            <Input
                                id='default-discount'
                                type='number'
                                inputMode='numeric'
                                min={0}
                                max={90}
                                step={1}
                                disabled={readOnly}
                                value={numberValue(
                                    values.defaultDiscountPercent
                                )}
                                onChange={(event) =>
                                    update({
                                        defaultDiscountPercent: toNumber(
                                            event.target.value
                                        ),
                                    })
                                }
                            />
                            <FieldError
                                message={errorFor(
                                    errors,
                                    'defaultDiscountPercent'
                                )}
                            />
                        </div>
                        <div>
                            <Label htmlFor='combo-two'>
                                Combination discount, 2 procedures ($)
                            </Label>
                            <Input
                                id='combo-two'
                                type='number'
                                inputMode='numeric'
                                min={0}
                                step={50}
                                disabled={readOnly}
                                value={numberValue(values.comboDiscountTwoUsd)}
                                onChange={(event) =>
                                    update({
                                        comboDiscountTwoUsd: toNumber(
                                            event.target.value
                                        ),
                                    })
                                }
                            />
                            <FieldError
                                message={errorFor(
                                    errors,
                                    'comboDiscountTwoUsd'
                                )}
                            />
                        </div>
                        <div>
                            <Label htmlFor='combo-three'>
                                Combination discount, 3 procedures ($)
                            </Label>
                            <Input
                                id='combo-three'
                                type='number'
                                inputMode='numeric'
                                min={0}
                                step={50}
                                disabled={readOnly}
                                value={numberValue(
                                    values.comboDiscountThreeUsd
                                )}
                                onChange={(event) =>
                                    update({
                                        comboDiscountThreeUsd: toNumber(
                                            event.target.value
                                        ),
                                    })
                                }
                            />
                            <FieldError
                                message={errorFor(
                                    errors,
                                    'comboDiscountThreeUsd'
                                )}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor='discount-statement'>
                            Fla. Stat. 456.062 statement
                        </Label>
                        <p className='text-muted-foreground mt-1 mb-2 text-sm'>
                            Shown next to every discounted price while a
                            discount is on. Use the exact text counsel confirms.
                        </p>
                        <Textarea
                            id='discount-statement'
                            rows={4}
                            disabled={readOnly}
                            value={values.discountStatement}
                            onChange={(event) =>
                                update({
                                    discountStatement: event.target.value,
                                })
                            }
                            className={cn(
                                discountOn &&
                                    !values.discountStatement.trim() &&
                                    'border-destructive'
                            )}
                        />
                        <FieldError
                            message={errorFor(errors, 'discountStatement')}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* One card per procedure */}
            {values.procedures.map((procedure) => {
                const at = `procedures.${procedure.procedure}`
                const starting = getPriceDisplay(snapshot, procedure.procedure)
                const range = getTypicalRange(snapshot, procedure.procedure)
                const percent = resolveDiscountPercent(
                    snapshot,
                    procedure.procedure
                )
                const startingOptions = procedure.lines.filter(
                    (line) => line.active && !line.addOn
                )
                const hasRange = TYPICAL_RANGE_PROCEDURES.includes(
                    procedure.procedure
                )

                return (
                    <Card key={procedure.procedure}>
                        <CardHeader>
                            <div className='flex flex-wrap items-start justify-between gap-4'>
                                <div>
                                    <CardTitle className='capitalize'>
                                        {procedure.name}
                                    </CardTitle>
                                    <CardDescription>
                                        Token key{' '}
                                        <code>{procedure.procedure}</code>
                                        {percent > 0 && (
                                            <Badge
                                                variant='secondary'
                                                className='ml-2'
                                            >
                                                {percent}% off
                                            </Badge>
                                        )}
                                    </CardDescription>
                                </div>
                                <div className='text-right'>
                                    <p className='text-muted-foreground text-xs tracking-wide uppercase'>
                                        Starting at
                                    </p>
                                    <PricePreview display={starting} />
                                    {range && (
                                        <p className='text-muted-foreground mt-1 max-w-xs text-xs'>
                                            {formatTypicalRangeText(range)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            <div className='grid gap-6 md:grid-cols-4'>
                                <div className='md:col-span-2'>
                                    <Label htmlFor={`${at}-starting`}>
                                        Starting-at line
                                    </Label>
                                    <Select
                                        disabled={readOnly}
                                        value={
                                            procedure.startingLineKey ??
                                            NO_STARTING_LINE
                                        }
                                        onValueChange={(value) =>
                                            updateProcedure(
                                                procedure.procedure,
                                                {
                                                    startingLineKey:
                                                        value ===
                                                        NO_STARTING_LINE
                                                            ? null
                                                            : value,
                                                }
                                            )
                                        }
                                    >
                                        <SelectTrigger id={`${at}-starting`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value={NO_STARTING_LINE}
                                            >
                                                No starting price
                                            </SelectItem>
                                            {startingOptions.map((line) => (
                                                <SelectItem
                                                    key={line.key}
                                                    value={line.key}
                                                >
                                                    {line.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError
                                        message={errorFor(
                                            errors,
                                            `${at}.startingLineKey`
                                        )}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`${at}-discount`}>
                                        Discount (%)
                                    </Label>
                                    <Input
                                        id={`${at}-discount`}
                                        type='number'
                                        inputMode='numeric'
                                        min={0}
                                        max={90}
                                        step={1}
                                        disabled={readOnly}
                                        placeholder={`Default (${values.defaultDiscountPercent || 0}%)`}
                                        value={numberValue(
                                            procedure.discountPercent
                                        )}
                                        onChange={(event) =>
                                            updateProcedure(
                                                procedure.procedure,
                                                {
                                                    discountPercent:
                                                        toOptionalNumber(
                                                            event.target.value
                                                        ),
                                                }
                                            )
                                        }
                                    />
                                    <FieldError
                                        message={errorFor(
                                            errors,
                                            `${at}.discountPercent`
                                        )}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`${at}-label`}>
                                        Offer name (optional)
                                    </Label>
                                    <Input
                                        id={`${at}-label`}
                                        disabled={readOnly}
                                        value={procedure.discountLabel}
                                        onChange={(event) =>
                                            updateProcedure(
                                                procedure.procedure,
                                                {
                                                    discountLabel:
                                                        event.target.value,
                                                }
                                            )
                                        }
                                    />
                                    <FieldError
                                        message={errorFor(
                                            errors,
                                            `${at}.discountLabel`
                                        )}
                                    />
                                </div>
                                {hasRange && (
                                    <div>
                                        <Label htmlFor={`${at}-max`}>
                                            Typical range, high end ($)
                                        </Label>
                                        <Input
                                            id={`${at}-max`}
                                            type='number'
                                            inputMode='numeric'
                                            min={0}
                                            step={50}
                                            disabled={readOnly}
                                            value={numberValue(
                                                procedure.typicalMaxUsd
                                            )}
                                            onChange={(event) =>
                                                updateProcedure(
                                                    procedure.procedure,
                                                    {
                                                        typicalMaxUsd:
                                                            toOptionalNumber(
                                                                event.target
                                                                    .value
                                                            ),
                                                    }
                                                )
                                            }
                                        />
                                        <FieldError
                                            message={errorFor(
                                                errors,
                                                `${at}.typicalMaxUsd`
                                            )}
                                        />
                                    </div>
                                )}
                                <div
                                    className={
                                        hasRange
                                            ? 'md:col-span-3'
                                            : 'md:col-span-4'
                                    }
                                >
                                    <Label htmlFor={`${at}-notes`}>
                                        Notes (never published)
                                    </Label>
                                    <Input
                                        id={`${at}-notes`}
                                        disabled={readOnly}
                                        placeholder='Why the discount, who approved it'
                                        value={procedure.notes}
                                        onChange={(event) =>
                                            updateProcedure(
                                                procedure.procedure,
                                                { notes: event.target.value }
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {procedure.lines.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Line</TableHead>
                                            <TableHead className='w-36'>
                                                List price ($)
                                            </TableHead>
                                            <TableHead className='w-44'>
                                                Shows as
                                            </TableHead>
                                            <TableHead className='w-20'>
                                                Active
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {procedure.lines.map((line) => {
                                            const lineAt = `${at}.lines.${line.key}`
                                            return (
                                                <TableRow key={line.key}>
                                                    <TableCell>
                                                        <Input
                                                            aria-label={`${line.key} name`}
                                                            disabled={readOnly}
                                                            value={line.label}
                                                            onChange={(event) =>
                                                                updateLine(
                                                                    procedure.procedure,
                                                                    line.key,
                                                                    {
                                                                        label: event
                                                                            .target
                                                                            .value,
                                                                    }
                                                                )
                                                            }
                                                        />
                                                        <div className='text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs'>
                                                            <code>
                                                                [[price:
                                                                {
                                                                    procedure.procedure
                                                                }
                                                                :{line.key}]]
                                                            </code>
                                                            {line.addOn && (
                                                                <Badge variant='outline'>
                                                                    Add-on
                                                                </Badge>
                                                            )}
                                                            {line.unit !==
                                                                'each' && (
                                                                <Badge variant='outline'>
                                                                    {line.unit}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <FieldError
                                                            message={errorFor(
                                                                errors,
                                                                `${lineAt}.label`
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            aria-label={`${line.key} price`}
                                                            type='number'
                                                            inputMode='numeric'
                                                            min={0}
                                                            step={50}
                                                            disabled={readOnly}
                                                            value={numberValue(
                                                                line.usd
                                                            )}
                                                            onChange={(event) =>
                                                                updateLine(
                                                                    procedure.procedure,
                                                                    line.key,
                                                                    {
                                                                        usd: toNumber(
                                                                            event
                                                                                .target
                                                                                .value
                                                                        ),
                                                                    }
                                                                )
                                                            }
                                                        />
                                                        <FieldError
                                                            message={errorFor(
                                                                errors,
                                                                `${lineAt}.usd`
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <PricePreview
                                                            display={getPriceDisplay(
                                                                snapshot,
                                                                procedure.procedure,
                                                                line.key
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Switch
                                                            aria-label={`${line.key} active`}
                                                            disabled={readOnly}
                                                            checked={
                                                                line.active
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                updateLine(
                                                                    procedure.procedure,
                                                                    line.key,
                                                                    {
                                                                        active: checked,
                                                                    }
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                )
            })}

            {/* Save bar */}
            <div className='bg-background/95 sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-4 border-t py-4 backdrop-blur'>
                {message && (
                    <p
                        className={cn(
                            'flex items-center gap-2 text-sm',
                            message.type === 'error'
                                ? 'text-destructive'
                                : 'text-green-700'
                        )}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle2 className='h-4 w-4' />
                        ) : (
                            <AlertTriangle className='h-4 w-4' />
                        )}
                        {message.text}
                    </p>
                )}
                <Button
                    type='button'
                    onClick={handleSave}
                    disabled={readOnly || isSaving || !isDirty}
                >
                    {isSaving ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                        <Save className='mr-2 h-4 w-4' />
                    )}
                    Save prices
                </Button>
            </div>
        </div>
    )
}
