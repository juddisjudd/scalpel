/** Process-wide "which PoE game are we attached to" flag. Lives in its own file
 *  (not overlay.ts) so that modules like trade/prices can read it without pulling
 *  electron-overlay-window / uiohook-napi into their import graphs -- those native
 *  modules would otherwise fail to load in Vitest. Set once by createOverlayWindow
 *  at startup; stable for the process lifetime since game switches trigger an
 *  app.relaunch() rather than an in-process swap. */
export let poeVersion: 1 | 2 = 1

export function setPoeVersion(v: 1 | 2): void {
  poeVersion = v
}
