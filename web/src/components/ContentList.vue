<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { formatDate } from '../utils/format';

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  showModule: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: 'No content available yet.'
  }
});

const rows = computed(() => props.items || []);

const toPath = (item) => {
  const moduleSlug = item.module_slug || item.moduleSlug || '';
  return `/${moduleSlug}/${item.slug}`;
};
</script>

<template>
  <div v-if="!rows.length" class="empty">{{ emptyText }}</div>
  <div v-else class="table-list">
    <article v-for="item in rows" :key="item.id || item.slug" class="table-row">
      <div v-if="showModule && item.module_name" class="pill">{{ item.module_name }}</div>
      <RouterLink :to="toPath(item)">
        <h3>{{ item.title }}</h3>
      </RouterLink>
      <p>{{ item.summary || 'Summary will be updated soon.' }}</p>
      <div class="muted">{{ formatDate(item.published_at || item.created_at) }}</div>
    </article>
  </div>
</template>
