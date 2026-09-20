<script setup lang="ts">
import { STATS, type Book } from '~/data/books'

const c = useCharacter()
const { want, select } = useLibrary()
useHead({ title: 'BookMap · Character' })

// Quests: unread books ranked by how much they help the weakest stats.
const weakest = computed(() => [...c.stats].sort((a, b) => a.points - b.points).slice(0, 2).map(s => s.key))
const quests = computed(() =>
  [...want.value]
    .map(b => ({ b, score: STATS.reduce((a, s) => a + (b.stats[s.key] ?? 0) * (weakest.value.includes(s.key) ? 2 : 1), 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6),
)
const statLabel = (k: string) => STATS.find(s => s.key === k)!.label
const grants = (b: Book) => STATS.filter(s => b.stats[s.key]).map(s => `${s.label} +${b.stats[s.key]}`).join(', ')
const xpPct = computed(() => {
  const floor = c.readerLevel ** 2 * 100
  return Math.round(((c.pages - floor) / (c.nextPages - floor)) * 100)
})
</script>

<template>
  <div class="page wrap">
    <div class="page-head">
      <div>
        <p class="eyebrow">Reader sheet</p>
        <h1>Level {{ c.readerLevel }} {{ c.title }}</h1>
        <p class="lede">Every finished book adds points to six stats and pages to the experience bar. Unread books show what they would unlock.</p>
      </div>
    </div>

    <div class="card xp">
      <div class="xp-row">
        <span><b>{{ c.pages.toLocaleString() }}</b> pages read</span>
        <span class="small muted">{{ (c.nextPages - c.pages).toLocaleString() }} pages to level {{ c.readerLevel + 1 }}</span>
      </div>
      <div class="bar" role="progressbar" :aria-valuenow="xpPct" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: xpPct + '%' }" /></div>
      <div class="facts small muted">
        <span>{{ c.readCount }} books</span><span>{{ c.countries }} countries</span><span>{{ c.languages }} original languages</span><span>{{ c.badges.filter(b => b.unlocked).length }}/{{ c.badges.length }} badges</span>
      </div>
    </div>

    <div class="section">
      <h2>Stats</h2>
      <p class="lede">Levels follow a square curve: level 3 needs 9 points, level 4 needs 16. Progress is slow on purpose.</p>
      <div class="stats">
        <section v-for="s in c.stats" :key="s.key" class="card stat">
          <header>
            <div>
              <h3>{{ s.label }}</h3>
              <p class="small muted">{{ s.blurb }}</p>
            </div>
            <div class="lvl"><span class="n">{{ s.level }}</span><span class="small faint">level</span></div>
          </header>
          <div class="bar" role="progressbar" :aria-valuenow="Math.round(s.pct * 100)" aria-valuemin="0" aria-valuemax="100" :aria-label="`${s.label} progress`">
            <span :style="{ width: Math.round(s.pct * 100) + '%' }" />
          </div>
          <div class="pts small muted"><span>{{ s.points }} pts</span><span>{{ s.next - s.points }} to level {{ s.level + 1 }}</span></div>
          <div class="src">
            <span class="small faint">Earned from</span>
            <div class="minis"><BookCover v-for="b in s.top" :key="b.id" :book="b" :caption="false" class="mini" /></div>
          </div>
          <div v-if="s.boosters.length" class="src">
            <span class="small faint">Level up faster with</span>
            <div class="minis"><BookCover v-for="b in s.boosters" :key="b.id" :book="b" :caption="false" class="mini" /></div>
          </div>
          <p v-else class="small faint src">Nothing on the want list feeds this stat yet. Add a book that does.</p>
        </section>
      </div>
    </div>

    <div class="section">
      <h2>Badges</h2>
      <p class="lede">{{ c.badges.filter(b => b.unlocked).length }} unlocked. Locked ones say how to get there.</p>
      <div class="badges">
        <div v-for="b in c.badges" :key="b.id" class="card badge" :class="{ locked: !b.unlocked }">
          <div class="seal" :aria-hidden="true"><span>{{ b.unlocked ? '✓' : `${Math.min(b.progress, b.target)}/${b.target}` }}</span></div>
          <div>
            <h3>{{ b.name }}</h3>
            <p class="small muted">{{ b.desc }}</p>
            <p v-if="!b.unlocked" class="small hint">{{ b.hint }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Next quests</h2>
      <p class="lede">Unread books ranked by how much they would raise my weakest stats right now: {{ weakest.map(statLabel).join(' and ') }}.</p>
      <ol class="quests">
        <li v-for="q in quests" :key="q.b.id" class="card quest">
          <BookCover :book="q.b" :caption="false" class="qc" />
          <div>
            <button class="qt" @click="select(q.b)">{{ q.b.title }}</button>
            <p class="small muted">{{ q.b.author }} · {{ q.b.pages }} pages</p>
            <p class="small grant">{{ grants(q.b) }}</p>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.xp { padding: 18px 22px; }
.xp-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.xp-row b { font-family: var(--serif); font-size: 22px; font-weight: 500; }
.bar { height: 10px; border-radius: 999px; background: var(--bg-2); overflow: hidden; }
.bar span { display: block; height: 100%; background: var(--accent); border-radius: 999px; transition: width .6s cubic-bezier(.2,.8,.2,1); }
.facts { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 12px; }
.stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 20px; }
.stat { padding: 18px 20px; }
.stat header { display: flex; justify-content: space-between; gap: 14px; margin-bottom: 12px; }
.lvl { text-align: center; line-height: 1; }
.lvl .n { display: block; font-family: var(--serif); font-size: 36px; }
.pts { display: flex; justify-content: space-between; margin-top: 6px; }
.src { margin-top: 14px; display: flex; flex-direction: column; gap: 6px; }
.minis { display: flex; gap: 6px; }
.mini { width: 44px; }
.badges { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; margin-top: 20px; }
.badge { display: flex; gap: 14px; padding: 14px 16px; align-items: flex-start; }
.badge.locked { opacity: .78; }
.seal { flex: none; width: 46px; height: 46px; border-radius: 50%; background: var(--accent); color: var(--accent-ink); display: grid; place-items: center; font-weight: 600; font-size: 13px; font-variant-numeric: tabular-nums; }
.locked .seal { background: var(--bg-2); color: var(--ink-2); border: 1px dashed var(--ink-3); }
.badge h3 { font-size: 16px; }
.hint { margin-top: 6px; color: var(--accent); }
.quests { list-style: none; margin: 20px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
.quest { display: flex; gap: 14px; padding: 14px; align-items: flex-start; }
.qc { width: 58px; flex: none; }
.qt { font-family: var(--serif); font-size: 18px; text-align: left; padding: 0; line-height: 1.2; }
.qt:hover { color: var(--accent); }
.grant { margin-top: 6px; color: var(--accent); }
</style>
