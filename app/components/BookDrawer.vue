<script setup lang="ts">
import { STATS } from '~/data/books'
import { summaries } from '~/data/summaries'
import { coverUrl, yearLabel, fmtDate, genreSlot, openLibraryUrl } from '~/composables/useLibrary'

const { selected, select } = useLibrary()
const close = () => select(null)
onMounted(() => {
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})
const refresher = computed(() => (selected.value ? summaries[selected.value.id] : undefined))
const statRows = computed(() => STATS.filter(s => selected.value?.stats[s.key]).map(s => ({ ...s, pts: selected.value!.stats[s.key]! })))
</script>

<template>
  <Transition name="dr">
    <div v-if="selected" class="scrim" @click.self="close">
      <aside class="drawer card" role="dialog" aria-modal="true" :aria-label="selected.title">
        <button class="x" aria-label="Close" @click="close">×</button>
        <div class="top">
          <div class="cov" :style="{ '--c': `var(--g-${genreSlot(selected.genre)})` }">
            <img v-if="coverUrl(selected, 'M')" :src="coverUrl(selected, 'M')!" :alt="`Cover of ${selected.title}`" />
          </div>
          <div>
            <p class="eyebrow">{{ selected.status === 'read' ? 'Read' : selected.status === 'reading' ? 'Reading now' : 'Want to read' }}<template v-if="selected.series"> · {{ selected.series }}</template></p>
            <h2>{{ selected.title }}</h2>
            <p class="muted by">{{ selected.author }}</p>
            <p class="small faint">{{ selected.place }}, {{ selected.country }} · first published {{ yearLabel(selected.year) }} · {{ selected.language }}</p>
            <div class="chips meta">
              <span class="tag"><span class="dot" :class="`g-${genreSlot(selected.genre)}`" />{{ selected.genre }}</span>
              <span class="tag">{{ selected.form }}</span>
              <span class="tag">{{ selected.pages }} pages</span>
            </div>
          </div>
        </div>

        <div class="ratings">
          <div><span class="k">My rating</span><span class="v">{{ selected.myRating ? '★'.repeat(selected.myRating) + '☆'.repeat(5 - selected.myRating) : 'unrated' }}</span></div>
          <div><span class="k">Goodreads</span><span class="v">{{ selected.avgRating.toFixed(2) }}</span></div>
          <div v-if="selected.dateRead"><span class="k">Finished</span><span class="v">{{ fmtDate(selected.dateRead) }}</span></div>
          <div v-else><span class="k">Added</span><span class="v">{{ fmtDate(selected.dateAdded) }}</span></div>
        </div>

        <section v-if="selected.takeaway">
          <h3>What I took from it</h3>
          <p class="body">{{ selected.takeaway }}</p>
        </section>
        <section v-else-if="selected.why">
          <h3>{{ selected.status === 'reading' ? 'Why I picked it up' : 'Why it is on the list' }}</h3>
          <p class="body">{{ selected.why }}</p>
        </section>

        <section v-if="refresher" class="remind">
          <details>
            <summary>Remind me what it was about</summary>
            <p class="body gist">{{ refresher.gist }}</p>
            <h4>Worth keeping</h4>
            <ul class="ideas"><li v-for="i in refresher.ideas" :key="i">{{ i }}</li></ul>
            <template v-if="refresher.people">
              <h4>Who was who</h4>
              <ul class="ideas"><li v-for="p in refresher.people" :key="p">{{ p }}</li></ul>
            </template>
          </details>
        </section>

        <section>
          <h3>Themes</h3>
          <div class="chips"><span v-for="t in selected.themes" :key="t" class="tag">{{ t }}</span></div>
        </section>

        <section v-if="statRows.length">
          <h3>{{ selected.status === 'read' ? 'Stats earned' : 'Stats it would grant' }}</h3>
          <ul class="stats">
            <li v-for="s in statRows" :key="s.key"><span>{{ s.label }}</span><span class="pts">{{ '+'.repeat(1) }}{{ s.pts }}</span></li>
          </ul>
        </section>

        <a class="ol" :href="openLibraryUrl(selected)" target="_blank" rel="noopener">Find on Open Library ↗</a>
      </aside>
    </div>
  </Transition>
</template>

<style scoped>
.scrim { position: fixed; inset: 0; background: rgba(71, 76, 100, .45); z-index: 40; display: flex; justify-content: flex-end; backdrop-filter: blur(2px); }
.drawer { width: min(520px, 100%); height: 100%; overflow-y: auto; padding: 28px 28px 40px; border-radius: 0; border-left: 1px solid var(--line); position: relative; }
.x { position: absolute; top: 12px; right: 16px; font-size: 28px; line-height: 1; color: var(--ink-3); padding: 4px 8px; }
.x:hover { color: var(--ink); }
.top { display: grid; grid-template-columns: 120px 1fr; gap: 20px; align-items: start; }
@media (max-width: 420px) { .top { grid-template-columns: 90px 1fr; gap: 14px; } }
.cov { aspect-ratio: 2/3; border-radius: 6px; overflow: hidden; background: var(--bg-2); border-left: 4px solid var(--c); outline: 1px solid var(--line); }
.cov img { width: 100%; height: 100%; object-fit: cover; }
h2 { font-size: 24px; margin-top: 2px; text-transform: none; letter-spacing: -.01em; font-weight: 800; }
.by { margin-top: 4px; font-size: 15px; }
.meta { margin-top: 10px; }
.ratings { display: flex; gap: 22px; flex-wrap: wrap; margin: 22px 0 6px; padding: 14px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.ratings .k { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: var(--ink-3); }
.ratings .v { font-family: var(--display); font-weight: 800; font-size: 18px; }
section { margin-top: 22px; }
section h3 { font-size: 11px; color: var(--ink-2); margin-bottom: 8px; letter-spacing: .16em; font-weight: 700; }
.body { font-size: 16px; line-height: 1.55; font-weight: 500; }
.remind details { border: 1px solid var(--line); border-radius: var(--r-sm); padding: 0 14px; }
.remind summary { cursor: pointer; padding: 11px 0; font-size: 13px; font-weight: 600; color: var(--accent); list-style: none; display: flex; align-items: center; gap: 8px; }
.remind summary::-webkit-details-marker { display: none; }
.remind summary::before { content: '+'; font-family: var(--display); font-weight: 800; font-size: 16px; line-height: 1; width: 14px; }
.remind details[open] summary::before { content: '–'; }
.remind details[open] summary { border-bottom: 1px dashed var(--line); }
.gist { margin-top: 12px; font-size: 15px; }
.remind h4 { font-size: 11px; color: var(--ink-3); margin: 16px 0 6px; letter-spacing: .14em; text-transform: uppercase; font-weight: 700; }
.ideas { margin: 0 0 14px; padding-left: 18px; font-size: 14px; line-height: 1.5; display: flex; flex-direction: column; gap: 5px; }
.stats { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.stats li { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed var(--line); font-size: 14px; }
.pts { color: var(--accent); font-weight: 600; font-variant-numeric: tabular-nums; }
.ol { display: inline-block; margin-top: 26px; font-size: 13px; color: var(--accent); text-decoration: none; }
.ol:hover { text-decoration: underline; }
.dr-enter-active, .dr-leave-active { transition: opacity .2s; }
.dr-enter-active .drawer, .dr-leave-active .drawer { transition: transform .25s cubic-bezier(.2, .8, .2, 1); }
.dr-enter-from, .dr-leave-to { opacity: 0; }
.dr-enter-from .drawer, .dr-leave-to .drawer { transform: translateX(40px); }
</style>
