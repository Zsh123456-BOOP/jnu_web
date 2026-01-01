<script setup>
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useSiteStore } from '../stores/site';

const siteStore = useSiteStore();
const navModules = computed(() => siteStore.navModules);
const loading = computed(() => siteStore.loadingModules);
const settingsSite = computed(() => siteStore.settingsSite?.value || {});
const siteName = computed(() => settingsSite.value.siteName || 'Lab Nexus');
const logoText = computed(
  () => settingsSite.value.logoText || 'Research, people, and publications'
);

onMounted(() => {
  if (!siteStore.modules.length) {
    siteStore.fetchModules();
  }
});
</script>

<template>
  <header class="site-nav">
    <div class="site-nav-inner">
      <div class="brand">
        <span class="brand-title">{{ siteName }}</span>
        <span class="brand-subtitle">{{ logoText }}</span>
      </div>
      <nav class="nav-links">
        <RouterLink class="nav-link" to="/">Home</RouterLink>
        <RouterLink class="nav-link" to="/search">Search</RouterLink>
        <span v-if="loading" class="muted">Loading navigation...</span>
        <RouterLink
          v-for="item in navModules"
          :key="item.id"
          class="nav-link"
          :to="`/${item.slug}`"
        >
          {{ item.name }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
