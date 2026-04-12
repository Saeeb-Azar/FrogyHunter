const LS_LEVELS = 'froggy_mock_levels'
const LS_MARKERS = 'froggy_mock_markers'
const LS_PROGRESS = 'froggy_mock_progress'

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export { LS_LEVELS, LS_MARKERS, LS_PROGRESS }
