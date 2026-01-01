<script setup>
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useSiteStore } from '../stores/site';

const props = defineProps({
  module: {
    type: Object,
    required: true
  }
});

const siteStore = useSiteStore();

onMounted(() => {
  if (!siteStore.modules.length) {
    siteStore.fetchModules();
  }
});

const items = computed(() => {
  const configItems = props.module?.config_json?.items;
  if (Array.isArray(configItems) && configItems.length) {
    return configItems
      .map((item) => {
        if (!item) {
          return null;
        }
        if (typeof item === 'string') {
          const external = item.startsWith('http://') || item.startsWith('https://');
          return {
            title: item,
            description: '',
            to: external ? item : `/${item}`,
            external
          };
        }
        if (typeof item === 'object') {
          const url = item.url || (item.slug ? `/${item.slug}` : null);
          if (!url) {
            return null;
          }
          return {
            title: item.title || item.name || 'Untitled',
            description: item.description || '',
            to: url,
            external: Boolean(item.url)
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  return siteStore.modules
    .filter((mod) => mod.slug !== props.module.slug)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((mod) => ({
      title: mod.name,
      description: mod.config_json?.summary || mod.type,
      to: `/${mod.slug}`,
      external: false
    }));
});
</script>

<template>
  <section class="surface-card">
    <h2>{{ module.name }}</h2>
    <p class="muted">{{ module.config_json?.summary || 'Navigate to featured resources.' }}</p>

    <div v-if="!items.length" class="empty">No landing items configured.</div>
    <div v-else class="grid cols-3">
      <article v-for="item in items" :key="item.title" class="surface-card">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description || 'Explore this area of the lab.' }}</p>
        <RouterLink v-if="!item.external" class="link-button secondary" :to="item.to">
          Open
        </RouterLink>
        <a v-else class="link-button secondary" :href="item.to" target="_blank" rel="noreferrer">
          Visit
        </a>
      </article>
    </div>
  </section>
</template>
