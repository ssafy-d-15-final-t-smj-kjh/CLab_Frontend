<!-- src/components/ErrorLayout.vue -->
<script setup>
import { useRouter } from 'vue-router'

defineProps({
  code: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    default: '🦀',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
})

const router = useRouter()

const goHome = () => {
  router.replace('/')
}
</script>

<template>
  <div class="error-page">
    <div class="waves"></div>

    <div class="error-content">
      <div class="crab">{{ emoji }}</div>

      <h1 class="error-code">{{ code }}</h1>
      <h2 class="error-title">{{ title }}</h2>
      <p class="error-message">{{ message }}</p>

      <button class="home-button" @click="goHome">
        🏖️ 메인으로 돌아가기
      </button>
    </div>

    <div class="sand-bubbles">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    to bottom,
    var(--sky-blue) 0%,
    var(--sand-light) 45%,
    var(--sand) 100%
  );
  overflow: hidden;
}

.waves {
  position: absolute;
  top: 38%;
  left: 0;
  width: 100%;
  height: 60px;
  background: var(--ocean-blue);
  opacity: 0.25;
  border-radius: 50%;
  filter: blur(8px);
}

.error-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 40px 24px;
}

.crab {
  font-size: 90px;
  animation: crab-walk 2.4s ease-in-out infinite;
}

@keyframes crab-walk {
  0%,
  100% {
    transform: translateX(-12px) rotate(-6deg);
  }
  50% {
    transform: translateX(12px) rotate(6deg);
  }
}

.error-code {
  font-size: 88px;
  font-weight: 900;
  color: var(--crab-red);
  letter-spacing: 2px;
  text-shadow: 3px 3px 0 var(--sand-dark);
  line-height: 1;
  margin-top: 8px;
}

.error-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-dark);
  margin-top: 16px;
}

.error-message {
  font-size: 16px;
  color: var(--text-gray);
  margin-top: 12px;
  line-height: 1.6;
}

.home-button {
  margin-top: 32px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 700;
  color: var(--white);
  background: var(--crab-orange);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 6px 0 var(--crab-red);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 0 var(--crab-red);
}

.home-button:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 var(--crab-red);
}

.sand-bubbles {
  position: absolute;
  bottom: 40px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 20px;
  z-index: 1;
}

.sand-bubbles span {
  width: 14px;
  height: 14px;
  background: var(--white);
  border-radius: 50%;
  opacity: 0.6;
  animation: bubble 3s ease-in-out infinite;
}

.sand-bubbles span:nth-child(2) {
  animation-delay: 0.6s;
}

.sand-bubbles span:nth-child(3) {
  animation-delay: 1.2s;
}

@keyframes bubble {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-16px);
    opacity: 0.8;
  }
}
</style>
