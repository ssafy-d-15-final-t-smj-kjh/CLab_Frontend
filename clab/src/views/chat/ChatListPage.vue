<template>
    <LoadingInfo v-if="isLoading" :is-loading="isLoading"/>
    <RetryInfo v-else-if="error" :message="error" @retry="fetchChats"/>

    <div v-else class="chat-list-page">
        <!-- 헤더 -->
        <header class="page-header">
            <button class="back-btn" @click="router.push('/main')">
                <span class="back-icon">←</span>
            </button>
            <h1 class="page-title">🗨️ 내 대화 목록</h1>
            <div class="header-spacer"></div>
        </header>

        <div class="content-wrapper">

            <!-- 상단 요약 -->
            <div class="summary-banner">
                <span class="summary-icon">🦀</span>
                <span class="summary-text">
                    총 <strong>{{ chats.length }}</strong>개의 대화가 있어요!
                </span>
                <button class="btn-upload" @click="router.push('/upload-chat')">
                    <span>📂</span>
                    대화 분석하기
                </button>
            </div>

            <!-- 목록 없을 때 -->
            <div v-if="chats.length === 0" class="empty-state">
                <span class="empty-icon">🌊</span>
                <p class="empty-title">아직 대화가 없어요</p>
                <p class="empty-sub">새로운 대화를 시작해보세요!</p>
                <button class="btn-upload btn-upload--large" @click="router.push('/upload-chat')">
                    <span>📂</span>
                    첫 대화를 분석해보세요!
                </button>
            </div>

            <!-- 대화 목록 -->
            <ul v-else class="chat-list">
                <li v-for="chat in chats" :key="chat.id" class="chat-card" @click="goToDetail(chat.id)">
                    <!-- 카드 왼쪽 인덱스 뱃지 -->
                    <div class="card-badge">
                        <span class="badge-number">{{ chat.id }}</span>
                    </div>

                    <!-- 카드 본문 -->
                    <div class="card-body">
                        <div class="card-top">
                            <h2 class="chat-title">{{ chat.title }}</h2>
                            <span class="arrow-icon">›</span>
                        </div>
                        <p class="chat-description">{{ chat.description }}</p>
                        <div class="card-dates">
                            <span class="date-item">
                                <span class="date-icon">📅</span>
                                등록일 {{ formatTime(chat.createdAt) }}
                            </span>
                            <span class="date-divider">·</span>
                            <span class="date-item">
                                <span class="date-icon">✏️</span>
                                수정일 {{ formatTime(chat.updatedAt) }}
                            </span>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'

import LoadingInfo from '@/components/LoadingInfo.vue'
import RetryInfo from '@/components/RetryInfo.vue'

const router = useRouter()
const chatStore = useChatStore()

// ── 날짜 포맷 ───────────────────────────────────────────────

const formatTime = (dateStr) => {
    if (!dateStr) return '-'

    const date = new Date(dateStr)

    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        // second: '2-digit',
        hour12: true
    })
}

// ── 상세 이동 ───────────────────────────────────────────────
const goToDetail = (id) => {
    router.push(`/chat-detail/${id}`)
}

// ── 데이터 ──────────────────────────────────────────────────
const { chats } = storeToRefs(chatStore)
const isLoading = ref(false)
const error = ref(null)

const fetchChats = async () => {
    isLoading.value = true
    error.value = null
    try {
        await chatStore.fetchChats()
    } catch (e) {
        console.error(e)
        error.value = '대화 내역을 불러오는 데 실패하였습니다.'
    } finally {
        isLoading.value = false
    }
}

onMounted(async () => {
    fetchChats()
})

</script>

<style scoped>
/* ── 페이지 ─────────────────────────────────────────────── */
.chat-list-page {
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
    gap: 16px;
}

/* ── 요약 배너 ──────────────────────────────────────────── */
.summary-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, var(--ocean-blue), var(--sky-blue));
    color: var(--white);
    padding: 14px 20px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(91, 180, 196, 0.3);
}

.summary-icon {
    font-size: 22px;
}

.summary-text {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
}

.summary-text strong {
    font-size: 18px;
    font-weight: 800;
}

.btn-upload {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--white);
    color: var(--ocean-blue);
    border: none;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.15s, box-shadow 0.15s;
}

.btn-upload:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-upload:active {
    transform: translateY(0);
}

/* 빈 상태 전용 큰 버튼 */
.btn-upload--large {
    margin-top: 8px;
    padding: 12px 24px;
    font-size: 15px;
    background: linear-gradient(135deg, var(--ocean-blue), var(--sky-blue));
    color: var(--white);
    box-shadow: 0 4px 14px rgba(91,180,196,0.4);
}

.btn-upload--large:hover {
    opacity: 0.9;
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

/* ── 목록 ───────────────────────────────────────────────── */
.chat-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0;
    margin: 0;
}

/* ── 카드 ───────────────────────────────────────────────── */
.chat-card {
    display: flex;
    align-items: stretch;
    gap: 0;
    background: var(--white);
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.07);
    border: 1px solid var(--sand);
    cursor: pointer;
    transition: transform 0.18s, box-shadow 0.18s;
}

.chat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(91, 180, 196, 0.2);
    border-color: var(--sky-blue);
}

.chat-card:active {
    transform: translateY(-1px);
}

/* ── 뱃지 ───────────────────────────────────────────────── */
.card-badge {
    width: 52px;
    min-width: 52px;
    background: linear-gradient(180deg, var(--ocean-blue), var(--sky-blue));
    display: flex;
    align-items: center;
    justify-content: center;
}

.badge-number {
    font-size: 20px;
    font-weight: 800;
    color: var(--white);
}

/* ── 카드 본문 ──────────────────────────────────────────── */
.card-body {
    flex: 1;
    padding: 16px 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.chat-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-dark);
    letter-spacing: -0.3px;
}

.arrow-icon {
    font-size: 24px;
    color: var(--ocean-blue);
    font-weight: 700;
    line-height: 1;
}

.chat-description {
    font-size: 13px;
    color: var(--text-gray);
    line-height: 1.5;
    /* 한 줄 말줄임 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* ── 날짜 ───────────────────────────────────────────────── */
.card-dates {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.date-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--text-gray);
}

.date-icon {
    font-size: 11px;
}

.date-divider {
    color: var(--sand-dark);
    font-size: 12px;
}

/* ── 반응형 ─────────────────────────────────────────────── */
@media (max-width: 480px) {
    .content-wrapper {
        padding: 16px 12px 48px;
    }

    .chat-title {
        font-size: 15px;
    }

    .card-badge {
        width: 44px;
        min-width: 44px;
    }

    .badge-number {
        font-size: 17px;
    }
}
</style>
