<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElCard, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';
import http, { getErrorMessage } from '../utils/http';

const loading = ref(false);
const saving = ref(false);
const rawValue = ref({});

const form = reactive({
  siteName: '',
  logoText: '',
  homeModules: '[]'
});

const loadSettings = async () => {
  loading.value = true;
  try {
    const res = await http.get('/admin/settings/site');
    rawValue.value = res.data?.data?.value || {};
    form.siteName = rawValue.value.siteName || '';
    form.logoText = rawValue.value.logoText || '';
    form.homeModules = JSON.stringify(rawValue.value.homeModules || [], null, 2);
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '加载设置失败'));
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  let homeModules = [];
  try {
    homeModules = form.homeModules ? JSON.parse(form.homeModules) : [];
  } catch {
    ElMessage.error('homeModules 必须是合法 JSON');
    return;
  }
  saving.value = true;
  try {
    const payload = {
      ...rawValue.value,
      siteName: form.siteName,
      logoText: form.logoText,
      homeModules
    };
    await http.put('/admin/settings/site', { value: payload });
    ElMessage.success('设置已保存');
    await loadSettings();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '保存失败'));
  } finally {
    saving.value = false;
  }
};

onMounted(loadSettings);
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>站点设置</h1>
      <el-button type="primary" :loading="saving" @click="saveSettings">保存设置</el-button>
    </div>

    <el-card class="page-card" v-loading="loading">
      <el-form label-position="top">
        <el-form-item label="站点名称">
          <el-input v-model="form.siteName" placeholder="例如: My Research Lab" />
        </el-form-item>
        <el-form-item label="Logo 副标题">
          <el-input v-model="form.logoText" placeholder="例如: People, Papers, and Projects" />
        </el-form-item>
        <el-form-item label="首页模块配置 (JSON)">
          <el-input
            v-model="form.homeModules"
            type="textarea"
            :rows="8"
            class="json-textarea"
            placeholder='示例：["home","about"]'
          />
           <small>控制首页显示的模块卡片，值可以是模块 slug 字符串，或自定义对象。</small>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
small {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
  display: block;
  margin-top: 4px;
}
</style>