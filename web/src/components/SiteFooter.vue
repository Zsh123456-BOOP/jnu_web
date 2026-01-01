<script setup>
import { computed } from 'vue';
import { useSiteStore } from '../stores/site';

const siteStore = useSiteStore();
const settingsSite = computed(() => siteStore.settingsSite?.value || {});
const siteName = computed(() => settingsSite.value.siteName || 'Lab Nexus');
const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <p>© {{ year }} {{ siteName }}. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: var(--space-8) 0;
  background-color: var(--color-surface-soft);
  border-top: var(--border-width-sm) solid var(--color-border);
}

.site-footer .container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.site-footer p {
  margin-bottom: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
</style>