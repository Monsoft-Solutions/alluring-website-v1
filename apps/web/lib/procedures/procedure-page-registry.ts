/**
 * Which component renders each procedure's page body.
 *
 * `/procedures/[slug]` renders every procedure. It keeps what has to be the
 * same for all of them — metadata, static params, the structured-data graph —
 * and asks this registry for the body. A procedure with no entry gets the
 * shared template, so a procedure opts in to a layout of its own only when
 * that layout is ready, and the other procedures don't change (#255).
 *
 * Chosen over a static route override, which would duplicate the metadata and
 * schema wiring per page, and over a section list in data, which would rebuild
 * the template problem inside the data files.
 *
 * Server-only: page modules import the procedure catalog.
 *
 * @module
 */
import 'server-only'

import { createElement, type ReactNode } from 'react'

import { BblPage } from '@/components/procedures/pages/bbl/bbl-page.component'
import { ProcedureTemplatePage } from '@/components/procedures/template/procedure-template-page.component'
import type {
    ProcedurePageModule,
    ProcedurePageModuleProps,
} from '@/lib/types/procedure-page-module.type'

/**
 * Procedures with a page module of their own, by slug. Every other procedure
 * renders the shared template.
 */
const procedurePageModules: Readonly<
    Partial<Record<string, ProcedurePageModule>>
> = {
    'brazilian-butt-lift-bbl-miami': BblPage,
}

/**
 * Render a procedure's page body with its own module, or with the shared
 * template when it has none.
 *
 * Returns an element rather than the component: the route would otherwise
 * pick a component during render, which `react-hooks/static-components`
 * rejects.
 */
export function renderProcedurePage(
    props: ProcedurePageModuleProps
): ReactNode {
    const pageModule =
        procedurePageModules[props.procedure.slug] ?? ProcedureTemplatePage

    return createElement(pageModule, props)
}
