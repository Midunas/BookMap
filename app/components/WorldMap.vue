<script setup lang="ts">
import type { Book } from '~/data/books'
import { groupBy } from '~/composables/useLibrary'

const props = defineProps<{ books: Book[]; active: string | null }>()
const emit = defineEmits<{ (e: 'pick', country: string | null): void }>()

const svgEl = ref<SVGSVGElement | null>(null)
const tip = ref<{ x: number; y: number; title: string; lines: string[] } | null>(null)
const failed = ref(false)
const ready = ref(false)

const NE_NAME: Record<string, string> = { 'United States': 'United States of America' }
const W = 960, H = 470

let d3: typeof import('d3'), features: any[] = [], path: any, projection: any

const countryCounts = computed(() => {
  const m = new Map<string, Book[]>()
  for (const b of props.books) { const k = NE_NAME[b.country] ?? b.country; (m.get(k) ?? m.set(k, []).get(k)!).push(b) }
  return m
})
const places = computed(() => groupBy(props.books, b => `${b.lat},${b.lng}`).map(g => ({ ...g, lat: g.items[0].lat, lng: g.items[0].lng, place: g.items[0].place, country: g.items[0].country })))

function draw() {
  if (!d3 || !svgEl.value) return
  const svg = d3.select(svgEl.value)
  const counts = countryCounts.value
  const max = Math.max(1, ...[...counts.values()].map(v => v.length))
  const step = (n: number) => (n === 0 ? 0 : Math.min(5, 1 + Math.floor((n / max) * 4.999)))

  svg.select('g.countries').selectAll('path').data(features).join('path')
    .attr('d', path)
    .attr('class', d => `c c${step(counts.get(d.properties.name)?.length ?? 0)} ${props.active && (NE_NAME[props.active] ?? props.active) === d.properties.name ? 'on' : ''}`)
    .on('click', (_, d) => {
      const disp = Object.entries(NE_NAME).find(([, v]) => v === d.properties.name)?.[0] ?? d.properties.name
      emit('pick', counts.has(d.properties.name) ? (props.active === disp ? null : disp) : null)
    })
    .on('mousemove', (ev: MouseEvent, d) => {
      const list = counts.get(d.properties.name)
      if (!list) { tip.value = null; return }
      tip.value = { x: ev.clientX, y: ev.clientY, title: `${d.properties.name} · ${list.length}`, lines: list.slice(0, 6).map(b => b.title).concat(list.length > 6 ? [`+${list.length - 6} more`] : []) }
    })
    .on('mouseleave', () => (tip.value = null))

  svg.select('g.places').selectAll('circle').data(places.value, (d: any) => d.name).join('circle')
    .attr('cx', d => projection([d.lng, d.lat])![0]).attr('cy', d => projection([d.lng, d.lat])![1])
    .attr('r', d => 3 + Math.sqrt(d.items.length) * 2.2)
    .attr('class', d => `p ${d.items.every(b => b.status === 'want') ? 'want' : ''}`)
    .on('mousemove', (ev: MouseEvent, d) => { tip.value = { x: ev.clientX, y: ev.clientY, title: `${d.place} · ${d.items.length}`, lines: d.items.slice(0, 6).map(b => `${b.title} (${b.author.split(' ').pop()})`) } })
    .on('mouseleave', () => (tip.value = null))
    .on('click', (_, d) => emit('pick', props.active === d.country ? null : d.country))
}

onMounted(async () => {
  try {
    const [mod, topo, world] = await Promise.all([
      import('d3'), import('topojson-client'),
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r => r.json()),
    ])
    d3 = mod
    features = (topo.feature(world, world.objects.countries) as any).features.filter((f: any) => f.properties.name !== 'Antarctica')
    projection = d3.geoNaturalEarth1().fitSize([W, H], { type: 'Sphere' } as any)
    path = d3.geoPath(projection)
    const svg = d3.select(svgEl.value!)
    svg.select('path.sphere').attr('d', path({ type: 'Sphere' } as any))
    svg.select('path.grat').attr('d', path(d3.geoGraticule10()))
    ready.value = true
    draw()
  } catch (e) { failed.value = true }
})
watch(() => [props.books, props.active], draw, { deep: false })
</script>

<template>
  <div class="mapwrap">
    <svg ref="svgEl" :viewBox="`0 0 ${W} ${H}`" class="map" role="img" aria-label="World map of author origins">
      <path class="sphere" />
      <path class="grat" />
      <g class="countries" />
      <g class="places" />
    </svg>
    <p v-if="!ready && !failed" class="note small faint">Loading map…</p>
    <p v-if="failed" class="note small muted">The map outline could not be loaded. The country list below has everything.</p>
    <div class="key small faint">
      <span>fewer</span><i class="k1" /><i class="k2" /><i class="k3" /><i class="k4" /><i class="k5" /><span>more books</span>
      <span class="sep">·</span><i class="pd" /><span>read</span><i class="pd want" /><span>want to read</span>
    </div>
    <div v-if="tip" class="tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }"><b>{{ tip.title }}</b><br /><span v-for="l in tip.lines" :key="l">{{ l }}<br /></span></div>
  </div>
</template>

<style scoped>
.mapwrap { position: relative; }
.map { width: 100%; height: auto; display: block; }
.map :deep(.sphere) { fill: var(--bg-2); stroke: var(--line); }
.map :deep(.grat) { fill: none; stroke: var(--line); stroke-width: .4; opacity: .7; }
.map :deep(.c) { stroke: var(--bg); stroke-width: .5; fill: var(--seq-0); transition: fill .2s; }
.map :deep(.c1) { fill: var(--seq-1); } .map :deep(.c2) { fill: var(--seq-2); } .map :deep(.c3) { fill: var(--seq-3); }
.map :deep(.c4) { fill: var(--seq-4); } .map :deep(.c5) { fill: var(--seq-5); }
.map :deep(.c1), .map :deep(.c2), .map :deep(.c3), .map :deep(.c4), .map :deep(.c5) { cursor: pointer; }
.map :deep(.c.on) { stroke: var(--ink); stroke-width: 1.2; }
.map :deep(.p) { fill: var(--ink); stroke: var(--bg); stroke-width: 1.5; cursor: pointer; opacity: .9; }
.map :deep(.p.want) { fill: var(--bg); stroke: var(--ink-2); stroke-dasharray: 2 1.5; }
.note { position: absolute; top: 12px; left: 12px; }
.key { display: flex; align-items: center; gap: 5px; margin-top: 8px; flex-wrap: wrap; }
.key i { width: 14px; height: 10px; border-radius: 2px; display: inline-block; }
.k1 { background: var(--seq-1); } .k2 { background: var(--seq-2); } .k3 { background: var(--seq-3); } .k4 { background: var(--seq-4); } .k5 { background: var(--seq-5); }
.key .pd { width: 10px; height: 10px; border-radius: 50%; background: var(--ink); margin-left: 6px; }
.key .pd.want { background: transparent; border: 1.5px dashed var(--ink-2); }
.sep { margin: 0 6px; }
</style>
