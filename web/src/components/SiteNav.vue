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

onMounted(() => {
  if (!siteStore.modules.length) {
    siteStore.fetchModules();
  }
});
</script>

<template>
  <header class="site-header">
    <div class="container site-header__inner">
      <RouterLink to="/" class="brand">
        <span class="brand__title">{{ siteName }}</span>
        <span class="brand__subtitle">{{ logoText }}</span>
      </RouterLink>

      <button class="site-header__mobile-toggle" @click="toggleMobileMenu">
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

      <nav class="site-nav" :class="{ 'is-open': isMobileMenuOpen }">
        <RouterLink class="site-nav__link" to="/">Home</RouterLink>
        <RouterLink class="site-nav__link" to="/search">Search</RouterLink>
        <span v-if="loading" class="site-nav__loading">Loading...</span>
        <RouterLink
          v-for="item in navModules"
          :key="item.id"
          class="site-nav__link"
          :to="`/${item.slug}`"
        >
          {{ item.name }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  backdrop-filter: blur(12px);
  background-color: rgba(247, 248, 250, 0.92);
  border-bottom: var(--border-width-sm) solid var(--color-border);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-8);
  height: 76px;
  flex-wrap: nowrap;
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
  font-family: var(--font-serif);
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
  align-items: center;
  gap: var(--space-3);
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow: hidden;
  flex: 1 1 auto;
  justify-content: flex-end;
}

.site-nav__link {
  display: block;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  text-decoration: none;
  border: var(--border-width-sm) solid transparent;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.site-nav__link:hover {
  color: var(--color-primary-strong);
  background-color: var(--color-surface-soft);
  border-color: var(--color-border);
  text-decoration: none;
}

.site-nav__link.router-link-active {
  background-color: var(--color-primary-soft);
  color: var(--color-primary-strong);
  border-color: rgba(37, 99, 235, 0.45);
}

.site-nav__link:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus-ring);
}

.site-header__mobile-toggle {
  display: none;
  background: none;
  border: none;
  padding: var(--space-2);
  cursor: pointer;
  color: var(--color-text);
}

/* Mobile Styles */
@media (max-width: 1024px) {
  .site-header__inner {
    height: 64px;
  }

  .site-header__mobile-toggle {
    display: block;
    z-index: 1001; /* Above the nav panel */
  }

  .site-nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    background-color: var(--color-background);
    border-bottom: var(--border-width-sm) solid var(--color-border);
    padding: var(--space-2) var(--space-4) var(--space-4);
  }

  .site-nav.is-open {
    display: flex;
  }

  .site-nav__link {
    padding: var(--space-3);
    border-radius: var(--radius-md);
  }

  .site-nav__loading {
    padding: var(--space-3);
  }
}
</style>
