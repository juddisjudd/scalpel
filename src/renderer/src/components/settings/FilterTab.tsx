import { useEffect, useRef, useState } from 'react'
import type { AppSettings } from '../../../../shared/types'
import { getGameFeatures } from '../../../../shared/game-features'
import { FilterPicker } from '../FilterPicker'
import { keyEventToAccelerator, prettyHotkey } from './utils'
import { SettingToggleBox } from './SettingToggleBox'

interface Props {
  settings: AppSettings
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  isOverlay: boolean
  onOnlineFilterUpdated?: (name: string) => void
  onOnlineImport?: (name: string) => void
  onSettingsChange: (s: AppSettings) => void
  tryHotkey: (hotkey: string, slot: { kind: 'filter' }) => boolean
}

export function FilterTab({
  settings,
  update,
  isOverlay,
  onOnlineFilterUpdated,
  onOnlineImport,
  onSettingsChange,
  tryHotkey,
}: Props): JSX.Element {
  const [recording, setRecording] = useState(false)
  const recRef = useRef<HTMLDivElement>(null)
  const features = getGameFeatures(settings.poeVersion)

  useEffect(() => {
    if (!recording) return
    window.api.suspendHotkeys()
    const onKey = (e: KeyboardEvent): void => {
      e.preventDefault()
      e.stopPropagation()
      const acc = keyEventToAccelerator(e)
      if (!acc) return
      if (!tryHotkey(acc, { kind: 'filter' })) {
        setRecording(false)
        return
      }
      update('hotkey', acc)
      setRecording(false)
    }
    const onClick = (e: MouseEvent): void => {
      if (recRef.current && !recRef.current.contains(e.target as Node)) setRecording(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
      window.api.resumeHotkeys()
    }
  }, [recording, update, tryHotkey])

  return (
    <>
      <div className="settings-section-title mt-3">Filter</div>

      {/* Filter folder & picker */}
      <section>
        <label>Filter folder</label>
        <div className="mt-[6px]">
          <FilterPicker
            settings={settings}
            onSettingsChange={onSettingsChange}
            autoSwitchInGame={isOverlay || undefined}
            onOnlineFilterUpdated={onOnlineFilterUpdated}
            onOnlineImport={onOnlineImport}
          />
        </div>
        {isOverlay && !settings.filterPath && (
          <p className="text-[11px] text-text-dim mt-1">
            Typically: <code>{features.filterFolderHint}</code>
          </p>
        )}
      </section>

      {/* Filter hotkey */}
      <section>
        <label>Filter hotkey</label>
        <div ref={recRef} className="mt-[6px]">
          <div className="setting-box" onClick={() => setRecording(true)}>
            <span className={`value ${recording ? 'recording' : ''}`}>
              {recording ? 'Press your desired key combo...' : prettyHotkey(settings.hotkey) || '(none set)'}
            </span>
            {!recording && (
              <button
                className="primary"
                onClick={(e) => {
                  e.stopPropagation()
                  setRecording(true)
                }}
              >
                Change
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Reload on save */}
      <SettingToggleBox
        label="Automatically reload filter when switching an item's tier"
        checked={settings.reloadOnSave}
        onChange={(val) => update('reloadOnSave', val)}
      />
    </>
  )
}
