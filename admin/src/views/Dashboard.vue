<script setup>
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
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
  <div>
    <div class="page-title">
      <h2>仪表盘</h2>
      <el-button type="primary" :loading="loading" @click="loadStats">刷新</el-button>
    </div>

    <div class="card-grid">
      <el-card>
        <template #header>
          <span>模块总数</span>
        </template>
        <strong style="font-size: 28px;">{{ stats.modules }}</strong>
      </el-card>
      <el-card>
        <template #header>
          <span>内容总数</span>
        </template>
        <strong style="font-size: 28px;">{{ stats.contents }}</strong>
      </el-card>
      <el-card>
        <template #header>
          <span>资源总数</span>
        </template>
        <strong style="font-size: 28px;">{{ stats.assets }}</strong>
      </el-card>
    </div>
  </div>
</template>
