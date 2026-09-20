<script setup lang="ts">
import type { Book } from '~/data/books'
import { groupBy, eraOf, yearLabel, genreSlot } from '~/composables/useLibrary'

const { filtered, select } = useLibrary()
useHead({ title: 'BookMap · Timeline' })

// Piecewise scale: antiquity to 1800 squeezed into the first 14% of the strip, 1800 to 2030 gets the rest.
const W = 1000
const x = (y: number) => (y < 1800 ? ((y + 500) / 2300) * 0.14 * W : (0.14 + ((y - 1800) / 230) * 0.86) * W)
const ticks = [-500, 0, 1000, 1800, 1850, 1900, 1925, 1950, 1975, 2000, 2025]

// stack dots that share a year so they don't overlap
const dots = computed(() => {
  const byYear = groupBy([...filtered.value].sort((a, b) => a.year - b.year), b => String(b.year))
  return byYear.flatMap(g => g.items.map((b, i) => ({ b, cx: x(b.year), cy: 46 - i * 11 })))
})

const eras = computed(() => {
  const order = (name: string) => (name === 'Antiquity' ? -10000 : name.endsWith('century') ? parseInt(name) * 100 - 10000 : parseInt(name))
  return groupBy([...filtered.value].sort((a, b) => a.year - b.year), b => eraOf(b.year)).sort((a, b) => order(a.name) - order(b.name))
})
const tip = ref<{ x: number; y: number; b: Book } | null>(null)
</script>

<template>
  <div class="page wrap">
    <div class="page-head">
      <div>
        <p class="eyebrow">By time</p>
        <h1>Two and a half millennia of pages</h1>
        <p class="lede">Placed by first publication. The strip compresses everything before 1800 so the modern century does not swallow the ancients.</p>
      </div>
    </div>
    <StatusBar />

    <div class="card strip">
      <svg :viewBox="`0 0 ${W} 80`" class="ss" role="img" aria-label="Books placed on a timeline of publication years">
        <line :x1="0" :x2="W" y1="60" y2="60" class="axis" />
        <g v-for="t in ticks" :key="t">
          <line :x1="x(t)" :x2="x(t)" y1="56" y2="64" class="axis" />
          <text :x="x(t)" y="76" class="tk" text-anchor="middle">{{ yearLabel(t) }}</text>
        </g>
        <circle
          v-for="d in dots" :key="d.b.id" :cx="d.cx" :cy="d.cy" r="4.5"
          :class="['pt', `f-${genreSlot(d.b.genre)}`, { want: d.b.status === 'want' }]"
          @mousemove="tip = { x: $event.clientX, y: $event.clientY, b: d.b }" @mouseleave="tip = null" @click="select(d.b)"
        />
      </svg>
      <div v-if="tip" class="tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }"><b>{{ tip.b.title }}</b><br />{{ tip.b.author }} · {{ yearLabel(tip.b.year) }}</div>
      <GenreLegend />
    </div>

    <div class="eras">
      <section v-for="e in eras" :key="e.name" class="era">
        <div class="lbl">
          <h2>{{ e.name }}</h2>
          <span class="small faint">{{ e.items.length }} {{ e.items.length === 1 ? 'book' : 'books' }}</span>
        </div>
        <div class="books">
          <div v-for="b in e.items" :key="b.id" class="tb">
            <span class="yr small faint">{{ yearLabel(b.year) }}</span>
            <BookCover :book="b" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.strip { padding: 16px 18px 12px; margin-bottom: 36px; position: relative; }
.ss { width: 100%; height: auto; display: block; margin-bottom: 8px; }
.axis { stroke: var(--line); stroke-width: 1; }
.tk { font-size: 10px; fill: var(--ink-3); font-family: var(--sans); }
.pt { stroke: var(--card); stroke-width: 1.5; cursor: pointer; }
.pt.want { fill-opacity: .3; stroke: var(--ink-3); stroke-dasharray: 2 1.5; }
.f-1 { fill: var(--g-1); } .f-2 { fill: var(--g-2); } .f-3 { fill: var(--g-3); } .f-4 { fill: var(--g-4); }
.f-5 { fill: var(--g-5); } .f-6 { fill: var(--g-6); } .f-7 { fill: var(--g-7); } .f-8 { fill: var(--g-8); }
.eras { display: flex; flex-direction: column; }
.era { display: grid; grid-template-columns: 160px 1fr; gap: 24px; padding: 26px 0; border-top: 1px solid var(--line); }
@media (max-width: 720px) { .era { grid-template-columns: 1fr; gap: 12px; } }
.lbl { position: sticky; top: 74px; align-self: start; }
.lbl h2 { font-size: 24px; }
.books { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 18px 14px; }
.tb { display: flex; flex-direction: column; gap: 4px; }
.yr { font-variant-numeric: tabular-nums; }
</style>
