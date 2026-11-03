<script setup>
// Shell aplikasi: header (nav + panduan kriteria), router-view dengan
// transisi halaman, dan footer. Satu Router dipasang di main.js.
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <router-view v-slot="{ Component }">
        <Transition name="route" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
    <footer class="border-t border-slate-200/80 py-6">
      <p class="mx-auto max-w-7xl px-4 text-center text-xs text-slate-400 sm:px-6">
        Dibangun dengan Vue 3, Vite &amp; Tailwind CSS • Data demo terbundel di sisi klien
      </p>
    </footer>
  </div>
</template>
