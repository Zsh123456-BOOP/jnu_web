<script setup>
import { onBeforeUnmount, watch } from 'vue';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [StarterKit],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML());
  }
});

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) {
      return;
    }
    const html = editor.value.getHTML();
    if (value !== html) {
      editor.value.commands.setContent(value || '', false);
    }
  }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<template>
  <div class="editor-panel">
    <EditorContent :editor="editor" class="tiptap" />
  </div>
</template>
