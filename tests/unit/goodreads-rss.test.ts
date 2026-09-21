import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseRssPage, GoodreadsFeedError } from '../../server/utils/goodreads/rss'

const page = readFileSync('tests/fixtures/goodreads-rss-page.xml', 'utf8')
const short = readFileSync('tests/fixtures/goodreads-rss-short.xml', 'utf8')
const html = readFileSync('tests/fixtures/goodreads-signin.html', 'utf8')

describe('parseRssPage', () => {
  it('parses every item with typed fields', () => {
    const items = parseRssPage(page)
    expect(items).toHaveLength(3)
    const first = items[0]
    expect(first.bookId).toBeTypeOf('number')
    expect(first.title.length).toBeGreaterThan(0)
    expect(first.author.length).toBeGreaterThan(0)
    expect(first.shelves).toBeInstanceOf(Array)
    expect(first.coverUrl).toMatch(/^https:\/\//)
  })
  it('turns RSS dates into ISO dates and empty dates into null', () => {
    const items = parseRssPage(page)
    const withDate = items.find(i => i.readAt)
    expect(withDate!.readAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const without = items.find(i => !i.readAt)
    expect(without!.readAt).toBeNull()
  })
  it('maps rating 0 to null', () => {
    const items = parseRssPage(page.replace(/<user_rating>\d<\/user_rating>/, '<user_rating>0</user_rating>'))
    expect(items[0].userRating).toBeNull()
  })
  it('handles a last page with one item', () => {
    expect(parseRssPage(short)).toHaveLength(1)
  })
  it('preserves leading zeros in ISBNs instead of number-coercing them', () => {
    const items = parseRssPage(page)
    expect(items[0].isbn).toBe('0061801917')
  })
  it('throws not-rss for an HTML sign-in page', () => {
    expect(() => parseRssPage(html)).toThrowError(GoodreadsFeedError)
    try { parseRssPage(html) } catch (e) { expect((e as GoodreadsFeedError).code).toBe('not-rss') }
  })
})
