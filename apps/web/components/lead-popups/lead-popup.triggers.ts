/**
 * When the lead popup may open: the rules and the one piece of signal
 * processing behind them, kept free of React and the DOM so they can be
 * tested on their own.
 *
 * @module components/lead-popups/lead-popup.triggers
 */

/** Time on the site before the timed trigger, when no promotion sets one. */
export const DEFAULT_DELAY_SECONDS = 60

/**
 * The phone's stand-in for exit intent. A touch screen has no pointer to
 * leave the window, but a visitor heading for the address bar, the tab
 * switcher or the back gesture usually flicks the page back up first. It
 * counts only once they have read a little: some time on the page and more
 * than a screen scrolled.
 */
export const SCROLL_UP_RULES = {
    /** Time on the page before a flick counts. */
    minEngagedMs: 15_000,
    /** How far down the visitor must have read, in screen heights. */
    minDepthScreens: 1.5,
    /** How far back up the flick travels, as a share of the screen height. */
    minDistanceScreens: 0.3,
    /** ...and within how long. */
    windowMs: 400,
    /**
     * A jump the visitor asked for (a tap on "Request consult", a link to a
     * section) also scrolls up fast. Scrolling that starts this soon after a
     * tap or a key press is theirs, not a way out.
     */
    userJumpGraceMs: 1_200,
} as const

type Sample = { readonly y: number; readonly t: number }

/**
 * Tracks scroll positions and reports a quick upward flick: the page moved
 * back up by at least `minDistance` pixels within the last `windowMs`.
 *
 * Feed it every scroll position with its timestamp; it keeps only the
 * samples inside the window, so it stays a few dozen entries long.
 */
export function createFlickDetector(windowMs: number) {
    let samples: Sample[] = []
    return (y: number, t: number, minDistance: number): boolean => {
        samples = samples.filter((sample) => t - sample.t <= windowMs)
        samples.push({ y, t })
        const peak = Math.max(...samples.map((sample) => sample.y))
        return peak - y >= minDistance
    }
}

/** Whether an element takes typing, so a popup would land on the keyboard. */
export function isTextEntry(element: Element | null): boolean {
    if (!element) return false
    if ((element as HTMLElement).isContentEditable) return true
    const tag = element.tagName
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true
    if (tag !== 'INPUT') return false
    const type = (element as HTMLInputElement).type
    return !['button', 'checkbox', 'radio', 'submit', 'reset'].includes(type)
}
