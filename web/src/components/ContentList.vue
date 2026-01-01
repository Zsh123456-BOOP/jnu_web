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
  const moduleSlug = item.module?.slug || item.module_slug || item.moduleSlug || '';
  return `/${moduleSlug}/${item.slug}`;
};
</script>

<template>
  <div v-if="!rows.length" class="empty-state">{{ emptyText }}</div>
  <div v-else class="content-list">
    <article v-for="item in rows" :key="item.id || item.slug" class="card">
      <div class="card__meta" v-if="showModule && (item.module?.name || item.module_name)">
        <span class="badge">{{ item.module?.name || item.module_name }}</span>
      </div>
      <RouterLink :to="toPath(item)" class="card__title-link">
        <h4 class="card__title">{{ item.title }}</h4>
      </RouterLink>
      <p class="card__summary">{{ item.summary || 'Summary will be updated soon.' }}</p>
      <div class="card__footer">
        {{ formatDate(item.published_at || item.created_at) }}
      </div>
    </article>
  </div>
</template>

<style scoped>
.content-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Override default card padding for a denser list view */
.card {
  padding: var(--space-5);
}

.card__meta {
  margin-bottom: var(--space-3);
}

.card__title {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-2);
  font-family: var(--font-serif);
  font-weight: var(--font-weight-semibold);
}

.card__title-link {
  text-decoration: none;
  color: var(--color-text);
}
.card__title-link:hover .card__title {
  color: var(--color-primary);
  text-decoration: underline;
}

.card__summary {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-4);
}

.card__footer {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: auto; /* Pushes footer to the bottom */
}
</style>