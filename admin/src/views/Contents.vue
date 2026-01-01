<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import http, { getErrorMessage } from '../utils/http';
import { formatDateTime } from '../utils/format';
import ContentEditor from '../components/ContentEditor.vue';
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

const editorVisible = ref(false);
const editingContent = ref(null);

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

const handlePageChange = (page) => {
  pagination.page = page;
  loadContents();
};

const openCreate = () => {
  editingContent.value = null;
  editorVisible.value = true;
};

const openEdit = (row) => {
  editingContent.value = { ...row };
  editorVisible.value = true;
};

const openPreview = (row) => {
  previewContent.value = row;
  previewVisible.value = true;
};

const buildPayloadFromRow = (row, overrides = {}) => ({
  module_id: row.module_id,
  title: row.title,
  slug: row.slug,
  status: row.status,
  content_format: row.content_format,
  content_md: row.content_format === 'markdown' ? row.content_md : null,
  content_html: row.content_format === 'richtext' ? row.content_html : null,
  summary: row.summary || null,
  year: row.year || null,
  tags_json: row.tags_json || [],
  authors_json: row.authors_json || [],
  meta_json: row.meta_json || {},
  published_at: row.published_at || null,
  ...overrides
});

const handleSave = async (payload, id) => {
  try {
    if (id) {
      await http.put(`/admin/contents/${id}`, payload);
      ElMessage.success('内容已更新');
    } else {
      await http.post('/admin/contents', payload);
      ElMessage.success('内容已创建');
    }
    editorVisible.value = false;
    loadContents();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '保存失败'));
  }
};

const togglePublish = async (row) => {
  const nextStatus = row.status === 'published' ? 'draft' : 'published';
  const publishedAt = nextStatus === 'published' ? new Date().toISOString() : null;
  try {
    await http.put(`/admin/contents/${row.id}`, buildPayloadFromRow(row, { status: nextStatus, published_at: publishedAt }));
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
    ElMessage.error(getErrorMessage(err, '加载模块失败'));
  }
  loadContents();
});
</script>

<template>
  <div>
    <div class="page-title">
      <h2>内容管理</h2>
      <el-button type="primary" @click="openCreate">新增内容</el-button>
    </div>

    <el-card style="margin-bottom: 16px;">
      <div class="filter-bar">
        <el-select v-model="filters.moduleId" placeholder="模块" clearable style="width: 180px;">
          <el-option v-for="item in modules" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 140px;">
          <el-option label="draft" value="draft" />
          <el-option label="published" value="published" />
        </el-select>
        <el-input v-model="filters.year" placeholder="年份" style="width: 120px;" />
        <el-input v-model="filters.keyword" placeholder="关键词" style="width: 200px;" />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="() => { filters.moduleId=''; filters.status=''; filters.year=''; filters.keyword=''; handleSearch(); }">
          重置
        </el-button>
      </div>
    </el-card>

    <el-table :data="contents" v-loading="loading" style="width: 100%;">
      <el-table-column prop="title" label="标题" min-width="180" />
      <el-table-column prop="module_name" label="模块" min-width="120" />
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column prop="year" label="年份" width="100" />
      <el-table-column label="发布时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.published_at || row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280">
        <template #default="{ row }">
          <el-button size="small" @click="openPreview(row)">预览</el-button>
          <el-button size="small" type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="warning" @click="togglePublish(row)">
            {{ row.status === 'published' ? '撤回' : '发布' }}
          </el-button>
          <el-button size="small" type="danger" @click="deleteContent(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
      <el-pagination
        layout="prev, pager, next"
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="handlePageChange"
      />
    </div>

    <ContentEditor
      v-model="editorVisible"
      :content="editingContent"
      :modules="modules"
      @save="handleSave"
    />

    <el-dialog v-model="previewVisible" title="内容预览" width="70%">
      <div v-if="previewContent">
        <h3>{{ previewContent.title }}</h3>
        <ContentRenderer :content="previewContent" />
      </div>
    </el-dialog>
  </div>
</template>
