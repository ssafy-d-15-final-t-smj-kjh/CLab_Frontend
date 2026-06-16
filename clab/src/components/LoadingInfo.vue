<template>
    <transition name="fade">
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-box">
                <div class="crab-wrap">
                    <span class="crab-icon"><img src='@/assets/imgs/CrabIcon.PNG' width="200px"></span>
                </div>
                <p class="loading-title">불러오는 중입니다...</p>
                <p class="loading-sub">잠시만 기다려주세요...! 🌊</p>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
// 부모 컴포넌트로부터 isLoading 상태를 전달받습니다.
defineProps({
    isLoading: {
        type: Boolean,
        required: true,
        default: false
    }
})
</script>

<style scoped>
/* ── 로딩 오버레이 스타일 ── */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
}

.loading-box {
    background: var(--white, #ffffff);
    padding: 40px 60px;
    border-radius: 24px;
    text-align: center;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.crab-wrap {
    font-size: 64px;
    margin-bottom: 16px;
    display: inline-block;
    /* 꽃게가 통통 튀는 애니메이션 */
    animation: bounce 0.8s infinite alternate cubic-bezier(0.5, 0.05, 1, 0.5);
}

.loading-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-dark, #333);
    margin-bottom: 8px;
}

.loading-sub {
    font-size: 14px;
    color: var(--text-gray, #777);
    margin-bottom: 24px;
}

/* ── 점 3개 로딩 애니메이션 ── */
.loading-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
}

.loading-dots span {
    display: block;
    width: 12px;
    height: 12px;
    background-color: var(--ocean-blue, #5bb4c4);
    border-radius: 50%;
    animation: pulse 1.2s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

/* ── Keyframes ── */
@keyframes bounce {
    0% { transform: translateY(0); }
    100% { transform: translateY(-20px); }
}

@keyframes pulse {
    0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
}

/* ── Transition(fade) ── */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>