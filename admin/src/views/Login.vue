<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElCard, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';
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
  if (!formRef.value) return;
  await formRef.value.validate();
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
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <strong>管理员登录</strong>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleLogin">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="username" size="large" placeholder="Username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            show-password
            size="large"
            placeholder="Password"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            class="login-button"
            type="primary"
            size="large"
            :loading="loading"
            native-type="submit"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 16px;
}

.login-card {
  width: 100%;
  max-width: 380px;
}

.card-header {
  text-align: center;
  font-size: 20px;
}

.login-button {
  width: 100%;
}
</style>