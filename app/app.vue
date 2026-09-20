<script setup lang="ts">
const links = [
  { to: '/', label: 'Shelf' },
  { to: '/map', label: 'Map' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/lenses', label: 'Lenses' },
  { to: '/character', label: 'Character' },
  { to: '/insights', label: 'Insights' },
]
const theme = ref<'light' | 'dark' | null>(null)
const apply = (t: 'light' | 'dark' | null) => {
  const root = document.documentElement
  if (t) root.setAttribute('data-theme', t); else root.removeAttribute('data-theme')
  try { t ? localStorage.setItem('bm-theme', t) : localStorage.removeItem('bm-theme') } catch {}
}
onMounted(() => { try { theme.value = (localStorage.getItem('bm-theme') as any) || null } catch {} })
const toggle = () => {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches)
  theme.value = dark ? 'light' : 'dark'
  apply(theme.value)
}
useHead({ script: [{ innerHTML: `try{var t=localStorage.getItem('bm-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}` }] })
</script>

<template>
  <div class="shell">
    <header class="hdr">
      <div class="wrap row">
        <NuxtLink to="/" class="brand"><span class="mark" aria-hidden="true" /><span>BookMap</span></NuxtLink>
        <nav class="nav" aria-label="Views">
          <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="nl">{{ l.label }}</NuxtLink>
        </nav>
        <button class="theme" aria-label="Toggle dark mode" title="Toggle theme" @click="toggle">◐</button>
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
.hdr { position: sticky; top: 0; z-index: 30; background: color-mix(in oklab, var(--bg) 88%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
.row { display: flex; align-items: center; gap: 18px; height: 58px; }
.brand { display: inline-flex; align-items: center; gap: 10px; font-family: var(--serif); font-size: 20px; text-decoration: none; font-weight: 500; }
.mark { width: 18px; height: 22px; border-radius: 3px; background: var(--accent); position: relative; }
.mark::after { content: ''; position: absolute; left: 5px; right: 5px; top: 5px; height: 2px; background: var(--accent-ink); box-shadow: 0 4px 0 var(--accent-ink); }
.nav { display: flex; gap: 2px; margin-left: auto; overflow-x: auto; scrollbar-width: none; }
.nav::-webkit-scrollbar { display: none; }
.nl { text-decoration: none; padding: 6px 11px; border-radius: 999px; color: var(--ink-2); font-size: 14px; white-space: nowrap; }
.nl:hover { color: var(--ink); background: var(--bg-2); }
.nl.router-link-exact-active { color: var(--ink); background: var(--card); box-shadow: inset 0 0 0 1px var(--line); }
.theme { font-size: 18px; color: var(--ink-2); padding: 4px 8px; border-radius: 999px; }
.theme:hover { color: var(--ink); background: var(--bg-2); }
.ftr { padding: 30px 0 40px; border-top: 1px solid var(--line); margin-top: 20px; }
@media (max-width: 640px) {
  .row { flex-wrap: wrap; height: auto; padding: 10px 0; row-gap: 6px; }
  .nav { order: 3; width: 100%; margin-left: 0; flex-wrap: wrap; }
  .theme { margin-left: auto; }
}
</style>
