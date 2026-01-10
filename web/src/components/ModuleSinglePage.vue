<script setup>
import { computed, ref, watch } from 'vue';
import api from '../api';
import ContentRenderer from './ContentRenderer.vue';
import PageHeader from './PageHeader.vue';

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
const subtitle = computed(() => props.module?.config_json?.summary || '');

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
        content.value = await api.contents.getBySlug(props.module.slug, defaultSlug.value);
      } catch (err) {
        if (err?.status === 404) {
          const data = await api.contents.list({ moduleSlug: props.module.slug, pageSize: 1 });
          content.value = data.items?.[0] || null;
        } else {
          throw err;
        }
      }
    } else {
      const data = await api.contents.list({ moduleSlug: props.module.slug, pageSize: 1 });
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
  <section class="page">
    <div class="container">
      <PageHeader :title="module.name" :subtitle="subtitle" />

      <div class="page-body">
        <div class="card">
          <div v-if="loading" class="muted">Loading content...</div>
          <div v-else-if="error" class="muted">{{ error }}</div>
          <div v-else-if="!content" class="empty-state">No published content yet.</div>
          <div v-else>
            <ContentRenderer :content="content" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
