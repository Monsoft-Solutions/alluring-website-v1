import type { ReactNode } from 'react'

type ToolbarGroupProps = {
    children: ReactNode
}

export function ToolbarGroup({ children }: ToolbarGroupProps) {
    return <div className='flex items-center gap-0.5'>{children}</div>
}
