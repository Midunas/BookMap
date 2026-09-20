<script setup lang="ts">
import { GENRES } from '~/data/books'
import { genreSlot } from '~/composables/useLibrary'
</script>
<template>
  <div class="legend">
    <span v-for="g in GENRES" :key="g" class="li"><span class="dot" :class="`g-${genreSlot(g)}`" />{{ g }}</span>
  </div>
</template>
<style scoped>
.legend { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 12px; color: var(--ink-2); }
.li { display: inline-flex; align-items: center; gap: 6px; }
</style>
