<script setup lang="ts">
import type { Book } from '~/data/books'
import { yearLabel } from '~/composables/useLibrary'

const { filtered, read, want, reading, books, status, select } = useLibrary()
const sort = ref<'added' | 'title' | 'author' | 'year' | 'rating'>('added')
const sorted = computed(() => {
  const xs = [...filtered.value]
  const by: Record<string, (a: Book, b: Book) => number> = {
    added: (a, b) => b.dateAdded.localeCompare(a.dateAdded) || a.title.localeCompare(b.title),
    title: (a, b) => a.title.localeCompare(b.title),
    author: (a, b) => a.author.split(' ').pop()!.localeCompare(b.author.split(' ').pop()!) || a.year - b.year,
    year: (a, b) => a.year - b.year,
    rating: (a, b) => (b.myRating ?? 0) - (a.myRating ?? 0) || b.avgRating - a.avgRating,
  }
  return xs.sort(by[sort.value])
})
const countries = computed(() => new Set(read.value.map(b => b.country)).size)
const pages = computed(() => read.value.reduce((a, b) => a + b.pages, 0))
const span = computed(() => `${yearLabel(Math.min(...books.map(b => b.year)))} – ${Math.max(...books.map(b => b.year))}`)
const latest = computed(() => [...read.value].filter(b => b.dateRead).sort((a, b) => b.dateRead!.localeCompare(a.dateRead!))[0])
useHead({ title: 'BookMap · Shelf' })
</script>

<template>
  <div class="page wrap">
    <section class="hero">
      <div>
        <p class="eyebrow">A personal reading map</p>
        <h1>Every book, placed.</h1>
        <p class="lede">What I have read, what is waiting, where it came from, when it was written, and what stuck. Click any cover for the story behind it.</p>
      </div>
      <div class="tiles hero-tiles">
        <div class="card tile"><div class="k">Read</div><div class="v">{{ read.length }}</div><div class="s">{{ pages.toLocaleString() }} pages</div></div>
        <div class="card tile"><div class="k">Waiting</div><div class="v">{{ want.length }}</div><div class="s">on the want list</div></div>
        <div class="card tile"><div class="k">Countries</div><div class="v">{{ countries }}</div><div class="s">authors from</div></div>
        <div class="card tile"><div class="k">Span</div><div class="v span">{{ span }}</div><div class="s">first publications</div></div>
      </div>
    </section>

    <p class="latest small muted">
      <template v-if="reading.length"><b>Reading now:</b> <button v-for="b in reading" :key="b.id" class="lnk" @click="select(b)">{{ b.title }}</button> by {{ reading[0].author }}. </template>
      <template v-if="latest">Most recently finished: <button class="lnk" @click="select(latest)">{{ latest.title }}</button> by {{ latest.author }}.</template>
    </p>

    <div class="controls">
      <StatusBar />
      <label class="sortl small muted">Sort
        <select v-model="sort" class="select">
          <option value="added">Recently added</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="year">Publication year</option>
          <option value="rating">My rating</option>
        </select>
      </label>
    </div>
    <GenreLegend class="lg" />

    <div class="grid">
      <BookCover v-for="b in sorted" :key="b.id" :book="b" />
    </div>
    <p v-if="!sorted.length" class="muted">Nothing matches. Try another word.</p>
  </div>
</template>

<style scoped>
.hero { display: grid; grid-template-columns: 1.1fr 1fr; gap: 32px; align-items: end; margin: 12px 0 28px; }
@media (max-width: 800px) { .hero { grid-template-columns: 1fr; } }
.hero .lede { margin-top: 12px; }
.hero-tiles { grid-template-columns: repeat(2, 1fr); }
.tile .span { font-size: 20px; padding-top: 10px; }
.latest { margin-bottom: 18px; }
.lnk { color: var(--accent); text-decoration: underline; padding: 0; }
.controls { display: flex; flex-wrap: wrap; gap: 10px 20px; align-items: flex-start; }
.controls :deep(.bar) { flex: 1; margin-bottom: 8px; }
.sortl { display: inline-flex; align-items: center; gap: 8px; }
.lg { margin: 6px 0 22px; }
</style>
