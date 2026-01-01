import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AdminLayout from '../components/AdminLayout.vue';
import LoginView from '../views/Login.vue';
import DashboardView from '../views/Dashboard.vue';
import ModulesView from '../views/Modules.vue';
import ContentsView from '../views/Contents.vue';
import AssetsView from '../views/Assets.vue';
import SettingsView from '../views/Settings.vue';
import ContentEditView from '../views/ContentEdit.vue';

const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
  {
    path: '/',
    component: AdminLayout,
    children: [
      { path: '', name: 'dashboard', component: DashboardView },
      { path: 'modules', name: 'modules', component: ModulesView },
      { path: 'contents', name: 'contents', component: ContentsView },
      { path: 'contents/create', name: 'content-create', component: ContentEditView },
      { path: 'contents/edit/:id', name: 'content-edit', component: ContentEditView, props: true },
      { path: 'assets', name: 'assets', component: AssetsView },
      { path: 'settings', name: 'settings', component: SettingsView }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (to.meta.public) {
    if (to.name === 'login' && authStore.user) {
      return { name: 'dashboard' };
    }
    return true;
  }

  const user = await authStore.ensure();
  if (!user) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  return true;
});

export default router;
