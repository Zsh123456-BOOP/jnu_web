<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { getContentBySlug } from '../utils/api';
import { formatDate } from '../utils/format';
import ContentRenderer from '../components/ContentRenderer.vue';
import PageHeader from '../components/PageHeader.vue';

const route = useRoute();
const router = useRouter();

const content = ref(null);
const loading = ref(false);
const error = ref('');
const moduleSlug = computed(
  () => content.value?.module?.slug || content.value?.module_slug || ''
);
const moduleName = computed(
  () => content.value?.module?.name || content.value?.module_name || ''
);

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
  <main class="page">
    <div class="container">
      <div v-if="loading" class="card">Loading content...</div>
      <div v-else-if="error" class="card empty-state">{{ error }}</div>
      <article v-else-if="content">
        <PageHeader
          class="page-header--center"
          :title="content.title"
          :subtitle="`Published on ${formatDate(content.published_at || content.created_at)}`"
        >
          <template #actions>
            <RouterLink v-if="moduleSlug && moduleName" class="badge" :to="`/${moduleSlug}`">
              {{ moduleName }}
            </RouterLink>
          </template>
        </PageHeader>

        <div class="page-body">
          <ContentRenderer :content="content" />

          <div class="page-footer">
            <RouterLink v-if="moduleSlug" class="btn btn--secondary" :to="`/${moduleSlug}`">
              &larr; Back to {{ moduleName || 'module' }}
            </RouterLink>
          </div>
        </div>
      </article>
    </div>
  </main>
</template>
