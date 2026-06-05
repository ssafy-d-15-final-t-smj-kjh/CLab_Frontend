
<template>
  <header>
    <VHeader/>
  </header>

  <RouterView/>

  <footer>
    <VFooter/>
  </footer>
</template>

<script setup>
import { RouterView } from 'vue-router';
import VHeader from './components/VHeader.vue';
import VFooter from './components/VFooter.vue';
</script>

<style scoped></style>
