import { defineStore } from 'pinia';
import { getModules, getSettingsSite } from '../utils/api';

export const useSiteStore = defineStore('site', {
  state: () => ({
    modules: [],
    settingsSite: null,
    loadingModules: false,
    loadingSettings: false,
    error: ''
  }),
  getters: {
    navModules: (state) => {
      return [...state.modules]
        .filter((item) => Number(item.nav_visible) === 1)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    },
    moduleMap: (state) => {
      const map = new Map();
      state.modules.forEach((mod) => {
        map.set(mod.slug, mod);
      });
      return map;
    }
  },
  actions: {
    async bootstrap() {
      await Promise.all([this.fetchModules(), this.fetchSettings()]);
    },
    async fetchModules() {
      if (this.loadingModules) {
        return;
      }
      this.loadingModules = true;
      this.error = '';
      try {
        this.modules = await getModules();
      } catch (err) {
        this.error = err?.message || 'Failed to load modules';
      } finally {
        this.loadingModules = false;
      }
    },
    async fetchSettings() {
      if (this.loadingSettings) {
        return;
      }
      this.loadingSettings = true;
      try {
        this.settingsSite = await getSettingsSite();
      } catch {
        this.settingsSite = null;
      } finally {
        this.loadingSettings = false;
      }
    }
  }
});
