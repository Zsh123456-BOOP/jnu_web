<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getContents } from '../utils/api';
import ContentList from './ContentList.vue';
import Pagination from './Pagination.vue';
import PageHeader from './PageHeader.vue';

const props = defineProps({
  module: {
    type: Object,
    required: true
  }
});

const layoutType = computed(() => {
  // 根据 slug 粗暴判断，或者更好的是在 module 表的 config_json 存一个 layout 字段
  if (props.module.slug === 'people' || props.module.slug === 'team') return 'grid-people';
  if (props.module.slug === 'publications') return 'list-dense';
  return 'grid-cards'; // 默认图文卡片
});

const route = useRoute();
const router = useRouter();

const keyword = ref(route.query.keyword || '');
const page = ref(Number(route.query.page) || 1);
const pageSize = 8;
const items = ref([]);
const total = ref(0);
const loading = ref(false);
const error = ref('');

const heading = computed(() => props.module?.name || 'Module');
const subtitle = computed(
  () => props.module?.config_json?.summary || 'Browse the latest entries.'
);

const syncQuery = (nextPage = page.value, nextKeyword = keyword.value) => {
  router.replace({
    name: 'module',
    params: { moduleSlug: props.module.slug },
    query: {
      ...(nextKeyword ? { keyword: nextKeyword } : {}),
      ...(nextPage > 1 ? { page: nextPage } : {})
    }
  });
};

const loadList = async () => {
  if (!props.module?.slug) {
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const data = await getContents({
      moduleSlug: props.module.slug,
      keyword: keyword.value || undefined,
      page: page.value,
      pageSize
    });
    items.value = data.items || [];
    total.value = data.total || 0;
  } catch (err) {
    error.value = err?.message || 'Failed to load content';
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {
  page.value = 1;
  syncQuery(1, keyword.value);
};

watch(
  () => [props.module?.slug, route.query.page, route.query.keyword],
  () => {
    page.value = Number(route.query.page) || 1;
    keyword.value = route.query.keyword || '';
    loadList();
  },
  { immediate: true }
);

const updatePage = (nextPage) => {
  page.value = nextPage;
  syncQuery(nextPage, keyword.value);
};
</script>

<template>
  <section class="page">
    <div class="container">
      <PageHeader :title="heading" :subtitle="subtitle" />

      <div class="page-body">
        <div class="card page-search">
          <label class="muted" for="module-search">Search / Filter</label>
          <div class="page-search__row">
            <input
              id="module-search"
              v-model="keyword"
              type="text"
              class="form-input page-search__input"
              placeholder="Type keyword"
            />
            <button class="btn btn--primary" type="button" @click="onSearch">Search</button>
          </div>
        </div>

        <div v-if="loading" class="muted">Loading list...</div>
        <div v-else-if="error" class="muted">{{ error }}</div>
        <ContentList
          v-else
          :items="items"
          :empty-text="'No published content in this module yet.'"
        />
        <Pagination
          v-if="total > pageSize"
          :page="page"
          :page-size="pageSize"
          :total="total"
          @update:page="updatePage"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ... 原有的样式 ... */

/* 3. 在这里添加您询问的 CSS (Style) */

/* 布局 A: 人物 (People) - 圆形头像网格 */
/* 使用 :deep() 穿透到子组件 ContentList 内部 */
.grid-people :deep(.content-list) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* 响应式网格 */
  gap: var(--space-6);
}

/* 针对人物卡片的特殊样式调整 (假设子组件用了 ContentCard) */
.grid-people :deep(.content-card) {
  align-items: center;
  text-align: center;
  padding: var(--space-6);
}
.grid-people :deep(.content-card__media) {
  width: 120px;
  height: 120px;
  border-radius: 50%; /* 圆形头像 */
  margin-bottom: var(--space-4);
  aspect-ratio: 1; /* 强制正方形 */
}
.grid-people :deep(.content-card__summary),
.grid-people :deep(.content-card__footer) {
  display: none; /* 人物列表通常不需要显示长摘要和日期 */
}


/* 布局 B: 论文 (Publications) - 紧凑列表 */
.list-dense :deep(.content-list) {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-dense :deep(.content-card) {
  flex-direction: row; /* 横向排列 */
  align-items: baseline;
  box-shadow: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  padding: var(--space-4) 0;
  background: transparent;
}
.list-dense :deep(.content-card__media) {
  display: none; /* 论文列表隐藏封面图 */
}
.list-dense :deep(.content-card__title) {
  font-size: var(--font-size-md);
  margin-bottom: var(--space-1);
}
.list-dense :deep(.content-card__body) {
  padding: 0;
}
</style>
