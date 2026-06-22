<!-- src/pages/errors/Unauthorized.vue -->
<script setup>
import ErrorLayout from '@/components/ErrorLayout.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goLogin = () => {
  router.replace('/login')
}
</script>

<template>
  <ErrorLayout
    code="401"
    emoji="🦀🔑"
    title="조개 열쇠가 필요해요"
    message="로그인이 필요한 해변이에요. 조개 열쇠로 문을 열고 다시 들어와 주세요!"
  >
  </ErrorLayout>

  <div class="login-link-wrapper">
    <button class="login-link" @click="goLogin">
      🔑 로그인 하러 가기
    </button>
  </div>
</template>

<style scoped>
.login-link-wrapper {
  position: fixed;
  bottom: 90px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 3;
}

.login-link {
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

.login-link:hover {
  background: var(--ocean-blue);
  color: var(--white);
}
</style>
