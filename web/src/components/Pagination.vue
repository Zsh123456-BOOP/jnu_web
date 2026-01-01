<script setup>
import { computed } from 'vue';

const props = defineProps({
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:page']);

const totalPages = computed(() => {
  const pages = Math.ceil(props.total / props.pageSize);
  return pages > 0 ? pages : 1;
});

const canPrev = computed(() => props.page > 1);
const canNext = computed(() => props.page < totalPages.value);

const goPrev = () => {
  if (canPrev.value) {
    emit('update:page', props.page - 1);
  }
};

const goNext = () => {
  if (canNext.value) {
    emit('update:page', props.page + 1);
  }
};
</script>

<template>
  <div class="pagination">
    <button class="secondary" type="button" :disabled="!canPrev" @click="goPrev">
      Previous
    </button>
    <span class="muted">Page {{ page }} / {{ totalPages }}</span>
    <button class="secondary" type="button" :disabled="!canNext" @click="goNext">
      Next
    </button>
  </div>
</template>
