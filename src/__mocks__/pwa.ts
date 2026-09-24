import { fn } from 'storybook/test'

export const isStandalone = true

export const useUpdateReady = fn((): boolean => false)

export const installUpdate = fn()
