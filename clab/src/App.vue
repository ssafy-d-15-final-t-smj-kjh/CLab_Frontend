<template>
  <header>
    <VHeader />
  </header>
  <LoadingInfo v-if="isLoading" :is-loading="isLoading"/>
  <div v-if="isLoading">
    <h1>로딩 중입니다...</h1>
  </div>
  <RouterView v-else/>

  <footer>
    <VFooter />
  </footer>
</template>

<script setup>
import { RouterView } from 'vue-router';
import VHeader from './components/VHeader.vue';
import VFooter from './components/VFooter.vue';
import LoadingInfo from './components/LoadingInfo.vue';

import { ref, onMounted } from 'vue';

import { useAuthStore } from './stores/auth.js';

const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref(null)

const fetchUserInfo = async () => {
  isLoading.value = true
  error.value = null
  try {
    await authStore.fetchUserInfo()
  } catch (e) {
    console.log(e)
  } finally {
    isLoading.value = false
  }
}

onMounted(
  fetchUserInfo
)
</script>

<style scoped></style>
