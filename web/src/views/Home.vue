<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useSiteStore } from '../stores/site';
import { getContents } from '../utils/api';
import ContentList from '../components/ContentList.vue';
import PageHeader from '../components/PageHeader.vue';

const siteStore = useSiteStore();
const latestContents = ref([]);
const latestLoading = ref(false);
const latestError = ref('');

const modules = computed(() => siteStore.modules);
const moduleMap = computed(() => siteStore.moduleMap);
const navModules = computed(() => siteStore.navModules);
const homeConfig = computed(() => siteStore.settingsSite?.value || {});

const homeCards = computed(() => {
  const configured = homeConfig.value.homeModules;
  if (Array.isArray(configured) && configured.length) {
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
  }

  return [...modules.value]
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .slice(0, 6)
    .map((module) => ({
      title: module.name,
      description: module.config_json?.summary || module.type,
      typeLabel: module.type || 'Module',
      to: `/${module.slug}`,
      external: false
    }));
});

const loadLatest = async () => {
  latestLoading.value = true;
  latestError.value = '';
  try {
    const data = await getContents({ pageSize: 5 });
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
  <main class="page page--hero">
    <section class="hero">
      <div class="container hero__content">
        <span class="badge">Open Research Hub</span>
        <PageHeader
          class="hero-header"
          title="Explore the laboratory, its people, and its discoveries."
          subtitle="Browse modules, read the latest updates, and search across publications, projects, and announcements."
        >
          <template #actions>
            <RouterLink class="btn btn--primary" to="/search">Search the lab</RouterLink>
            <RouterLink
              v-if="navModules.length"
              class="btn btn--secondary"
              :to="`/${navModules[0].slug}`"
            >
              Start with {{ navModules[0].name }}
            </RouterLink>
          </template>
        </PageHeader>
      </div>
    </section>

    <div class="page-body">
      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2>Explore modules</h2>
            <p class="section-subtitle">{{ homeCards.length }} destinations</p>
          </div>
          <div v-if="!homeCards.length" class="empty-state">No modules available yet.</div>
          <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3">
          <article v-for="card in homeCards" :key="card.title" class="card card--interactive">
            <div class="card__badge">
              <span class="badge badge--neutral">{{ card.typeLabel }}</span>
            </div>
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
            <RouterLink v-if="!card.external" class="btn btn--primary" :to="card.to">
              Open
            </RouterLink>
            <a v-else class="btn btn--secondary" :href="card.to" target="_blank" rel="noreferrer">
              Visit
            </a>
            </article>
          </div>
        </div>
      </section>

      <section class="section section--wash">
        <div class="container">
          <div class="section-header">
            <h2>Latest updates</h2>
            <p class="section-subtitle">Fresh from the lab</p>
          </div>
          <div v-if="latestLoading" class="card">Loading latest content...</div>
          <div v-else-if="latestError" class="card">{{ latestError }}</div>
          <ContentList v-else :items="latestContents" :show-module="true" />
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.hero {
  padding: var(--space-16) 0 var(--space-16);
  min-height: 420px;
  display: flex;
  align-items: center;
  background-image: linear-gradient(145deg, hsl(222, 50%, 12%), hsl(222, 70%, 28%));
  color: var(--color-on-primary);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(2, 6, 23, 0.78), rgba(2, 6, 23, 0.5));
  z-index: 0;
}

.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at top right, hsla(210, 90%, 65%, 0.3), transparent 45%);
  pointer-events: none;
  z-index: 0;
}

.hero__content {
  position: relative;
  z-index: 1;
  width: 100%;
}

.hero-header {
  margin-top: var(--space-4);
  margin-bottom: 0;
}

.hero-header :deep(.page-title) {
  font-size: clamp(2.4rem, 3.6vw, 3.4rem);
  max-width: 20ch;
  color: #f8fafc;
  text-shadow: 0 8px 24px rgba(15, 23, 42, 0.45);
}

.hero-header :deep(.page-subtitle) {
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  color: #e2e8f0;
  text-shadow: 0 6px 18px rgba(15, 23, 42, 0.35);
  max-width: 65ch;
}

.hero-header :deep(.page-actions) {
  margin-top: var(--space-6);
}

.hero .badge {
  background-color: rgba(255, 255, 255, 0.14);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero .btn--secondary {
  background-color: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.3);
  color: #f8fafc;
  box-shadow: 0 12px 28px -24px rgba(15, 23, 42, 0.8);
}

.hero .btn--secondary:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.28);
  border-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .hero {
    min-height: 360px;
    padding: var(--space-12) 0 var(--space-12);
  }

  .hero-header :deep(.page-title) {
    font-size: clamp(2rem, 6vw, 2.6rem);
  }
}

.section-header {
  margin-bottom: var(--space-6);
}

.section-header h2 {
  margin-bottom: var(--space-1);
}

.section-header .section-subtitle {
  color: var(--color-text-muted);
  margin-bottom: 0;
}

.section--wash {
  background-color: var(--color-surface-soft);
}

.card p {
  color: var(--color-text-muted);
  flex-grow: 1;
}

.card .btn {
  margin-top: var(--space-4);
}

/* Make card a flex column to push button to bottom */
.card {
  display: flex;
  flex-direction: column;
}

</style>
