<script setup>
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';

const props = defineProps({
  source: {
    type: String,
    default: ''
  }
});

const markdown = new MarkdownIt({
  linkify: true,
  breaks: true,
  html: false
});

const rendered = computed(() => markdown.render(props.source || ''));
</script>

<template>
  <div class="content-preview" v-html="rendered"></div>
</template>
