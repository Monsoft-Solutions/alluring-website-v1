/**
 * Header Component Types
 *
 * Shared types for header navigation components.
 */

export type NavLink = {
    label: string
    href: string
}

export type NavDropdownProps = {
    label: string
    links: NavLink[]
    isOpen: boolean
    onToggle: () => void
    onClose: () => void
}
