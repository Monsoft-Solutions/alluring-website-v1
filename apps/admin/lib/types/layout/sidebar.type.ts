export type NavChildItem = {
    title: string
    href: string
    icon?: React.ComponentType<{ className?: string }>
}

export type NavItem = {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    children?: NavChildItem[]
}
