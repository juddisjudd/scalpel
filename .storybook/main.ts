import type { StorybookConfig } from '@storybook/react-vite'

/** Storybook config for the renderer. Stories live next to the components they
 *  document so they get picked up by IDE refactors automatically. The catalog
 *  stays small and curated -- not every component needs a story, only the ones
 *  whose visual state we want to iterate on without spinning up the full overlay
 *  flow. */
const config: StorybookConfig = {
  stories: ['../src/renderer/src/**/*.stories.@(ts|tsx)'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  addons: [],
}

export default config
