<!-- src/pages/errors/ServerError.vue -->
<script setup>
import ErrorLayout from '@/components/ErrorLayout.vue'
</script>

<template>
  <ErrorLayout
    code="500"
    emoji="🦀💥"
    title="꽃게가 넘어졌어요"
    message="서버 모래성이 잠시 무너졌어요. 꽃게들이 열심히 다시 쌓고 있으니 잠시 후에 다시 시도해 주세요!"
  />
</template>
