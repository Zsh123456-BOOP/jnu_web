<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, ElCard, ElButton, ElTable, ElTableColumn, ElPagination, ElUpload } from 'element-plus';
import http, { getErrorMessage } from '../utils/http';
import { formatDateTime, formatSize } from '../utils/format';

const loading = ref(false);
const uploading = ref(false);
const assets = ref([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const loadAssets = async () => {
  loading.value = true;
  try {
    const res = await http.get('/admin/assets', {
      params: { page: pagination.page, pageSize: pagination.pageSize }
    });
    assets.value = res.data?.data?.items || [];
    pagination.total = res.data?.data?.total || 0;
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '加载资源失败'));
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  pagination.page = page;
  loadAssets();
};

const handleUpload = async (options) => {
  uploading.value = true;
  const formData = new FormData();
  formData.append('file', options.file);
  try {
    await http.post('/admin/assets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    ElMessage.success('上传成功');
    // Go to first page to see the new upload
    pagination.page = 1;
    await loadAssets();
    options.onSuccess();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '上传失败'));
    options.onError(err);
  } finally {
    uploading.value = false;
  }
};

const handleCopyUrl = async (row) => {
  const url = `/static/${row.relative_path}`;
  try {
    await navigator.clipboard.writeText(url);
    ElMessage.success('已复制访问地址');
  } catch {
    ElMessage.warning('复制失败，请手动复制');
  }
};

const deleteAsset = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除资源「${row.original_name}」吗？`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await http.delete(`/admin/assets/${row.id}`);
    ElMessage.success('资源已删除');
    await loadAssets();
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(getErrorMessage(err, '删除失败'));
    }
  }
};

onMounted(loadAssets);
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">资源管理</h1>
        <p class="page-subtitle">上传并管理站点使用的图片资源</p>
      </div>
      <div class="page-header__actions">
        <el-upload
          :http-request="handleUpload"
          :show-file-list="false"
          accept="image/png,image/jpeg,image/webp"
        >
          <el-button type="primary" :loading="uploading">上传图片</el-button>
        </el-upload>
      </div>
    </div>

    <el-card class="page-card">
      <el-table class="admin-table" :data="assets" v-loading="loading">
        <el-table-column prop="original_name" label="文件名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="mime" label="MIME 类型" min-width="140" />
        <el-table-column label="大小" width="120">
          <template #default="{ row }">
            {{ formatSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="relative_path" label="相对路径" min-width="220" show-overflow-tooltip />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleCopyUrl(row)">复制地址</el-button>
            <el-button size="small" type="danger" @click="deleteAsset(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

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
  </div>
</template>
