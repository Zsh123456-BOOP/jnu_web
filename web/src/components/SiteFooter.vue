<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useSiteStore } from '../stores/site';

const siteStore = useSiteStore();
const settingsSite = computed(() => siteStore.settingsSite?.value || {});
const footerSettings = computed(() => siteStore.publicSettings?.footer || {});
const siteName = computed(() => settingsSite.value.siteName || 'Lab Nexus');
const tagline = computed(() => settingsSite.value.logoText || 'Research, people, and publications.');
const footerContact = computed(() => footerSettings.value.contact || {});
const footerLinks = computed(() =>
  Array.isArray(footerSettings.value.links) ? footerSettings.value.links : []
);
const year = new Date().getFullYear();

const isExternalLink = (url = '') => /^https?:\/\//i.test(url);
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">{{ siteName }}</div>
          <p class="footer-tagline">{{ tagline }}</p>
        </div>
        <div v-for="(group, index) in footerLinks" :key="group.title || index">
          <h4 class="footer-heading">{{ group.title || 'Links' }}</h4>
          <nav class="footer-links">
            <template v-for="(item, idx) in group.items || []" :key="item.label || idx">
              <a
                v-if="isExternalLink(item.url)"
                class="footer-link"
                :href="item.url"
                target="_blank"
                rel="noreferrer"
              >
                {{ item.label || item.url }}
              </a>
              <RouterLink v-else class="footer-link" :to="item.url || '/'">
                {{ item.label || item.url }}
              </RouterLink>
            </template>
          </nav>
        </div>
        <div>
          <h4 class="footer-heading">Contact</h4>
          <div class="footer-contact">
            <p v-if="footerContact.address">Address: {{ footerContact.address }}</p>
            <p v-if="footerContact.email">
              Email:
              <a class="footer-link" :href="`mailto:${footerContact.email}`">
                {{ footerContact.email }}
              </a>
            </p>
          </div>
        </div>
      </div>
      <div class="footer-bottom">© {{ year }} {{ siteName }}. All rights reserved.</div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: var(--space-12) 0;
  background-color: #0f172a;
  color: #f8fafc;
  position: relative;
}

.site-footer::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--sidebar-width) * -1);
  width: var(--sidebar-width);
  background-color: inherit;
}

.site-footer .container {
  position: relative;
  z-index: 1;
}

.footer-grid {
  display: grid;
  gap: var(--space-8);
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.footer-logo {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.footer-tagline {
  margin-top: var(--space-3);
  color: rgba(248, 250, 252, 0.72);
  font-size: var(--font-size-sm);
}

.footer-heading {
  margin-bottom: var(--space-3);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(248, 250, 252, 0.8);
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.footer-link {
  color: #f8fafc;
  text-decoration: none;
}

.footer-link:hover {
  color: var(--color-primary-soft);
  text-decoration: underline;
}

.footer-contact p {
  margin-bottom: var(--space-2);
  color: rgba(248, 250, 252, 0.75);
  font-size: var(--font-size-sm);
}

.footer-bottom {
  margin-top: var(--space-10);
  font-size: var(--font-size-xs);
  color: rgba(248, 250, 252, 0.6);
}

@media (max-width: 1024px) {
  .site-footer::before {
    display: none;
  }
}
</style>
