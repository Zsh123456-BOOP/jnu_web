<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/auth';
import { getErrorMessage } from '../utils/http';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const formRef = ref(null);
const form = reactive({
  username: '',
  password: ''
});

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const loading = ref(false);

const handleLogin = async () => {
  await formRef.value?.validate();
  loading.value = true;
  try {
    await authStore.login({ username: form.username, password: form.password });
    const redirect = route.query.redirect || '/';
    router.replace(redirect);
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '登录失败'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;">
    <el-card style="width: 360px;">
      <template #header>
        <strong>管理员登录</strong>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" autocomplete="current-password" show-password />
        </el-form-item>
        <el-button type="primary" :loading="loading" style="width: 100%;" @click="handleLogin">
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>
