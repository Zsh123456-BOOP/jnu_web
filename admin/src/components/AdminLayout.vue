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
    router.push({ name: 'login' });
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
      <el-menu
        :default-active="active"
        router
        class="admin-menu"
        background-color="#0f172a"
        text-color="#e2e8f0"
        active-text-color="var(--el-color-primary)"
      >
        <el-menu-item-group>
          <template #title>仪表盘</template>
          <el-menu-item index="/">仪表盘</el-menu-item>
        </el-menu-item-group>
        <el-sub-menu index="content">
          <template #title>内容</template>
          <el-menu-item index="/modules">模块管理</el-menu-item>
          <el-menu-item index="/contents">内容管理</el-menu-item>
          <el-menu-item index="/members">成员管理</el-menu-item>
          <el-menu-item index="/assets">资源管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="system">
          <template #title>系统</template>
          <el-menu-item index="/settings">站点设置</el-menu-item>
        </el-sub-menu>
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

:deep(.admin-menu .el-menu-item-group__title) {
  margin: 12px 16px 4px;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.6);
}

:deep(.admin-menu .el-menu-item) {
  margin: 4px 12px;
  border-radius: 10px;
  height: 44px;
  line-height: 44px;
  color: rgba(226, 232, 240, 0.9);
  position: relative;
}

:deep(.admin-menu .el-sub-menu__title) {
  margin: 4px 12px;
  border-radius: 10px;
  height: 44px;
  line-height: 44px;
  color: rgba(226, 232, 240, 0.9);
}

:deep(.admin-menu .el-menu-item:hover),
:deep(.admin-menu .el-sub-menu__title:hover) {
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

:deep(.admin-menu .el-menu-item.is-active) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
}

:deep(.admin-menu .el-sub-menu.is-active > .el-sub-menu__title) {
  color: var(--el-color-primary);
}
</style>
