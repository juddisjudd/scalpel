import { screen } from 'electron'
import { OverlayController } from 'electron-overlay-window'
import { registerSecondaryOverlay, sendCanvasIpc, moveCanvasTop, type SecondaryOverlay } from './windowing'
import { setSecondaryOverlayHotkeys } from './hotkeys'
import { forwardZoneChangesTo, sendCurrentZoneTo } from './client-log'
import type { AppSettings, OverlayAnchor } from '../shared/types'

// Re-export the pure storage / image-fetch helpers so consumers (handlers,
// protocol handler, tests) keep their existing import path. The actual
// implementations live in cheat-sheet-storage.ts so they can be unit-tested
// without dragging the full main-process module graph in.
export {
  categoryDir,
  sheetFilePath,
  generateSheetId,
  generateCategoryId,
  saveSheetBuffer,
  removeSheetFile,
  removeCategoryDir,
  ensureThumb,
  fetchImageBuffer,
} from './cheat-sheet-storage'

// ---- Overlay registration ---------------------------------------------------

const DEFAULT_ANCHOR: OverlayAnchor = {
  fracX: 0.2695,
  fracY: 0.8343,
  fracW: 0.4609,
  fracH: 0.138,
}

let overlay: SecondaryOverlay | null = null
let storedAnchorGetter: () => OverlayAnchor | undefined = () => undefined
let onAnchorChangedFn: ((a: OverlayAnchor) => void) | undefined

// Stash for the focus-category IPC across the async did-finish-load delay
// the very first time the overlay opens. After that, the window is always
// loaded and IPCs deliver synchronously.
let pendingFocusCategory: string | undefined

/** Register the cheat-sheets overlay with the secondary-overlay system.
 *  Called once during main process boot (after settings are available).
 *  Returns the overlay handle so the caller can wire hotkeys. */
export function registerCheatSheetsOverlay(deps: {
  storedAnchor: () => OverlayAnchor | undefined
  onAnchorChanged: (a: OverlayAnchor) => void
}): SecondaryOverlay {
  storedAnchorGetter = deps.storedAnchor
  onAnchorChangedFn = deps.onAnchorChanged
  overlay = registerSecondaryOverlay({
    id: 'cheat-sheets',
    htmlEntry: 'cheat-sheets-grid.html',
    defaultAnchor: () => DEFAULT_ANCHOR,
    storedAnchor: () => storedAnchorGetter(),
    onAnchorChanged: (a) => onAnchorChangedFn?.(a),
    onFirstShow: (win) => {
      // Deliver any focus-category IPC that arrived during the first window
      // creation - webContents.send before did-finish-load is silently
      // dropped, so we wait until now to flush it.
      win.webContents.send('cheat-sheet:focus-category', pendingFocusCategory)
      pendingFocusCategory = undefined
      sendCurrentZoneTo(win)
    },
  })
  forwardZoneChangesTo(() => overlay?.getWindow() ?? null)
  return overlay
}

/** Handle a cheat-sheet hotkey press.
 *
 *  - **Global hotkey** (no categoryId): toggle the overlay open/closed.
 *  - **Category hotkey** (categoryId set):
 *    - If overlay is closed: open it focused on that category.
 *    - If overlay is open: just switch the active tab to that category. Don't
 *      close - the user already has it open and is asking to view a different
 *      sheet, not dismiss it. They can close it via the global hotkey or Esc.
 */
export function toggleCheatSheets(categoryId?: string): void {
  if (!overlay) return
  const wasVisible = overlay.isVisible()
  if (categoryId !== undefined && wasVisible) {
    overlay.send('cheat-sheet:focus-category', categoryId)
    return
  }
  // Mutual exclusion: hide the whiteboard before showing the cheat sheet.
  if (!wasVisible) {
    import('./whiteboard').then(({ getWhiteboardOverlay }) => {
      getWhiteboardOverlay()?.hide()
    })
  }
  // First open of the session creates the window asynchronously; stash the
  // category so onFirstShow can deliver it after did-finish-load. For
  // already-loaded windows the send below delivers immediately.
  if (!overlay.getWindow()) {
    pendingFocusCategory = categoryId
    overlay.toggle()
    return
  }
  overlay.toggle()
  if (!wasVisible) overlay.send('cheat-sheet:focus-category', categoryId)
}

export function getCheatSheetsOverlay(): SecondaryOverlay | null {
  return overlay
}

// Optional pre-show hook (index.ts wires this to hideOverlay() so the main
// overlay collapses before the cheat-sheet appears). Kept here so the hotkey
// handlers below stay self-contained.
let beforeShowHook: (() => void) | null = null

export function setCheatSheetsBeforeShow(cb: (() => void) | null): void {
  beforeShowHook = cb
}

/** Re-register the cheat-sheet hotkeys (global + per-category) with the
 *  secondary-overlay system. Called once at boot and again whenever the
 *  cheatSheets settings change. */
export function applyCheatSheetHotkeys(cs: AppSettings['cheatSheets']): void {
  const hotkeys: Array<{ accelerator: string; handler: () => void }> = []
  const fire = (categoryId?: string): void => {
    beforeShowHook?.()
    toggleCheatSheets(categoryId)
  }
  if (cs?.globalHotkey) {
    hotkeys.push({ accelerator: cs.globalHotkey, handler: () => fire() })
  }
  for (const cat of cs?.categories ?? []) {
    if (!cat.hotkey) continue
    const id = cat.id
    hotkeys.push({ accelerator: cat.hotkey, handler: () => fire(id) })
  }
  setSecondaryOverlayHotkeys(hotkeys)
}

// ---- Hover preview (cheat-sheet specific, renders on the shared canvas) ----

export function showPreview(src: string): void {
  // Center the image on the PoE window when known; otherwise fall back to the
  // primary display's work area (e.g. dev runs without an attached game).
  const tb = OverlayController.targetBounds
  const gameBounds =
    tb && tb.width > 0 && tb.height > 0
      ? { x: tb.x, y: tb.y, width: tb.width, height: tb.height }
      : (() => {
          const wa = screen.getPrimaryDisplay().workArea
          return { x: wa.x, y: wa.y, width: wa.width, height: wa.height }
        })()
  sendCanvasIpc('cheat-sheet-preview:render', { src, gameBounds })
  // Lift the canvas above the cheat-sheet window so the hover image visibly
  // overlays the thumbnail strip (snap ghost intentionally doesn't do this -
  // it stays behind the dragged window).
  moveCanvasTop()
}

export function hidePreview(): void {
  // Don't hide the canvas - that would trigger a paint flash on next show.
  // Just clear the cheat-sheet preview layer; snap ghost (if any) is unaffected.
  sendCanvasIpc('cheat-sheet-preview:render', { src: null, gameBounds: null })
}
