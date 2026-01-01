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
    <div>© {{ year }} {{ siteName }}. All rights reserved.</div>
  </footer>
</template>
