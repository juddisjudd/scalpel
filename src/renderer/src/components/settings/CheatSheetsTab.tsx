import { useState } from 'react'
import { ReactSortable } from 'react-sortablejs'
import { CloseSmall, AddOne } from '@icon-park/react'
import type { AppSettings, CheatSheetCategory } from '../../../../shared/types'
import { HotkeyRecorder } from './HotkeyRecorder'
import { generateClientCategoryId } from './utils'
import type { HotkeySlot } from './hotkey-collisions'

interface Props {
  settings: AppSettings
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  tryHotkey: (hotkey: string, slot: HotkeySlot) => boolean
}

export function CheatSheetsTab({ settings, update, tryHotkey }: Props): JSX.Element {
  const cheatSheets = settings.cheatSheets ?? { globalHotkey: '', categories: [] }
  const setCategories = (categories: CheatSheetCategory[]): void => {
    update('cheatSheets', { ...cheatSheets, categories })
  }

  return (
    <>
      <div className="settings-section-title mt-3">Cheat Sheets</div>

      {/* Global hotkey */}
      <section>
        <label>Show cheat sheet overlay</label>
        <div className="mt-[6px]">
          <HotkeyRecorder
            value={cheatSheets.globalHotkey}
            onChange={(hotkey) => {
              if (!tryHotkey(hotkey, { kind: 'cheatsheet-global' })) return
              update('cheatSheets', { ...cheatSheets, globalHotkey: hotkey })
            }}
          />
        </div>
      </section>

      {/* Categories */}
      {cheatSheets.categories.length === 0 ? (
        <CategoriesEmptyState onAdd={() => setCategories([newCategory()])} />
      ) : (
        <section>
          <label>Categories</label>
          <div className="mt-[6px]">
            <ReactSortable
              list={cheatSheets.categories.map((c) => ({ ...c }))}
              setList={setCategories}
              animation={150}
              handle=".category-drag-handle"
              className="flex flex-col gap-2"
            >
              {cheatSheets.categories.map((cat, i) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  index={i}
                  tryHotkey={tryHotkey}
                  onUpdate={(next) => {
                    const arr = [...cheatSheets.categories]
                    arr[i] = next
                    setCategories(arr)
                  }}
                  onRemove={() => {
                    void window.api.removeCheatSheetCategory(cat.id)
                    setCategories(cheatSheets.categories.filter((_, j) => j !== i))
                  }}
                />
              ))}
            </ReactSortable>
            <button
              onClick={() => setCategories([...cheatSheets.categories, newCategory()])}
              className="text-[11px] text-text-dim self-start px-3 py-1.5 mt-2"
            >
              + Add Category
            </button>
          </div>
        </section>
      )}
    </>
  )
}

function newCategory(): CheatSheetCategory {
  return { id: generateClientCategoryId(), name: 'New Category', hotkey: '', sheets: [] }
}

function CategoriesEmptyState({ onAdd }: { onAdd: () => void }): JSX.Element {
  return (
    <section>
      <div className="bg-black/15 rounded p-3 flex flex-col items-center gap-1">
        <button onClick={onAdd} className="text-[11px] px-3 py-1.5">
          + Add Category
        </button>
        <div className="text-[10px] text-text-dim">
          Categories group cheat sheets and can be hotkeyed independently.
        </div>
      </div>
    </section>
  )
}

interface CategoryCardProps {
  category: CheatSheetCategory
  index: number
  tryHotkey: (hotkey: string, slot: HotkeySlot) => boolean
  onUpdate: (next: CheatSheetCategory) => void
  onRemove: () => void
}

function CategoryCard({ category, index, tryHotkey, onUpdate, onRemove }: CategoryCardProps): JSX.Element {
  const [confirming, setConfirming] = useState(false)
  const [showHotkey, setShowHotkey] = useState(category.hotkey !== '')
  const [urlInput, setUrlInput] = useState<string | null>(null)

  if (confirming) {
    return (
      <div className="bg-black/15 rounded p-[8px] flex items-center gap-2">
        <span className="text-xs text-text-dim flex-1">Delete category &quot;{category.name}&quot;?</span>
        <button onClick={onRemove} className="text-[11px] px-3 py-1 bg-danger/20">
          Confirm
        </button>
        <button onClick={() => setConfirming(false)} className="text-[11px] px-3 py-1">
          Cancel
        </button>
      </div>
    )
  }

  const addFromFile = async (): Promise<void> => {
    const added = await window.api.addCheatSheetFromFile(category.id)
    if (added.length === 0) return
    onUpdate({ ...category, sheets: [...category.sheets, ...added.map((a) => ({ id: a.id, ext: a.ext }))] })
  }
  const addFromUrl = async (url: string): Promise<void> => {
    if (!url.trim()) return
    try {
      const added = await window.api.addCheatSheetFromUrl(category.id, url.trim())
      onUpdate({ ...category, sheets: [...category.sheets, { id: added.id, ext: added.ext }] })
      setUrlInput(null)
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e)
      setUrlInput(`error: ${err}`)
    }
  }

  return (
    <div className="bg-black/15 rounded p-[8px] flex flex-col gap-2 category-drag-handle cursor-grab">
      {/* Name + remove */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={category.name}
          onChange={(e) => onUpdate({ ...category, name: e.target.value })}
          className="flex-1 text-[11px] bg-black/30 rounded px-2 py-[5px] border-none"
        />
        <button onClick={() => setConfirming(true)} className="text-text-dim hover:text-danger no-drag">
          <CloseSmall size={14} theme="outline" fill="currentColor" />
        </button>
      </div>

      {/* Thumbnail strip */}
      <div className="flex flex-wrap gap-2 no-drag" onClick={(e) => e.stopPropagation()}>
        {category.sheets.map((sheet) => (
          <ThumbnailTile
            key={sheet.id}
            categoryId={category.id}
            sheet={sheet}
            onRemove={() => {
              void window.api.removeCheatSheet(category.id, sheet.id, sheet.ext)
              onUpdate({ ...category, sheets: category.sheets.filter((s) => s.id !== sheet.id) })
            }}
          />
        ))}
        <PlaceholderTile
          onClickFile={addFromFile}
          onClickUrl={() => setUrlInput('')}
          urlInputValue={urlInput}
          onUrlChange={setUrlInput}
          onUrlSubmit={() => addFromUrl(urlInput ?? '')}
          onUrlCancel={() => setUrlInput(null)}
        />
      </div>

      {/* Per-category hotkey (optional) */}
      <div className="no-drag">
        {showHotkey || category.hotkey !== '' ? (
          <div className="flex items-center gap-2 text-[10px] text-text-dim">
            <span>Hotkey:</span>
            <HotkeyRecorder
              value={category.hotkey}
              onChange={(hotkey) => {
                if (!tryHotkey(hotkey, { kind: 'cheatsheet-category', index })) return
                onUpdate({ ...category, hotkey })
              }}
            />
            {category.hotkey !== '' && (
              <button
                onClick={() => {
                  onUpdate({ ...category, hotkey: '' })
                  setShowHotkey(false)
                }}
                className="text-text-dim hover:text-danger"
              >
                <CloseSmall size={12} theme="outline" fill="currentColor" />
              </button>
            )}
          </div>
        ) : (
          <button onClick={() => setShowHotkey(true)} className="text-[10px] text-text-dim px-2 py-1">
            <AddOne size={10} theme="outline" fill="currentColor" /> Add hotkey (optional)
          </button>
        )}
      </div>
    </div>
  )
}

function ThumbnailTile({
  categoryId,
  sheet,
  onRemove,
}: {
  categoryId: string
  sheet: { id: string; ext: string }
  onRemove: () => void
}): JSX.Element {
  const src = `cheatsheet://${categoryId}/${sheet.id}.${sheet.ext}`
  return (
    <div className="relative group rounded overflow-hidden bg-black/30" style={{ width: 80, height: 60 }}>
      <img src={src} alt="" className="w-full h-full object-cover" />
      <button
        onClick={onRemove}
        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded-full p-0.5"
        title="Remove image"
      >
        <CloseSmall size={10} theme="outline" fill="currentColor" />
      </button>
    </div>
  )
}

function PlaceholderTile({
  onClickFile,
  onClickUrl,
  urlInputValue,
  onUrlChange,
  onUrlSubmit,
  onUrlCancel,
}: {
  onClickFile: () => void
  onClickUrl: () => void
  urlInputValue: string | null
  onUrlChange: (v: string) => void
  onUrlSubmit: () => void
  onUrlCancel: () => void
}): JSX.Element {
  if (urlInputValue !== null) {
    return (
      <div className="flex items-center gap-1" style={{ height: 60 }}>
        <input
          autoFocus
          type="text"
          placeholder="Paste image URL"
          value={urlInputValue.startsWith('error: ') ? '' : urlInputValue}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onUrlSubmit()
            if (e.key === 'Escape') onUrlCancel()
          }}
          className="text-[11px] bg-black/30 rounded px-2 py-[5px] border-none w-[200px]"
        />
        <button onClick={onUrlSubmit} className="text-[11px] px-2 py-1">
          Add
        </button>
        <button onClick={onUrlCancel} className="text-[11px] px-2 py-1 text-text-dim">
          Cancel
        </button>
        {urlInputValue.startsWith('error: ') && (
          <span className="text-[9px] text-danger">{urlInputValue.slice(7)}</span>
        )}
      </div>
    )
  }
  return (
    <div
      className="flex flex-col items-center justify-center rounded border border-dashed border-text-dim/40 cursor-pointer hover:border-accent text-text-dim hover:text-accent transition-colors"
      style={{ width: 80, height: 60 }}
      onClick={onClickFile}
      title="Click to add image"
    >
      <AddOne size={20} theme="outline" fill="currentColor" />
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClickUrl()
        }}
        className="text-[8px] text-text-dim hover:text-accent"
      >
        or URL
      </button>
    </div>
  )
}
