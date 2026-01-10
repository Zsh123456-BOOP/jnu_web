<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getMembers } from '../utils/api';

const route = useRoute();
const loading = ref(false);
const error = ref('');
const members = ref([]);
const isPiPage = computed(() => route.name === 'pi');

const loadMembers = async () => {
  loading.value = true;
  error.value = '';
  try {
    members.value = await getMembers({ is_pi: isPiPage.value ? 1 : 0 });
  } catch (err) {
    error.value = err?.message || 'Failed to load members';
  } finally {
    loading.value = false;
  }
};

const getInitial = (name = '') => {
  const trimmed = String(name).trim();
  return trimmed ? trimmed.slice(0, 1) : '?';
};

const splitTags = (value) => {
  if (!value) {
    return [];
  }
  return String(value)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
};

onMounted(loadMembers);
watch(isPiPage, () => {
  loadMembers();
});
</script>

<template>
  <section class="page">
    <div class="container">
      <div class="page-header">
        <div class="page-header__text">
          <h1 class="page-title">{{ isPiPage ? 'PI' : 'Members' }}</h1>
          <p class="page-subtitle">
            {{ isPiPage ? 'Principal investigators and faculty' : 'Lab members and research interests' }}
          </p>
        </div>
      </div>

      <div v-if="loading" class="surface-card">Loading members...</div>
      <div v-else-if="error" class="surface-card">{{ error }}</div>
      <div v-else-if="!members.length" class="empty-state">No members yet</div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 members-grid">
        <article v-for="member in members" :key="member.id" class="card member-card">
          <div class="member-card__header">
            <div class="member-card__avatar">
              <img v-if="member.image?.url" :src="member.image.url" :alt="member.name" />
              <span v-else>{{ getInitial(member.name) }}</span>
            </div>
            <div>
              <h3 class="member-card__name">{{ member.name }}</h3>
              <p class="member-card__position">
                {{ member.position || (isPiPage ? 'PI' : 'Member') }}
              </p>
            </div>
          </div>

          <div class="member-card__body">
            <div v-if="member.research_interests" class="member-card__section">
              <div class="member-card__label">Research Interests</div>
              <div class="member-card__tags">
                <span v-for="tag in splitTags(member.research_interests)" :key="tag" class="badge badge--neutral">
                  {{ tag }}
                </span>
              </div>
            </div>

            <div v-if="member.hobbies" class="member-card__section">
              <div class="member-card__label">Hobbies</div>
              <div class="member-card__text">{{ member.hobbies }}</div>
            </div>

            <div v-if="member.email" class="member-card__section">
              <div class="member-card__label">Email</div>
              <a class="member-card__link" :href="`mailto:${member.email}`">{{ member.email }}</a>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
