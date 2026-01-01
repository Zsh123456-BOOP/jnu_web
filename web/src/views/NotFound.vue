<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <section class="surface-card">
    <h2>Page not found</h2>
    <p class="muted">The page you are looking for does not exist.</p>
    <RouterLink class="btn btn--secondary" to="/">Return to home</RouterLink>
  </section>
</template>
