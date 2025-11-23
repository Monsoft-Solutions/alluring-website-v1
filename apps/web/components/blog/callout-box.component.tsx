import type { ReactNode } from 'react'

type CalloutBoxProps = {
    children: ReactNode
    type?: 'info' | 'warning' | 'success' | 'error'
}

/**
 * CalloutBox component for displaying informational, warning, success, or error messages.
 *
 * @param children - The content to display inside the callout box
 * @param type - The type of callout: 'info' (default), 'warning', 'success', or 'error'
 * @returns A styled callout box with semantic design tokens
 */
export function CalloutBox({ children, type = 'info' }: CalloutBoxProps) {
    const styles = {
        info: 'bg-primary/10 border-primary text-primary',
        warning: 'bg-muted/50 border-muted-foreground/30 text-muted-foreground',
        success: 'bg-primary/10 border-primary/50 text-primary',
        error: 'bg-destructive/10 border-destructive text-destructive',
    }

    return (
        <div className={`my-6 rounded-r-lg border-l-4 p-6 ${styles[type]}`}>
            {children}
        </div>
    )
}
