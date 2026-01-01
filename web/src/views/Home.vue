<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useSiteStore } from '../stores/site';
import { getContents } from '../utils/api';
import ContentList from '../components/ContentList.vue';

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
          if (!module) {
            return null;
          }
          return {
            title: module.name,
            description: module.config_json?.summary || module.type,
            to: `/${module.slug}`,
            external: false
          };
        }
        if (item && typeof item === 'object') {
          const slug = item.slug || item.moduleSlug;
          const module = slug ? moduleMap.value.get(slug) : null;
          const url = item.url || (slug ? `/${slug}` : null);
          if (!url) {
            return null;
          }
          return {
            title: item.title || module?.name || slug || 'Untitled',
            description: item.description || module?.config_json?.summary || module?.type || '',
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
  <div>
    <section class="hero">
      <div class="hero-content">
        <span class="pill">Open Research Hub</span>
        <h1>Explore the laboratory, its people, and its discoveries.</h1>
        <p class="tagline">
          Browse modules, read the latest updates, and search across publications, projects,
          and announcements.
        </p>
        <div class="hero-actions">
          <RouterLink class="link-button" to="/search">Search the lab</RouterLink>
          <RouterLink
            v-if="navModules.length"
            class="link-button secondary"
            :to="`/${navModules[0].slug}`"
          >
            Start with {{ navModules[0].name }}
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-title">
        <h2>Explore modules</h2>
        <span class="muted">{{ homeCards.length }} destinations</span>
      </div>
      <div v-if="!homeCards.length" class="empty">No modules available yet.</div>
      <div v-else class="grid cols-3">
        <article v-for="card in homeCards" :key="card.title" class="surface-card">
          <h3>{{ card.title }}</h3>
          <p>{{ card.description }}</p>
          <RouterLink v-if="!card.external" class="link-button secondary" :to="card.to">
            Open
          </RouterLink>
          <a v-else class="link-button secondary" :href="card.to" target="_blank" rel="noreferrer">
            Visit
          </a>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section-title">
        <h2>Latest updates</h2>
        <span class="muted">Fresh from the lab</span>
      </div>
      <div v-if="latestLoading" class="surface-card">Loading latest content...</div>
      <div v-else-if="latestError" class="surface-card">{{ latestError }}</div>
      <ContentList v-else :items="latestContents" :show-module="true" />
    </section>
  </div>
</template>
