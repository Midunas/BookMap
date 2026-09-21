import { XMLParser } from 'fast-xml-parser'
import type { GoodreadsItem } from './types'

export class GoodreadsFeedError extends Error {
  constructor(public code: 'not-rss' | 'empty', message: string) { super(message) }
}

const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: '__cdata', trimValues: true })

const text = (v: unknown): string => {
  if (v == null) return ''
  if (typeof v === 'object') return text((v as any).__cdata ?? (v as any)['#text'] ?? '')
  return String(v)
}
const num = (v: unknown): number | null => { const n = Number(text(v)); return text(v) === '' || Number.isNaN(n) ? null : n }
const isoDate = (v: unknown): string | null => {
  const s = text(v); if (!s) return null
  const d = new Date(s); return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}
const largest = (item: any) => text(item.book_large_image_url) || text(item.book_medium_image_url) || text(item.book_image_url) || null

export function parseRssPage(xml: string): GoodreadsItem[] {
  if (!/^\s*<\?xml|<rss[\s>]/.test(xml)) throw new GoodreadsFeedError('not-rss', 'Response was not an RSS feed (profile may be private or blocked)')
  const doc = parser.parse(xml)
  const raw = doc?.rss?.channel?.item
  if (!raw) return []
  const items: any[] = Array.isArray(raw) ? raw : [raw]
  return items.map((it) => {
    const rating = num(it.user_rating)
    return {
      bookId: Number(text(it.book_id)),
      title: text(it.title),
      author: text(it.author_name),
      isbn: text(it.isbn) || null,
      pages: num(it.book?.num_pages),
      published: num(it.book_published),
      avgRating: num(it.average_rating),
      coverUrl: largest(it),
      description: text(it.book_description) || null,
      userRating: rating && rating > 0 ? rating : null,
      readAt: isoDate(it.user_read_at),
      addedAt: isoDate(it.user_date_added),
      shelves: text(it.user_shelves).split(',').map(s => s.trim()).filter(Boolean),
      review: text(it.user_review) || null,
    }
  }).filter(i => Number.isFinite(i.bookId) && i.title)
}
