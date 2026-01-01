<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElCard, ElButton, ElRow, ElCol, ElTag, ElIcon } from 'element-plus';
import { DocumentAdd, Upload, Setting, Monitor } from '@element-plus/icons-vue';
import http, { getErrorMessage } from '../utils/http';

const router = useRouter();
const loading = ref(false);
const stats = ref({
  contents: 0,
  assets: 0,
  systemStatus: '正常'
});
const statusTagType = computed(() =>
  stats.value.systemStatus === '正常' ? 'success' : 'warning'
);

const quickActions = [
  {
    title: 'New Article',
    subtitle: 'Create a new content item',
    to: '/contents/create',
    icon: DocumentAdd
  },
  {
    title: 'Upload File',
    subtitle: 'Manage assets and uploads',
    to: '/assets',
    icon: Upload
  },
  {
    title: 'Site Settings',
    subtitle: 'Update site configuration',
    to: '/settings',
    icon: Setting
  },
  {
    title: 'View Live Site',
    subtitle: 'Open the public site',
    to: '/',
    icon: Monitor,
    external: true
  }
];

const goTo = (action) => {
  if (action.external) {
    window.open(action.to, '_blank', 'noopener');
    return;
  }
  router.push(action.to);
};

const loadStats = async () => {
  loading.value = true;
  try {
    const [contentsRes, assetsRes] = await Promise.all([
      http.get('/admin/contents', { params: { page: 1, pageSize: 1 } }),
      http.get('/admin/assets', { params: { page: 1, pageSize: 1 } })
    ]);
    stats.value = {
      contents: contentsRes.data?.data?.total || 0,
      assets: assetsRes.data?.data?.total || 0,
      systemStatus: '正常'
    };
  } catch (err) {
    stats.value.systemStatus = '需关注';
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

    <el-row :gutter="20" class="stat-row" v-loading="loading">
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card">
          <div class="stat-label">内容总数</div>
          <div class="stat-number">{{ stats.contents }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card">
          <div class="stat-label">资源总数</div>
          <div class="stat-number">{{ stats.assets }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card">
          <div class="stat-label">系统状态</div>
          <el-tag class="status-tag" :type="statusTagType">{{ stats.systemStatus }}</el-tag>
        </el-card>
      </el-col>
    </el-row>

    <div class="section-header">
      <h2>Quick Actions</h2>
    </div>
    <el-row :gutter="20" class="action-row">
      <el-col v-for="action in quickActions" :key="action.title" :xs="24" :sm="12" :lg="6">
        <el-card
          class="action-card"
          shadow="hover"
          role="button"
          tabindex="0"
          @click="goTo(action)"
          @keyup.enter="goTo(action)"
        >
          <div class="action-card__content">
            <el-icon class="action-card__icon">
              <component :is="action.icon" />
            </el-icon>
            <div>
              <div class="action-card__title">{{ action.title }}</div>
              <div class="action-card__subtitle">{{ action.subtitle }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.stat-card {
  text-align: left;
  margin-bottom: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px -18px rgba(15, 23, 42, 0.35);
}
.stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.stat-number {
  font-size: 32px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.status-tag {
  font-size: 13px;
}
.section-header {
  margin: 12px 0 16px;
}
.section-header h2 {
  margin: 0;
  font-size: 18px;
  color: var(--el-text-color-primary);
}
.action-row {
  margin-bottom: 20px;
}
.action-card {
  cursor: pointer;
  margin-bottom: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px -18px rgba(15, 23, 42, 0.35);
}
.action-card__content {
  display: flex;
  gap: 12px;
  align-items: center;
}
.action-card__icon {
  font-size: 24px;
  color: var(--el-color-primary);
}
.action-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.action-card__subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
