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
.admin-menu {
  border-right: none;
  background: transparent;
}
</style>
