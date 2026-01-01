<script setup>
import { computed, ref, watch } from 'vue';
import { getContents } from '../utils/api';
import ContentRenderer from './ContentRenderer.vue';

const props = defineProps({
  module: {
    type: Object,
    required: true
  }
});

const content = ref(null);
const loading = ref(false);
const error = ref('');

const loadContact = async () => {
  if (!props.module?.slug) {
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const data = await getContents({ moduleSlug: props.module.slug, pageSize: 1 });
    content.value = data.items?.[0] || null;
  } catch (err) {
    error.value = err?.message || 'Failed to load contact info';
  } finally {
    loading.value = false;
  }
};

const contactMeta = computed(() => {
  const meta = content.value?.meta_json || {};
  return meta.contact && typeof meta.contact === 'object' ? meta.contact : meta;
});

const contactFields = computed(() => {
  const meta = contactMeta.value || {};
  const fields = [
    { label: 'Email', value: meta.email, type: 'email' },
    { label: 'Phone', value: meta.phone, type: 'phone' },
    { label: 'Office', value: meta.office },
    { label: 'Address', value: meta.address },
    { label: 'Office Hours', value: meta.officeHours || meta.office_hours },
    { label: 'Website', value: meta.website, type: 'url' }
  ];
  return fields.filter((field) => field.value);
});

watch(
  () => props.module?.slug,
  () => {
    loadContact();
  },
  { immediate: true }
);
</script>

<template>
  <section class="surface-card">
    <h2>{{ module.name }}</h2>
    <p class="muted">{{ module.config_json?.summary || 'Get in touch with the lab.' }}</p>

    <div v-if="loading" class="muted">Loading contact details...</div>
    <div v-else-if="error" class="muted">{{ error }}</div>
    <div v-else-if="!content" class="empty">Contact details will be available soon.</div>
    <div v-else class="grid cols-2">
      <div class="surface-card" style="padding: 16px;">
        <h3>Contact details</h3>
        <div v-if="!contactFields.length" class="muted">No structured contact fields yet.</div>
        <div v-else class="table-list">
          <div v-for="field in contactFields" :key="field.label" class="table-row">
            <strong>{{ field.label }}</strong>
            <span v-if="field.type === 'email'">
              <a :href="`mailto:${field.value}`">{{ field.value }}</a>
            </span>
            <span v-else-if="field.type === 'phone'">
              <a :href="`tel:${field.value}`">{{ field.value }}</a>
            </span>
            <span v-else-if="field.type === 'url'">
              <a :href="field.value" target="_blank" rel="noreferrer">{{ field.value }}</a>
            </span>
            <span v-else>{{ field.value }}</span>
          </div>
        </div>
      </div>
      <div class="surface-card" style="padding: 16px;">
        <h3>Message from the lab</h3>
        <ContentRenderer :content="content" />
      </div>
    </div>
  </section>
</template>
