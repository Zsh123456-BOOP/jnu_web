<!--
  IntroSplash.vue - 开屏动画组件
  
  配置说明：
  - 动画时长：修改 PHASE_* 常量来调整各阶段时长
  - sessionStorage：动画完成后设置 'intro_seen' 键，同一会话不再显示
  - 禁用开屏：在 App.vue 中设置 showIntro = false 即可
  - prefers-reduced-motion：自动跳过动画，200ms 内显示页面
-->
<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useSiteStore } from '../stores/site';

const emit = defineEmits(['complete']);

const siteStore = useSiteStore();

// 动画阶段时长（毫秒）- 已翻倍
const PHASE_ENTER = 800;      // 0-800ms: 淡入+缩放
const PHASE_HOLD = 1000;      // 800-1800ms: 上移
const PHASE_EXIT = 800;       // 1800-2600ms: 整体淡出
const TOTAL_DURATION = PHASE_ENTER + PHASE_HOLD + PHASE_EXIT; // 2600ms

// 状态
const visible = ref(true);
const phase = ref('enter'); // 'enter' | 'hold' | 'exit'
const prefersReducedMotion = ref(false);

// 从 store 获取站点信息
const siteName = computed(() => siteStore.settingsSite?.value?.siteName || 'Bioinfo Lab');
const tagline = computed(() => siteStore.settingsSite?.value?.logoText || 'Research · People · Publications');

let timers = [];

const startAnimation = () => {
  // 检测 prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    prefersReducedMotion.value = true;
    setTimeout(() => {
      complete();
    }, 200);
    return;
  }

  // 阶段 1: 进入动画 (0-400ms)
  phase.value = 'enter';

  // 阶段 2: 保持并上移 (400-900ms)
  timers.push(setTimeout(() => {
    phase.value = 'hold';
  }, PHASE_ENTER));

  // 阶段 3: 退出动画 (900-1300ms)
  timers.push(setTimeout(() => {
    phase.value = 'exit';
  }, PHASE_ENTER + PHASE_HOLD));

  // 完成
  timers.push(setTimeout(() => {
    complete();
  }, TOTAL_DURATION));
};

const complete = () => {
  visible.value = false;
  sessionStorage.setItem('intro_seen', '1');
  emit('complete');
};

const skip = () => {
  // 清理所有定时器
  timers.forEach(t => clearTimeout(t));
  timers = [];
  // 快速退出
  phase.value = 'exit';
  setTimeout(() => {
    complete();
  }, 150);
};

// 键盘事件：Enter 或 Space 跳过
const handleKeydown = (e) => {
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
    skip();
  }
};

onMounted(() => {
  startAnimation();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  timers.forEach(t => clearTimeout(t));
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Transition name="splash-fade">
    <div
      v-if="visible"
      class="intro-splash"
      :class="[`phase-${phase}`, { 'reduced-motion': prefersReducedMotion }]"
      role="dialog"
      aria-label="开屏动画"
      aria-modal="true"
    >
      <!-- 装饰背景 -->
      <div class="splash-bg">
        <div class="splash-glow splash-glow--1"></div>
        <div class="splash-glow splash-glow--2"></div>
      </div>

      <!-- 主要内容 -->
      <div class="splash-content">
        <h1 class="splash-title">{{ siteName }}</h1>
        <p class="splash-tagline">{{ tagline }}</p>
        
        <!-- 生物信息学装饰：四个 icon 依次转圈显示 -->
        <div class="splash-icons" aria-hidden="true">
          <span class="bio-icon bio-icon--1">🧬</span>
          <span class="bio-icon bio-icon--2">🔬</span>
          <span class="bio-icon bio-icon--3">🧪</span>
          <span class="bio-icon bio-icon--4">📊</span>
        </div>
      </div>

      <!-- Skip 按钮 -->
      <button
        class="skip-btn"
        type="button"
        @click="skip"
        aria-label="跳过开屏动画"
      >
        Skip
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.intro-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background, #f8fafc);
  overflow: hidden;
}

/* 背景装饰光晕 */
.splash-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.splash-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.splash-glow--1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(147, 197, 253, 0.4) 0%, transparent 70%);
  top: 20%;
  left: 30%;
  animation: glow-pulse 2s ease-in-out infinite alternate;
}

.splash-glow--2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(196, 181, 253, 0.3) 0%, transparent 70%);
  bottom: 25%;
  right: 25%;
  animation: glow-pulse 2s 0.5s ease-in-out infinite alternate;
}

@keyframes glow-pulse {
  0% { opacity: 0.3; transform: scale(1); }
  100% { opacity: 0.5; transform: scale(1.05); }
}

/* 主要内容 */
.splash-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  /* 动画初始状态 */
  opacity: 0;
  transform: scale(0.96) translateY(0);
}

.splash-title {
  font-family: var(--font-serif, system-ui);
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text, #0f172a);
  letter-spacing: -0.03em;
  line-height: var(--line-height-tight, 1.1);
  margin: 0 0 var(--space-3, 0.75rem);
}

.splash-tagline {
  font-family: var(--font-sans, system-ui);
  font-size: var(--font-size-lg, 1.25rem);
  color: var(--color-text-muted, #64748b);
  margin: 0;
  letter-spacing: 0.02em;
}

/* 生物信息学 icon 装饰 */
.splash-icons {
  margin-top: var(--space-8, 2rem);
  display: flex;
  align-items: center;
  gap: var(--space-6, 1.5rem);
  opacity: 0;
}

.bio-icon {
  font-size: 2rem;
  opacity: 0;
  transform: scale(0.5);
  display: inline-block;
}

/* Skip 按钮 */
.skip-btn {
  position: absolute;
  top: var(--space-6, 1.5rem);
  right: var(--space-6, 1.5rem);
  padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
  background: transparent;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: var(--radius-full, 9999px);
  color: var(--color-text-muted, #64748b);
  font-size: var(--font-size-sm, 1rem);
  font-weight: var(--font-weight-medium, 500);
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
}

.skip-btn:hover {
  background: var(--color-surface-soft, #f1f5f9);
  color: var(--color-text, #0f172a);
  border-color: var(--color-border-hover, #cbd5e1);
}

.skip-btn:focus-visible {
  outline: 2px solid var(--color-primary, hsl(192, 100%, 22%));
  outline-offset: 2px;
}

/* ============================================
   动画阶段
   ============================================ */

/* 阶段 1: 进入 (0-400ms) - 淡入 + 缩放 */
.phase-enter .splash-content {
  animation: content-enter 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.phase-enter .skip-btn {
  animation: fade-in 0.5s 0.3s ease forwards;
}

@keyframes content-enter {
  0% {
    opacity: 0;
    transform: scale(0.96) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes fade-in {
  to { opacity: 1; }
}

/* 阶段 2: 保持并上移 (400-900ms) */
.phase-hold .splash-content {
  opacity: 1;
  transform: scale(1) translateY(0);
  animation: content-hold 1s ease-out forwards;
}

.phase-hold .skip-btn {
  opacity: 1;
}

.phase-hold .splash-icons {
  animation: icons-enter 0.4s ease forwards;
}

/* 每个 icon 依次出现并转圈 */
.phase-hold .bio-icon--1 {
  animation: icon-spin-in 0.5s 0s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.phase-hold .bio-icon--2 {
  animation: icon-spin-in 0.5s 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.phase-hold .bio-icon--3 {
  animation: icon-spin-in 0.5s 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.phase-hold .bio-icon--4 {
  animation: icon-spin-in 0.5s 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes content-hold {
  to {
    transform: scale(1) translateY(-24px);
  }
}

@keyframes icons-enter {
  to { opacity: 1; }
}

/* icon 出现并转圈动画 */
@keyframes icon-spin-in {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(180deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(360deg);
  }
}

/* 阶段 3: 退出 (900-1300ms) */
.phase-exit .splash-content {
  opacity: 1;
  transform: scale(1) translateY(-24px);
  animation: content-exit 0.8s ease-in forwards;
}

.phase-exit .splash-icons {
  opacity: 1;
}

.phase-exit .skip-btn {
  animation: fade-out 0.4s ease forwards;
}

.phase-exit .splash-glow {
  animation: glow-fade 0.8s ease forwards;
}

@keyframes content-exit {
  to {
    opacity: 0;
    transform: scale(1) translateY(-40px);
  }
}

@keyframes fade-out {
  to { opacity: 0; }
}

@keyframes glow-fade {
  to { opacity: 0; }
}

/* 整体淡出过渡 */
.splash-fade-leave-active {
  transition: opacity 0.5s ease;
}

.splash-fade-leave-to {
  opacity: 0;
}

/* ============================================
   prefers-reduced-motion 支持
   ============================================ */
.reduced-motion .splash-content {
  opacity: 1;
  transform: none;
  animation: none;
}

.reduced-motion .skip-btn {
  opacity: 1;
  animation: none;
}

.reduced-motion .splash-icons,
.reduced-motion .splash-glow {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .splash-content,
  .skip-btn,
  .bio-icon {
    animation: none !important;
    transition: none !important;
  }
  
  .splash-content {
    opacity: 1;
    transform: none;
  }
  
  .skip-btn {
    opacity: 1;
  }
}
</style>
