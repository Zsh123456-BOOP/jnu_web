<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getModuleBySlug } from '../utils/api';
import ModuleRenderer from '../components/ModuleRenderer.vue';

const route = useRoute();
const router = useRouter();

const moduleData = ref(null);
const loading = ref(false);
const error = ref('');

const loadModule = async () => {
  const slug = route.params.moduleSlug;
  if (!slug) {
    return;
  }
  loading.value = true;
  error.value = '';
  moduleData.value = null;
  try {
    moduleData.value = await getModuleBySlug(slug);
  } catch (err) {
    if (err?.status === 404) {
      router.replace('/404');
      return;
    }
    error.value = err?.message || 'Failed to load module';
  } finally {
    loading.value = false;
  }
};

watch(
  () => route.params.moduleSlug,
  () => {
    loadModule();
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <div v-if="loading" class="surface-card">Loading module...</div>
    <div v-else-if="error" class="surface-card">{{ error }}</div>
    <ModuleRenderer v-else-if="moduleData" :module="moduleData" />
  </div>
</template>
