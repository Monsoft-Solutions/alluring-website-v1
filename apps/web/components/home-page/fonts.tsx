import { Bodoni_Moda, Instrument_Sans } from 'next/font/google'

import './home-page.css'

/**
 * The home page's type: Bodoni Moda for display, Instrument Sans for
 * everything read at text size.
 *
 * Bodoni Moda is a Didone drawn for fashion display, with an optical-size
 * axis: at 100 px its hairlines go razor thin, at 18 px they thicken so an
 * FAQ question still reads. Its italic carries the page's one emotional
 * word per heading. Instrument Sans is a narrow-ish contemporary grotesk
 * that stays crisp on a phone at 15 px.
 *
 * Both are variable files, self-hosted by `next/font` at build time and
 * preloaded, so the headline paints in Bodoni rather than swapping into it.
 *
 * Why this module also imports the page's stylesheet, and why `app/page.tsx`
 * imports it first: `next/font` preloads a face on every route whose CSS
 * chunk carries its `@font-face`, and the build merges small CSS files into
 * shared chunks. Imported after the consultation thread, the faces landed in
 * the thread's chunk, and /contact-us and the specials page preloaded 128 KB
 * of fonts they never use. Next to the page's own stylesheet they stay in a
 * chunk only the home page loads (checked in `next-font-manifest.json`).
 */
export const homeDisplayFont = Bodoni_Moda({
    subsets: ['latin'],
    style: ['normal', 'italic'],
    axes: ['opsz'],
    display: 'swap',
})

export const homeTextFont = Instrument_Sans({
    subsets: ['latin'],
    display: 'swap',
})

/**
 * Points the site's two font slots at the home page's faces while the home
 * page is on screen, so the header, footer, consultation thread and sticky
 * bar change with it. The rest of the site keeps Lato and Playfair.
 *
 * `--font-lato` and `--font-playfair` are what the `font-sans` / `font-serif`
 * utilities and the thread's CSS read (`packages/ui` globals, `@theme
 * inline`). The root layout sets them with a class on `<body>`; this rule
 * outranks that class (0,1,1 against 0,1,0) and stops applying when a client
 * navigation leaves the page.
 */
export function HomeFontScope() {
    return (
        <style>{`body:has(.hp-page){--font-lato:${homeTextFont.style.fontFamily};--font-playfair:${homeDisplayFont.style.fontFamily}}`}</style>
    )
}
