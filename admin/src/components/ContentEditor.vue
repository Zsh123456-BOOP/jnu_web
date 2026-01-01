<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import MarkdownRenderer from './MarkdownRenderer.vue';
import ContentRenderer from './ContentRenderer.vue';
import RichTextEditor from './RichTextEditor.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  content: {
    type: Object,
    default: null
  },
  modules: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

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

const isEdit = computed(() => Boolean(props.content && props.content.id));
const drawerTitle = computed(() => (isEdit.value ? '编辑内容' : '新增内容'));

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
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const applyContent = (content) => {
  form.module_id = content?.module_id || '';
  form.title = content?.title || '';
  form.slug = content?.slug || '';
  form.status = content?.status || 'draft';
  form.year = content?.year || '';
  form.summary = content?.summary || '';
  form.tags = stringifyList(content?.tags_json);
  form.authors = stringifyList(content?.authors_json);
  form.content_format = content?.content_format || 'markdown';
  form.content_md = content?.content_md || '';
  form.content_html = content?.content_html || '';
  form.meta_json = content?.meta_json ? JSON.stringify(content.meta_json, null, 2) : '';
  form.published_at = content?.published_at || null;
};

watch(
  () => props.content,
  (value) => {
    applyContent(value);
  },
  { immediate: true }
);

const previewContent = computed(() => ({
  content_format: form.content_format,
  content_md: form.content_md,
  content_html: form.content_html
}));

const validateContentBody = (_rule, _value, callback) => {
  if (form.content_format === 'markdown' && !form.content_md.trim()) {
    callback(new Error('Markdown 内容不能为空'));
    return;
  }
  if (form.content_format === 'richtext' && !form.content_html.trim()) {
    callback(new Error('富文本内容不能为空'));
    return;
  }
  callback();
};

const rules = {
  module_id: [{ required: true, message: '请选择模块', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  slug: [{ required: true, message: '请输入 slug', trigger: 'blur' }],
  content_format: [{ required: true, message: '请选择格式', trigger: 'change' }],
  content_md: [{ validator: validateContentBody, trigger: 'blur' }],
  content_html: [{ validator: validateContentBody, trigger: 'blur' }]
};

const handleClose = () => {
  emit('update:modelValue', false);
};

const handleSave = async () => {
  await formRef.value?.validate();
  let metaJson = {};
  if (form.meta_json) {
    try {
      metaJson = JSON.parse(form.meta_json);
    } catch {
      ElMessage.error('meta_json 需要是合法 JSON');
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

  emit('save', payload, props.content?.id || null);
};
</script>

<template>
  <el-drawer :model-value="modelValue" :title="drawerTitle" size="70%" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item label="模块" prop="module_id">
        <el-select v-model="form.module_id" placeholder="选择模块" style="width: 100%;">
          <el-option v-for="item in modules" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="内容标题" />
      </el-form-item>
      <el-form-item label="Slug" prop="slug">
        <el-input v-model="form.slug" placeholder="用于详情页的 slug" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" style="width: 100%;">
          <el-option label="draft" value="draft" />
          <el-option label="published" value="published" />
        </el-select>
      </el-form-item>
      <el-form-item label="年份">
        <el-input v-model="form.year" placeholder="2024" />
      </el-form-item>
      <el-form-item label="摘要">
        <el-input v-model="form.summary" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="Tags">
        <el-input v-model="form.tags" placeholder="逗号分隔，如 AI, Biology" />
      </el-form-item>
      <el-form-item label="Authors">
        <el-input v-model="form.authors" placeholder="逗号分隔，如 Alice, Bob" />
      </el-form-item>
      <el-form-item label="格式" prop="content_format">
        <el-radio-group v-model="form.content_format">
          <el-radio value="markdown">Markdown</el-radio>
          <el-radio value="richtext">富文本</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="内容" prop="content_md">
        <div v-if="form.content_format === 'markdown'" class="editor-split">
          <el-input
            v-model="form.content_md"
            type="textarea"
            :rows="12"
            placeholder="输入 Markdown 内容"
          />
          <div class="preview-panel">
            <MarkdownRenderer :source="form.content_md" />
          </div>
        </div>
        <div v-else class="editor-split">
          <RichTextEditor v-model="form.content_html" />
          <div class="preview-panel">
            <ContentRenderer :content="previewContent" />
          </div>
        </div>
      </el-form-item>

      <el-form-item label="meta_json">
        <el-input
          v-model="form.meta_json"
          type="textarea"
          :rows="5"
          class="json-textarea"
          placeholder='例如：{ "contact": { "email": "lab@uni.edu" } }'
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>
