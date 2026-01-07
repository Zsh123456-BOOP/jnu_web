<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import http, { getErrorMessage } from '../utils/http';
import { formatDateTime } from '../utils/format';
import ContentRenderer from '../components/ContentRenderer.vue';

const loading = ref(false);
const contents = ref([]);
const modules = ref([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const filters = reactive({
  moduleId: '',
  status: '',
  year: '',
  keyword: ''
});

const router = useRouter();

const previewVisible = ref(false);
const previewContent = ref(null);

const loadModules = async () => {
  const pageSize = 100;
  let page = 1;
  let collected = [];

  while (true) {
    const res = await http.get('/admin/modules', { params: { page, pageSize } });
    const data = res.data?.data;
    const items = data?.items || [];
    const total = Number(data?.total || 0);
    collected = collected.concat(items);
    if (items.length < pageSize || collected.length >= total) {
      break;
    }
    page += 1;
  }

  modules.value = collected;
};

const loadContents = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    };
    if (filters.moduleId) {
      params.moduleId = filters.moduleId;
    }
    if (filters.status) {
      params.status = filters.status;
    }
    if (filters.year) {
      params.year = filters.year;
    }
    if (filters.keyword) {
      params.keyword = filters.keyword;
    }
    const res = await http.get('/admin/contents', { params });
    contents.value = res.data?.data?.items || [];
    pagination.total = res.data?.data?.total || 0;
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '加载内容失败'));
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  loadContents();
};

const resetFilters = () => {
  filters.moduleId = '';
  filters.status = '';
  filters.year = '';
  filters.keyword = '';
  handleSearch();
};

const handlePageChange = (page) => {
  pagination.page = page;
  loadContents();
};

const openCreate = () => {
  router.push({ name: 'content-create' });
};

const openEdit = (row) => {
  router.push({ name: 'content-edit', params: { id: row.id } });
};

const openPreview = (row) => {
  previewContent.value = row;
  previewVisible.value = true;
};

const normalizeOptional = (value) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  return value;
};

const buildContentPayload = (row, overrides = {}) => {
  const format = row.content_format || 'markdown';
  return {
    module_id: Number(row.module_id),
    title: String(row.title || '').trim(),
    slug: String(row.slug || '').trim(),
    status: row.status || 'draft',
    content_format: format,
    content_md: format === 'markdown' ? row.content_md : undefined,
    content_html: format === 'richtext' ? row.content_html : undefined,
    summary: normalizeOptional(row.summary),
    cover_asset_id: normalizeOptional(row.cover_asset_id),
    year: normalizeOptional(row.year),
    tags_json: normalizeOptional(row.tags_json),
    authors_json: normalizeOptional(row.authors_json),
    meta_json: normalizeOptional(row.meta_json),
    published_at: normalizeOptional(row.published_at),
    ...overrides
  };
};

const togglePublish = async (row) => {
  const nextStatus = row.status === 'published' ? 'draft' : 'published';
  const publishedAt = nextStatus === 'published' ? new Date().toISOString() : undefined;
  try {
    const payload = buildContentPayload(row, { status: nextStatus, published_at: publishedAt });
    await http.put(`/admin/contents/${row.id}`, payload);
    ElMessage.success(nextStatus === 'published' ? '已发布' : '已撤回');
    loadContents();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '更新状态失败'));
  }
};

const deleteContent = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除内容「${row.title}」吗？`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await http.delete(`/admin/contents/${row.id}`);
    ElMessage.success('内容已删除');
    loadContents();
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(getErrorMessage(err, '删除失败'));
    }
  }
};

onMounted(async () => {
  try {
    await loadModules();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '页面初始化失败'));
  }
  loadContents();
});
</script>

<template>
  <div>
    <el-card class="page-card page-card--tight">
      <template #header>
        <div class="card-header">
          <h2>内容管理</h2>
          <el-button type="primary" @click="openCreate">新增内容</el-button>
        </div>
      </template>

      <!-- Filters -->
      <el-form :model="filters" inline class="filter-form filter-bar">
        <el-form-item class="filter-item">
          <el-select v-model="filters.moduleId" class="filter-control" placeholder="所有模块" clearable>
            <el-option v-for="item in modules" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-item filter-item--sm">
          <el-select v-model="filters.status" class="filter-control" placeholder="所有状态" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-item filter-item--sm">
          <el-input v-model.trim="filters.year" class="filter-control" placeholder="年份" clearable />
        </el-form-item>
        <el-form-item class="filter-item filter-item--lg">
          <el-input v-model.trim="filters.keyword" class="filter-control" placeholder="关键词" clearable />
        </el-form-item>
        <div class="filter-actions">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </div>
      </el-form>

      <!-- Table -->
      <el-table class="admin-table" :data="contents" v-loading="loading" stripe>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="module_name" label="模块" width="140" />
        <el-table-column prop="status" label="状态" width="100">
           <template #default="{ row }">
             <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
           </template>
        </el-table-column>
        <el-table-column prop="year" label="年份" width="100" />
        <el-table-column label="更新于" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openPreview(row)">预览</el-button>
            <el-button size="small" type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" :type="row.status === 'published' ? 'warning' : 'success'" @click="togglePublish(row)">
              {{ row.status === 'published' ? '撤回' : '发布' }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteContent(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    

    <el-dialog
      v-model="previewVisible"
      title="内容预览"
      width="90vw"
      top="5vh"
      class="responsive-dialog dialog--preview"
    >
      <div v-if="previewContent" class="preview-dialog-content">
        <h3>{{ previewContent.title }}</h3>
        <ContentRenderer :content="previewContent" />
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.preview-dialog-content {
  max-height: 75vh;
  overflow-y: auto;
}
</style>
