<script setup>
import { computed } from 'vue';
import PageHeader from './PageHeader.vue';

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
  <section class="page">
    <div class="container">
      <PageHeader
        :title="module.name"
        :subtitle="description || 'This module points to an external resource.'"
      />

      <div class="page-body">
        <div class="card">
          <div v-if="url">
            <a class="btn btn--primary" :href="url" target="_blank" rel="noreferrer">
              Open external site
            </a>
          </div>
          <div v-else class="empty-state">No external URL configured for this module.</div>
        </div>
      </div>
    </div>
  </section>
</template>
