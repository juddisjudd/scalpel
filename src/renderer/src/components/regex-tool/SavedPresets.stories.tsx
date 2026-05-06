import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { SavedPresets } from './SavedPresets'
import type { RegexPreset } from '../../../../shared/types'
import { TAB_COLORS } from './mapmods-helpers'

/** SavedPresets renders the horizontal "Saved Regex" card strip beneath the
 *  regex tool's chip header. Each card shows the preset's tag chips, has a
 *  drag handle to reorder, an X to delete, and loads on click. The component
 *  filters by `generator` so only matching presets show; an empty filtered
 *  list returns null and renders nothing. */
const meta: Meta<typeof SavedPresets> = {
  title: 'Regex Tool / SavedPresets',
  component: SavedPresets,
  decorators: [
    (Story) => (
      <div className="w-[680px] bg-bg-solid">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof SavedPresets>

const SAMPLE_PRESETS: RegexPreset[] = [
  {
    id: 'p1',
    generator: 'maps',
    tags: [
      { text: '90 quant', color: TAB_COLORS.want, source: 'qualifier', sourceId: 'quantity' },
      { text: 'no-regen', color: '#ffd54f', source: 'avoid', sourceId: 'no-regen' },
      { text: 'reflect', color: '#ef5350', source: 'avoid', sourceId: 'reflect' },
    ],
    avoid: [],
    want: [],
    wantMode: 'any',
    qualifiers: { quantity: 90 },
    nightmare: false,
  },
  {
    id: 'p2',
    generator: 'maps',
    tags: [
      { text: 'beyond', color: TAB_COLORS.want, source: 'want' },
      { text: 'breach', color: TAB_COLORS.want, source: 'want' },
      { text: 'magic-mons', color: '#90a4ae', source: 'custom' },
    ],
    avoid: [],
    want: [],
    wantMode: 'all',
    qualifiers: {},
    nightmare: false,
  },
  {
    id: 'p3',
    generator: 'maps',
    tags: [
      { text: 'shaper', color: TAB_COLORS.want, source: 'want' },
      { text: '+pack', color: TAB_COLORS.qualifiers, source: 'qualifier' },
      { text: '8-mod', color: '#7e57c2', source: 'qualifier' },
      { text: '+mod-magnitude', color: '#90a4ae', source: 'custom' },
      { text: 'no-flask', color: '#ef5350', source: 'avoid' },
    ],
    avoid: [],
    want: [],
    wantMode: 'any',
    qualifiers: {},
    nightmare: false,
  },
]

const Host = (props: {
  generator: 'maps' | 'flasks' | 'custom' | 'waystones'
  presets: RegexPreset[]
}): JSX.Element => {
  const [presets, setPresets] = useState(props.presets)
  return (
    <SavedPresets
      presets={presets}
      setPresets={setPresets}
      generator={props.generator}
      loadPreset={(p) => alert(`Load ${p.id}`)}
      deletePreset={(id) => setPresets((cur) => cur.filter((p) => p.id !== id))}
    />
  )
}

export const ThreeMapsPresets: Story = {
  render: () => <Host generator="maps" presets={SAMPLE_PRESETS} />,
}

export const SinglePreset: Story = {
  render: () => <Host generator="maps" presets={[SAMPLE_PRESETS[0]]} />,
}

export const Empty: Story = {
  render: () => <Host generator="maps" presets={[]} />,
  parameters: {
    docs: {
      description: { story: 'Empty filtered list returns null -- the strip vanishes entirely.' },
    },
  },
}

export const NoMatchingGenerator: Story = {
  render: () => <Host generator="flasks" presets={SAMPLE_PRESETS} />,
  parameters: {
    docs: {
      description: { story: 'Three presets exist but all are generator=maps, so the flasks tab shows nothing.' },
    },
  },
}
