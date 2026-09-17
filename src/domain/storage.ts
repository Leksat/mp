import { emptyProgress, type Progress } from './progress'

const STORAGE_KEY = 'mp.progress.v2'

export const loadProgress = (): Progress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return emptyProgress()
    const parsed = JSON.parse(stored) as Partial<Progress>
    return {
      tick: parsed.tick ?? 0,
      facts: parsed.facts ?? {},
      celebrated: parsed.celebrated ?? false,
    }
  } catch {
    return emptyProgress()
  }
}

export const saveProgress = (progress: Progress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    return
  }
}
