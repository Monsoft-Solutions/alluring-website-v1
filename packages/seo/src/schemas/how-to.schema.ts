import type { HowTo, HowToStep, WithContext } from 'schema-dts'

import type { HowToSchemaProps } from '../types/schema/how-to.type'
import { withContext } from './_internal'

export function buildHowToJsonLd(props: HowToSchemaProps): WithContext<HowTo> {
    const steps: HowToStep[] = props.steps.map((step, idx) => ({
        '@type': 'HowToStep',
        position: idx + 1,
        name: step.name,
        ...(step.description && { text: step.description }),
        ...(step.url && { url: step.url }),
        ...(step.image && { image: step.image }),
        ...(step.performTime && { performTime: step.performTime }),
    }))

    const howTo: HowTo = {
        '@type': 'HowTo',
        name: props.name,
        ...(props.description && { description: props.description }),
        ...(props.url && { url: props.url }),
        ...(props.image && { image: props.image }),
        ...(props.totalTime && { totalTime: props.totalTime }),
        ...(props.estimatedCost && {
            estimatedCost: {
                '@type': 'MonetaryAmount',
                currency: props.estimatedCost.currency,
                value: props.estimatedCost.value,
            },
        }),
        ...(props.tools &&
            props.tools.length > 0 && {
                tool: props.tools.map((tool) => ({
                    '@type': 'HowToTool' as const,
                    name: tool.name,
                    ...(tool.url && { url: tool.url }),
                })),
            }),
        ...(props.supplies &&
            props.supplies.length > 0 && {
                supply: props.supplies.map((supply) => ({
                    '@type': 'HowToSupply' as const,
                    name: supply.name,
                    ...(supply.url && { url: supply.url }),
                })),
            }),
        step: steps,
        ...(props.yield && { yield: props.yield }),
    }

    return withContext(howTo)
}
