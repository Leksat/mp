const pad = (value: number): string => String(value).padStart(2, '0')

export const formatBuildTime = (builtAt: string): string => {
  const at = new Date(builtAt)
  const date = `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`
  return `${date} ${pad(at.getHours())}:${pad(at.getMinutes())}`
}

export const BUILD_TIME = formatBuildTime(__BUILT_AT__)
