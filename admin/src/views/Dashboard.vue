<script setup>
import { onMounted, ref } from 'vue';
import { ElMessage, ElCard, ElButton, ElRow, ElCol } from 'element-plus';
import http, { getErrorMessage } from '../utils/http';

const loading = ref(false);
const stats = ref({
  modules: 0,
  contents: 0,
  assets: 0
});

const loadStats = async () => {
  loading.value = true;
  try {
    // Note: The original implementation might be inefficient if there are many items.
    // A dedicated stats endpoint would be better, but we work with what we have.
    const [modulesRes, contentsRes, assetsRes] = await Promise.all([
      http.get('/admin/modules', { params: { page: 1, pageSize: 1 } }),
      http.get('/admin/contents', { params: { page: 1, pageSize: 1 } }),
      http.get('/admin/assets', { params: { page: 1, pageSize: 1 } })
    ]);
    stats.value = {
      modules: modulesRes.data?.data?.total || 0,
      contents: contentsRes.data?.data?.total || 0,
      assets: assetsRes.data?.data?.total || 0
    };
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '加载统计失败'));
  } finally {
    loading.value = false;
  }
};

onMounted(loadStats);
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>仪表盘</h1>
      <el-button type="primary" :loading="loading" @click="loadStats" plain>刷新</el-button>
    </div>

    <el-row :gutter="20" v-loading="loading">
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card">
          <template #header>
            <span>模块总数</span>
          </template>
          <div class="stat-number">{{ stats.modules }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card">
          <template #header>
            <span>内容总数</span>
          </template>
          <div class="stat-number">{{ stats.contents }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card">
          <template #header>
            <span>资源总数</span>
          </template>
          <div class="stat-number">{{ stats.assets }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.stat-card {
  text-align: center;
  margin-bottom: 20px;
}
.stat-number {
  font-size: 32px;
  font-weight: 600;
  color: var(--el-color-primary);
}
</style>