export type NavItem = {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    children?: { title: string; href: string }[]
}
