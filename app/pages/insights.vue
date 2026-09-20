<script setup lang="ts">
import { GENRES, type Book } from '~/data/books'
import { threads } from '~/data/threads'
import { groupBy, eraOf, yearLabel, genreVar, avg } from '~/composables/useLibrary'

const { books, read, want, select } = useLibrary()
useHead({ title: 'BookMap · Insights' })

const rows = (key: (b: Book) => string, order?: string[]) => {
  const r = groupBy(read.value, key), w = groupBy(books.filter(b => b.status !== 'read'), key)
  const names = order ?? [...new Set([...r.map(g => g.name), ...w.map(g => g.name)])]
  const out = names.map(n => ({ label: n, a: r.find(g => g.name === n)?.items.length ?? 0, b: w.find(g => g.name === n)?.items.length ?? 0 }))
  return order ? out : out.sort((x, y) => y.a + y.b - (x.a + x.b))
}
const byGenre = computed(() => rows(b => b.genre, GENRES))
const byForm = computed(() => rows(b => b.form))
const byLang = computed(() => rows(b => b.language))
const byCountry = computed(() => rows(b => b.country).slice(0, 8))
const eraOrder = ['Antiquity', '19th century', '1900s', '1910s', '1920s', '1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']
const byEra = computed(() => rows(b => eraOf(b.year), eraOrder).filter(r => r.a + r.b))

const fiction = computed(() => read.value.filter(b => ['Novel', 'Novella'].includes(b.form)).length)
const oldest = computed(() => [...read.value].sort((a, b) => a.year - b.year)[0])
const longest = computed(() => [...read.value].sort((a, b) => b.pages - a.pages)[0])
const myAvg = computed(() => avg(read.value.filter(b => b.myRating).map(b => b.myRating!)))
const grAvg = computed(() => avg(read.value.map(b => b.avgRating)))
const rated = computed(() => [...read.value].filter(b => b.myRating).sort((a, b) => (b.myRating! - b.avgRating) - (a.myRating! - a.avgRating)))
const themeCounts = computed(() => groupBy(read.value.flatMap(b => b.themes.map(t => ({ t, b }))), x => x.t).sort((a, b) => b.items.length - a.items.length).slice(0, 18))
const byId = (id: string) => books.find(b => b.id === id)!
const women = computed(() => ['jane-austen', 'toni-morrison', 'barbara-kingsolver', 'betty-smith', 'laura-hillenbrand', 'sohn-won-pyung', 'madeline-cash'])
const womenRead = computed(() => read.value.filter(b => women.value.includes(b.authorId)).length)
</script>

<template>
  <div class="page wrap">
    <div class="page-head">
      <div>
        <p class="eyebrow">What it adds up to</p>
        <h1>Insights</h1>
        <p class="lede">Counts, shapes and the threads that run between books.</p>
      </div>
    </div>

    <div class="tiles">
      <div class="card tile"><div class="k">Fiction share</div><div class="v">{{ Math.round((fiction / read.length) * 100) }}%</div><div class="s">{{ fiction }} of {{ read.length }} read are novels</div></div>
      <div class="card tile"><div class="k">My average</div><div class="v">{{ myAvg.toFixed(2) }}</div><div class="s">vs {{ grAvg.toFixed(2) }} Goodreads avg</div></div>
      <div class="card tile"><div class="k">Oldest read</div><div class="v small-v">{{ yearLabel(oldest.year) }}</div><div class="s">{{ oldest.title }}</div></div>
      <div class="card tile"><div class="k">Longest read</div><div class="v">{{ longest.pages }}</div><div class="s">pages · {{ longest.title }}</div></div>
      <div class="card tile"><div class="k">Women authors</div><div class="v">{{ womenRead }}</div><div class="s">read · {{ women.length - womenRead }} on the want list</div></div>
    </div>

    <div class="charts">
      <section class="card ch">
        <h3>Genre</h3><p class="small muted">Literary fiction dominates both piles. The want list leans harder into fantasy and history.</p>
        <BarChart :rows="byGenre" />
      </section>
      <section class="card ch">
        <h3>Style</h3><p class="small muted">Novels first, then guides. Almost nothing I want to read next is non-fiction.</p>
        <BarChart :rows="byForm" />
      </section>
      <section class="card ch">
        <h3>Era of first publication</h3><p class="small muted">A mid-century bulge: the 1940s to 1960s produced a third of the shelf.</p>
        <BarChart :rows="byEra" />
      </section>
      <section class="card ch">
        <h3>Original language</h3><p class="small muted">English by a mile. The want list adds Chinese, French, Japanese, Korean and Polish.</p>
        <BarChart :rows="byLang" />
      </section>
      <section class="card ch">
        <h3>Country</h3><p class="small muted">Top eight. The United States is roughly two thirds of everything.</p>
        <BarChart :rows="byCountry" />
      </section>
      <section class="card ch">
        <h3>Themes I keep meeting</h3><p class="small muted">Tags across the books I have read, sized by count.</p>
        <div class="cloud">
          <span v-for="t in themeCounts" :key="t.name" class="tag" :style="{ fontSize: 11 + t.items.length * 2 + 'px' }" :title="t.items.map(x => x.b.title).join(', ')">{{ t.name }}<span class="n">{{ t.items.length }}</span></span>
        </div>
      </section>
    </div>

    <div class="section">
      <h2>Threads</h2>
      <p class="lede">What the books taught me when read together. Each thread is a lesson stitched from several covers.</p>
      <div class="threads">
        <article v-for="t in threads" :key="t.id" class="card thread">
          <div class="tcovers"><BookCover v-for="id in t.books" :key="id" :book="byId(id)" :caption="false" class="mini" /></div>
          <h3>{{ t.title }}</h3>
          <p class="ttext">{{ t.text }}</p>
        </article>
      </div>
    </div>

    <div class="section">
      <h2>Where I disagree with the crowd</h2>
      <p class="lede">My rating against the Goodreads average, for the books I rated. Positive means I liked it more than most.</p>
      <div class="card tbl">
        <table>
          <thead><tr><th>Book</th><th>Mine</th><th>Goodreads</th><th>Diff</th></tr></thead>
          <tbody>
            <tr v-for="b in rated" :key="b.id">
              <td><button class="lnk" @click="select(b)">{{ b.title }}</button> <span class="faint small">{{ b.author }}</span></td>
              <td class="num">{{ b.myRating }}</td>
              <td class="num">{{ b.avgRating.toFixed(2) }}</td>
              <td class="num" :class="{ pos: b.myRating! - b.avgRating > 0, neg: b.myRating! - b.avgRating < 0 }">{{ (b.myRating! - b.avgRating > 0 ? '+' : '') + (b.myRating! - b.avgRating).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tile .small-v { font-size: 26px; padding-top: 6px; }
.charts { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-top: 24px; }
.ch { padding: 18px 20px 20px; }
.ch h3 { margin-bottom: 2px; }
.ch > p { margin-bottom: 14px; }
.cloud { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.cloud .n { opacity: .55; margin-left: 4px; font-size: 11px; }
.threads { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-top: 22px; }
.thread { padding: 18px 20px 20px; }
.tcovers { display: flex; gap: 6px; margin-bottom: 14px; }
.mini { width: 44px; }
.thread h3 { font-size: 18px; margin-bottom: 8px; letter-spacing: -.01em; }
.ttext { font-size: 15px; line-height: 1.55; color: var(--ink); }
.tbl { padding: 6px 18px; margin-top: 20px; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: var(--ink-3); padding: 10px 8px 8px; border-bottom: 1px solid var(--line); }
td { padding: 9px 8px; border-bottom: 1px solid var(--line); }
tr:last-child td { border-bottom: 0; }
.num { text-align: right; font-variant-numeric: tabular-nums; }
.pos { color: var(--g-6); font-weight: 600; } .neg { color: var(--g-8); font-weight: 600; }
th:not(:first-child) { text-align: right; }
.lnk { padding: 0; text-align: left; }
.lnk:hover { color: var(--accent); }
</style>
