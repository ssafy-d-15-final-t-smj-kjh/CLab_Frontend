<template>
    <LoadingInfo v-if="isLoading" :is-loading="isLoading" />
    <RetryInfo v-else-if="error" :message="error" @retry="fetchData" />
    <div v-else class="meeting-analysis-page">
        <header class="page-header">
            <button class="back-btn" @click="goToChatDetail">
                <span class="back-icon">←</span>
            </button>
            <div class="header-content">
                <h1 class="page-title">회의 분석 결과</h1>
                <p class="page-subtitle">{{ formatDate(meetingAnalysis.startedAt) }}</p>
            </div>
            <div class="header-badge" :class="atmosphereClass">
                {{ atmosphereLabel }}
            </div>
        </header>
        <section class="info-card primary-card">
            <div class="topic-section">
                <div class="label-row">
                    <span class="label-icon">🎯</span>
                    <span class="label-text">회의 주제</span>
                </div>
                <h2 class="topic-title">{{ meetingAnalysis.topic }}</h2>
            </div>
            <div class="time-grid">
                <div class="time-item">
                    <span class="time-label">시작</span>
                    <span class="time-value">{{ formatTime(meetingAnalysis.startedAt) }}</span>
                </div>
                <div class="time-divider">
                    <div class="duration-badge">
                        <span class="duration-icon">⏱</span>
                        <span>{{ duration }}</span>
                    </div>
                </div>
                <div class="time-item">
                    <span class="time-label">종료</span>
                    <span class="time-value">{{ formatTime(meetingAnalysis.endedAt) }}</span>
                </div>
            </div>
        </section>

        <section class="section-card">
            <div class="section-header">
                <span class="section-icon">🔑</span>
                <h3 class="section-title">핵심 키워드</h3>
            </div>
            <div class="keywords-container">
                <span v-for="(keyword, index) in parsedKeywords" :key="index" class="keyword-chip"
                    :class="`chip-color-${(index % 4) + 1}`">
                    {{ keyword }}
                </span>
            </div>
        </section>

        <section class="section-card">
            <div class="section-header">
                <span class="section-icon">📋</span>
                <h3 class="section-title">회의 요약</h3>
            </div>
            <div class="summary-content">
                <p class="summary-text">{{ meetingAnalysis.meetingSummary }}</p>
            </div>
        </section>

        <section class="section-card">
            <div class="section-header">
                <span class="section-icon">✅</span>
                <h3 class="section-title">해야 할 일</h3>
                <span class="count-badge">{{ parsedActionItems.length }}</span>
            </div>
            <div class="action-items-list">
                <div v-for="(item, index) in parsedActionItems" :key="index" class="action-item">
                    <div class="action-number">{{ String(index + 1).padStart(2, '0') }}</div>
                    <div class="action-content">
                        <p class="action-text">{{ item }}</p>
                    </div>
                    <div class="action-arrow">›</div>
                </div>
            </div>
        </section>

        <section class="section-card atmosphere-card">
            <div class="section-header">
                <span class="section-icon">💬</span>
                <h3 class="section-title">회의 분위기</h3>
            </div>
            <div class="atmosphere-content">
                <div class="atmosphere-meter">
                    <div class="meter-labels">
                        <span>부정적</span>
                        <span>중립</span>
                        <span>긍정적</span>
                    </div>
                    <div class="meter-bar">
                        <div class="meter-fill" :style="{ width: atmosphereMeterWidth }"></div>
                        <div class="meter-indicator" :style="{ left: atmosphereMeterWidth }"></div>
                    </div>
                </div>
                <div class="atmosphere-description">
                    <span class="atmosphere-emoji">{{ atmosphereEmoji }}</span>
                    <span class="atmosphere-text">{{ meetingAnalysis.atmosphere }}</span>
                </div>
            </div>
        </section>

        <section class="section-card chart-section">
            <div class="section-header flex-between">
                <div class="header-left">
                    <span class="section-icon">📊</span>
                    <h3 class="section-title">참여자 지표 비교</h3>
                    <span class="count-badge">{{ meetingParticipants.length }}명</span>
                </div>
                <button class="sort-btn" @click="toggleSort">
                    {{ sortDesc ? '⬇️ 내림차순' : '⬆️ 오름차순' }}
                </button>
            </div>

            <div class="tabs-container">
                <button v-for="tab in metricsTabs" :key="tab.key" class="tab-btn"
                    :class="{ 'active-tab': activeTab === tab.key }" @click="activeTab = tab.key">
                    <span class="tab-icon">{{ tab.icon }}</span>
                    {{ tab.label }}
                </button>
            </div>

            <div class="chart-list">
                <transition-group name="list" tag="div">
                    <div v-for="(participant, index) in sortedParticipants" :key="participant.id" class="chart-row tooltip-container">
                        
                        <div class="rank-number" :class="`rank-${index + 1}`">{{ index + 1 }}</div>

                        <div class="user-info">
                            <div class="user-avatar" :class="`avatar-${getAvatarIndex(participant.id)}`">
                                {{ participant.name.charAt(0) }}
                            </div>
                            <span class="user-name">{{ participant.name }}</span>
                        </div>

                        <div class="bar-container">
                            <div class="bar-track">
                                <div class="bar-fill"
                                    :style="{ 
                                        width: `${getBarWidth(participant[activeTab])}%`, 
                                        background: activeTabInfo.color 
                                    }">
                                </div>
                            </div>
                        </div>

                        <div class="value-display">
                            {{ participant[activeTab] }}
                            <span class="value-unit">{{ getUnit(activeTab) }}</span>
                        </div>

                        <div v-if="participant.keyOpinion || participant.assignedTask" class="custom-tooltip">
                            <div v-if="participant.keyOpinion" class="tooltip-section">
                                <div class="tooltip-header opinion-color">🎯 핵심 의견</div>
                                <div class="tooltip-content">{{ participant.keyOpinion }}</div>
                            </div>

                            <hr v-if="participant.keyOpinion && participant.assignedTask" class="tooltip-divider" />

                            <div v-if="participant.assignedTask" class="tooltip-section">
                                <div class="tooltip-header task-color">✅ 할당된 작업</div>
                                <div class="tooltip-content">{{ participant.assignedTask }}</div>
                            </div>
                        </div>
                    </div>
                </transition-group>
                
                <div v-if="sortedParticipants.length === 0" class="empty-state">
                    분석 가능한 참여자 데이터가 없습니다.
                </div>
            </div>
        </section>

        <div class="bottom-space"></div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue' // 💡 watch 임포트 보완
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useParticipantStore } from '@/stores/participant'
import { useMeetingAnalysisStore } from '@/stores/meeting-analysis'

import LoadingInfo from '@/components/LoadingInfo.vue'
import RetryInfo from '@/components/RetryInfo.vue'

const route = useRoute()
const router = useRouter()

const participantStore = useParticipantStore()
const meetingAnalysisStore = useMeetingAnalysisStore()

const isLoading = ref(true)
const error = ref(null)

const chatId = route.params.chatId
const { meetingParticipants } = storeToRefs(participantStore)
const { meetingAnalysis } = storeToRefs(meetingAnalysisStore)

const goToChatDetail = () => router.push(`/chat/${chatId}`)

// 분석 가능한 전체 지표 목록
const metricsTabs = [
    { key: 'count', label: '발언 횟수', icon: '🗣️', color: '#4F46E5', unit: '회' },
    { key: 'averageReplyTime', label: '평균 응답시간', icon: '⏱️', color: '#10B981', unit: '초' },
    { key: 'chatLength', label: '발화 길이', icon: '📏', color: '#F59E0B', unit: '자' },
    { key: 'meaningfulUtteranceCount', label: '유의미한 발화', icon: '💡', color: '#8B5CF6', unit: '회' },
    { key: 'participationScore', label: '참여도 점수', icon: '⭐', color: '#F59E0B', unit: '점' },
    { key: 'topicInitiationCount', label: '주제 발의', icon: '🚀', color: '#3B82F6', unit: '회' },
    { key: 'reactionReceivedScore', label: '받은 리액션', icon: '👏', color: '#14B8A6', unit: '점' }
];  

const activeTab = ref(metricsTabs[0].key)
const activeTabInfo = computed(() => metricsTabs.find(tab => tab.key === activeTab.value))

// ── 💡 정렬 및 데이터 요청 상태 관리 ──────────────────────────
const sortRequestDto = reactive({
    sortBy: metricsTabs[0].key, // 초기 지표 매핑 ('count')
    sortOrder: 'DESC',
})

// 💡 템플릿 렌더링용 연산 프로퍼티 보완
const sortDesc = computed(() => sortRequestDto.sortOrder === 'DESC')

// 백엔드가 정렬해서 넘겨준 데이터를 리스트로 그대로 출력합니다.
const sortedParticipants = computed(() => meetingParticipants.value)

const toggleSort = () => {
    sortRequestDto.sortOrder = sortRequestDto.sortOrder === 'DESC' ? 'ASC' : 'DESC'
}

// ── 💡 데이터 감시자(Watch) 세팅 ──────────────────────────────

// 1. 활성화된 탭(activeTab)이 변경되면 DTO의 sortBy 값을 매핑합니다.
watch(activeTab, (newTabKey) => {
    sortRequestDto.sortBy = newTabKey
})

// 2. DTO 내부의 정렬 기준이나 차순이 바뀌면 자동으로 백엔드에 fetch 요청을 다시 날립니다.
watch(
    () => [sortRequestDto.sortBy, sortRequestDto.sortOrder],
    async () => {
        try {
            await participantStore.fetchMeetingParticipants(chatId, sortRequestDto)
        } catch (err) {
            console.error('회의 지표 정렬 데이터 요청 실패:', err)
        }
    }
)

// ── 데이터 페칭 ──────────────────────────────────────────────
const fetchData = async () => {
    isLoading.value = true
    error.value = null
    try {
        await meetingAnalysisStore.fetchMeetingAnalysis(chatId)
        await participantStore.fetchMeetingParticipants(chatId, sortRequestDto)
    } catch (err) {
        console.error('MeetingAnalysisPage.vue - fetchData', err)
        error.value = '회의 분석 정보를 불러오는 데 실패하였습니다.'
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchData()
})

// ── 기존 Computed 및 Helpers ─────────────────────────────────
const getUnit = (key) => {
    const tab = metricsTabs.find(t => t.key === key);
    return tab ? tab.unit : '';
};

const maxValue = computed(() => {
    if (meetingParticipants.value.length === 0) return 1
    const max = Math.max(...meetingParticipants.value.map(p => p[activeTab.value] || 0))
    return max > 0 ? max : 1
})

const getBarWidth = (val) => {
    return ((val || 0) / maxValue.value) * 100
}

const parseKeywords = (str) => {
    if (!str) return []
    return str.split(',').map((k) => k.trim()).filter(Boolean)
}

const parseActionItems = (str) => {
    if (!str) return []
    return str.split('|').map((item) => item.trim()).filter(Boolean)
}

const parsedKeywords = computed(() => parseKeywords(meetingAnalysis.value.keywords))
const parsedActionItems = computed(() => parseActionItems(meetingAnalysis.value.actionItems))

const duration = computed(() => {
    if (!meetingAnalysis.value.startedAt || !meetingAnalysis.value.endedAt) return '-'
    const diff = new Date(meetingAnalysis.value.endedAt) - new Date(meetingAnalysis.value.startedAt)
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)
    if (days > 0) {
        return `${days}일 ${hours % 24}시간 ${mins % 60}분`
    } else if (hours > 0) {
        return `${hours}시간 ${mins % 60}분` 
    } else {
        return `${mins}분`
    }
})

const atmosphereClass = computed(() => {
    const atmo = meetingAnalysis.value.atmosphere?.toLowerCase() || ''
    if (atmo.includes('긍정') || atmo.includes('positive')) return 'badge-positive'
    if (atmo.includes('부정') || atmo.includes('negative')) return 'badge-negative'
    return 'badge-neutral'
})

const atmosphereLabel = computed(() => {
    const atmo = meetingAnalysis.value.atmosphere?.toLowerCase() || ''
    if (atmo.includes('긍정') || atmo.includes('positive')) return '😊 긍정적'
    if (atmo.includes('부정') || atmo.includes('negative')) return '😟 부정적'
    return '😐 중립적'
})

const atmosphereEmoji = computed(() => {
    const atmo = meetingAnalysis.value.atmosphere?.toLowerCase() || ''
    if (atmo.includes('긍정') || atmo.includes('positive')) return '😊'
    if (atmo.includes('부정') || atmo.includes('negative')) return '😟'
    return '😐'
})

const atmosphereMeterWidth = computed(() => {
    const atmo = meetingAnalysis.value.atmosphere?.toLowerCase() || ''
    if (atmo.includes('긍정') || atmo.includes('positive')) return '80%'
    if (atmo.includes('부정') || atmo.includes('negative')) return '20%'
    return '50%'
})

const formatDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

const formatTime = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

const getAvatarIndex = (id) => {
    let hash = 0
    for (const c of String(id)) hash += c.charCodeAt(0)
    return (hash % 5) + 1
}
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────── */
.meeting-analysis-page {
    min-height: 100vh;
    background: var(--sand-light);
    padding-bottom: 2rem;
}

/* ── Header ─────────────────────────────────────────────── */
.page-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem 1.25rem 1rem;
    background: var(--white);
    border-bottom: 2px solid var(--sand-dark);
    position: sticky;
    top: 0;
    z-index: 10;
}

.back-btn {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    border: 2px solid var(--sand-dark);
    background: var(--sand-light);
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.2s;
}

.back-btn:hover {
    background: var(--sand);
}

.header-content {
    flex: 1;
}

.page-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-dark);
}

.page-subtitle {
    font-size: 0.75rem;
    color: var(--text-gray);
    margin-top: 0.1rem;
}

.header-badge {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
}

.badge-positive {
    background: #d4f7e7;
    color: #1a7a4a;
}

.badge-negative {
    background: #fde8e8;
    color: #c41e3a;
}

.badge-neutral {
    background: var(--sand);
    color: var(--text-gray);
}

/* ── Cards ──────────────────────────────────────────────── */
.info-card,
.section-card {
    margin: 1rem 1rem 0;
    background: var(--white);
    border-radius: 1rem;
    padding: 1.25rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.primary-card {
    background: linear-gradient(135deg, var(--ocean-blue), var(--sky-blue));
    color: var(--white);
}

/* ── Topic Section ───────────────────────────────────────── */
.label-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
}

.label-icon {
    font-size: 1rem;
}

.label-text {
    font-size: 0.8rem;
    font-weight: 600;
    opacity: 0.85;
}

.topic-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 1.25rem;
    line-height: 1.4;
}

/* ── Time Grid ───────────────────────────────────────────── */
.time-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 0.75rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
}

.time-item {
    text-align: center;
}

.time-label {
    display: block;
    font-size: 0.7rem;
    opacity: 0.8;
    margin-bottom: 0.25rem;
}

.time-value {
    font-size: 1rem;
    font-weight: 700;
}

.time-divider {
    display: flex;
    justify-content: center;
}

.duration-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    font-size: 0.75rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 0.5rem;
    padding: 0.35rem 0.6rem;
}

.duration-icon {
    font-size: 0.9rem;
}

/* ── Section Header ─────────────────────────────────────── */
.section-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 1rem;
}

.section-icon {
    font-size: 1rem;
}

.section-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-dark);
    flex: 1;
}

.count-badge {
    background: var(--sand);
    color: var(--text-dark);
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
}

/* ── Keywords ───────────────────────────────────────────── */
.keywords-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.keyword-chip {
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
}

.chip-color-1 {
    background: #e8f4fd;
    color: #2980b9;
}

.chip-color-2 {
    background: #fef3e8;
    color: #e67e22;
}

.chip-color-3 {
    background: #eafaf1;
    color: #1e8449;
}

.chip-color-4 {
    background: #fdebd0;
    color: #ca6f1e;
}

/* ── Summary ────────────────────────────────────────────── */
.summary-content {
    background: var(--sand-light);
    border-radius: 0.75rem;
    padding: 1rem;
    border-left: 3px solid var(--ocean-blue);
}

.summary-text {
    font-size: 0.9rem;
    line-height: 1.7;
    color: var(--text-dark);
}

/* ── Action Items ───────────────────────────────────────── */
.action-items-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.action-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--sand-light);
    border-radius: 0.75rem;
    padding: 0.75rem 0.9rem;
    border: 1px solid var(--sand-dark);
}

.action-number {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--white);
    background: var(--ocean-blue);
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.action-content {
    flex: 1;
}

.action-text {
    font-size: 0.875rem;
    color: var(--text-dark);
    line-height: 1.4;
}

.action-arrow {
    color: var(--text-gray);
    font-size: 1.1rem;
}

/* ── Atmosphere ─────────────────────────────────────────── */
.atmosphere-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.meter-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: var(--text-gray);
    margin-bottom: 0.4rem;
}

.meter-bar {
    height: 8px;
    background: var(--sand-dark);
    border-radius: 999px;
    position: relative;
    overflow: visible;
}

.meter-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--crab-red), var(--ocean-blue));
    border-radius: 999px;
    transition: width 0.8s ease;
}

.meter-indicator {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    background: var(--white);
    border: 3px solid var(--ocean-blue);
    border-radius: 50%;
    transition: left 0.8s ease;
}

.atmosphere-description {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-dark);
    font-weight: 500;
}

.atmosphere-emoji {
    font-size: 1.4rem;
}

.flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.sort-btn {
    background: var(--sand-light, #f1f5f9);
    border: 1px solid var(--sand-dark, #e2e8f0);
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-dark, #333);
    cursor: pointer;
    transition: background 0.2s;
}

.sort-btn:hover {
    background: #e2e8f0;
}

.tabs-container {
    display: flex;
    overflow-x: auto;
    gap: 8px;
    padding-bottom: 8px; /* 스크롤바 공간 확보 */
    margin-bottom: 16px;
    -webkit-overflow-scrolling: touch; /* 모바일 부드러운 스크롤 */
}

.tabs-container::-webkit-scrollbar {
    height: 6px;
    display: none;
}
.tabs-container::-webkit-scrollbar-thumb {
    background-color: #CBD5E1;
    border-radius: 4px;
}

.tab-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    background: var(--sand-light, #f1f5f9);
    border: 1px solid transparent;
    color: var(--text-gray, #64748b);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap; /* 텍스트 한 줄로 유지 */
    flex-shrink: 0; /* 탭이 찌그러지지 않게 */
}

.tab-btn.active-tab {
    background: #eff6ff; 
    border-color: #bfdbfe;
    color: var(--ocean-blue, #2563eb);
}

.chart-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-top: 0.5rem;
}

.chart-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
    background: #fff;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background 0.2s;
}

.chart-row:hover {
    background: #f8fafc;
}

.list-move, .list-enter-active, .list-leave-active {
    transition: all 0.5s ease;
}
.list-enter-from, .list-leave-to {
    opacity: 0;
    transform: translateY(15px);
}
.list-leave-active { position: absolute; width: 100%; }

.rank-number {
    width: 1.2rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-gray, #94a3b8);
    text-align: center;
}
.rank-1 { color: #f59e0b; font-size: 1.1rem; }
.rank-2 { color: #94a3b8; font-size: 1rem; }
.rank-3 { color: #d97706; font-size: 0.95rem; }

.user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 9.5rem;
    flex-shrink: 0;
}

.user-avatar {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.avatar-1 { background: #475569; }
.avatar-2 { background: #ef4444; }
.avatar-3 { background: #8b5cf6; }
.avatar-4 { background: #10b981; }
.avatar-5 { background: #f59e0b; }

.user-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-dark, #1e293b);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
}

.tooltip-container {
    position: relative;
    cursor: help; /* 마우스를 올렸을 때 도움말 커서로 변경 */
}

/* 💡 행 전체를 툴팁 기준점으로 설정 */
.chart-row.tooltip-container {
    position: relative; 
    cursor: help;
}

/* 툴팁 기본 스타일 */
.custom-tooltip {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    bottom: 100%; /* 바/이름 위쪽으로 띄움 */
    left: 10%;
    transform: translateX(-50%);
    margin-bottom: 8px; /* 요소와 툴팁 사이 간격 */
    background-color: #1E293B; /* 어두운 배경 */
    color: #F8FAFC;
    padding: 12px 16px;
    border-radius: 8px;
    z-index: 100;
    width: max-content;
    max-width: 320px; /* 내용이 길면 줄바꿈 */
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease-in-out;
    pointer-events: none; /* 마우스 오버 방해 방지 */
    text-align: left;
    font-size: 0.85rem;
    line-height: 1.5;
    white-space: pre-wrap;
}

/* 말풍선 꼬리 */
.custom-tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -6px;
    border-width: 6px;
    border-style: solid;
    border-color: #1E293B transparent transparent transparent;
}

/* 툴팁 내부 헤더(제목) 스타일 */
.tooltip-header {
    font-weight: 700;
    margin-bottom: 4px;
    font-size: 0.75rem;
}

/* 포인트 컬러 부여 */
.opinion-color { color: #38BDF8; } /* 하늘색 */
.task-color { color: #34D399; } /* 에메랄드(초록)색 */

/* 내부 구분선 */
.tooltip-divider {
    border: none;
    border-top: 1px solid #475569; /* 은은한 회색 선 */
    margin: 8px 0;
}

/* 마우스 오버 시 애니메이션 효과 */
.chart-row.tooltip-container:hover .custom-tooltip {
    visibility: visible;
    opacity: 1;
    bottom: calc(100% + 5px); /* 떠오르는 듯한 효과 */
}

/* 마우스 오버 시 툴팁 표시 */
.tooltip-container:hover .custom-tooltip {
    visibility: visible;
    opacity: 1;
    bottom: 130%; /* 나타날 때 위로 살짝 올라가는 애니메이션 효과 */
}

.bar-container {
    flex: 1;
    display: flex;
    align-items: center;
}

.bar-track {
    width: 100%;
    height: 8px;
    background: #f1f5f9;
    border-radius: 999px;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.5s;
    min-width: 2%;
}

.value-display {
    width: 3rem;
    text-align: right;
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--text-dark, #1e293b);
    flex-shrink: 0;
}

.value-unit {
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--text-gray, #64748b);
}

.empty-state {
    text-align: center;
    padding: 2rem 0;
    color: var(--text-gray, #64748b);
    font-size: 0.9rem;
}

.bottom-space {
    height: 2rem;
}
</style>
