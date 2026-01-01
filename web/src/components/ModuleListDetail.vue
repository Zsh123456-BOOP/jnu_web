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
          <label class="muted" for="module-search">Search within this module</label>
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
