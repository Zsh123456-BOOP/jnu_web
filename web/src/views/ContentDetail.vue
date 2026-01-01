<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { getContentBySlug } from '../utils/api';
import { formatDate } from '../utils/format';
import ContentRenderer from '../components/ContentRenderer.vue';

const route = useRoute();
const router = useRouter();

const content = ref(null);
const loading = ref(false);
const error = ref('');

const loadContent = async () => {
  const moduleSlug = route.params.moduleSlug;
  const pageSlug = route.params.pageSlug;
  if (!moduleSlug || !pageSlug) {
    return;
  }
  loading.value = true;
  error.value = '';
  content.value = null;
  try {
    content.value = await getContentBySlug(moduleSlug, pageSlug);
  } catch (err) {
    if (err?.status === 404) {
      router.replace('/404');
      return;
    }
    error.value = err?.message || 'Failed to load content';
  } finally {
    loading.value = false;
  }
};

watch(
  () => [route.params.moduleSlug, route.params.pageSlug],
  () => {
    loadContent();
  },
  { immediate: true }
);
</script>

<template>
  <section class="surface-card">
    <div v-if="loading" class="muted">Loading content...</div>
    <div v-else-if="error" class="muted">{{ error }}</div>
    <div v-else-if="content">
      <div class="pill" v-if="content.module_name">{{ content.module_name }}</div>
      <h2>{{ content.title }}</h2>
      <p class="muted">{{ formatDate(content.published_at || content.created_at) }}</p>
      <ContentRenderer :content="content" />
      <div style="margin-top: 24px;">
        <RouterLink class="link-button secondary" :to="`/${content.module_slug}`">
          Back to {{ content.module_name || 'module' }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>
