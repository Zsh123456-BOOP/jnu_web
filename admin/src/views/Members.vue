<script setup>
import { onMounted, reactive, ref } from 'vue';
import {
  ElMessage,
  ElMessageBox,
  ElCard,
  ElButton,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSwitch,
  ElUpload,
  ElAvatar,
  ElTag
} from 'element-plus';
import http, { getErrorMessage } from '../utils/http';

const loading = ref(false);
const uploading = ref(false);
const members = ref([]);
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

const dialogVisible = ref(false);
const filterPiOnly = ref(false);
const formRef = ref(null);
const form = reactive({
  id: null,
  name: '',
  position: '',
  is_pi: false,
  research_interests: '',
  hobbies: '',
  email: '',
  image_asset_id: null,
  image_url: '',
  sort_order: 0,
  enabled: true
});

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
};

const resetForm = () => {
  form.id = null;
  form.name = '';
  form.position = '';
  form.is_pi = false;
  form.research_interests = '';
  form.hobbies = '';
  form.email = '';
  form.image_asset_id = null;
  form.image_url = '';
  form.sort_order = 0;
  form.enabled = true;
};

const normalizeOptional = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};

const normalizeOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const loadMembers = async () => {
  loading.value = true;
  try {
    const res = await http.get('/admin/members', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        is_pi: filterPiOnly.value ? 1 : undefined
      }
    });
    members.value = res.data?.data?.items || [];
    pagination.total = res.data?.data?.total || 0;
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '加载成员失败'));
  } finally {
    loading.value = false;
  }
};

const handlePiFilterChange = () => {
  pagination.page = 1;
  loadMembers();
};

const openCreate = () => {
  resetForm();
  dialogVisible.value = true;
};

const openEdit = (row) => {
  form.id = row.id;
  form.name = row.name || '';
  form.position = row.position || '';
  form.is_pi = Number(row.is_pi) === 1;
  form.research_interests = row.research_interests || '';
  form.hobbies = row.hobbies || '';
  form.email = row.email || '';
  form.image_asset_id = row.image_asset_id || null;
  form.image_url = row.image?.url || '';
  form.sort_order = Number(row.sort_order || 0);
  form.enabled = Number(row.enabled) === 1;
  dialogVisible.value = true;
};

const handleUpload = async (options) => {
  uploading.value = true;
  const formData = new FormData();
  formData.append('file', options.file);
  try {
    const res = await http.post('/admin/assets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const asset = res.data?.data;
    form.image_asset_id = asset?.id || null;
    form.image_url = asset?.url || '';
    ElMessage.success('头像上传成功');
    options.onSuccess?.();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '上传失败'));
    options.onError?.(err);
  } finally {
    uploading.value = false;
  }
};

const clearImage = () => {
  form.image_asset_id = null;
  form.image_url = '';
};

const saveMember = async () => {
  await formRef.value?.validate();
  const payload = {
    name: form.name,
    position: normalizeOptional(form.position),
    is_pi: form.is_pi ? 1 : 0,
    research_interests: normalizeOptional(form.research_interests),
    hobbies: normalizeOptional(form.hobbies),
    email: normalizeOptional(form.email),
    image_asset_id: normalizeOptionalNumber(form.image_asset_id),
    sort_order: Number(form.sort_order) || 0,
    enabled: form.enabled ? 1 : 0
  };
  try {
    if (form.id) {
      await http.put(`/admin/members/${form.id}`, payload);
      ElMessage.success('成员已更新');
    } else {
      await http.post('/admin/members', payload);
      ElMessage.success('成员已创建');
    }
    dialogVisible.value = false;
    await loadMembers();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '保存失败'));
  }
};

const deleteMember = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除成员「${row.name}」吗？`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await http.delete(`/admin/members/${row.id}`);
    ElMessage.success('成员已删除');
    await loadMembers();
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(getErrorMessage(err, '删除失败'));
    }
  }
};

onMounted(loadMembers);
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">成员管理</h1>
        <p class="page-subtitle">维护实验室成员信息与头像展示</p>
      </div>
      <div class="page-header__actions">
        <el-switch v-model="filterPiOnly" active-text="只看 PI" @change="handlePiFilterChange" />
        <el-button type="primary" @click="openCreate">新增成员</el-button>
      </div>
    </div>

    <el-card class="page-card">
      <el-table class="admin-table" size="small" :data="members" v-loading="loading" row-key="id">
        <el-table-column label="头像" width="90">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.image?.url">
              {{ row.name?.slice(0, 1) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="position" label="职位" min-width="140" />
        <el-table-column label="PI" width="90">
          <template #default="{ row }">
            <el-tag v-if="Number(row.is_pi) === 1" type="warning">PI</el-tag>
            <el-tag v-else type="info">成员</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sort_order" label="排序" width="100" />
        <el-table-column label="启用" width="90">
          <template #default="{ row }">
            <el-tag v-if="Number(row.enabled) === 1" type="success">启用</el-tag>
            <el-tag v-else type="info">停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button size="small" type="primary" @click="openEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="deleteMember(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          @current-change="(p) => { pagination.page = p; loadMembers(); }"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="成员信息"
      width="90vw"
      class="responsive-dialog dialog--form"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="form.position" />
        </el-form-item>
        <el-form-item label="PI/老师">
          <el-switch v-model="form.is_pi" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="研究方向">
          <el-input v-model="form.research_interests" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="兴趣爱好">
          <el-input v-model="form.hobbies" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-upload">
            <el-avatar :size="64" :src="form.image_url">{{ form.name?.slice(0, 1) }}</el-avatar>
            <div class="avatar-upload__actions">
              <el-upload
                :http-request="handleUpload"
                :show-file-list="false"
                accept="image/png,image/jpeg,image/webp"
              >
                <el-button size="small" :loading="uploading">上传头像</el-button>
              </el-upload>
              <el-button size="small" plain @click="clearImage">清除头像</el-button>
            </div>
          </div>
          <p class="help-text">支持 PNG/JPG/WEBP，最大 20MB。</p>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMember">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
