/** localStorage key holding the visitor's 18+ confirmation. */
export const AGE_OK_KEY = 'alluring-age-ok'

/**
 * Runs inline before the gallery paints: a returning visitor who already
 * confirmed their age never sees the photos blurred, even for a frame.
 * A fixed string — no visitor data is interpolated into it.
 */
export const GALLERY_AGE_SCRIPT = `try{if(localStorage.getItem('${AGE_OK_KEY}')==='1')document.documentElement.setAttribute('data-age-ok','')}catch(e){}`
