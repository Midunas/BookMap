import { books, GENRES, STATS, type Book, type Genre, type StatKey } from '~/data/books'
import covers from '~/data/covers.json'

const coverIds = covers as Record<string, number | null>

export const genreSlot = (g: Genre) => GENRES.indexOf(g) + 1
export const genreVar = (g: Genre) => `var(--g-${genreSlot(g)})`

export const coverUrl = (b: Book, size: 'S' | 'M' | 'L' = 'M') => {
  const id = coverIds[b.id]
  return id ? `https://covers.openlibrary.org/b/id/${id}-${size}.jpg` : null
}

export const yearLabel = (y: number) => (y < 0 ? `${-y} BC` : y < 1000 ? `AD ${y}` : String(y))

export const eraOf = (y: number) => {
  if (y < 500) return 'Antiquity'
  if (y < 1900) return `${Math.floor(y / 100) + 1}th century`
  return `${Math.floor(y / 10) * 10}s`
}

export const centuryOf = (y: number) => {
  if (y < 0) return `${Math.ceil(-y / 100)}th c. BC`
  const c = Math.floor((y - 1) / 100) + 1
  const suffix = c === 1 ? 'st' : c === 2 ? 'nd' : c === 3 ? 'rd' : 'th'
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

export type StatusFilter = 'all' | 'read' | 'want' | 'reading' | 'must'
export const MUST_READ_MIN = 4.0

export function useLibrary() {
  const status = useState<StatusFilter>('bm-status', () => 'all')
  const query = useState<string>('bm-query', () => '')
  const selected = useState<Book | null>('bm-selected', () => null)

  const read = computed(() => books.filter(b => b.status === 'read'))
  const want = computed(() => books.filter(b => b.status === 'want'))
  const reading = computed(() => books.filter(b => b.status === 'reading'))
  const must = computed(() => books.filter(b => b.status !== 'read' && b.avgRating >= MUST_READ_MIN))

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    return books.filter(b => {
      if (status.value === 'must') { if (b.status === 'read' || b.avgRating < MUST_READ_MIN) return false }
      else if (status.value !== 'all' && b.status !== status.value) return false
      if (!q) return true
      return [b.title, b.author, b.country, b.genre, b.form, b.language, ...b.themes].join(' ').toLowerCase().includes(q)
    })
  })

  const select = (b: Book | null) => { selected.value = b }

  return { books, read, want, reading, must, filtered, status, query, selected, select }
}

/* ───────── gamification ───────── */
export interface StatLevel {
  key: StatKey; label: string; blurb: string
  points: number; level: number; floor: number; next: number; pct: number
  top: Book[]; boosters: Book[]
}

export const READER_TITLES = ['Browser', 'Page-turner', 'Bookworm', 'Regular', 'Reader', 'Well-read', 'Scholar', 'Bibliophile', 'Sage', 'Librarian', 'Oracle', 'Archivist', 'Lorekeeper']

export const levelFor = (points: number) => Math.floor(Math.sqrt(points))

export function useCharacter() {
  const read = books.filter(b => b.status === 'read')
  const want = books.filter(b => b.status !== 'read')

  const stats: StatLevel[] = STATS.map(s => {
    const points = read.reduce((a, b) => a + (b.stats[s.key] ?? 0), 0)
    const level = levelFor(points)
    const floor = level * level
    const next = (level + 1) * (level + 1)
    const top = [...read].filter(b => b.stats[s.key]).sort((a, b) => (b.stats[s.key] ?? 0) - (a.stats[s.key] ?? 0)).slice(0, 4)
    const boosters = [...want].filter(b => (b.stats[s.key] ?? 0) >= 2).sort((a, b) => (b.stats[s.key] ?? 0) - (a.stats[s.key] ?? 0)).slice(0, 3)
    return { ...s, points, level, floor, next, pct: (points - floor) / (next - floor), top, boosters }
  })

  const pages = read.reduce((a, b) => a + b.pages, 0)
  const readerLevel = Math.floor(Math.sqrt(pages / 100))
  const nextPages = (readerLevel + 1) ** 2 * 100
  const title = READER_TITLES[Math.min(readerLevel, READER_TITLES.length - 1)]

  const countries = new Set(read.map(b => b.country))
  const languages = new Set(read.map(b => b.language))
  const centuries = new Set(read.map(b => centuryOf(b.year)))
  const authorCounts = groupBy(read, b => b.authorId).filter(g => g.items.length >= 2)
  const seriesCounts = groupBy(read.filter(b => b.series), b => b.series!.replace(/ #\d+$/, '')).filter(g => g.items.length >= 2)
  const fiveStars = read.filter(b => b.myRating === 5).length
  const yearCounts = groupBy(read.filter(b => b.dateRead), b => b.dateRead!.slice(0, 4))
  const bestYear = Math.max(0, ...yearCounts.map(g => g.items.length))
  const dystopias = ['1984', 'brave-new-world', 'fahrenheit-451'].filter(id => read.some(b => b.id === id)).length
  const oldest = Math.min(...read.map(b => b.year))

  const badges = [
    { id: 'globetrotter', name: 'Globetrotter', desc: 'Authors from 8 countries', progress: countries.size, target: 8, hint: 'Sailor (Japan), Almond (Korea) or Shōgun (Australia) add new countries.' },
    { id: 'time-traveller', name: 'Time Traveller', desc: 'Read something over a thousand years old', progress: 2026 - oldest >= 1000 ? 1 : 0, target: 1, hint: 'Meditations was written around AD 180.' },
    { id: 'polyglot', name: 'Polyglot Origins', desc: 'Books first written in 6 languages', progress: languages.size, target: 6, hint: 'The Stranger (French), Art of War (Chinese) and Almond (Korean) are waiting.' },
    { id: 'doorstopper', name: 'Doorstopper', desc: 'Finish a book over 800 pages', progress: read.filter(b => b.pages > 800).length, target: 1, hint: 'Shōgun and Lonesome Dove both qualify.' },
    { id: 'regular', name: 'Loyal Reader', desc: 'Two or more books by 5 authors', progress: authorCounts.length, target: 5, hint: 'A second Dostoevsky or a third Steinbeck would count.' },
    { id: 'series', name: 'Series Companion', desc: 'Two books in one series', progress: seriesCounts.length, target: 1, hint: 'Red Rising then Golden Son.' },
    { id: 'five-stars', name: 'Generous Critic', desc: 'Ten five-star ratings', progress: fiveStars, target: 10, hint: 'Rate the unrated ones on the shelf.' },
    { id: 'big-year', name: 'Big Year', desc: 'Five books dated finished in one year', progress: bestYear, target: 5, hint: 'Set a date read when you finish a book.' },
    { id: 'dystopia', name: 'Dystopian Trilogy', desc: '1984, Brave New World, Fahrenheit 451', progress: dystopias, target: 3, hint: 'Fahrenheit 451 completes the set.' },
    { id: 'centuries', name: 'Century Hopper', desc: 'Books from 5 different centuries', progress: centuries.size, target: 5, hint: 'The Republic or The Art of War unlocks this instantly.' },
  ].map(b => ({ ...b, unlocked: b.progress >= b.target }))

  return { stats, pages, readerLevel, nextPages, title, badges, readCount: read.length, countries: countries.size, languages: languages.size }
}
