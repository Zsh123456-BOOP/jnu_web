import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    compact: false
  }),
  actions: {
    toggleCompact() {
      this.compact = !this.compact;
    }
  }
});
