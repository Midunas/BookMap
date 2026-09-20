<script setup lang="ts">
const links = [
  { to: '/', label: 'Shelf' },
  { to: '/map', label: 'Map' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/lenses', label: 'Lenses' },
  { to: '/character', label: 'Character' },
  { to: '/insights', label: 'Insights' },
]
</script>

<template>
  <div class="shell">
    <header class="hdr">
      <div class="wrap row">
        <NuxtLink to="/" class="brand"><span class="mark" aria-hidden="true" /><span>BookMap</span></NuxtLink>
        <nav class="nav" aria-label="Views">
          <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="nl">{{ l.label }}</NuxtLink>
        </nav>
      </div>
    </header>
    <main>
      <NuxtPage />
    </main>
    <footer class="ftr wrap small faint">
      Built from a Goodreads shelf. Covers via Open Library. Ratings out of five.
    </footer>
    <BookDrawer />
  </div>
</template>

<style scoped>
.hdr { position: sticky; top: 0; z-index: 30; background: var(--bar); color: var(--bar-ink); border-bottom: 1px solid var(--line); }
.row { display: flex; align-items: center; gap: 18px; height: 58px; }
.brand { display: inline-flex; align-items: center; gap: 10px; font-family: var(--display); font-size: 17px; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: .02em; font-stretch: 112%; }
.mark { width: 22px; height: 22px; border-radius: 50%; background: var(--bar-ink); position: relative; box-shadow: inset 0 0 0 .5px rgba(0,0,0,.35); }
.mark::after { content: ''; position: absolute; right: -6px; top: -3px; width: 5px; height: 5px; border-radius: 50%; background: var(--bar-ink); }
.nav { display: flex; gap: 2px; margin-left: auto; overflow-x: auto; scrollbar-width: none; }
.nav::-webkit-scrollbar { display: none; }
.nl { text-decoration: none; padding: 6px 12px; border-radius: 999px; color: var(--bar-ink); opacity: .78; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; white-space: nowrap; }
.nl:hover { opacity: 1; background: color-mix(in srgb, var(--bar-ink) 12%, transparent); }
.nl.router-link-exact-active { opacity: 1; background: var(--bar-ink); color: var(--bar); }
.ftr { padding: 30px 0 40px; border-top: 1px solid var(--line); margin-top: 20px; }
@media (max-width: 640px) {
  .row { flex-wrap: wrap; height: auto; padding: 10px 0; row-gap: 6px; }
  .nav { order: 3; width: 100%; margin-left: 0; flex-wrap: wrap; }
}
</style>
