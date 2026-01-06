<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useSiteStore } from '../stores/site';

const siteStore = useSiteStore();
const navModules = computed(() => siteStore.navModules);
const loading = computed(() => siteStore.loadingModules);
const settingsSite = computed(() => siteStore.settingsSite?.value || {});
const siteName = computed(() => settingsSite.value.siteName || 'Lab Nexus');
const logoText = computed(
  () => settingsSite.value.logoText || 'Research, people, and publications'
);

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

onMounted(() => {
  if (!siteStore.modules.length) {
    siteStore.fetchModules();
  }
});
</script>

<template>
  <div class="site-sidebar-wrapper">
    <button class="site-sidebar__toggle" @click="toggleMobileMenu">
      <span class="visually-hidden">Menu</span>
      <svg
        v-if="!isMobileMenuOpen"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    <div
      class="site-sidebar__backdrop"
      :class="{ 'is-open': isMobileMenuOpen }"
      @click="closeMobileMenu"
    ></div>

    <aside class="site-sidebar" :class="{ 'is-open': isMobileMenuOpen }">
      <RouterLink to="/" class="brand" @click="closeMobileMenu">
        <span class="brand__title">{{ siteName }}</span>
        <span class="brand__subtitle">{{ logoText }}</span>
      </RouterLink>

      <nav class="site-nav">
        <RouterLink class="site-nav__link" to="/" @click="closeMobileMenu">Home</RouterLink>
        <RouterLink class="site-nav__link" to="/search" @click="closeMobileMenu">Search</RouterLink>
        <span v-if="loading" class="site-nav__loading">Loading...</span>
        <RouterLink
          v-for="item in navModules"
          :key="item.id"
          class="site-nav__link"
          :to="`/${item.slug}`"
          @click="closeMobileMenu"
        >
          {{ item.name }}
        </RouterLink>
      </nav>
    </aside>
  </div>
</template>

<style scoped>
.site-sidebar-wrapper {
  position: relative;
  flex: 0 0 var(--sidebar-width);
  width: var(--sidebar-width);
}

.site-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: var(--space-6) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.9);
  border-right: 1px solid var(--color-border);
}

.brand {
  display: flex;
  flex-direction: column;
  line-height: var(--line-height-tight);
  text-decoration: none;
}
.brand:hover {
  text-decoration: none;
}

.brand__title {
  font-family: var(--font-sans);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.brand__subtitle {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.site-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  overflow-y: auto;
  padding-right: var(--space-1);
}

.site-nav__link {
  display: flex;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.site-nav__link:hover {
  color: var(--color-primary);
  background-color: var(--color-surface-soft);
  border-color: var(--color-border);
  text-decoration: none;
}

.site-nav__link.router-link-active {
  color: var(--color-primary);
  background-color: var(--color-primary-soft);
  border-left-color: var(--color-primary);
}

.site-nav__link:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus-ring);
}

.site-sidebar__toggle {
  display: none;
  position: fixed;
  top: var(--space-4);
  left: var(--space-4);
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-primary);
  color: var(--color-on-primary);
  cursor: pointer;
  z-index: 2100;
  box-shadow: var(--shadow-md);
}

.site-sidebar__backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  z-index: 2000;
}

/* Mobile Styles */
@media (max-width: 1024px) {
  .site-sidebar-wrapper {
    width: 0;
    flex: 0 0 0;
  }

  .site-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: var(--sidebar-width);
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    z-index: 2100;
  }

  .site-sidebar.is-open {
    transform: translateX(0);
  }

  .site-sidebar__toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .site-sidebar__backdrop.is-open {
    display: block;
  }
}
</style>
