<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, ElCard, ElButton, ElTable, ElTableColumn, ElPagination, ElDialog, ElSwitch, ElInput, ElInputNumber, ElSelect, ElOption, ElForm, ElFormItem } from 'element-plus';
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

const saveModule = async () => {
  await formRef.value?.validate();
  let configJson;
  try {
    configJson = form.config_json ? JSON.parse(form.config_json) : {};
  } catch {
    ElMessage.error('config_json 必须是合法 JSON');
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

const updateModuleStatus = async (row, key, value) => {
 try {
    await http.put(`/admin/modules/${row.id}`, { ...row, [key]: value ? 1 : 0 });
    ElMessage.success('状态已更新');
    await loadModules();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '更新失败'));
    // Revert switch state on failure
    row[key] = !value;
  }
}

const moveModule = async (row, direction) => {
  const list = [...modules.value].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  const index = list.findIndex((item) => item.id === row.id);
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= list.length) return;
  
  const target = list[swapIndex];
  try {
    // Swap sort_order values
    await http.put(`/admin/modules/${row.id}`, { sort_order: target.sort_order });
    await http.put(`/admin/modules/${target.id}`, { sort_order: row.sort_order });
    ElMessage.success('排序已更新');
    await loadModules();
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '排序更新失败'));
  }
};

const deleteModule = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除模块「${row.name}」吗？这不会删除模块下的内容。`, '提示', {
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

const handleMoveCommand = (row, command) => {
  if (command === 'up') {
    moveModule(row, 'up');
    return;
  }
  if (command === 'down') {
    moveModule(row, 'down');
  }
};

onMounted(loadModules);
</script>

<template>
    <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">模块管理</h1>
        <p class="page-subtitle">管理站点模块、导航展示与排序</p>
      </div>
      <div class="page-header__actions">
        <el-button type="primary" @click="openCreate">新增模块</el-button>
      </div>
    </div>

    <el-card class="page-card">
      <el-table class="admin-table" size="small" :data="modules" v-loading="loading" row-key="id">
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="slug" label="Slug" min-width="160" />
        <el-table-column prop="type" label="类型" min-width="140" />
        <el-table-column label="启用" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" :active-value="1" :inactive-value="0" @change="(val) => updateModuleStatus(row, 'enabled', val)" />
          </template>
        </el-table-column>
        <el-table-column label="导航" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.nav_visible" :active-value="1" :inactive-value="0" @change="(val) => updateModuleStatus(row, 'nav_visible', val)" />
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="120" sortable />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-dropdown trigger="click" @command="(command) => handleMoveCommand(row, command)">
                <el-button size="small" plain>排序</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="up">上移</el-dropdown-item>
                    <el-dropdown-item command="down">下移</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button size="small" type="primary" @click="openEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="deleteModule(row)">删除</el-button>
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
          @current-change="(p) => { pagination.page = p; loadModules(); }"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="模块配置"
      width="90vw"
      class="responsive-dialog dialog--form"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Slug" prop="slug">
          <el-input v-model="form.slug" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type">
            <el-option label="SinglePage (单个富文本页面)" value="SinglePage" />
            <el-option label="ListDetail (内容列表)" value="ListDetail" />
            <el-option label="ExternalLink (外部链接)" value="ExternalLink" />
            <el-option label="LandingGrid (聚合落地页)" value="LandingGrid" />
            <el-option label="Contact (联系方式页)" value="Contact" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="在网站中启用">
              <el-switch v-model="form.enabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="在导航栏显示">
              <el-switch v-model="form.nav_visible" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="排序 (数字越小越靠前)">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="模块配置 (JSON)">
          <el-input v-model="form.config_json" type="textarea" :rows="6" class="json-textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveModule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.pagination-container {
  padding-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
