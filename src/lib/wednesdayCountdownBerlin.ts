import { DateTime } from 'luxon'

const ZONE = 'Europe/Berlin'

/**
 * Nächster Mittwoch 00:00:00 in Europe/Berlin (jetzige Uhrzeit & Datum in Berlin einbezogen).
 * Liegt dieser Zeitpunkt heute schon in der Vergangenheit, ist es der Mittwoch in 7 Tagen.
 */
export function getNextWednesdayMidnightBerlin(now: Date = new Date()): DateTime {
  const z = DateTime.fromJSDate(now).setZone(ZONE)
  let wed = z.startOf('day')
  const daysUntilWed = (3 - wed.weekday + 7) % 7
  wed = wed.plus({ days: daysUntilWed })
  if (wed <= z) wed = wed.plus({ weeks: 1 })
  return wed
}

export function msUntilNextWednesdayBerlin(now: Date = new Date()): number {
  return Math.max(0, getNextWednesdayMidnightBerlin(now).toMillis() - now.getTime())
}

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}

/** Restzeit bis zum Ziel (ms), deutsch: optional mit Tagen. */
export function formatWednesdayCountdownDe(ms: number): string {
  const sec = Math.floor(Math.max(0, ms) / 1000)
  if (sec <= 0) return '0:00:00'
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const time = `${pad2(h)}:${pad2(m)}:${pad2(s)}`
  if (d === 0) return time
  return `${d} Tag${d === 1 ? '' : 'e'} ${time}`
}
