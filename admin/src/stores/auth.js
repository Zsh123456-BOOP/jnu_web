import { defineStore } from 'pinia';
import http from '../utils/http';

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
        const res = await http.get('/admin/me');
        this.user = res.data?.data || null;
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
      const res = await http.post('/admin/login', payload);
      this.user = res.data?.data || null;
      this.checked = true;
      return this.user;
    },
    async logout() {
      try {
        await http.post('/admin/logout');
      } finally {
        this.user = null;
        this.checked = true;
      }
    }
  }
});
