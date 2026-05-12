/** Footprint the cheat-sheets overlay shrinks to when minimized: a header-
 *  only strip in the bottom-right corner of its previous bounds. Shared so
 *  the main process (animation target + setMinimumSize floor) and the
 *  renderer (icon switching threshold) agree on what "collapsed" means. */
export const CHEAT_SHEET_MINIMIZED_WIDTH = 220
export const CHEAT_SHEET_MINIMIZED_HEIGHT = 34

/** Pixel slack added to the minimized height when deciding whether the
 *  window is "currently at the minimized footprint". Absorbs OS chrome
 *  jitter, DPI rounding, and the in-flight animation's partial frames. */
export const CHEAT_SHEET_MINIMIZED_SLACK = 4
