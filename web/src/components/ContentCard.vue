<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
  item: { type: Object, required: true },
  showModule: { type: Boolean, default: false }
});

// 模拟从 Asset ID 获取图片 URL 的逻辑 (实际项目中你需要一个 helper)
const coverUrl = computed(() => {
  if (props.item.cover_asset_id) {
    // 假设后端有一个 API 或静态路径映射
    // 这里用 Picsum 占位，实际应使用: `/api/assets/${props.item.cover_asset_id}`
    return `https://picsum.photos/seed/${props.item.id}/800/600`; 
  }
  return null;
});

const formattedDate = computed(() => {
  if (!props.item.published_at) return '';
  return new Date(props.item.published_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
});

// 解析 JSON 标签
const tags = computed(() => {
  try {
    return typeof props.item.tags_json === 'string' 
      ? JSON.parse(props.item.tags_json) 
      : (props.item.tags_json || []);
  } catch (e) { return []; }
});
</script>

<template>
  <article class="content-card">
    <RouterLink :to="`/${item.slug}`" class="content-card__media" v-if="coverUrl">
      <img :src="coverUrl" :alt="item.title" loading="lazy" />
    </RouterLink>

    <div class="content-card__body">
      <div class="content-card__meta">
        <span v-if="formattedDate">{{ formattedDate }}</span>
        <span v-if="showModule && item.module" class="meta-dot">· {{ item.module.name }}</span>
      </div>

      <h3 class="content-card__title">
        <RouterLink :to="`/${item.slug}`">{{ item.title }}</RouterLink>
      </h3>

      <p class="content-card__summary">{{ item.summary }}</p>

      <div class="content-card__footer" v-if="tags.length">
        <span v-for="tag in tags.slice(0, 3)" :key="tag" class="tag">#{{ tag }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.content-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid var(--color-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: var(--color-primary-soft);
}

.content-card__media {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: var(--color-surface-soft);
}

.content-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.content-card:hover .content-card__media img {
  transform: scale(1.05);
}

.content-card__body {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.content-card__meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-subtle);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.content-card__title {
  font-family: var(--font-sans); /* 标题改用 Sans 更现代，或者保持 Serif 视风格而定 */
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-3);
  line-height: 1.4;
}

.content-card__title a {
  color: var(--color-text);
  background-image: linear-gradient(var(--color-text), var(--color-text));
  background-size: 0% 1px;
  background-repeat: no-repeat;
  background-position: 0 100%;
  transition: background-size 0.3s;
}

.content-card:hover .content-card__title a {
  color: var(--color-primary);
  text-decoration: none;
}

.content-card__summary {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: var(--space-4);
  flex-grow: 1; /* 推送 Footer 到底部 */
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 限制摘要行数 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.content-card__footer {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.tag {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}
</style>
