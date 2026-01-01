<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
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
    loadAssets();
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
    loadAssets();
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(getErrorMessage(err, '删除失败'));
    }
  }
};

onMounted(loadAssets);
</script>

<template>
  <div>
    <div class="page-title">
      <h2>资源管理</h2>
      <el-upload :http-request="handleUpload" :show-file-list="false">
        <el-button type="primary" :loading="uploading">上传文件</el-button>
      </el-upload>
    </div>

    <el-table :data="assets" v-loading="loading" style="width: 100%;">
      <el-table-column prop="original_name" label="文件名" min-width="200" />
      <el-table-column prop="mime" label="MIME" min-width="140" />
      <el-table-column label="大小" width="120">
        <template #default="{ row }">
          {{ formatSize(row.size) }}
        </template>
      </el-table-column>
      <el-table-column prop="relative_path" label="相对路径" min-width="220" />
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleCopyUrl(row)">复制地址</el-button>
          <el-button size="small" type="danger" @click="deleteAsset(row)">删除</el-button>
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
  </div>
</template>
