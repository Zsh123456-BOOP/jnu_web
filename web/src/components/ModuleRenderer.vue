<script setup>
import { computed } from 'vue';
import ModuleSinglePage from './ModuleSinglePage.vue';
import ModuleListDetail from './ModuleListDetail.vue';
import ModuleExternalLink from './ModuleExternalLink.vue';
import ModuleLandingGrid from './ModuleLandingGrid.vue';
import ModuleContact from './ModuleContact.vue';

const props = defineProps({
  module: {
    type: Object,
    required: true
  }
});

const componentMap = {
  SinglePage: ModuleSinglePage,
  ListDetail: ModuleListDetail,
  ExternalLink: ModuleExternalLink,
  LandingGrid: ModuleLandingGrid,
  Contact: ModuleContact
};

const resolvedComponent = computed(() => {
  return componentMap[props.module?.type] || ModuleSinglePage;
});
</script>

<template>
  <component :is="resolvedComponent" :module="module" />
</template>
