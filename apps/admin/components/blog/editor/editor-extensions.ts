import CharacterCount from '@tiptap/extension-character-count'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'

// Create lowlight instance with common languages
const lowlight = createLowlight(common)

type EditorExtensionsOptions = {
    placeholder?: string
}

export function createEditorExtensions(options: EditorExtensionsOptions = {}) {
    const { placeholder = 'Start writing your post...' } = options

    return [
        StarterKit.configure({
            heading: {
                levels: [1, 2, 3],
            },
            // Disable the default code block in favor of CodeBlockLowlight
            codeBlock: false,
        }),
        Markdown.configure({
            markedOptions: {
                gfm: true, // GitHub Flavored Markdown
                breaks: false,
            },
        }),
        Placeholder.configure({
            placeholder,
        }),
        Link.configure({
            openOnClick: false,
            autolink: true,
            HTMLAttributes: {
                class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
            },
        }),
        Image.configure({
            HTMLAttributes: {
                class: 'rounded-lg max-w-full mx-auto',
            },
            allowBase64: true,
        }),
        CodeBlockLowlight.configure({
            lowlight,
            defaultLanguage: 'javascript',
            HTMLAttributes: {
                class: 'rounded-lg bg-stone-900 text-stone-100 p-4 overflow-x-auto',
            },
        }),
        CharacterCount.configure({
            limit: null, // No limit
        }),
    ]
}

// Keyboard shortcuts reference for tooltips
export const KEYBOARD_SHORTCUTS = {
    bold: { mac: '⌘B', windows: 'Ctrl+B', label: 'Bold' },
    italic: { mac: '⌘I', windows: 'Ctrl+I', label: 'Italic' },
    strike: { mac: '⌘⇧X', windows: 'Ctrl+Shift+X', label: 'Strikethrough' },
    code: { mac: '⌘E', windows: 'Ctrl+E', label: 'Inline Code' },
    heading1: { mac: '⌘⌥1', windows: 'Ctrl+Alt+1', label: 'Heading 1' },
    heading2: { mac: '⌘⌥2', windows: 'Ctrl+Alt+2', label: 'Heading 2' },
    heading3: { mac: '⌘⌥3', windows: 'Ctrl+Alt+3', label: 'Heading 3' },
    bulletList: { mac: '⌘⇧8', windows: 'Ctrl+Shift+8', label: 'Bullet List' },
    orderedList: { mac: '⌘⇧7', windows: 'Ctrl+Shift+7', label: 'Ordered List' },
    blockquote: { mac: '⌘⇧B', windows: 'Ctrl+Shift+B', label: 'Quote' },
    codeBlock: { mac: '⌘⌥C', windows: 'Ctrl+Alt+C', label: 'Code Block' },
    undo: { mac: '⌘Z', windows: 'Ctrl+Z', label: 'Undo' },
    redo: { mac: '⌘⇧Z', windows: 'Ctrl+Shift+Z', label: 'Redo' },
    link: { mac: '⌘K', windows: 'Ctrl+K', label: 'Link' },
} as const

export function getShortcutLabel(key: keyof typeof KEYBOARD_SHORTCUTS): string {
    const isMac =
        typeof navigator !== 'undefined' &&
        navigator.platform.toUpperCase().includes('MAC')
    const shortcut = KEYBOARD_SHORTCUTS[key]
    return `${shortcut.label} (${isMac ? shortcut.mac : shortcut.windows})`
}
