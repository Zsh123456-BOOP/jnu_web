<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getContents } from '../utils/api';
import ContentList from '../components/ContentList.vue';
import Pagination from '../components/Pagination.vue';

const route = useRoute();
const router = useRouter();

const keyword = ref(route.query.keyword || '');
const page = ref(Number(route.query.page) || 1);
const pageSize = 10;
const items = ref([]);
const total = ref(0);
const loading = ref(false);
const error = ref('');

const syncQuery = (nextPage = page.value, nextKeyword = keyword.value) => {
  router.replace({
    name: 'search',
    query: {
      ...(nextKeyword ? { keyword: nextKeyword } : {}),
      ...(nextPage > 1 ? { page: nextPage } : {})
    }
  });
};

const loadSearch = async () => {
  if (!keyword.value) {
    items.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const data = await getContents({
      keyword: keyword.value,
      page: page.value,
      pageSize
    });
    items.value = data.items || [];
    total.value = data.total || 0;
  } catch (err) {
    error.value = err?.message || 'Search failed';
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {
  page.value = 1;
  syncQuery(1, keyword.value);
};

watch(
  () => [route.query.keyword, route.query.page],
  () => {
    keyword.value = route.query.keyword || '';
    page.value = Number(route.query.page) || 1;
    loadSearch();
  },
  { immediate: true }
);

const updatePage = (nextPage) => {
  page.value = nextPage;
  syncQuery(nextPage, keyword.value);
};
</script>

<template>
  <section class="surface-card">
    <h2>Search</h2>
    <p class="muted">Search across all published content.</p>

    <div class="surface-card" style="padding: 16px;">
      <label class="muted" for="search-input">Keyword</label>
      <div style="display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap;">
        <input
          id="search-input"
          v-model="keyword"
          type="text"
          placeholder="Try people, publications, or projects"
          style="flex: 1; min-width: 220px;"
        />
        <button type="button" @click="onSearch">Search</button>
      </div>
    </div>

    <div v-if="!keyword" class="empty" style="margin-top: 20px;">
      Enter a keyword to begin searching.
    </div>
    <div v-else-if="loading" class="muted">Searching...</div>
    <div v-else-if="error" class="muted">{{ error }}</div>
    <ContentList v-else :items="items" :show-module="true" empty-text="No results found." />
    <Pagination
      v-if="keyword && total > pageSize"
      :page="page"
      :page-size="pageSize"
      :total="total"
      @update:page="updatePage"
    />
  </section>
</template>
