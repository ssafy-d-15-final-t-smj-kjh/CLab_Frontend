<template>
  <header>
    <VHeader />
  </header>
  <LoadingInfo v-if="isLoading" :is-loading="isLoading" />
  <RetryInfo v-else-if="error" :message="error" @retry="fetchData" />
  <RouterView v-else />
  <footer>
    <VFooter />
  </footer>
</template>

<script setup>
import { RouterView } from 'vue-router';

import VHeader from './components/VHeader.vue';
import VFooter from './components/VFooter.vue';
import LoadingInfo from './components/LoadingInfo.vue';
import RetryInfo from './components/RetryInfo.vue';

import { ref, onMounted } from 'vue';

import { useAuthStore } from './stores/auth.js';

const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref(null)

</script>

<style scoped></style>
