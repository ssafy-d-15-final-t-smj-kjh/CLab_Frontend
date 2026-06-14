<template>
    <div class="chat-detail-page">

        <!-- 헤더 -->
        <header class="page-header">
            <button class="back-btn" @click="router.push('/chat')">
                <span class="back-icon">←</span>
            </button>
            <h1 class="page-title">💬 대화 상세</h1>
            <div class="header-spacer"></div>
        </header>

        <div class="content-wrapper">

            <!-- 로딩 중 -->
            <div v-if="isLoading" class="loading-state">
                <span class="loading-icon">🦀</span>
                <p class="loading-text">데이터를 불러오는 중입니다...</p>
            </div>

            <template v-else-if="chatInfo">

                <!-- 타이틀 배너 -->
                <div class="title-banner">
                    <div class="banner-icon">💬</div>
                    <div class="banner-text">
                        <h2 class="banner-title">{{ chatInfo.title }}</h2>
                        <p class="banner-sub">{{ chatInfo.description }}</p>
                    </div>
                </div>

                <!-- 상세 정보 카드 -->
                <div class="section-card">
                    <h3 class="section-title">
                        <span class="section-icon">📋</span>
                        대화 정보
                    </h3>

                    <div class="info-list">
                        <div class="info-item">
                            <span class="info-label">
                                <span class="label-icon">📌</span>
                                제목
                            </span>
                            <span class="info-value">{{ chatInfo.title }}</span>
                        </div>

                        <div class="info-item">
                            <span class="info-label">
                                <span class="label-icon">📝</span>
                                설명
                            </span>
                            <span class="info-value">{{ chatInfo.description }}</span>
                        </div>

                        <div class="info-item">
                            <span class="info-label">
                                <span class="label-icon">📅</span>
                                등록일
                            </span>
                            <span class="info-value">{{ formatDate(chatInfo.createdAt) }}</span>
                        </div>

                        <div class="info-item">
                            <span class="info-label">
                                <span class="label-icon">✏️</span>
                                수정일
                            </span>
                            <span class="info-value">{{ formatDate(chatInfo.updatedAt) }}</span>
                        </div>

                        <div class="info-item">
                            <span class="info-label">
                                <span class="label-icon">🆔</span>
                                대화 ID
                            </span>
                            <span class="info-value info-value--id"># {{ chatInfo.id }}</span>
                        </div>
                    </div>
                </div>

                <!-- 대화 내용 카드 -->
                <div class="section-card">
                    <h3 class="section-title">
                        <span class="section-icon">🌊</span>
                        대화 내용
                    </h3>
                    <div class="chat-content-area">
                        <p class="chat-content-text">
                            {{ chatInfo.content ?? '대화 내용이 없습니다.' }}
                        </p>
                    </div>
                </div>

                <!-- 하단 버튼 -->
                <div class="button-group">
                    <button class="btn-secondary" @click="router.push('/chat-list')">
                        ← 목록으로
                    </button>
                    <button class="btn-primary" @click="router.push(`/chat/${chatInfo.id}/conversation`)">
                        💬 대화 이어가기
                    </button>
                </div>

            </template>

            <!-- 데이터 없음 -->
            <div v-else class="empty-state">
                <span class="empty-icon">🌊</span>
                <p class="empty-title">대화를 찾을 수 없어요</p>
                <p class="empty-sub">삭제되었거나 존재하지 않는 대화입니다.</p>
                <button class="btn-primary" style="margin-top: 20px;" @click="router.push('/chat')">
                    목록으로 돌아가기
                </button>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()
const { chatInfo } = storeToRefs(chatStore)

const isLoading = ref(false)

// ── 날짜 포맷 ────────────────────────────────────────────
const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

// ── 마운트 시 데이터 fetch ────────────────────────────────
onMounted(async () => {
    const id = route.params.id

    // 이미 같은 id의 데이터가 store에 있으면 재요청 생략
    if (chatInfo.value && String(chatInfo.value.id) === String(id)) return

    isLoading.value = true
    try {
        await chatStore.fetchChatInfo(id)
    } catch (e) {
        console.error(e)
    } finally {
        isLoading.value = false
    }
})
</script>

<style scoped>
/* ── 페이지 ─────────────────────────────────────────────── */
.chat-detail-page {
    min-height: 100vh;
    background: var(--sand-light);
}

/* ── 헤더 ───────────────────────────────────────────────── */
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--white);
    border-bottom: 2px solid var(--sand-dark);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.back-btn {
    background: var(--sand);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.back-btn:hover {
    background: var(--sand-dark);
}

.back-icon {
    font-size: 18px;
    color: var(--text-dark);
}

.page-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
}

.header-spacer {
    width: 40px;
}

/* ── 콘텐츠 ─────────────────────────────────────────────── */
.content-wrapper {
    max-width: 600px;
    margin: 0 auto;
    padding: 24px 16px 60px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* ── 로딩 ───────────────────────────────────────────────── */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    gap: 16px;
}

.loading-icon {
    font-size: 48px;
    animation: bounce 0.8s infinite alternate;
}

@keyframes bounce {
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(-12px);
    }
}

.loading-text {
    font-size: 14px;
    color: var(--text-gray);
    font-weight: 500;
}

/* ── 타이틀 배너 ────────────────────────────────────────── */
.title-banner {
    display: flex;
    align-items: center;
    gap: 16px;
    background: linear-gradient(135deg, var(--ocean-blue), var(--sky-blue));
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 4px 16px rgba(91, 180, 196, 0.35);
    color: var(--white);
}

.banner-icon {
    font-size: 40px;
    line-height: 1;
}

.banner-title {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.3px;
    margin-bottom: 6px;
}

.banner-sub {
    font-size: 13px;
    opacity: 0.85;
    line-height: 1.4;
}

/* ── 섹션 카드 ──────────────────────────────────────────── */
.section-card {
    background: var(--white);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    border: 1px solid var(--sand);
}

.section-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-dark);
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--sand);
}

.section-icon {
    font-size: 18px;
}

/* ── 정보 리스트 ────────────────────────────────────────── */
.info-list {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.info-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 13px 0;
    border-bottom: 1px solid var(--sand-light);
    gap: 12px;
}

.info-item:last-child {
    border-bottom: none;
}

.info-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-gray);
    min-width: 80px;
    flex-shrink: 0;
}

.label-icon {
    font-size: 14px;
}

.info-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-dark);
    text-align: right;
    word-break: break-all;
    line-height: 1.5;
}

.info-value--id {
    color: var(--ocean-blue);
    font-weight: 700;
    font-size: 13px;
    background: var(--sand-light);
    padding: 2px 10px;
    border-radius: 20px;
}

/* ── 대화 내용 영역 ─────────────────────────────────────── */
.chat-content-area {
    background: var(--sand-light);
    border-radius: 14px;
    padding: 16px;
    border: 1px solid var(--sand);
    min-height: 100px;
}

.chat-content-text {
    font-size: 14px;
    color: var(--text-dark);
    line-height: 1.7;
    white-space: pre-line;
}

/* ── 빈 상태 ────────────────────────────────────────────── */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    gap: 12px;
}

.empty-icon {
    font-size: 56px;
}

.empty-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
}

.empty-sub {
    font-size: 14px;
    color: var(--text-gray);
}

/* ── 버튼 ───────────────────────────────────────────────── */
.button-group {
    display: flex;
    gap: 12px;
}

.btn-secondary {
    flex: 1;
    padding: 14px;
    border: 1.5px solid var(--sand-dark);
    border-radius: 16px;
    background: var(--white);
    color: var(--text-gray);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
}

.btn-secondary:hover {
    background: var(--sand);
    border-color: var(--ocean-blue);
    color: var(--text-dark);
}

.btn-primary {
    flex: 2;
    padding: 14px;
    border: none;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--ocean-blue), var(--sky-blue));
    color: var(--white);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(91, 180, 196, 0.35);
    transition: opacity 0.2s, transform 0.1s;
}

.btn-primary:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

.btn-primary:active {
    transform: translateY(0);
}

/* ── 반응형 ─────────────────────────────────────────────── */
@media (max-width: 480px) {
    .content-wrapper {
        padding: 16px 12px 48px;
    }

    .section-card {
        padding: 18px 14px;
    }

    .banner-title {
        font-size: 16px;
    }

    .banner-icon {
        font-size: 32px;
    }

    .button-group {
        flex-direction: column;
    }

    .btn-primary,
    .btn-secondary {
        flex: unset;
        width: 100%;
    }
}
</style>
