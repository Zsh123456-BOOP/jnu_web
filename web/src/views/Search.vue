<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api';
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
    const data = await api.contents.list({
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
  <main class="container section">
    <div class="section-header">
      <h2>Search</h2>
      <p class="section-subtitle">Search across all published content.</p>
    </div>

    <div class="card">
      <form @submit.prevent="onSearch" class="search-form">
        <label for="search-input" class="visually-hidden">Keyword</label>
        <input
          id="search-input"
          v-model="keyword"
          type="text"
          class="form-input"
          placeholder="Try people, publications, or projects"
        />
        <button type="submit" class="btn btn--primary">Search</button>
      </form>
    </div>

    <div class="search-results">
      <div v-if="!keyword" class="empty-state">
        Enter a keyword to begin searching.
      </div>
      <div v-else-if="loading" class="card">Searching...</div>
      <div v-else-if="error" class="card empty-state">{{ error }}</div>
      <ContentList v-else :items="items" :show-module="true" empty-text="No results found." />
      <Pagination
        v-if="keyword && total > pageSize"
        :page="page"
        :page-size="pageSize"
        :total="total"
        @update:page="updatePage"
      />
    </div>
  </main>
</template>

<style scoped>
.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.search-form .form-input {
  flex: 1 1 300px;
}

.search-results {
  margin-top: var(--space-8);
}
</style>
