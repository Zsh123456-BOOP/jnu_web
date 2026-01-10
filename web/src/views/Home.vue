<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useSiteStore } from '../stores/site';
import api from '../api';
import ContentList from '../components/ContentList.vue';

const siteStore = useSiteStore();
const latestContents = ref([]);
const latestLoading = ref(false);
const latestError = ref('');

const moduleMap = computed(() => siteStore.moduleMap);
const homeConfig = computed(() => siteStore.settingsSite?.value || {});

const homeCards = computed(() => {
  const configured = homeConfig.value.homeModules;
  if (!Array.isArray(configured) || configured.length === 0) {
    return [];
  }

  return configured
    .map((item) => {
      if (typeof item === 'string') {
        const module = moduleMap.value.get(item);
        if (!module) return null;
        return {
          title: module.name,
          description: module.config_json?.summary || module.type,
          typeLabel: module.type || 'Module',
          to: `/${module.slug}`,
          external: false
        };
      }
      if (item && typeof item === 'object') {
        const slug = item.slug || item.moduleSlug;
        const module = slug ? moduleMap.value.get(slug) : null;
        const url = item.url || (slug ? `/${slug}` : null);
        if (!url) return null;
        return {
          title: item.title || module?.name || slug || 'Untitled',
          description: item.description || module?.config_json?.summary || module?.type || '',
          typeLabel: module?.type || (item.url ? 'External' : 'Module'),
          to: url,
          external: Boolean(item.url)
        };
      }
      return null;
    })
    .filter(Boolean);
});

const loadLatest = async () => {
  latestLoading.value = true;
  latestError.value = '';
  try {
    const data = await api.contents.list({ pageSize: 5 });
    latestContents.value = data.items || [];
  } catch (err) {
    latestError.value = err?.message || 'Failed to load latest content';
  } finally {
    latestLoading.value = false;
  }
};

onMounted(() => {
  siteStore.fetchModules();
  loadLatest();
});
</script>

<template>
  <main class="page">
    <section class="hero-modern">
      <div class="container hero-container">
        <div class="hero-text">
          <div class="badge-wrapper">
            <span class="badge badge--primary-soft">Welcome to the Lab</span>
          </div>
          <h1 class="hero-title">
            Exploring the frontiers of <span class="highlight">Bioinformatics</span> and Data Science.
          </h1>
          <p class="hero-subtitle">
            Browse our latest publications, discover open-source software, and meet the team behind the research.
          </p>
          <div class="hero-actions">
            <RouterLink class="btn btn--primary btn--lg" to="/research">Our Research</RouterLink>
            <RouterLink class="btn btn--text" to="/about">Read about us &rarr;</RouterLink>
          </div>
        </div>
        <div class="hero-visual">
          <div class="blob blob-1"></div>
          <div class="blob blob-2"></div>
          <div class="glass-card">
            <div class="stat">
              <span class="stat-num">40+</span>
              <span class="stat-label">Papers</span>
            </div>
            <div class="stat">
              <span class="stat-num">12</span>
              <span class="stat-label">Projects</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="page-body container section">
      <div class="home-layout-grid">
        <div class="home-main">
          <div class="section-header">
            <h2>Latest updates</h2>
          </div>
          <div v-if="latestLoading" class="muted">Loading latest updates...</div>
          <div v-else-if="latestError" class="muted">{{ latestError }}</div>
          <ContentList v-else :items="latestContents" empty-text="No updates yet." />
        </div>
        <aside class="home-sidebar">
          <div class="section-header">
            <h3>Explore modules</h3>
          </div>
          <article v-for="card in homeCards" :key="card.title" class="sidebar-card">
            <h4>{{ card.title }} &rarr;</h4>
            <RouterLink :to="card.to" class="sidebar-link-overlay"></RouterLink>
          </article>
        </aside>
      </div>
    </div>

  </main>
</template>

<style scoped>
/* Modern Hero Styles */
.hero-modern {
  position: relative;
  padding: var(--space-20) 0;
  background: radial-gradient(circle at top right, rgba(37, 99, 235, 0.05), transparent 40%),
    radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.03), transparent 40%);
  overflow: hidden;
}

.hero-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-10);
  align-items: center;
}

@media (min-width: 1024px) {
  .hero-container {
    grid-template-columns: 1.2fr 0.8fr;
  }
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.1;
  margin-bottom: var(--space-6);
  color: var(--color-text);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.hero-title .highlight {
  color: var(--color-primary);
  background: linear-gradient(120deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
  background-repeat: no-repeat;
  background-size: 100% 30%;
  background-position: 0 88%;
}

.hero-subtitle {
  font-size: var(--font-size-xl);
  color: var(--color-text-muted);
  margin-bottom: var(--space-8);
  max-width: 50ch;
  font-family: var(--font-serif);
}

.hero-actions {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.btn--lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-md);
}

/* Visual Blobs & Glass Card */
.hero-visual {
  position: relative;
  height: 400px;
  display: none;
  /* Mobile 隐藏 */
}

@media (min-width: 1024px) {
  .hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
  animation: float 10s infinite ease-in-out;
}

.blob-1 {
  width: 300px;
  height: 300px;
  background: #bfdbfe;
  top: 10%;
  left: 10%;
}

.blob-2 {
  width: 250px;
  height: 250px;
  background: #ddd6fe;
  bottom: 10%;
  right: 10%;
  animation-delay: -5s;
}

.glass-card {
  position: relative;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  padding: var(--space-8);
  border-radius: var(--radius-xl);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: var(--space-8);
  z-index: 10;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  margin-top: var(--space-2);
}

/* Home Layout */
.home-layout-grid {
  display: grid;
  gap: var(--space-8);
}

@media (min-width: 1024px) {
  .home-layout-grid {
    grid-template-columns: 2fr 1fr;
    align-items: start;
  }
}

/* Sidebar Cards */
.sidebar-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  position: relative;
  transition: border-color 0.2s ease;
}

.sidebar-card:hover {
  border-color: var(--color-primary);
}

.sidebar-card h4 {
  font-size: var(--font-size-md);
  color: var(--color-text);
  margin: 0;
}

.sidebar-link-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(0, 20px);
  }
}
</style>
