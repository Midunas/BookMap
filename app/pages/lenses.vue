<script setup lang="ts">
import type { Book } from '~/data/books'
import { groupBy, centuryOf, avg } from '~/composables/useLibrary'

const { filtered } = useLibrary()
useHead({ title: 'BookMap · Lenses' })

const lenses: { key: string; label: string; fn: (b: Book) => string; blurb: string }[] = [
  { key: 'genre', label: 'Genre', fn: b => b.genre, blurb: 'What kind of book it is.' },
  { key: 'form', label: 'Style', fn: b => b.form, blurb: 'The shape of the writing: novel, memoir, treatise, guide.' },
  { key: 'author', label: 'Author', fn: b => b.author, blurb: 'Writers I keep coming back to float to the top.' },
  { key: 'country', label: 'Country', fn: b => b.country, blurb: 'Where the author is from.' },
  { key: 'language', label: 'Original language', fn: b => b.language, blurb: 'The language the book was first written in.' },
  { key: 'century', label: 'Century', fn: b => centuryOf(b.year), blurb: 'When it was first published.' },
  { key: 'theme', label: 'Theme', fn: b => b.themes[0], blurb: 'The leading theme I tagged each book with.' },
  { key: 'rating', label: 'My rating', fn: b => (b.myRating ? `${b.myRating} stars` : 'Unrated'), blurb: 'Only books I have rated on Goodreads.' },
]
const lens = ref(lenses[0])
const groups = computed(() =>
  groupBy(filtered.value, lens.value.fn).sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name)),
)
</script>

<template>
  <div class="page wrap">
    <div class="page-head">
      <div>
        <p class="eyebrow">By anything</p>
        <h1>Lenses</h1>
        <p class="lede">The same shelf, regrouped. Pick a lens and the books rearrange themselves.</p>
      </div>
    </div>
    <StatusBar />
    <div class="chips lenses">
      <button v-for="l in lenses" :key="l.key" class="chip" :class="{ on: lens.key === l.key }" @click="lens = l">{{ l.label }}</button>
    </div>
    <p class="small muted blurb">{{ lens.blurb }} {{ groups.length }} groups.</p>

    <div class="groups">
      <section v-for="g in groups" :key="g.name" class="card grp">
        <header>
          <h3>{{ g.name }}</h3>
          <span class="small faint">{{ g.items.length }} {{ g.items.length === 1 ? 'book' : 'books' }} · avg {{ avg(g.items.map(b => b.avgRating)).toFixed(2) }}</span>
        </header>
        <div class="row">
          <BookCover v-for="b in g.items" :key="b.id" :book="b" size="M" :caption="false" class="mini" />
        </div>
        <p class="small muted names">{{ g.items.map(b => b.title).join(' · ') }}</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.lenses { margin-bottom: 8px; }
.blurb { margin-bottom: 20px; }
.groups { display: grid; align-items: start; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.grp { padding: 16px 18px 14px; }
.grp header { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
.row { display: flex; flex-wrap: wrap; gap: 8px; }
.mini { width: 54px; }
.names { margin-top: 12px; line-height: 1.5; }
</style>
