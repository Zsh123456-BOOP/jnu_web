<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElCard, ElForm, ElFormItem, ElInput, ElButton, ElSelect, ElOption, ElRadioGroup, ElRadio, ElRow, ElCol } from 'element-plus';
import http, { getErrorMessage } from '../utils/http';
import MarkdownRenderer from '../components/MarkdownRenderer.vue';
import RichTextEditor from '../components/RichTextEditor.vue';

const props = defineProps({
  id: {
    type: String,
    default: null
  }
});

const router = useRouter();
const modules = ref([]);
const formRef = ref(null);
const form = reactive({
  module_id: '',
  title: '',
  slug: '',
  status: 'draft',
  year: '',
  summary: '',
  tags: '',
  authors: '',
  content_format: 'markdown',
  content_md: '',
  content_html: '',
  meta_json: '',
  published_at: null
});

const isEdit = computed(() => Boolean(props.id));
const pageTitle = computed(() => (isEdit.value ? '编辑内容' : '新增内容'));
const loading = ref(false);
const selectedModuleLabel = computed(() => {
  const match = modules.value.find((item) => String(item.id) === String(form.module_id));
  return match?.name || '';
});

const stringifyList = (value) => {
  if (!Array.isArray(value)) {
    return '';
  }
  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }
      if (item && typeof item === 'object') {
        return item.name || item.label || item.value || '';
      }
      return '';
    })
    .map((item) => String(item).trim())
    .filter(Boolean)
    .join(', ');
};

const normalizeList = (value) => {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const loadInitialData = async () => {
  loading.value = true;
  try {
    const moduleRes = await http.get('/admin/modules');
    modules.value = moduleRes.data?.data?.items || [];

    if (isEdit.value) {
      const contentRes = await http.get(`/admin/contents/${props.id}`);
      const content = contentRes.data?.data;
      if (content) {
        form.module_id = content.module_id || '';
        form.title = content.title || '';
        form.slug = content.slug || '';
        form.status = content.status || 'draft';
        form.year = content.year || '';
        form.summary = content.summary || '';
        form.tags = stringifyList(content.tags_json);
        form.authors = stringifyList(content.authors_json);
        form.content_format = content.content_format || 'markdown';
        form.content_md = content.content_md || '';
        form.content_html = content.content_html || '';
        form.meta_json = content.meta_json ? JSON.stringify(content.meta_json, null, 2) : '';
        form.published_at = content.published_at || null;
      }
    }
  } catch (err) {
    ElMessage.error(getErrorMessage(err, 'Failed to load data'));
  } finally {
    loading.value = false;
  }
};

onMounted(loadInitialData);

const handleSave = async () => {
  await formRef.value?.validate();
  let metaJson = {};
  if (form.meta_json) {
    try {
      metaJson = JSON.parse(form.meta_json);
    } catch {
      ElMessage.error('meta_json must be valid JSON');
      return;
    }
  }

  const payload = {
    module_id: Number(form.module_id),
    title: form.title.trim(),
    slug: form.slug.trim(),
    status: form.status,
    content_format: form.content_format,
    content_md: form.content_format === 'markdown' ? form.content_md : undefined,
    content_html: form.content_format === 'richtext' ? form.content_html : undefined,
    summary: form.summary.trim() || undefined,
    year: form.year ? Number(form.year) : undefined,
    tags_json: normalizeList(form.tags),
    authors_json: normalizeList(form.authors),
    meta_json: metaJson,
    published_at: form.published_at || undefined
  };

  loading.value = true;
  try {
    if (isEdit.value) {
      await http.put(`/admin/contents/${props.id}`, payload);
      ElMessage.success('内容已更新');
    } else {
      await http.post('/admin/contents', payload);
      ElMessage.success('内容已创建');
    }
    router.push({ name: 'contents' });
  } catch (err) {
    ElMessage.error(getErrorMessage(err, '保存失败'));
  } finally {
    loading.value = false;
  }
};

const rules = {
  module_id: [{ required: true, message: '请选择模块', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  slug: [{ required: true, message: '请输入 slug', trigger: 'blur' }]
};
</script>

<template>
  <div class="content-edit">
    <!-- Header -->
    <div class="page-header">
      <h1>{{ pageTitle }}</h1>
      <div class="header-actions">
        <el-button @click="router.back()">返回</el-button>
        <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
      </div>
    </div>

    <!-- Form Layout -->
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" :disabled="loading">
      <el-row :gutter="24">
        <!-- Main Column -->
        <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
          <el-card class="box-card with-padding">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="内容标题" size="large"/>
            </el-form-item>
            <el-form-item label="Slug" prop="slug">
              <el-input v-model="form.slug" placeholder="用于详情页的 slug">
                 <template #prepend>/{{ form.module_id }}/</template>
              </el-input>
            </el-form-item>

            <el-form-item label="内容">
              <el-radio-group v-model="form.content_format" style="margin-bottom: 12px;">
                <el-radio-button value="markdown">Markdown</el-radio-button>
                <el-radio-button value="richtext">富文本</el-radio-button>
              </el-radio-group>
              
              <div class="editor-container">
                <el-input
                  v-if="form.content_format === 'markdown'"
                  v-model="form.content_md"
                  type="textarea"
                  :rows="20"
                  class="md-editor"
                  placeholder="输入 Markdown 内容..."
                />
                <RichTextEditor v-else v-model="form.content_html" />
              </div>
            </el-form-item>
          </el-card>

          <el-card title="内容预览" class="box-card with-padding preview-card">
             <template #header>内容预览</template>
             <div class="admin-prose">
                <MarkdownRenderer v-if="form.content_format === 'markdown'" :source="form.content_md" />
                <div v-else v-html="form.content_html"></div>
             </div>
          </el-card>
        </el-col>
        
        <!-- Side Column -->
        <el-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6" class="content-sidebar">
          <el-card class="box-card with-padding">
            <template #header>发布</template>
            <el-form-item label="模块" prop="module_id">
              <el-select
                v-model="form.module_id"
                class="select-ellipsis"
                placeholder="选择模块"
                :title="selectedModuleLabel"
              >
                <el-option v-for="item in modules" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status">
                <el-option label="草稿" value="draft" />
                <el-option label="已发布" value="published" />
              </el-select>
            </el-form-item>
          </el-card>

          <el-card class="box-card with-padding">
             <template #header>元数据</template>
            <el-form-item label="年份">
              <el-input v-model="form.year" placeholder="例如: 2024" />
            </el-form-item>
            <el-form-item label="摘要">
              <el-input v-model="form.summary" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="Tags (逗号分隔)">
              <el-input v-model="form.tags" placeholder="AI, Biology" />
            </el-form-item>
            <el-form-item label="Authors (逗号分隔)">
              <el-input v-model="form.authors" placeholder="Alice, Bob" />
            </el-form-item>
             <el-form-item label="meta_json">
              <el-input
                v-model="form.meta_json"
                type="textarea"
                :rows="4"
                class="json-textarea"
                placeholder="{ }"
              />
            </el-form-item>
          </el-card>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<style>
/* Non-scoped styles for prose rendering */
.admin-prose {
  line-height: 1.7;
  color: var(--el-text-color-primary);
}
.admin-prose h1, .admin-prose h2, .admin-prose h3 { margin-top: 1.5rem; margin-bottom: 1rem; }
.admin-prose p { margin-bottom: 1rem; }
.admin-prose a { color: var(--el-color-primary); text-decoration: none; }
.admin-prose a:hover { text-decoration: underline; }
.admin-prose pre { background: #f4f4f5; padding: 16px; border-radius: 4px; overflow-x: auto; }
.admin-prose code { font-family: monospace; background: #f4f4f5; padding: 2px 4px; border-radius: 4px; }
.admin-prose pre > code { background: transparent; padding: 0; }
.admin-prose blockquote { margin: 16px 0; padding: 12px 16px; border-left: 3px solid var(--el-color-primary); background: #ecf5ff; }
.admin-prose table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
.admin-prose th, .admin-prose td { border: 1px solid #e0e0e0; padding: 8px 12px; }
.admin-prose th { background-color: #fafafa; }
</style>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h1 {
  margin: 0;
  font-size: 24px;
}

.box-card {
  margin-bottom: 20px;
}
.box-card.with-padding {
  --el-card-padding: 20px;
}
.preview-card {
  margin-top: 20px;
}

.editor-container {
  width: 100%;
}
.md-editor, .json-textarea {
  font-family: monospace;
}
</style>
