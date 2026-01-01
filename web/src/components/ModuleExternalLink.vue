<script setup>
import { computed } from 'vue';

const props = defineProps({
  module: {
    type: Object,
    required: true
  }
});

const url = computed(() => props.module?.config_json?.url || '');
const description = computed(() => props.module?.config_json?.description || '');
</script>

<template>
  <section class="surface-card">
    <h2>{{ module.name }}</h2>
    <p class="muted">{{ description || 'This module points to an external resource.' }}</p>
    <div v-if="url">
      <a class="link-button" :href="url" target="_blank" rel="noreferrer">Open external site</a>
    </div>
    <div v-else class="empty">No external URL configured for this module.</div>
  </section>
</template>
