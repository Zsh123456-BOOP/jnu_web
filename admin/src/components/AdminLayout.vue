<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const active = computed(() => route.path);
const username = computed(() => authStore.user?.username || 'Admin');

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await authStore.logout();
    router.push('/login');
  } catch (err) {
    if (err !== 'cancel' && err !== 'close') {
      ElMessage.error('退出失败');
    }
  }
};
</script>

<template>
  <el-container class="admin-shell">
    <el-aside width="240px" class="admin-sidebar">
      <div class="admin-logo">Lab Admin</div>
      <el-menu :default-active="active" router class="admin-menu" background-color="#0f172a" text-color="#e2e8f0" active-text-color="#ffffff">
        <el-menu-item index="/">仪表盘</el-menu-item>
        <el-menu-item index="/modules">模块管理</el-menu-item>
        <el-menu-item index="/contents">内容管理</el-menu-item>
        <el-menu-item index="/assets">资源管理</el-menu-item>
        <el-menu-item index="/settings">站点设置</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="admin-header">
        <div class="meta">
          <strong>管理后台</strong>
          <span class="el-text--secondary">欢迎，{{ username }}</span>
        </div>
        <el-button type="danger" plain @click="handleLogout">退出</el-button>
      </el-header>
      <el-main class="content-wrap">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-sidebar {
  background-color: #0f172a;
  color: #e2e8f0;
}

.admin-logo {
  padding: 20px 16px 12px;
  font-weight: 600;
  color: #f8fafc;
  letter-spacing: 0.2px;
}

.admin-menu {
  border-right: none;
  background: transparent;
}

:deep(.admin-menu) {
  padding: 8px 0;
}

:deep(.admin-menu .el-menu-item) {
  margin: 4px 12px;
  border-radius: 10px;
  height: 44px;
  line-height: 44px;
  color: rgba(226, 232, 240, 0.9);
  position: relative;
}

:deep(.admin-menu .el-menu-item:hover) {
  background-color: rgba(59, 130, 246, 0.16);
  color: #ffffff;
}

:deep(.admin-menu .el-menu-item.is-active) {
  background-color: rgba(37, 99, 235, 0.28);
  color: #ffffff;
  font-weight: 600;
}

:deep(.admin-menu .el-menu-item.is-active::before) {
  content: "";
  position: absolute;
  left: -12px;
  top: 8px;
  bottom: 8px;
  width: 4px;
  border-radius: 6px;
  background-color: #60a5fa;
}
</style>
