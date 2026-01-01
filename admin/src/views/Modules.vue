<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import http, { getErrorMessage } from '../utils/http';

const loading = ref(false);
const modules = ref([]);
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

const dialogVisible = ref(false);
const formRef = ref(null);
const form = reactive({
  id: null,
  name: '',
  slug: '',
  type: 'SinglePage',
  enabled: true,
  nav_visible: true,
  sort_order: 100,
  config_json: '{}'
});

const resetForm = () => {
  form.id = null;
  form.name = '';
  form.slug = '';
  form.type = 'SinglePage';
  form.enabled = true;
  form.nav_visible = true;
  form.sort_order = 100;
  form.config_json = '{}';
};

const rules = {
  name: [{ required: true, message: '请输入模块名称', trigger: 'blur' }],
  slug: [{ required: true, message: '请输入 slug', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
};

const loadModules = async () => {
  loading.value = true;
  try {
    const res = await http.get('/admin/modules', {
      params: { page: pagination.page, pageSize: pagination.pageSize }
    });
    modules.value = res.data?.data?.items || [];
    pagination.total = res.data?.data?.total || 0;
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '加载模块失败'));
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  resetForm();
  dialogVisible.value = true;
};

const openEdit = (row) => {
  form.id = row.id;
  form.name = row.name;
  form.slug = row.slug;
  form.type = row.type;
  form.enabled = Number(row.enabled) === 1;
  form.nav_visible = Number(row.nav_visible) === 1;
  form.sort_order = row.sort_order;
  form.config_json = JSON.stringify(row.config_json || {}, null, 2);
  dialogVisible.value = true;
};

const parseConfig = () => {
  if (!form.config_json) {
    return null;
  }
  try {
    return JSON.parse(form.config_json);
  } catch {
    ElMessage.error('config_json 必须是合法 JSON');
    return null;
  }
};

const saveModule = async () => {
  await formRef.value?.validate();
  const configJson = parseConfig();
  if (form.config_json && configJson === null) {
    return;
  }

  const payload = {
    name: form.name,
    slug: form.slug,
    type: form.type,
    enabled: form.enabled ? 1 : 0,
    nav_visible: form.nav_visible ? 1 : 0,
    sort_order: Number(form.sort_order) || 0,
    config_json: configJson
  };

  try {
    if (form.id) {
      await http.put(`/admin/modules/${form.id}`, payload);
      ElMessage.success('模块已更新');
    } else {
      await http.post('/admin/modules', payload);
      ElMessage.success('模块已创建');
    }
    dialogVisible.value = false;
    await loadModules();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '保存失败'));
  }
};

const updateModule = async (row, changes) => {
  const payload = {
    name: row.name,
    slug: row.slug,
    type: row.type,
    enabled: Number(row.enabled) === 1 ? 1 : 0,
    nav_visible: Number(row.nav_visible) === 1 ? 1 : 0,
    sort_order: Number(row.sort_order) || 0,
    config_json: row.config_json || {}
  };
  const merged = { ...payload, ...changes };
  await http.put(`/admin/modules/${row.id}`, merged);
};

const toggleEnabled = async (row, key) => {
  try {
    await updateModule(row, { [key]: row[key] ? 1 : 0 });
    ElMessage.success('状态已更新');
    await loadModules();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '更新失败'));
  }
};

const moveModule = async (row, direction) => {
  const list = [...modules.value].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  const index = list.findIndex((item) => item.id === row.id);
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= list.length) {
    return;
  }
  const target = list[swapIndex];
  const currentOrder = row.sort_order;
  const targetOrder = target.sort_order;

  try {
    await updateModule(row, { sort_order: targetOrder });
    await updateModule(target, { sort_order: currentOrder });
    ElMessage.success('排序已更新');
    await loadModules();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '排序更新失败'));
  }
};

const deleteModule = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除模块「${row.name}」吗？`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await http.delete(`/admin/modules/${row.id}`);
    ElMessage.success('模块已删除');
    await loadModules();
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(getErrorMessage(err, '删除失败'));
    }
  }
};

const handlePageChange = (page) => {
  pagination.page = page;
  loadModules();
};

onMounted(loadModules);
</script>

<template>
  <div>
    <div class="page-title">
      <h2>模块管理</h2>
      <el-button type="primary" @click="openCreate">新增模块</el-button>
    </div>

    <el-table :data="modules" v-loading="loading" style="width: 100%;">
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column prop="slug" label="Slug" min-width="160" />
      <el-table-column prop="type" label="类型" min-width="140" />
      <el-table-column label="启用" width="100">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" :active-value="1" :inactive-value="0" @change="() => toggleEnabled(row, 'enabled')" />
        </template>
      </el-table-column>
      <el-table-column label="导航" width="100">
        <template #default="{ row }">
          <el-switch v-model="row.nav_visible" :active-value="1" :inactive-value="0" @change="() => toggleEnabled(row, 'nav_visible')" />
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="120" />
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button size="small" @click="moveModule(row, 'up')">上移</el-button>
          <el-button size="small" @click="moveModule(row, 'down')">下移</el-button>
          <el-button size="small" type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteModule(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
      <el-pagination
        layout="prev, pager, next"
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="handlePageChange"
      />
    </div>

    <el-dialog v-model="dialogVisible" title="模块配置" width="640px" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Slug" prop="slug">
          <el-input v-model="form.slug" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" style="width: 100%;">
            <el-option label="SinglePage" value="SinglePage" />
            <el-option label="ListDetail" value="ListDetail" />
            <el-option label="ExternalLink" value="ExternalLink" />
            <el-option label="LandingGrid" value="LandingGrid" />
            <el-option label="Contact" value="Contact" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
        <el-form-item label="导航可见">
          <el-switch v-model="form.nav_visible" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="config_json" class="json-textarea">
          <el-input v-model="form.config_json" type="textarea" :rows="6" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveModule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
