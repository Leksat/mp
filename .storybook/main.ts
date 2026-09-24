import type { StorybookConfig } from '@storybook/react-vite'
import type { Plugin, PluginOption } from 'vite'

const PWA_REGISTER_ID = 'virtual:pwa-register'
const RESOLVED_PWA_REGISTER_ID = `\0${PWA_REGISTER_ID}`

const pwaRegisterStub: Plugin = {
  name: 'pwa-register-stub',
  resolveId: (id) => (id === PWA_REGISTER_ID ? RESOLVED_PWA_REGISTER_ID : null),
  load: (id) =>
    id === RESOLVED_PWA_REGISTER_ID ? 'export const registerSW = () => async () => {}' : null,
}

const isPwaPlugin = (plugin: PluginOption): boolean =>
  typeof plugin === 'object' &&
  plugin !== null &&
  'name' in plugin &&
  plugin.name.startsWith('vite-plugin-pwa')

const withoutPwa = (plugins: readonly PluginOption[]): PluginOption[] =>
  plugins.flatMap((plugin) => {
    if (Array.isArray(plugin)) return [withoutPwa(plugin)]
    return isPwaPlugin(plugin) ? [] : [plugin]
  })

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  framework: '@storybook/react-vite',
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: [...withoutPwa(viteConfig.plugins ?? []), pwaRegisterStub],
  }),
}

export default config
