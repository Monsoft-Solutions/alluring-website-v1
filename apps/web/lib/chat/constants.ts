/**
 * Chat Constants
 *
 * Centralized configuration constants for the chat system.
 *
 * @module lib/chat/constants
 */

/**
 * Animation durations in milliseconds
 */
export const ANIMATION = {
    /** Message appear animation duration */
    MESSAGE_APPEAR: 300,
    /** Scroll animation duration */
    SCROLL: 200,
    /** Typing indicator animation duration */
    TYPING: 150,
    /** Button press feedback duration */
    BUTTON_PRESS: 150,
    /** Modal open/close animation */
    MODAL: 300,
} as const

/**
 * Polling and timing configuration
 */
export const TIMING = {
    /** Quick questions poll interval in ms */
    QUICK_QUESTIONS_POLL_INTERVAL: 500,
    /** Maximum quick questions poll attempts */
    QUICK_QUESTIONS_MAX_ATTEMPTS: 6,
    /** Scroll debounce delay in ms */
    SCROLL_DEBOUNCE: 50,
    /** Input debounce delay in ms */
    INPUT_DEBOUNCE: 100,
} as const

/**
 * UI dimensions and limits
 */
export const DIMENSIONS = {
    /** Minimum textarea height in pixels */
    TEXTAREA_MIN_HEIGHT: 44,
    /** Maximum textarea height in pixels */
    TEXTAREA_MAX_HEIGHT: 128,
    /** Scroll threshold from bottom in pixels */
    SCROLL_BOTTOM_THRESHOLD: 100,
    /** Minimum touch target size in pixels */
    MIN_TOUCH_TARGET: 44,
    /** Chat widget width on desktop */
    WIDGET_WIDTH: 400,
    /** Chat widget height on desktop */
    WIDGET_HEIGHT: 600,
} as const

/**
 * Message configuration
 */
export const MESSAGES = {
    /** Maximum message content length */
    MAX_LENGTH: 2000,
    /** Number of quick replies to show before hiding */
    HIDE_QUICK_REPLIES_AFTER: 5,
} as const

/**
 * Quick reply categories
 */
export const QUICK_REPLY_CATEGORIES = {
    INITIAL: 'initial',
    PROCEDURES: 'procedures',
    PRICING: 'pricing',
    SCHEDULING: 'scheduling',
    GENERAL: 'general',
} as const

/**
 * CSS class names for animations
 */
export const CSS_CLASSES = {
    /** Message appear animation */
    MESSAGE_APPEAR: 'animate-in fade-in slide-in-from-bottom-2 duration-300',
    /** Fade in animation */
    FADE_IN: 'animate-in fade-in duration-200',
    /** Scale up animation */
    SCALE_UP: 'animate-in zoom-in-95 duration-200',
    /** Slide up animation */
    SLIDE_UP: 'animate-in slide-in-from-bottom-4 duration-300',
} as const

/**
 * Z-index layers for chat components
 */
export const Z_INDEX = {
    /** Floating chat button */
    BUTTON: 50,
    /** Chat widget */
    WIDGET: 60,
    /** Mobile backdrop */
    BACKDROP: 55,
    /** Scroll to bottom button */
    SCROLL_BUTTON: 10,
} as const

/**
 * Accessibility labels
 */
export const ARIA_LABELS = {
    OPEN_CHAT: 'Open chat',
    CLOSE_CHAT: 'Close chat',
    SEND_MESSAGE: 'Send message',
    SCROLL_TO_BOTTOM: 'Scroll to bottom',
    NEW_CONVERSATION: 'Start new conversation',
    TALK_TO_TEAM: 'Talk to team member',
    TYPING: (name: string) => `${name} is typing`,
} as const
