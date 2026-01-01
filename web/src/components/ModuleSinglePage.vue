<script setup>
import { computed, ref, watch } from 'vue';
import { getContentBySlug, getContents } from '../utils/api';
import ContentRenderer from './ContentRenderer.vue';

const props = defineProps({
  module: {
    type: Object,
    required: true
  }
});

const content = ref(null);
const loading = ref(false);
const error = ref('');

const defaultSlug = computed(() => {
  const config = props.module?.config_json || {};
  return config.defaultSlug || config.default_slug || '';
});

const loadContent = async () => {
  if (!props.module?.slug) {
    return;
  }
  loading.value = true;
  error.value = '';
  content.value = null;
  try {
    if (defaultSlug.value) {
      try {
        content.value = await getContentBySlug(props.module.slug, defaultSlug.value);
      } catch (err) {
        if (err?.status === 404) {
          const data = await getContents({ moduleSlug: props.module.slug, pageSize: 1 });
          content.value = data.items?.[0] || null;
        } else {
          throw err;
        }
      }
    } else {
      const data = await getContents({ moduleSlug: props.module.slug, pageSize: 1 });
      content.value = data.items?.[0] || null;
    }
  } catch (err) {
    error.value = err?.message || 'Failed to load content';
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.module?.slug,
  () => {
    loadContent();
  },
  { immediate: true }
);
</script>

<template>
  <section class="surface-card">
    <h2>{{ module.name }}</h2>
    <p class="muted">{{ module.config_json?.summary || module.type }}</p>
    <div v-if="loading" class="muted">Loading content...</div>
    <div v-else-if="error" class="muted">{{ error }}</div>
    <div v-else-if="!content" class="empty">No published content yet.</div>
    <div v-else>
      <h3>{{ content.title }}</h3>
      <ContentRenderer :content="content" />
    </div>
  </section>
</template>
