<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api';

const route = useRoute();
const loading = ref(false);
const error = ref('');
const members = ref([]);
const isPiPage = computed(() => route.name === 'pi');

const loadMembers = async () => {
  loading.value = true;
  error.value = '';
  try {
    members.value = await api.members.list({ is_pi: isPiPage.value ? 1 : 0 });
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
    
const groupedMembers = computed(() => {
  if (isPiPage.value) return { 'Principal Investigators': members.value };
  
  const groups = {
    'in_service': [],
    'student': [],
    'alumni': []
  };
  
  members.value.forEach(m => {
    const t = m.type || 'student';
    if (!groups[t]) groups[t] = [];
    groups[t].push(m);
  });
  
  // Return non-empty groups with labels
  const result = {};
  if (groups['in_service'].length) result['In Service'] = groups['in_service'];
  if (groups['student'].length) result['Students'] = groups['student'];
  if (groups['alumni'].length) result['Alumni'] = groups['alumni'];
  
  return result;
});
  
// PI Modal
const showModal = ref(false);
const selectedMember = ref(null);
const piInfo = ref(null);
import MarkdownRenderer from '../components/ModuleListDetail.vue'; // Hack: borrowing markdown renderer or I should create/import a proper one. 
// actually I should check if there is a MarkdownRenderer component. 
// I saw MarkdownRenderer.vue in web/src/components/MarkdownRenderer.vue in list_dir output (step 39).
import MdRenderer from '../components/MarkdownRenderer.vue';

const openMember = (member) => {
  if (isPiPage.value) {
    selectedMember.value = member;
    piInfo.value = member.pi_info;
    showModal.value = true;
  }
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

      <div v-else class="members-groups">
        <template v-for="(groupMembers, groupName) in groupedMembers" :key="groupName">
          <div class="group-header" v-if="!isPiPage">
             <h2>{{ groupName }}</h2>
          </div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 members-grid">
            <article 
              v-for="member in groupMembers" 
              :key="member.id" 
              class="card member-card"
              :class="{ 'cursor-pointer': isPiPage }"
              @click="openMember(member)"
            >
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
                  <a class="member-card__link" :href="`mailto:${member.email}`" @click.stop>{{ member.email }}</a>
                </div>
              </div>
            </article>
          </div>
        </template>
      </div>
      
      <!-- PI Modal -->
      <div v-if="showModal" class="modal-backdrop" @click="showModal = false">
        <div class="modal-card" @click.stop>
          <button class="modal-close" @click="showModal = false">&times;</button>
          <div class="modal-header">
             <h2>{{ selectedMember?.name }}</h2>
             <p>{{ selectedMember?.position }}</p>
          </div>
          <div class="modal-body prose">
             <div v-if="piInfo">
               <MdRenderer v-if="piInfo.content_format === 'markdown'" :source="piInfo.content_md" />
               <div v-else v-html="piInfo.content_html"></div>
             </div>
             <p v-else class="text-muted">No details available.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Page Layout */
.members-groups {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.group-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--surface-border);
}

.members-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(1, 1fr);
}

@media (min-width: 640px) {
  .members-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .members-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Member Card */
.member-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.member-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.member-card.cursor-pointer {
  cursor: pointer;
}

.member-card__header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--surface-hover);
  border-bottom: 1px solid var(--surface-border);
}

.member-card__avatar {
  flex-shrink: 0;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  overflow: hidden;
  background: var(--surface-ground);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--surface-border);
}

.member-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-card__avatar span {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.member-card__name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.member-card__position {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
}

.member-card__body {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.member-card__section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.member-card__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  font-weight: 600;
}

.member-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.member-card__text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.member-card__link {
  font-size: 0.875rem;
  color: var(--primary-600);
  text-decoration: none;
  font-weight: 500;
}

.member-card__link:hover {
  text-decoration: underline;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--color-background, #fff);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

.modal-card {
  background: var(--surface-card);
  width: 90%;
  max-width: 100%;
  max-height: 90vh;
  border-radius: var(--radius-xl);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@media (min-width: 1024px) {
  .modal-card {
    width: 70vw;
    max-width: 1400px;
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--text-secondary);
  transition: all 0.2s;
  z-index: 10;
}

.modal-close:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.modal-header {
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid var(--surface-border);
  background: var(--surface-ground);
}

.modal-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.modal-header p {
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin: 0.5rem 0 0 0;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Scrollbar for modal */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb);
  border-radius: 20px;
  border: 3px solid transparent;
  background-clip: content-box;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background-color: var(--scrollbar-thumb-hover);
}
</style>
