<script setup>
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useSiteStore } from '../stores/site';
import PageHeader from './PageHeader.vue';

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
  const moduleMap = new Map(siteStore.modules.map((mod) => [mod.slug, mod]));
  if (Array.isArray(configItems) && configItems.length) {
    return configItems
      .map((item) => {
        if (!item) {
          return null;
        }
        if (typeof item === 'string') {
          const external = item.startsWith('http://') || item.startsWith('https://');
          const mapped = external ? null : moduleMap.get(item);
          return {
            title: item,
            description: '',
            to: external ? item : `/${item}`,
            external,
            typeLabel: mapped?.type || (external ? 'External' : 'Module')
          };
        }
        if (typeof item === 'object') {
          const url = item.url || (item.slug ? `/${item.slug}` : null);
          if (!url) {
            return null;
          }
          const mapped = item.slug ? moduleMap.get(item.slug) : null;
          return {
            title: item.title || item.name || 'Untitled',
            description: item.description || '',
            to: url,
            external: Boolean(item.url),
            typeLabel: mapped?.type || (item.url ? 'External' : 'Module')
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
      external: false,
      typeLabel: mod.type || 'Module'
    }));
});
</script>

<template>
  <section class="page">
    <div class="container">
      <PageHeader
        :title="module.name"
        :subtitle="module.config_json?.summary || 'Navigate to featured resources.'"
      />

      <div class="page-body">
        <div v-if="!items.length" class="empty-state">No landing items configured.</div>
        <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3">
          <article v-for="item in items" :key="item.title" class="card card--interactive">
            <div class="card__badge">
              <span class="badge badge--neutral">{{ item.typeLabel }}</span>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description || 'Explore this area of the lab.' }}</p>
            <RouterLink v-if="!item.external" class="btn btn--primary" :to="item.to">
              Open
            </RouterLink>
            <a v-else class="btn btn--secondary" :href="item.to" target="_blank" rel="noreferrer">
              Visit
            </a>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
