import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/Home.vue';
import ModuleView from '../views/ModuleView.vue';
import ContentDetailView from '../views/ContentDetail.vue';
import SearchView from '../views/Search.vue';
import NotFoundView from '../views/NotFound.vue';
import MembersView from '../views/Members.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/search', name: 'search', component: SearchView },
  { path: '/members', name: 'members', component: MembersView },
  { path: '/pi', name: 'pi', component: MembersView },
  { path: '/:moduleSlug/:pageSlug', name: 'content-detail', component: ContentDetailView },
  { path: '/:moduleSlug', name: 'module', component: ModuleView },
  { path: '/404', name: 'not-found', component: NotFoundView },
  { path: '/:pathMatch(.*)*', redirect: '/404' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
