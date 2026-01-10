import { defineStore } from 'pinia';
import api from '../api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    checked: false,
    loading: false
  }),
  actions: {
    async fetchMe() {
      this.loading = true;
      try {
        this.user = await api.auth.me();
      } catch {
        this.user = null;
      } finally {
        this.loading = false;
        this.checked = true;
      }
      return this.user;
    },
    async ensure() {
      if (this.checked) {
        return this.user;
      }
      return this.fetchMe();
    },
    async login(payload) {
      this.user = await api.auth.login(payload);
      this.checked = true;
      return this.user;
    },
    async logout() {
      try {
        await api.auth.logout();
      } finally {
        this.user = null;
        this.checked = true;
      }
    }
  }
});
