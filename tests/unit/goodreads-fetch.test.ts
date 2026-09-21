import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { extractGoodreadsUserId, walkShelf } from '../../server/utils/goodreads/fetch'

const page = readFileSync('tests/fixtures/goodreads-rss-page.xml', 'utf8')
const short = readFileSync('tests/fixtures/goodreads-rss-short.xml', 'utf8')
const html = readFileSync('tests/fixtures/goodreads-signin.html', 'utf8')

describe('extractGoodreadsUserId', () => {
  it('accepts profile URLs, list URLs and bare ids', () => {
    expect(extractGoodreadsUserId('https://www.goodreads.com/user/show/12345-mykolas')).toBe('12345')
    expect(extractGoodreadsUserId('goodreads.com/review/list/98765?shelf=read')).toBe('98765')
    expect(extractGoodreadsUserId('https://www.goodreads.com/review/list_rss/1?shelf=read')).toBe('1')
    expect(extractGoodreadsUserId('  4242 ')).toBe('4242')
  })
  it('rejects anything else', () => {
    expect(extractGoodreadsUserId('https://example.com/user/show/1')).toBeNull()
    expect(extractGoodreadsUserId('mykolas')).toBeNull()
  })
})

const fakeFetch = (pages: Record<string, string>) => {
  const calls: string[] = []
  const f = (async (url: string) => {
    calls.push(url)
    const body = pages[new URL(url).searchParams.get('page') ?? '1'] ?? short.replace(/<item>[\s\S]*<\/item>/, '')
    return new Response(body, { status: 200, headers: { 'content-type': 'application/xml' } })
  }) as unknown as typeof fetch
  return { f, calls }
}

describe('walkShelf', () => {
  it('walks pages until a short page', async () => {
    // page 1 has 3 items but we pretend full pages are 3 for the test via pageSize
    const { f, calls } = fakeFetch({ '1': page, '2': short })
    const r = await walkShelf('1', 'read', { fetchImpl: f, delayMs: 0, pageSize: 3 })
    expect(r.items).toHaveLength(4)
    expect(r.pages).toBe(2)
    expect(r.truncated).toBe(false)
    expect(calls[0]).toContain('/review/list_rss/1?shelf=read&page=1')
  })
  it('stops at maxPages and reports truncation', async () => {
    const { f } = fakeFetch({ '1': page, '2': page, '3': page })
    const r = await walkShelf('1', 'to-read', { fetchImpl: f, delayMs: 0, pageSize: 3, maxPages: 2 })
    expect(r.pages).toBe(2)
    expect(r.truncated).toBe(true)
  })
  it('propagates not-rss errors', async () => {
    const { f } = fakeFetch({ '1': html })
    await expect(walkShelf('1', 'read', { fetchImpl: f, delayMs: 0 })).rejects.toMatchObject({ code: 'not-rss' })
  })
})
