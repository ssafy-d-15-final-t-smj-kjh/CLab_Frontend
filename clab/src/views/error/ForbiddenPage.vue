<!-- src/pages/errors/Forbidden.vue -->
<script setup>
import ErrorLayout from '@/components/ErrorLayout.vue'
</script>

<template>
  <ErrorLayout
    code="403"
    emoji="🦀🚧"
    title="출입 금지 구역"
    message="이곳은 꽃게 대장만 들어갈 수 있는 모래성이에요. 접근 권한이 없어 들어갈 수 없어요!"
  />
</template>
