<script setup lang="ts">
import { groupBy, avg } from '~/composables/useLibrary'
const { filtered, read } = useLibrary()
const active = ref<string | null>(null)
const byCountry = computed(() =>
  groupBy(filtered.value, b => b.country).sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name)),
)
const shown = computed(() => (active.value ? byCountry.value.filter(g => g.name === active.value) : byCountry.value))
const readCountries = computed(() => new Set(read.value.map(b => b.country)).size)
const allCountries = computed(() => new Set(useLibrary().books.map(b => b.country)).size)
useHead({ title: 'BookMap · Map' })
</script>

<template>
  <div class="page wrap">
    <div class="page-head">
      <div>
        <p class="eyebrow">By place</p>
        <h1>Where the voices come from</h1>
        <p class="lede">Each dot is an author's birthplace. Countries darken with the number of books. I have read authors from {{ readCountries }} countries; the want list would bring it to {{ allCountries }}.</p>
      </div>
    </div>
    <StatusBar />
    <div class="card mapcard">
      <ClientOnly>
        <WorldMap :books="filtered" :active="active" @pick="active = $event" />
        <template #fallback><div class="ph" /></template>
      </ClientOnly>
    </div>

    <div class="section">
      <div class="page-head">
        <h2>{{ active ? active : 'By country' }}</h2>
        <button v-if="active" class="chip" @click="active = null">Show all countries</button>
      </div>
      <div class="countries">
        <section v-for="g in shown" :key="g.name" class="cg">
          <header>
            <h3>{{ g.name }} <span class="faint">{{ g.items.length }}</span></h3>
            <span class="small faint">{{ [...new Set(g.items.map(b => b.author))].length }} authors · Goodreads avg {{ avg(g.items.map(b => b.avgRating)).toFixed(2) }}</span>
          </header>
          <div class="grid sm">
            <BookCover v-for="b in g.items" :key="b.id" :book="b" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mapcard { padding: 14px; overflow: hidden; }
.ph { aspect-ratio: 960 / 470; }
.countries { display: flex; flex-direction: column; gap: 32px; }
.cg header { display: flex; align-items: baseline; gap: 14px; margin-bottom: 12px; flex-wrap: wrap; }
.grid.sm { grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 16px 12px; }
</style>
