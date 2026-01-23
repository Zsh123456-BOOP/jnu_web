import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useSiteStore } from './stores/site';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/pages.css';
import './styles/components.css';
import './styles/markdown.css';

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);

const siteStore = useSiteStore(pinia);
siteStore.fetchPublicSettings();

app.mount('#app');
