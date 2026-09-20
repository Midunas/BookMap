<script setup lang="ts">
// Horizontal bars. One or two series; direct value labels; legend only when two series.
export interface Row { label: string; a: number; b?: number }
const props = withDefaults(defineProps<{ rows: Row[]; seriesA?: string; seriesB?: string; colorA?: string; colorB?: string; unit?: string }>(), {
  seriesA: 'Read', seriesB: 'Want to read', colorA: 'var(--accent)', colorB: 'var(--want)', unit: '',
})
const max = computed(() => Math.max(1, ...props.rows.map(r => Math.max(r.a, r.b ?? 0))))
const two = computed(() => props.rows.some(r => r.b !== undefined))
</script>

<template>
  <div class="bc">
    <div v-if="two" class="lg"><span><i :style="{ background: colorA }" />{{ seriesA }}</span><span><i :style="{ background: colorB }" />{{ seriesB }}</span></div>
    <div v-for="r in rows" :key="r.label" class="row" :title="two ? `${r.label}: ${r.a} ${seriesA.toLowerCase()}, ${r.b ?? 0} ${seriesB.toLowerCase()}` : `${r.label}: ${r.a}${unit}`">
      <span class="lb">{{ r.label }}</span>
      <span class="bars">
        <span class="b" :style="{ width: (r.a / max) * 100 + '%', background: colorA }"><span class="v">{{ r.a }}{{ unit }}</span></span>
        <span v-if="two" class="b" :style="{ width: ((r.b ?? 0) / max) * 100 + '%', background: colorB }"><span class="v">{{ r.b ?? 0 }}{{ unit }}</span></span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.bc { display: flex; flex-direction: column; gap: 8px; }
.lg { display: flex; gap: 16px; font-size: 12px; color: var(--ink-2); margin-bottom: 4px; }
.lg span { display: inline-flex; align-items: center; gap: 6px; }
.lg i { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
.row { display: grid; grid-template-columns: minmax(90px, 150px) 1fr; gap: 12px; align-items: center; }
.lb { font-size: 13px; color: var(--ink-2); text-align: right; line-height: 1.2; }
.bars { display: flex; flex-direction: column; gap: 2px; }
.b { height: 12px; border-radius: 0 4px 4px 0; position: relative; min-width: 2px; transition: width .4s; }
.v { position: absolute; left: calc(100% + 6px); top: -3px; font-size: 12px; color: var(--ink-2); font-variant-numeric: tabular-nums; white-space: nowrap; }
</style>
