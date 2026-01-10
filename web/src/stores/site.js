import { defineStore } from 'pinia';
import api from '../api';

export const useSiteStore = defineStore('site', {
  state: () => ({
    modules: [],
    settingsSite: null,
    publicSettings: null,
    loadingModules: false,
    loadingSettings: false,
    loadingPublicSettings: false,
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
      await Promise.all([this.fetchModules(), this.fetchSettings(), this.fetchPublicSettings()]);
    },
    async fetchModules() {
      if (this.loadingModules) {
        return;
      }
      this.loadingModules = true;
      this.error = '';
      try {
        this.modules = await api.modules.list();
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
        this.settingsSite = await api.settings.getSite();
      } catch {
        this.settingsSite = null;
      } finally {
        this.loadingSettings = false;
      }
    },
    async fetchPublicSettings() {
      if (this.loadingPublicSettings) {
        return;
      }
      this.loadingPublicSettings = true;
      try {
        this.publicSettings = await api.settings.getPublicSiteSettings();
      } catch {
        this.publicSettings = null;
      } finally {
        this.loadingPublicSettings = false;
      }
    }
  }
});
