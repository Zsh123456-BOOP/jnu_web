<script setup>
import { computed, ref, watch } from 'vue';
import api from '../api';
import ContentRenderer from './ContentRenderer.vue';
import PageHeader from './PageHeader.vue';

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
    const data = await api.contents.list({ moduleSlug: props.module.slug, pageSize: 1 });
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
  <section class="page">
    <div class="container">
      <PageHeader
        :title="module.name"
        :subtitle="module.config_json?.summary || 'Get in touch with the lab.'"
      />

      <div class="page-body">
        <div v-if="loading" class="card muted">Loading contact details...</div>
        <div v-else-if="error" class="card muted">{{ error }}</div>
        <div v-else-if="!content" class="empty-state">Contact details will be available soon.</div>
        <div v-else class="grid md:grid-cols-2">
          <div class="card card--compact">
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
          <div class="card card--compact">
            <h3>Message from the lab</h3>
            <ContentRenderer :content="content" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
