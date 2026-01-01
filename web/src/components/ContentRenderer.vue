<script setup>
import { computed } from 'vue';
import MarkdownRenderer from './MarkdownRenderer.vue';

const props = defineProps({
  content: {
    type: Object,
    default: null
  }
});

const format = computed(() => props.content?.content_format || 'markdown');
const html = computed(() => props.content?.content_html || '');
</script>

<template>
  <MarkdownRenderer v-if="format === 'markdown'" :source="content?.content_md || ''" />
  <div v-else class="content-body" v-html="html"></div>
</template>
