<template>
    <LoadingInfo v-if="isLoading" :is-loading="isLoading" />
    <RetryInfo v-else-if="error" :message="error" @retry="fetchChats" />

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

            <div class="summary-banner">
                <span class="summary-icon">🦀</span>
                <span class="summary-text">
                    총 <strong>{{ totalCount }}</strong>개의 대화가 있어요!
                </span>
                <button class="btn-upload" @click="router.push('/upload-chat')">
                    <span>📂</span>
                    대화 분석하기
                </button>
            </div>

            <div class="controls-container">

                <div class="tabs-container">
                    <button v-for="tab in tabs" :key="tab.value" class="tab-btn"
                        :class="{ 'active': activeTab === tab.value }" @click="changeTab(tab.value)">
                        {{ tab.label }}
                    </button>
                </div>

                <div class="sort-container">
                    <select v-model="pageRequestDto.sortBy" @change="changeSortBy" class="sort-select">
                        <option value="createdAt">시간순</option>
                        <option value="title">이름순</option>
                    </select>
                    <select v-model="pageRequestDto.sortOrder" @change="changeSortOrder" class="sort-select">
                        <option value="DESC">내림차순</option>
                        <option value="ASC">오름차순</option>
                    </select>
                </div>

            </div>


            <!-- 목록 없을 때 -->
            <div v-if="chats.length === 0" class="empty-state">
                <span class="empty-icon">🌊</span>
                <p class="empty-title">
                    {{ activeTab === 'ALL' ? '아직 대화가 없어요' : '해당 카테고리의 대화가 없어요' }}
                </p>
                <p class="empty-sub">새로운 대화를 시작해보세요!</p>
                <button class="btn-upload btn-upload--large" @click="router.push('/upload-chat')">
                    <span>📂</span>
                    첫 대화를 분석해보세요!
                </button>
            </div>

            <ul v-else class="chat-list">
                <li v-for="chat in chats" :key="chat.id" class="chat-card" @click="handleChatClick(chat)">
                    <div class="card-badge" style="width: 90px" :class="chat.category?.toLowerCase()">
                        <span class="badge-category">{{ chat.category === 'EMOTION' ? '페르소나' : '회의' }}</span>
                        <span v-if="chat.status === 'DONE'" style="margin-left: 8px; font-size: 0.8rem; color: white; white-space: nowrap;">
                            ✅ 분석 완료
                        </span>
                        <span v-else-if="chat.status === 'PENDING'" style="margin-left: 8px; font-size: 0.8rem; color: white; white-space: nowrap;">
                            ⏳ 분석 중...
                        </span>
                        <span v-else-if="chat.status === 'FAILED'" style="margin-left: 8px; font-size: 0.8rem; color: white; white-space: nowrap;">
                            ❌ 분석 실패
                        </span>
                    </div>

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

            <div v-if="chats.length > 0" class="pagination-container">
                <button 
                    class="page-btn ctrl-btn" 
                    :disabled="pageRequestDto.page <= pageBlockSize" 
                    @click="prevBlock"
                >
                    «
                </button>
                
                <button 
                    class="page-btn ctrl-btn" 
                    :disabled="pageRequestDto.page === 1" 
                    @click="changePage(pageRequestDto.page - 1)"
                >
                    ‹
                </button>
                
                <div class="page-numbers">
                    <button 
                        v-for="page in pageNumbers" 
                        :key="page"
                        class="page-number-btn"
                        :class="{ 'active': page === pageRequestDto.page }"
                        @click="changePage(page)"
                    >
                        {{ page }}
                    </button>
                </div>

                <button 
                    class="page-btn ctrl-btn" 
                    :disabled="pageRequestDto.page >= totalPages" 
                    @click="changePage(pageRequestDto.page + 1)"
                >
                    ›
                </button>

                <button 
                    class="page-btn ctrl-btn" 
                    :disabled="Math.floor((pageRequestDto.page - 1) / pageBlockSize) === Math.floor((totalPages - 1) / pageBlockSize)" 
                    @click="nextBlock"
                >
                    »
                </button>
            </div>

        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'

import LoadingInfo from '@/components/LoadingInfo.vue'
import RetryInfo from '@/components/RetryInfo.vue'

const router = useRouter()
const chatStore = useChatStore()

const { chats, totalCount } = storeToRefs(chatStore)

const activeTab = ref('ALL')

const tabs = [
    { label: '전체', value: 'ALL' },
    { label: '페르소나 분석', value: 'EMOTION' },
    { label: '회의 분석', value: 'MEETING' }
]

const limit = ref(10)
const pageBlockSize = 10;

const totalPages = computed(() => {
    return totalCount?.value === 0 ? 1 : Math.ceil(totalCount?.value / limit?.value);
});

const pageRequestDto = reactive({
    page: 1,
    size: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    category: 'ALL'
})

const pageNumbers = computed(() => {
    const pages = [];
    const startPage = Math.floor((pageRequestDto.page - 1) / pageBlockSize) * pageBlockSize + 1;
    const endPage = Math.min(startPage + pageBlockSize - 1, totalPages.value);

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
});

const isLoading = ref(true)
const error = ref(null)


const handleChatClick = (chat) => {
    if (chat.status === 'PENDING') {
        alert('분석 중입니다. 잠시만 기다려주세요.');
        return;
    }
    
    if (chat.status === 'FAILED') {
        alert('분석에 실패한 대화입니다.');
        return;
    }
    
    goToDetail(chat.id);
};

const goToDetail = (chatId) => {
    router.push(`/chat/${chatId}`)
}

const formatTime = (dateStr) => {
    if (!dateStr) return '-'

    const date = new Date(dateStr)

    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
}

const changeSortBy = () => {
    pageRequestDto.page = 1
    fetchChats()
}

const changeSortOrder = () => {
    pageRequestDto.page = 1
    fetchChats()
}

const changeTab = (newValue) => {
    activeTab.value = newValue
    pageRequestDto.category = newValue
    pageRequestDto.page = 1
    fetchChats()
}

const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages.value) return;
    pageRequestDto.page = newPage
    fetchChats();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const prevBlock = () => {
    const startPage = Math.floor((pageRequestDto.page - 1) / pageBlockSize) * pageBlockSize + 1;
    if (startPage > 1) {
        changePage(startPage - 1);
    }
};

const nextBlock = () => {
    const startPage = Math.floor((pageRequestDto.page - 1) / pageBlockSize) * pageBlockSize + 1;
    const endPage = startPage + pageBlockSize - 1;
    if (endPage < totalPages.value) {
        changePage(endPage + 1);
    }
};

const fetchChats = async () => {
    isLoading.value = true
    error.value = null
    try {
        await chatStore.fetchChats(pageRequestDto)
        console.log(chats.value)
    } catch (e) {
        console.error('ChatListPage.vue - fetchChats :', e)
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
/* ── 페이지 & 헤더 (기존 유지) ─────────────────────────────── */
.chat-list-page {
    min-height: 100vh;
    background: var(--sand-light, #f5f0e6);
}

.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--white, #ffffff);
    border-bottom: 2px solid var(--sand-dark, #d8ccb8);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.back-btn {
    background: var(--sand, #f0e6d2);
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
    background: var(--sand-dark, #d8ccb8);
}

.back-icon {
    font-size: 18px;
    color: var(--text-dark, #333333);
}

.page-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark, #333333);
}

.header-spacer {
    width: 40px;
}

/* ── 콘텐츠 & 배너 (기존 유지) ─────────────────────────────── */
.content-wrapper {
    max-width: 600px;
    margin: 0 auto;
    padding: 24px 16px 60px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.summary-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, var(--ocean-blue, #0077b6), var(--sky-blue, #00b4d8));
    color: var(--white, #ffffff);
    padding: 14px 20px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(91, 180, 196, 0.3);
}

.summary-icon { font-size: 22px; }
.summary-text { flex: 1; font-size: 14px; font-weight: 500; }
.summary-text strong { font-size: 18px; font-weight: 800; }

.btn-upload {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--white, #ffffff);
    color: var(--ocean-blue, #0077b6);
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

.btn-upload--large {
    margin-top: 8px;
    padding: 12px 24px;
    font-size: 15px;
    background: linear-gradient(135deg, var(--ocean-blue, #0077b6), var(--sky-blue, #00b4d8));
    color: var(--white, #ffffff);
    box-shadow: 0 4px 14px rgba(91,180,196,0.4);
}

/* 💡 컨트롤 (탭 & 정렬) 영역 스타일 추가 */
.controls-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 8px;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
    gap: 12px;
    flex-wrap: wrap; /* 화면이 좁아지면 아래로 떨어지도록 */
}

.tabs-container {
    display: flex;
    gap: 10px;
}

.tab-btn {
    padding: 8px 12px;
    border: none;
    background: transparent;
    font-size: 0.95rem;
    font-weight: 600;
    color: #888;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease-in-out;
}

.tab-btn:hover {
    background-color: #f5f5f5;
    color: #333;
}

.tab-btn.active {
    background-color: var(--ocean-blue, #0077b6);
    color: white;
}

/* 💡 정렬 Select 디자인 */
.sort-container {
    display: flex;
    gap: 8px;
}

.sort-select {
    padding: 6px 28px 6px 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: white;
    font-size: 0.85rem;
    font-weight: 600;
    color: #444;
    cursor: pointer;
    outline: none;
    appearance: none; /* 브라우저 기본 화살표 숨김 */
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat;
    background-position: right 10px top 50%;
    background-size: 10px auto;
    transition: border-color 0.2s;
}

.sort-select:hover, .sort-select:focus {
    border-color: var(--ocean-blue, #0077b6);
}

/* ── 빈 상태 & 카드 (기존 유지) ───────────────────────────── */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    gap: 12px;
}

.empty-icon { font-size: 56px; }
.empty-title { font-size: 18px; font-weight: 700; color: var(--text-dark, #333333); }
.empty-sub { font-size: 14px; color: var(--text-gray, #888888); }

.chat-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0;
    margin: 0;
}

.chat-card {
    display: flex;
    align-items: stretch;
    gap: 0;
    background: var(--white, #ffffff);
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.07);
    border: 1px solid var(--sand, #f0e6d2);
    cursor: pointer;
    transition: transform 0.18s, box-shadow 0.18s;
}

.chat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(91, 180, 196, 0.2);
    border-color: var(--sky-blue, #00b4d8);
}

.card-badge {
    width: 52px;
    min-width: 52px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 65px; 
    flex-shrink: 0
}

.badge-category {
    font-size: 0.7rem;
    font-weight: bold;
    color: white;
    background: rgba(0, 0, 0, 0.25);
    padding: 3px 6px;
    border-radius: 4px;
    white-space: nowrap; 
    word-break: keep-all;
}

.card-badge.emotion { background-color: #ffb3ba; color: #333; }
.card-badge.meeting { background-color: #bae1ff; color: #333; }

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
    color: var(--text-dark, #333333);
    letter-spacing: -0.3px;
}

.arrow-icon {
    font-size: 24px;
    color: var(--ocean-blue, #0077b6);
    font-weight: 700;
    line-height: 1;
}

.chat-description {
    font-size: 13px;
    color: var(--text-gray, #888888);
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

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
    color: var(--text-gray, #888888);
}

.date-divider {
    color: var(--sand-dark, #d8ccb8);
    font-size: 12px;
}

@media (max-width: 480px) {
    .content-wrapper { padding: 16px 12px 48px; }
    .controls-container { flex-direction: column; align-items: flex-start; }
    .sort-container { width: 100%; justify-content: flex-end; }
}

.pagination-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 40px;
    padding: 20px 0;
    user-select: none;
}

/* 컨트롤 버튼 (<<, <, >, >>) 공통 스타일 */
.page-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background-color: #ffffff;
    color: #4a5568;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
    background-color: #f7fafc;
    border-color: #cbd5e0;
    color: #1a202c;
}

.page-btn:disabled {
    background-color: #f8fafc;
    color: #cbd5e0;
    border-color: #edf2f7;
    cursor: not-allowed;
}

/* 숫자 버튼들을 감싸는 컨테이너 */
.page-numbers {
    display: flex;
    gap: 6px;
}

/* 개별 숫자 버튼 스타일 */
.page-number-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid transparent;
    border-radius: 6px;
    background-color: transparent;
    color: #4a5568;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.page-number-btn:hover {
    background-color: #f1f5f9;
    color: #1e293b;
}

/* 🔥 현재 선택된 활성화 페이지 스타일 */
.page-number-btn.active {
    background-color: #3182ce; /* 브랜드 메인 컬러 */
    color: #ffffff;
    font-weight: 700;
    border-color: #3182ce;
}
</style>