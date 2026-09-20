<script setup lang="ts">
import type { Book } from '~/data/books'
import { coverUrl, genreSlot } from '~/composables/useLibrary'

const props = withDefaults(defineProps<{ book: Book; size?: 'S' | 'M' | 'L'; caption?: boolean; dim?: boolean }>(), { size: 'M', caption: true })
const failed = ref(false)
const src = computed(() => (failed.value ? null : coverUrl(props.book, props.size)))
const { select } = useLibrary()
</script>

<template>
  <button class="bk" :class="{ dim, want: book.status === 'want' }" :title="`${book.title} · ${book.author}`" @click="select(book)">
    <span class="cov" :class="`s-${genreSlot(book.genre)}`">
      <img v-if="src" :src="src" :alt="`Cover of ${book.title}`" loading="lazy" @error="failed = true" />
      <span v-else class="fallback">
        <span class="t">{{ book.title }}</span>
        <span class="a">{{ book.author }}</span>
      </span>
      <span v-if="caption && book.status === 'want'" class="ribbon">to read</span>
      <span v-if="caption && book.myRating" class="stars">{{ '★'.repeat(book.myRating) }}</span>
    </span>
    <span v-if="caption" class="cap">
      <span class="ct">{{ book.title }}</span>
      <span class="ca">{{ book.author }}</span>
    </span>
  </button>
</template>

<style scoped>
.bk { display: flex; flex-direction: column; gap: 8px; text-align: left; padding: 0; width: 100%; }
.cov {
  position: relative; display: block; aspect-ratio: 2 / 3; border-radius: 6px; overflow: hidden; background: var(--bg-2);
  outline: 1px solid var(--line); transition: transform .2s; border-left: 4px solid var(--c);
}
.s-1 { --c: var(--g-1); } .s-2 { --c: var(--g-2); } .s-3 { --c: var(--g-3); } .s-4 { --c: var(--g-4); }
.s-5 { --c: var(--g-5); } .s-6 { --c: var(--g-6); } .s-7 { --c: var(--g-7); } .s-8 { --c: var(--g-8); }
.bk:hover .cov { transform: translateY(-3px) rotate(-.5deg); outline-color: var(--line-strong); }
.cov img { width: 100%; height: 100%; object-fit: cover; }
.want .cov img { filter: saturate(.55) contrast(.95); opacity: .85; }
.dim .cov { opacity: .35; }
.fallback {
  position: absolute; inset: 0; padding: 12px 10px; display: flex; flex-direction: column; justify-content: space-between;
  background: linear-gradient(160deg, color-mix(in oklab, var(--c) 35%, var(--card)), var(--card));
}
.fallback .t { font-family: var(--display); font-weight: 800; text-transform: uppercase; font-size: 12px; line-height: 1.1; color: var(--ink); }
.fallback .a { font-size: 10px; color: var(--ink-2); }
.ribbon {
  position: absolute; top: 8px; right: -22px; transform: rotate(35deg); background: var(--line-strong); color: var(--accent-ink);
  font-size: 9px; letter-spacing: .08em; text-transform: uppercase; padding: 2px 26px; font-weight: 600;
}
.stars { position: absolute; left: 6px; bottom: 5px; font-size: 10px; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.7); letter-spacing: -.5px; }
.cap { display: flex; flex-direction: column; gap: 1px; }
.ct { font-size: 13px; line-height: 1.3; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ca { font-size: 12px; color: var(--ink-3); }
</style>
