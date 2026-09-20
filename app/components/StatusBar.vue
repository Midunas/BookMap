<script setup lang="ts">
const { status, query, read, want, books } = useLibrary()
</script>

<template>
  <div class="bar">
    <div class="chips">
      <button class="chip" :class="{ on: status === 'all' }" @click="status = 'all'">All<span class="n">{{ books.length }}</span></button>
      <button class="chip" :class="{ on: status === 'read' }" @click="status = 'read'">Read<span class="n">{{ read.length }}</span></button>
      <button class="chip" :class="{ on: status === 'want' }" @click="status = 'want'">Want to read<span class="n">{{ want.length }}</span></button>
    </div>
    <input v-model="query" class="search" type="search" placeholder="Search title, author, theme…" aria-label="Search books" />
  </div>
</template>

<style scoped>
.bar { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; justify-content: space-between; margin-bottom: 22px; }
</style>
