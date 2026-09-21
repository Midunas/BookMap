export type GoodreadsShelf = 'read' | 'to-read' | 'currently-reading'
export const GOODREADS_SHELVES: GoodreadsShelf[] = ['read', 'to-read', 'currently-reading']

export interface GoodreadsItem {
  bookId: number
  title: string
  author: string
  isbn: string | null
  pages: number | null
  published: number | null
  avgRating: number | null
  coverUrl: string | null
  description: string | null
  userRating: number | null
  readAt: string | null   // YYYY-MM-DD
  addedAt: string | null  // YYYY-MM-DD
  shelves: string[]
  review: string | null
}

export const GOODREADS_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
