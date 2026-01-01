<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import SiteNav from './components/SiteNav.vue';
import SiteFooter from './components/SiteFooter.vue';
import { useSiteStore } from './stores/site';

const siteStore = useSiteStore();

onMounted(() => {
  siteStore.bootstrap();
});
</script>

<template>
  <div class="app-shell">
    <SiteNav />
    <main class="app-main">
      <RouterView />
    </main>
    <SiteFooter />
  </div>
</template>
