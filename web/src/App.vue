<!--
  App.vue - 应用根组件
  
  开屏动画控制说明：
  - sessionStorage 键名: 'intro_seen'
  - 同一会话只显示一次开屏动画
  - 清除 sessionStorage.removeItem('intro_seen') 可重新显示
  - 设置 showIntro = false 可完全禁用开屏
-->
<script setup>
import { onMounted, ref, computed } from 'vue';
import { RouterView } from 'vue-router';
import SiteNav from './components/SiteNav.vue';
import SiteFooter from './components/SiteFooter.vue';
import IntroSplash from './components/IntroSplash.vue';
import { useSiteStore } from './stores/site';

const siteStore = useSiteStore();

// 开屏动画状态
const showIntro = ref(false);
const appReady = ref(false);

// 检查是否为首次访问（同一会话内）
const checkFirstVisit = () => {
  const hasSeen = sessionStorage.getItem('intro_seen');
  if (!hasSeen) {
    showIntro.value = true;
  } else {
    // 已看过开屏，直接显示页面
    appReady.value = true;
  }
};

// 开屏动画完成回调
const onIntroComplete = () => {
  showIntro.value = false;
  // 延迟一帧后触发页面渐显动画
  requestAnimationFrame(() => {
    appReady.value = true;
  });
};

onMounted(() => {
  checkFirstVisit();
  siteStore.bootstrap();
});
</script>

<template>
  <!-- 开屏动画 -->
  <IntroSplash v-if="showIntro" @complete="onIntroComplete" />
  
  <!-- 主应用壳层 -->
  <div class="app-shell" :class="{ 'app-ready': appReady, 'app-behind-intro': showIntro }">
    <SiteNav />
    <div class="app-content">
      <main class="app-main">
        <RouterView />
      </main>
      <SiteFooter />
    </div>
  </div>
</template>

<style>
/* ============================================
   页面渐显动画 (Stagger Fade-in)
   ============================================ */

/* 初始状态：隐藏并下移 */
.app-shell:not(.app-ready) .hero-modern,
.app-shell:not(.app-ready) .hero-container,
.app-shell:not(.app-ready) .page-body,
.app-shell:not(.app-ready) .home-main,
.app-shell:not(.app-ready) .home-sidebar,
.app-shell:not(.app-ready) .section-header,
.app-shell:not(.app-ready) .glass-card {
  opacity: 0;
  transform: translateY(16px);
}

/* 准备就绪后的渐显动画 */
.app-ready .hero-modern,
.app-ready .hero-container {
  animation: page-fade-in 0.5s ease forwards;
  animation-delay: 0ms;
}

.app-ready .glass-card {
  animation: page-fade-in 0.5s ease forwards;
  animation-delay: 60ms;
}

.app-ready .page-body,
.app-ready .home-main {
  animation: page-fade-in 0.5s ease forwards;
  animation-delay: 120ms;
}

.app-ready .home-sidebar {
  animation: page-fade-in 0.5s ease forwards;
  animation-delay: 180ms;
}

.app-ready .section-header {
  animation: page-fade-in 0.4s ease forwards;
  animation-delay: 100ms;
}

@keyframes page-fade-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 开屏显示时降低主内容层级 */
.app-behind-intro {
  pointer-events: none;
}

/* prefers-reduced-motion 支持 */
@media (prefers-reduced-motion: reduce) {
  .app-shell:not(.app-ready) .hero-modern,
  .app-shell:not(.app-ready) .hero-container,
  .app-shell:not(.app-ready) .page-body,
  .app-shell:not(.app-ready) .home-main,
  .app-shell:not(.app-ready) .home-sidebar,
  .app-shell:not(.app-ready) .section-header,
  .app-shell:not(.app-ready) .glass-card {
    opacity: 1;
    transform: none;
  }
  
  .app-ready .hero-modern,
  .app-ready .hero-container,
  .app-ready .glass-card,
  .app-ready .page-body,
  .app-ready .home-main,
  .app-ready .home-sidebar,
  .app-ready .section-header {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
