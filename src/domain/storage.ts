import { emptyProgress, fromLegacy, type LegacyProgress, type Progress } from './progress'
import { defaultSettings, isVerdictPlacement, toSessionLength, type Settings } from './settings'

const PROGRESS_KEY = 'mp.progress.v3'
const LEGACY_PROGRESS_KEY = 'mp.progress.v2'
const SETTINGS_KEY = 'mp.settings.v1'

const read = (key: string): unknown => {
  try {
    const stored = localStorage.getItem(key)
    return stored === null ? undefined : JSON.parse(stored)
  } catch {
    return undefined
  }
}

const write = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

export const loadProgress = (): Progress => {
  const parsed = read(PROGRESS_KEY) as Partial<Progress> | undefined
  if (parsed) {
    return {
      tick: parsed.tick ?? 0,
      facts: parsed.facts ?? {},
      celebrated: parsed.celebrated ?? false,
    }
  }

  const legacy = read(LEGACY_PROGRESS_KEY) as LegacyProgress | undefined
  return legacy ? fromLegacy(legacy) : emptyProgress()
}

export const saveProgress = (progress: Progress): void => write(PROGRESS_KEY, progress)

export const loadSettings = (): Settings => {
  const parsed = read(SETTINGS_KEY) as Partial<Settings> | undefined
  const placement = parsed?.verdictPlacement
  return {
    verdictPlacement: isVerdictPlacement(placement) ? placement : defaultSettings().verdictPlacement,
    sessionLength: toSessionLength(parsed?.sessionLength),
  }
}

export const saveSettings = (settings: Settings): void => write(SETTINGS_KEY, settings)
