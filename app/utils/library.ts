import { GENRES, type Book, type Genre } from '~/data/books'

export const genreSlot = (g: Genre) => GENRES.indexOf(g) + 1
export const genreVar = (g: Genre) => `var(--g-${genreSlot(g)})`

export const yearLabel = (y: number) => (y < 0 ? `${-y} BC` : y < 1000 ? `AD ${y}` : String(y))

export const eraOf = (y: number) => {
  if (y < 500) return 'Antiquity'
  if (y < 1900) return `${Math.floor(y / 100) + 1}th century`
  return `${Math.floor(y / 10) * 10}s`
}

export const centuryOf = (y: number) => {
  if (y < 0) return `${Math.ceil(-y / 100)}th c. BC`
  const c = Math.floor((y - 1) / 100) + 1
  const suffix = (c % 10 === 1 && c % 100 !== 11) ? 'st' : (c % 10 === 2 && c % 100 !== 12) ? 'nd' : (c % 10 === 3 && c % 100 !== 13) ? 'rd' : 'th'
  return `${c}${suffix} century`
}

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null

export const openLibraryUrl = (b: Book) =>
  `https://openlibrary.org/search?q=${encodeURIComponent(`${b.title} ${b.author}`)}`

export function groupBy<T>(list: T[], key: (t: T) => string) {
  const m = new Map<string, T[]>()
  for (const item of list) {
    const k = key(item)
    if (!m.has(k)) m.set(k, [])
    m.get(k)!.push(item)
  }
  return [...m.entries()].map(([name, items]) => ({ name, items }))
}

export const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
