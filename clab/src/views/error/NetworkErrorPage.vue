<!-- src/pages/errors/NetworkError.vue -->
<script setup>
import ErrorLayout from '@/components/ErrorLayout.vue'

const reload = () => {
  window.location.reload()
}
</script>

<template>
  <ErrorLayout
    code="📡"
    emoji="🦀🌊"
    title="파도가 신호를 삼켰어요"
    message="네트워크 연결이 끊어졌어요. 인터넷 상태를 확인하고 다시 시도해 주세요!"
  />

  <div class="retry-wrapper">
    <button class="retry-button" @click="reload">
      🔄 다시 시도하기
    </button>
  </div>
</template>

<style scoped>
.retry-wrapper {
  position: fixed;
  bottom: 90px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 3;
}

.retry-button {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ocean-blue);
  background: var(--white);
  border: 2px solid var(--ocean-blue);
  border-radius: 50px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.retry-button:hover {
  background: var(--ocean-blue);
  color: var(--white);
}
</style>
