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

const isExternalLink = (href) => /^https?:\/\//i.test(href || '');
const defaultLinkRender =
  markdown.renderer.rules.link_open ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const href = token.attrGet('href');
  if (isExternalLink(href)) {
    token.attrSet('target', '_blank');
    token.attrSet('rel', 'noopener noreferrer');
  }
  return defaultLinkRender(tokens, idx, options, env, self);
};

const rendered = computed(() => markdown.render(props.source || ''));
</script>

<template>
  <div class="content-body" v-html="rendered"></div>
</template>
