// Looks up each book on Open Library and stores its cover id in app/data/covers.json.
// Run: node scripts/fetch-covers.mjs   (re-run any time you add books)
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const src = readFileSync(new URL('../app/data/books.ts', import.meta.url), 'utf8')
const entries = [...src.matchAll(/id: '([^']+)', title: (['"])(.*?)\2,.*?author: '([^']+)'/gs)]
  .map(m => ({ id: m[1], title: m[3].replace(/\\'/g, "'"), author: m[4] }))

const out = new URL('../app/data/covers.json', import.meta.url)
const covers = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : {}

for (const b of entries) {
  if (covers[b.id]) continue
  const q = new URLSearchParams({ title: b.title, author: b.author.split(' ').pop(), limit: '5', fields: 'cover_i,title,author_name,edition_count' })
  try {
    const r = await fetch(`https://openlibrary.org/search.json?${q}`, { headers: { 'User-Agent': 'BookMap/1.0 (personal reading site)' } })
    const j = await r.json()
    const hit = (j.docs || []).filter(d => d.cover_i).sort((a, b) => (b.edition_count || 0) - (a.edition_count || 0))[0]
    covers[b.id] = hit ? hit.cover_i : null
    console.log(b.id, '→', covers[b.id])
  } catch (e) {
    console.log(b.id, 'failed', e.message)
  }
  await new Promise(r => setTimeout(r, 250))
}
writeFileSync(out, JSON.stringify(covers, null, 2) + '\n')
console.log('done', Object.keys(covers).length, 'entries')
