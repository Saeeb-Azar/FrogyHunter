export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export const SEASON_LABEL: Record<Season, string> = { spring: 'Frühling', summer: 'Sommer', autumn: 'Herbst', winter: 'Winter' }

/**
 * Aktuelle Jahreszeit nach Berliner Datum (meteorologisch: Frühling ab März, Sommer ab Juni,
 * Herbst ab September, Winter ab Dezember). Zum Testen: `?season=winter` in der URL
 * (wird gemerkt, `?season=auto` setzt zurück).
 */
export function currentSeason(now = new Date()): Season {
  try {
    const param = new URLSearchParams(location.search).get('season')
    if (param === 'auto') localStorage.removeItem('froggy_season')
    else if (param && param in SEASON_LABEL) localStorage.setItem('froggy_season', param)
    const forced = localStorage.getItem('froggy_season')
    if (forced && forced in SEASON_LABEL) return forced as Season
  } catch { /* Speicher nicht verfügbar */ }
  const month = Number(new Intl.DateTimeFormat('en-US', { month: 'numeric', timeZone: 'Europe/Berlin' }).format(now))
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}
