import type { Meta, StoryObj } from '@storybook/react-vite'
import { InfoChip, PriceChip } from './PriceChip'

/** InfoChip + PriceChip stories. PriceChip renders a chaos/divine icon based on
 *  the active PoE version (PoE2 swaps chaos for exalted), so flipping the "PoE
 *  Version" toolbar toggle above the canvas is the easy way to verify the icon
 *  variant at each version. */

const infoMeta: Meta<typeof InfoChip> = {
  title: 'Shared / InfoChip',
  component: InfoChip,
  args: {
    children: 'Inscribed Ultimatum',
  },
}
export default infoMeta

type InfoStory = StoryObj<typeof InfoChip>

export const Default: InfoStory = {
  args: {},
}

export const WithLabel: InfoStory = {
  args: { label: 'Item:', children: 'Inscribed Ultimatum' },
}

export const SmallSize: InfoStory = {
  args: { label: 'ilvl', children: '84', size: 'sm' },
}

export const Colored: InfoStory = {
  args: { children: 'Corrupted', color: '#ef5350' },
}

// PriceChip stories live in the same file so the two related components show
// up adjacent in the catalog tree. The named-meta pattern Storybook 10
// supports lets us declare additional metadata at story level for these.
export const PriceChip_Chaos: StoryObj<typeof PriceChip> = {
  render: (args) => <PriceChip {...args} />,
  args: { chaosValue: 47 },
  parameters: { docs: { description: { story: 'Chaos-denominated price (PoE1 default).' } } },
}

export const PriceChip_Divine: StoryObj<typeof PriceChip> = {
  render: (args) => <PriceChip {...args} />,
  args: { chaosValue: 350, divineValue: 2.3 },
  parameters: { docs: { description: { story: 'Divine-denominated price (auto-promoted when value >= 1 divine).' } } },
}

export const PriceChip_FromChaosPerDivine: StoryObj<typeof PriceChip> = {
  render: (args) => <PriceChip {...args} />,
  args: { chaosValue: 460, chaosPerDivine: 200 },
  parameters: {
    docs: { description: { story: 'Computes divine value from chaos using a chaosPerDivine ratio.' } },
  },
}

export const PriceChip_WithNinjaIcon: StoryObj<typeof PriceChip> = {
  render: (args) => <PriceChip {...args} />,
  args: { chaosValue: 90, showNinja: true, label: 'ninja' },
}
