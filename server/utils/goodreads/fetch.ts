import { parseRssPage } from './rss'
import { GOODREADS_UA, type GoodreadsItem, type GoodreadsShelf } from './types'

export function extractGoodreadsUserId(input: string): string | null {
  const s = input.trim()
  if (/^\d{1,12}$/.test(s)) return s
  const m = s.match(/goodreads\.com\/(?:user\/show|review\/list(?:_rss)?)\/(\d{1,12})/i)
  return m ? m[1] : null
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function walkShelf(
  userId: string,
  shelf: GoodreadsShelf,
  opts: { fetchImpl?: typeof fetch; maxPages?: number; delayMs?: number; pageSize?: number } = {},
): Promise<{ items: GoodreadsItem[]; pages: number; truncated: boolean }> {
  const fetchImpl = opts.fetchImpl ?? fetch
  const maxPages = opts.maxPages ?? 30
  const delayMs = opts.delayMs ?? 300
  const pageSize = opts.pageSize ?? 100
  const items: GoodreadsItem[] = []
  let page = 1
  while (page <= maxPages) {
    const url = `https://www.goodreads.com/review/list_rss/${userId}?shelf=${shelf}&page=${page}`
    const res = await fetchImpl(url, { headers: { 'User-Agent': GOODREADS_UA, Accept: 'application/rss+xml, application/xml, text/xml' } })
    const body = await res.text()
    const batch = parseRssPage(body)   // throws GoodreadsFeedError on HTML
    items.push(...batch)
    if (batch.length < pageSize) return { items, pages: page, truncated: false }
    page++
    if (page <= maxPages && delayMs) await sleep(delayMs)
  }
  return { items, pages: maxPages, truncated: true }
}
