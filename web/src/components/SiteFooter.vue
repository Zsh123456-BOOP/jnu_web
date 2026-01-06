<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useSiteStore } from '../stores/site';

const siteStore = useSiteStore();
const settingsSite = computed(() => siteStore.settingsSite?.value || {});
const siteName = computed(() => settingsSite.value.siteName || 'Lab Nexus');
const tagline = computed(() => settingsSite.value.logoText || 'Research, people, and publications.');
const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">{{ siteName }}</div>
          <p class="footer-tagline">{{ tagline }}</p>
        </div>
        <div>
          <h4 class="footer-heading">Quick Links</h4>
          <nav class="footer-links">
            <RouterLink class="footer-link" to="/">Home</RouterLink>
            <RouterLink class="footer-link" to="/research">Research</RouterLink>
            <RouterLink class="footer-link" to="/people">Team</RouterLink>
          </nav>
        </div>
        <div>
          <h4 class="footer-heading">Contact</h4>
          <div class="footer-contact">
            <p>Address: 123 Research Road, City</p>
            <p>
              Email:
              <a class="footer-link" href="mailto:lab@example.com">lab@example.com</a>
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
