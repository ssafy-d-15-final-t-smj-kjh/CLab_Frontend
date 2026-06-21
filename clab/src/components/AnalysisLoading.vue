<template>
    <transition name="fade">
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-box" :class="currentScene.boxClass">

                <!-- 배경 파도 -->
                <div class="wave-container">
                    <div class="wave wave1" :class="currentScene.waveClass"></div>
                    <div class="wave wave2" :class="currentScene.waveClass"></div>
                    <div class="wave wave3" :class="currentScene.waveClass"></div>
                </div>

                <!-- 초과 배너 -->
                <transition name="banner-drop">
                    <div v-if="isOvertime" class="overtime-banner">
                        <span>⏳</span>
                        <span>예상보다 오래 걸리고 있어요. 잠시만 기다려주세요!</span>
                    </div>
                </transition>

                <!-- 이모지 무대 -->
                <div class="emoji-stage">
                    <transition name="emoji-swap" mode="out-in">
                        <span :key="currentSceneIndex" class="stage-emoji">
                            {{ currentScene.emoji }}
                        </span>
                    </transition>
                    <span v-for="(p, i) in currentScene.particles" :key="currentSceneIndex + '-' + i" class="particle"
                        :style="particleStyle(i)">{{ p }}</span>
                </div>

                <!-- 스피너 -->
                <div class="spinner-wrap">
                    <div class="spinner" :class="currentScene.spinnerClass">
                        <div class="spinner-inner"></div>
                    </div>
                </div>

                <!-- 메시지 -->
                <transition name="text-slide" mode="out-in">
                    <div :key="currentSceneIndex" class="message-area">
                        <p class="loading-title">{{ currentScene.title }}</p>
                        <p class="loading-sub">{{ currentScene.sub }}</p>
                    </div>
                </transition>

                <!-- 시간 정보 -->
                <div class="time-info-row">
                    <div class="time-item">
                        <span class="time-label">⏱️ 예상 시간</span>
                        <span class="time-val">{{ formatTime(props.estimatedSeconds) }}</span>
                    </div>
                    <div class="time-divider"></div>
                    <div class="time-item">
                        <span class="time-label">⌛ 경과 시간</span>
                        <span class="time-val" :class="{ 'overtime-val': isOvertime }">
                            {{ formatTime(elapsed) }}
                        </span>
                    </div>
                </div>

                <!-- 힌트 -->
                <transition name="hint-fade" mode="out-in">
                    <p :key="hintIndex" class="hint-text">{{ currentHint }}</p>
                </transition>

            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

// ── Props ──────────────────────────────────────────────
const props = defineProps({
    isLoading: {
        type: Boolean,
        required: true,
        default: false,
    },
    fileSize: {
        type: Number,
        default: 0,
    },
    estimatedSeconds: {
        type: Number,
        default: 0
    }
})

// ── 상태 ───────────────────────────────────────────────
const elapsed = ref(0)
const isOvertime = ref(false)

const currentSceneIndex = ref(0)
const hintIndex = ref(0)

let mainTimer = null   // 1초 tick
let sceneTimer = null   // 장면 전환
let hintTimer = null   // 힌트 전환

// ── 장면 정의 ──────────────────────────────────────────
// duration: 해당 장면이 유지되는 초
const scenes = [
    {
        emoji: '🦀',
        particles: ['💬', '📄', '🔍'],
        title: '꽃게 연구원이 파일을 열고 있습니다',
        sub: '대화 파일을 꼼꼼하게 살펴보는 중이에요...',
        boxClass: 'theme-ocean',
        waveClass: 'wave-blue',
        spinnerClass: 'spin-blue',
        duration: 5,
    },
    {
        emoji: '🏖️',
        particles: ['🌊', '🐚', '⭐'],
        title: '모래사장에서 데이터를 수집 중입니다',
        sub: '대화 내용을 하나씩 모아서 분류하고 있어요!',
        boxClass: 'theme-sand',
        waveClass: 'wave-sand',
        spinnerClass: 'spin-sand',
        duration: 5,
    },
    {
        emoji: '🔬',
        particles: ['🧪', '💡', '📊'],
        title: '연구실에서 분석이 한창입니다',
        sub: '카테고리별로 대화 패턴을 분석 중이에요...',
        boxClass: 'theme-lab',
        waveClass: 'wave-teal',
        spinnerClass: 'spin-teal',
        duration: 5,
    },
    {
        emoji: '🌊',
        particles: ['🐠', '🐟', '🐙'],
        title: '바닷물이 들어오고 있습니다',
        sub: '깊은 바다에서 성향 데이터를 끌어올리는 중...',
        boxClass: 'theme-deep',
        waveClass: 'wave-deep',
        spinnerClass: 'spin-deep',
        duration: 5,
    },
    {
        emoji: '🗺️',
        particles: ['⚓', '🧭', '🌟'],
        title: '항해 일지를 정리하고 있습니다',
        sub: '페르소나 분석 결과를 작성하는 중이에요!',
        boxClass: 'theme-voyage',
        waveClass: 'wave-voyage',
        spinnerClass: 'spin-voyage',
        duration: 5,
    },
    {
        emoji: '🐚',
        particles: ['🌈', '✨', '💫'],
        title: '조개껍데기에 결과를 새기고 있어요',
        sub: '거의 다 됐어요! 조금만 더 기다려주세요~',
        boxClass: 'theme-done',
        waveClass: 'wave-done',
        spinnerClass: 'spin-done',
        duration: 5,
    },
]

const currentScene = computed(() => scenes[currentSceneIndex.value])

// ── 힌트 ───────────────────────────────────────────────
const hints = [
    '💡 파일이 클수록 더 정밀한 분석이 가능해요!',
    '🦀 꽃게는 옆으로 걷지만, 분석은 곧장 나아갑니다.',
    '🌊 바다처럼 깊은 대화일수록 흥미로운 결과가 나와요.',
    '📊 6가지 카테고리로 대화 성향을 파악하고 있어요.',
    '🐚 조개껍데기 하나에도 이야기가 담겨있듯, 대화에도요.',
    '⚡ 테토-에테르 점수로 대화 스타일을 분석 중이에요!',
    '🔍 각 메시지의 감정을 하나하나 분류 중입니다.',
]

const currentHint = computed(() => hints[hintIndex.value])

// ── 유틸 ───────────────────────────────────────────────
function formatTime(seconds) {
    if (!seconds || seconds <= 0) return '0초'
    if (seconds < 60) return `${seconds}초`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return s === 0 ? `${m}분` : `${m}분 ${s}초`
}

function particleStyle(index) {
    const angles = [0, 60, 120, 180, 240, 300]
    const angle = angles[index % 6]
    const rad = (angle * Math.PI) / 180
    const r = 62
    return {
        '--tx': `${Math.cos(rad) * r}px`,
        '--ty': `${Math.sin(rad) * r}px`,
        animationDelay: `${index * 0.3}s`,
    }
}

// ── 장면 순환 타이머 ────────────────────────────────────
function scheduleNextScene() {
    const duration = scenes[currentSceneIndex.value].duration * 1000
    sceneTimer = setTimeout(() => {
        currentSceneIndex.value = (currentSceneIndex.value + 1) % scenes.length
        scheduleNextScene() // 재귀로 계속 순환
    }, duration)
}

// ── 타이머 시작 ─────────────────────────────────────────
function startTimers() {
    elapsed.value = 0
    isOvertime.value = false
    currentSceneIndex.value = 0
    hintIndex.value = 0

    // 1초 tick
    mainTimer = setInterval(() => {
        elapsed.value++
        if (!isOvertime.value && elapsed.value > props.estimatedSeconds.value) {
            isOvertime.value = true
        }
    }, 1000)

    // 장면 전환 (각 duration 기반)
    scheduleNextScene()

    // 힌트 전환 (4초마다)
    hintTimer = setInterval(() => {
        hintIndex.value = (hintIndex.value + 1) % hints.length
    }, 4000)
}

// ── 타이머 정지 ─────────────────────────────────────────
function stopTimers() {
    clearInterval(mainTimer)
    clearTimeout(sceneTimer)
    clearInterval(hintTimer)
    mainTimer = null
    sceneTimer = null
    hintTimer = null
}

watch(
    () => props.isLoading,
    (val) => { val ? startTimers() : stopTimers() },
    { immediate: true }
)

onUnmounted(stopTimers)
</script>

<style scoped>
/* ── 오버레이 ── */
.loading-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(58, 58, 58, 0.55);
    backdrop-filter: blur(6px);
}

/* ── 박스 ── */
.loading-box {
    position: relative;
    width: min(420px, 92vw);
    border-radius: 28px;
    padding: 32px 28px 26px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    transition: background 1s ease;
}

.theme-ocean {
    background: linear-gradient(160deg, #e8f7f9, #d0eef2);
}

.theme-sand {
    background: linear-gradient(160deg, #fdf6e8, #faecd0);
}

.theme-lab {
    background: linear-gradient(160deg, #eaf7f5, #d4ede9);
}

.theme-deep {
    background: linear-gradient(160deg, #e4eef5, #cce0ef);
}

.theme-voyage {
    background: linear-gradient(160deg, #fdf0e8, #f7dfc8);
}

.theme-done {
    background: linear-gradient(160deg, #fdf6e8, #e8f7e8);
}

/* ── 파도 배경 ── */
.wave-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    overflow: hidden;
    pointer-events: none;
}

.wave {
    position: absolute;
    bottom: -10px;
    left: -60%;
    width: 220%;
    height: 70px;
    border-radius: 50%;
    opacity: 0.25;
    animation: wave-roll 6s linear infinite;
}

.wave2 {
    animation-duration: 9s;
    animation-delay: -3s;
    opacity: 0.15;
}

.wave3 {
    animation-duration: 12s;
    animation-delay: -6s;
    opacity: 0.10;
}

.wave-blue {
    background: #5bb4c4;
}

.wave-sand {
    background: #f0b429;
}

.wave-teal {
    background: #3a9b8c;
}

.wave-deep {
    background: #3a6b9b;
}

.wave-voyage {
    background: #e8554e;
}

.wave-done {
    background: #5bb4c4;
}

@keyframes wave-roll {
    0% {
        transform: translateX(0) scaleY(1);
    }

    50% {
        transform: translateX(-15%) scaleY(1.15);
    }

    100% {
        transform: translateX(0) scaleY(1);
    }
}

/* ── 초과 배너 ── */
.overtime-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(240, 180, 41, 0.2);
    border: 1.5px solid rgba(240, 180, 41, 0.45);
    border-radius: 12px;
    padding: 9px 14px;
    font-size: 13px;
    font-weight: 600;
    color: #8a6000;
    margin-bottom: 14px;
}

.banner-drop-enter-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.banner-drop-leave-active {
    transition: all 0.25s ease;
}

.banner-drop-enter-from {
    opacity: 0;
    transform: translateY(-12px);
}

.banner-drop-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

/* ── 이모지 무대 ── */
.emoji-stage {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 96px;
    margin-bottom: 0;
}

.stage-emoji {
    font-size: 56px;
    display: block;
    animation: float-bounce 2.4s ease-in-out infinite;
    filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.12));
    position: relative;
    z-index: 2;
}

@keyframes float-bounce {

    0%,
    100% {
        transform: translateY(0) rotate(-3deg);
    }

    50% {
        transform: translateY(-13px) rotate(3deg);
    }
}

.particle {
    position: absolute;
    font-size: 18px;
    animation: orbit 4s linear infinite;
    opacity: 0.75;
}

@keyframes orbit {
    0% {
        transform: translate(var(--tx), var(--ty)) scale(0.8) rotate(0deg);
        opacity: 0;
    }

    20% {
        opacity: 0.85;
    }

    80% {
        opacity: 0.85;
    }

    100% {
        transform: translate(var(--tx), var(--ty)) scale(0.8) rotate(360deg);
        opacity: 0;
    }
}

/* ── 스피너 ── */
.spinner-wrap {
    display: flex;
    justify-content: center;
    margin: 16px 0 18px;
}

.spinner {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 4px solid rgba(0, 0, 0, 0.08);
    position: relative;
    animation: spin 1.1s linear infinite;
}

.spinner-inner {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 4px solid transparent;
}

/* 스피너 색상 */
.spin-blue {
    border-top-color: #5bb4c4;
}

.spin-sand {
    border-top-color: #f0b429;
}

.spin-teal {
    border-top-color: #3a9b8c;
}

.spin-deep {
    border-top-color: #3a6b9b;
}

.spin-voyage {
    border-top-color: #e8554e;
}

.spin-done {
    border-top-color: #5bb4c4;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* ── 메시지 ── */
.message-area {
    text-align: center;
    margin-bottom: 20px;
    min-height: 58px;
}

.loading-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 6px;
    line-height: 1.4;
}

.loading-sub {
    font-size: 13px;
    color: var(--text-gray);
    margin: 0;
    line-height: 1.5;
}

/* ── 시간 정보 ── */
.time-info-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0;
    background: rgba(255, 255, 255, 0.55);
    border-radius: 14px;
    padding: 12px 20px;
    margin-bottom: 14px;
    backdrop-filter: blur(4px);
}

.time-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex: 1;
}

.time-label {
    font-size: 11px;
    color: var(--text-gray);
}

.time-val {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-dark);
    transition: color 0.5s;
}

.overtime-val {
    color: #c47a00;
    animation: blink 2s ease-in-out infinite;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.55;
    }
}

.time-divider {
    width: 1px;
    height: 34px;
    background: rgba(0, 0, 0, 0.1);
    margin: 0 16px;
}

/* ── 힌트 ── */
.hint-text {
    text-align: center;
    font-size: 12px;
    color: var(--text-gray);
    background: rgba(255, 255, 255, 0.4);
    border-radius: 10px;
    padding: 8px 14px;
    margin: 0;
    line-height: 1.5;
}

/* ── 트랜지션 ── */
.text-slide-enter-active {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.text-slide-leave-active {
    transition: all 0.3s ease;
}

.text-slide-enter-from {
    opacity: 0;
    transform: translateY(14px);
}

.text-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.emoji-swap-enter-active {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.emoji-swap-leave-active {
    transition: all 0.3s ease;
}

.emoji-swap-enter-from {
    opacity: 0;
    transform: scale(0.4) rotate(-20deg);
}

.emoji-swap-leave-to {
    opacity: 0;
    transform: scale(1.3) rotate(20deg);
}

.hint-fade-enter-active {
    transition: all 0.5s ease;
}

.hint-fade-leave-active {
    transition: all 0.3s ease;
}

.hint-fade-enter-from {
    opacity: 0;
    transform: translateY(6px);
}

.hint-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
