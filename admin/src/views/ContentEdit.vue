<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElCard, ElForm, ElFormItem, ElInput, ElButton, ElSelect, ElOption, ElRadioGroup, ElRadioButton, ElDatePicker } from 'element-plus';
import api from '../api';
import { getErrorMessage } from '../api/httpClient';
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
  cover_asset_id: '',
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
const selectedModuleSlug = computed(() => {
  const match = modules.value.find((item) => String(item.id) === String(form.module_id));
  return match?.slug || '';
});
const slugPreview = computed(() => {
  const moduleSegment = selectedModuleSlug.value || 'module';
  const slugSegment = form.slug || 'slug';
  return `/${moduleSegment}/${slugSegment}`;
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
    const moduleData = await api.modules.list({ page: 1, pageSize: 200 });
    modules.value = moduleData.items || [];

    if (isEdit.value) {
      const content = await api.contents.get(props.id);
      if (content) {
        form.module_id = content.module_id || '';
        form.title = content.title || '';
        form.slug = content.slug || '';
        form.status = content.status || 'draft';
        form.year = content.year || '';
        form.cover_asset_id = content.cover_asset_id || '';
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
    cover_asset_id: form.cover_asset_id ? Number(form.cover_asset_id) : undefined,
    tags_json: normalizeList(form.tags),
    authors_json: normalizeList(form.authors),
    meta_json: metaJson,
    published_at: form.published_at || undefined
  };

  loading.value = true;
  try {
    if (isEdit.value) {
      await api.contents.update(props.id, payload);
      ElMessage.success('内容已更新');
    } else {
      await api.contents.create(payload);
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
  <div class="page-container content-edit">
    <div class="page-header content-edit-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="content-edit-actions">
        <el-button @click="router.back()">返回</el-button>
        <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
      </div>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" :disabled="loading">
      <div class="content-edit-grid">
        <section class="content-main">
          <el-card class="box-card with-padding">
            <template #header>内容信息</template>
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入内容标题" size="large" class="title-input" />
            </el-form-item>
            <el-form-item label="Slug" prop="slug">
              <el-input v-model="form.slug" placeholder="例如：research-overview" />
              <div class="slug-preview">URL 预览：{{ slugPreview }}</div>
            </el-form-item>
            <el-form-item label="摘要">
              <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="简要描述内容亮点" />
            </el-form-item>
          </el-card>

          <el-card class="box-card with-padding">
            <template #header>正文内容</template>
            <el-form-item label="内容格式">
              <div class="format-toggle">
                <el-radio-group v-model="form.content_format">
                  <el-radio-button value="markdown">Markdown</el-radio-button>
                  <el-radio-button value="richtext">富文本</el-radio-button>
                </el-radio-group>
              </div>
            </el-form-item>
            <div class="editor-divider" aria-hidden="true"></div>
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
          </el-card>

          <el-card class="box-card with-padding preview-card">
            <template #header>内容预览</template>
            <div class="admin-prose">
              <MarkdownRenderer v-if="form.content_format === 'markdown'" :source="form.content_md" />
              <div v-else v-html="form.content_html"></div>
            </div>
          </el-card>
        </section>

        <aside class="content-sidebar">
          <el-card class="box-card with-padding">
            <template #header>发布设置</template>
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status" class="status-toggle">
                <el-radio-button value="draft">草稿</el-radio-button>
                <el-radio-button value="published">已发布</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="模块" prop="module_id">
              <el-select
                v-model="form.module_id"
                class="select-ellipsis"
                placeholder="请选择模块"
                :title="selectedModuleLabel"
              >
                <el-option v-for="item in modules" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="发布日期">
              <el-date-picker
                v-model="form.published_at"
                type="datetime"
                placeholder="选择日期时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-card>

          <el-card class="box-card with-padding">
            <template #header>媒体</template>
            <el-form-item label="封面资源 ID">
              <el-input v-model="form.cover_asset_id" placeholder="例如：123" />
            </el-form-item>
          </el-card>

          <el-card class="box-card with-padding">
            <template #header>元数据</template>
            <el-form-item label="年份">
              <el-input v-model="form.year" placeholder="例如：2024" />
            </el-form-item>
            <el-form-item label="Tags (逗号分隔)">
              <el-input v-model="form.tags" placeholder="如：AI, Biology" />
            </el-form-item>
            <el-form-item label="Authors (逗号分隔)">
              <el-input v-model="form.authors" placeholder="如：Alice, Bob" />
            </el-form-item>
            <el-form-item label="扩展字段 (JSON)">
              <el-input
                v-model="form.meta_json"
                type="textarea"
                :rows="4"
                class="json-textarea"
                placeholder='{"key":"value"}'
              />
            </el-form-item>
          </el-card>
        </aside>
      </div>
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
.content-edit-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--admin-bg);
  padding: 16px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  box-shadow: 0 6px 12px -12px rgba(15, 23, 42, 0.45);
}

.content-edit-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content-edit-grid {
  display: grid;
  gap: 24px;
}

@media (min-width: 1024px) {
  .content-edit-grid {
    grid-template-columns: minmax(0, 7fr) minmax(0, 3fr);
    align-items: start;
  }
}

.content-main,
.content-sidebar {
  min-width: 0;
}

.box-card {
  margin-bottom: 20px;
}
.box-card.with-padding {
  --el-card-padding: 20px;
}

.title-input :deep(.el-input__inner) {
  font-size: 1.25rem;
  font-weight: 600;
}

.slug-preview {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.format-toggle {
  display: inline-flex;
  align-items: center;
  padding: 6px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-radius: 9999px;
}

.status-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.editor-divider {
  height: 1px;
  background: var(--el-border-color-light);
  margin: 4px 0 16px;
}
.editor-container {
  width: 100%;
}
.md-editor, .json-textarea {
  font-family: monospace;
}

.content-sidebar :deep(.el-date-editor) {
  width: 100%;
}
</style>
