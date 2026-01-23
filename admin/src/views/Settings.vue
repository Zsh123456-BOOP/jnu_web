<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElCard, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';
import api from '../api';
import { getErrorMessage } from '../api/httpClient';

const loading = ref(false);
const saving = ref(false);
const siteSettingsLoading = ref(false);
const metaSaving = ref(false);
const footerSaving = ref(false);
const rawValue = ref({});

const form = reactive({
  siteName: '',
  logoText: '',
  homeModules: '[]'
});

const metaForm = reactive({
  siteTitle: '',
  faviconUrl: ''
});

const footerForm = reactive({
  address: '',
  email: ''
});

const loadSettings = async () => {
  loading.value = true;
  try {
    const data = await api.settings.getSite();
    rawValue.value = data?.value || {};
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
    await api.settings.updateSite({ value: payload });
    ElMessage.success('设置已保存');
    await loadSettings();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '保存失败'));
  } finally {
    saving.value = false;
  }
};

const loadSiteSettings = async () => {
  siteSettingsLoading.value = true;
  try {
    const data = await api.settings.getSiteSettings();
    metaForm.siteTitle = data?.site_title || '';
    metaForm.faviconUrl = data?.favicon_url || '';
    const contact = data?.footer?.contact || {};
    footerForm.address = contact.address || '';
    footerForm.email = contact.email || '';
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '加载站点设置失败'));
  } finally {
    siteSettingsLoading.value = false;
  }
};

const saveSiteMetaSettings = async () => {
  const title = metaForm.siteTitle.trim();
  if (!title) {
    ElMessage.warning('站点标题不能为空');
    return;
  }
  metaSaving.value = true;
  try {
    await api.settings.updateSiteSettings({
      site_title: title,
      favicon_url: metaForm.faviconUrl.trim()
    });
    ElMessage.success('站点标题已保存');
    await loadSiteSettings();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '保存失败'));
  } finally {
    metaSaving.value = false;
  }
};

const saveFooterSettings = async () => {
  footerSaving.value = true;
  try {
    await api.settings.updateSiteSettings({
      footer: {
        contact: {
          address: footerForm.address.trim(),
          email: footerForm.email.trim()
        }
      }
    });
    ElMessage.success('联系方式已保存');
    await loadSiteSettings();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '保存失败'));
  } finally {
    footerSaving.value = false;
  }
};

onMounted(() => {
  loadSettings();
  loadSiteSettings();
});
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">站点设置</h1>
        <p class="page-subtitle">更新站点名称与首页模块配置</p>
      </div>
      <div class="page-header__actions">
        <el-button type="primary" :loading="saving" @click="saveSettings">保存设置</el-button>
      </div>
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
           <small class="help-text">控制首页显示的模块卡片，值可以是模块 slug 字符串，或自定义对象。</small>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="page-card" v-loading="siteSettingsLoading">
      <template #header>
        <div class="card-header">
          <div>
            <h2>站点标题与图标</h2>
            <p class="page-subtitle">浏览器标签页标题与 favicon</p>
          </div>
          <el-button type="primary" :loading="metaSaving" @click="saveSiteMetaSettings">
            保存标题
          </el-button>
        </div>
      </template>
      <el-form label-position="top">
        <el-form-item label="站点标题">
          <el-input v-model="metaForm.siteTitle" placeholder="例如: JNU Web" />
        </el-form-item>
        <el-form-item label="Favicon URL">
          <el-input
            v-model="metaForm.faviconUrl"
            placeholder="https://example.com/favicon.ico"
          />
          <small class="help-text">支持为空，留空则使用默认浏览器图标。</small>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="page-card" v-loading="siteSettingsLoading">
      <template #header>
        <div class="card-header">
          <div>
            <h2>Footer 联系方式</h2>
            <p class="page-subtitle">用于网站页脚展示的地址与邮箱信息</p>
          </div>
          <el-button type="primary" :loading="footerSaving" @click="saveFooterSettings">
            保存联系方式
          </el-button>
        </div>
      </template>
      <el-form label-position="top">
        <el-form-item label="地址">
          <el-input v-model="footerForm.address" placeholder="填写实验室地址" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="footerForm.email" placeholder="lab@example.com" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
