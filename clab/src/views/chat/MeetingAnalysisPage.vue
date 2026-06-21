<template>
    <LoadingInfo v-if="isLoading" :is-loading="isLoading" />
    <RetryInfo v-else-if="error" :message="error" @retry="fetchData" />
    <div v-else class="meeting-analysis-page">
        <!-- Header -->
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
        <!-- Topic & Time Card -->
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

        <!-- Keywords -->
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

        <!-- Meeting Summary -->
        <section class="section-card">
            <div class="section-header">
                <span class="section-icon">📋</span>
                <h3 class="section-title">회의 요약</h3>
            </div>
            <div class="summary-content">
                <p class="summary-text">{{ meetingAnalysis.meetingSummary }}</p>
            </div>
        </section>

        <!-- Action Items -->
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

        <!-- Atmosphere -->
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
                    <span class="count-badge">{{ mergedParticipants.length }}명</span>
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
                    <div v-for="(participant, index) in sortedParticipants" :key="participant.id" class="chart-row">
                        
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useParticipantStore } from '@/stores/participant'
import { useMeetingAnalysisStore } from '@/stores/meeting-analysis'
import { useMeetingParticipationStore } from '@/stores/meeting-participation'

import LoadingInfo from '@/components/LoadingInfo.vue'
import RetryInfo from '@/components/RetryInfo.vue'

const route = useRoute()
const router = useRouter()

const participantStore = useParticipantStore()
const meetingAnalysisStore = useMeetingAnalysisStore()
const meetingParticipationStore = useMeetingParticipationStore()

const isLoading = ref(true)
const error = ref(null)

const chatId = route.params.chatId
const { participants } = storeToRefs(participantStore)
const { meetingAnalysis } = storeToRefs(meetingAnalysisStore)
const { meetingParticipations } = storeToRefs(meetingParticipationStore)

const goToChatDetail = () => router.push(`/chat/${chatId}`)

// ── 데이터 페칭 ──────────────────────────────────────────────
const fetchData = async () => {
    isLoading.value = true
    error.value = null
    try {
        await participantStore.fetchParticipants(chatId)
        await meetingAnalysisStore.fetchMeetingAnalysis(chatId)
        if (meetingAnalysis.value && meetingAnalysis.value.id) {
            await meetingParticipationStore.fetchMeetingParticipations(meetingAnalysis.value.id)
        }
    } catch (e) {
        console.error(e)
        error.value = '회의 분석 정보를 불러오는 데 실패하였습니다.'
    } finally {
        isLoading.value = false
    }
}
onMounted(async () => {
    await fetchData()
})

// ── 탭 및 정렬 상태 관리 ──────────────────────────────────────
const sortDesc = ref(true) // 기본: 내림차순
const toggleSort = () => { sortDesc.value = !sortDesc.value }

// 분석 가능한 전체 지표 목록 (두 스토어의 데이터 병합 활용)
const metricsTabs = [
    { key: 'participationScore', label: '참여도', icon: '🏆', color: 'var(--ocean-blue, #2563eb)' },
    { key: 'count', label: '대화 횟수', icon: '💬', color: '#0ea5e9' },
    { key: 'meaningfulUtteranceCount', label: '유의미 발언', icon: '🗣️', color: '#059669' },
    { key: 'topicInitiationCount', label: '주제 제시', icon: '🚀', color: '#e67e22' },
    { key: 'reactionReceivedScore', label: '반응 점수', icon: '⭐', color: '#7c3aed' },
    { key: 'averageReplyTime', label: '평균 답장', icon: '⏱️', color: '#ef4444' }
]

const activeTab = ref(metricsTabs[0].key)
const activeTabInfo = computed(() => metricsTabs.find(tab => tab.key === activeTab.value))

const getUnit = (key) => {
    if (key === 'participationScore' || key === 'reactionReceivedScore') return '점'
    if (key === 'averageReplyTime') return '분'
    return '회'
}

// ── 데이터 병합 및 정렬 연산 ──────────────────────────────────
const mergedParticipants = computed(() => {
    if (!participants.value) return []
    
    // participants를 기준으로 meetingParticipations 데이터를 Join
    return participants.value.map(p => {
        const mp = meetingParticipations.value?.find(m => m.participantId === p.id) || {}
        return {
            id: p.id,
            name: p.name || '알 수 없음',
            count: p.count || 0,
            averageReplyTime: p.averageReplyTime || 0,
            chatLength: p.chatLength || 0,
            participationScore: mp.participationScore || 0,
            meaningfulUtteranceCount: mp.meaningfulUtteranceCount || 0,
            topicInitiationCount: mp.topicInitiationCount || 0,
            reactionReceivedScore: mp.reactionReceivedScore || 0
        }
    })
})

const sortedParticipants = computed(() => {
    return [...mergedParticipants.value].sort((a, b) => {
        const valA = a[activeTab.value] || 0
        const valB = b[activeTab.value] || 0
        
        // sortDesc 값에 따라 내림차순 / 오름차순 반환
        return sortDesc.value ? valB - valA : valA - valB
    })
})

const maxValue = computed(() => {
    if (sortedParticipants.value.length === 0) return 1
    const max = Math.max(...sortedParticipants.value.map(p => p[activeTab.value] || 0))
    return max > 0 ? max : 1
})

const getBarWidth = (val) => {
    return ((val || 0) / maxValue.value) * 100
}

// ── 기존 Computed 및 Helpers ─────────────────────────────────

const parseKeywords = (str) => {
    if (!str) return []
    return str
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
}

const parseActionItems = (str) => {
    if (!str) return []
    return str
        .split('|')
        .map((item) => item.trim())
        .filter(Boolean)
}

const parsedKeywords = computed(() => {
    return parseKeywords(meetingAnalysis.value.keywords)
})

const parsedActionItems = computed(() => {
    return parseActionItems(meetingAnalysis.value.actionItems)
})

const duration = computed(() => {
    if (!meetingAnalysis.value.startedAt || !meetingAnalysis.value.endedAt) return '-'
    const diff = new Date(meetingAnalysis.value.endedAt) - new Date(meetingAnalysis.value.startedAt)
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    return hours > 0 ? `${hours}시간 ${mins % 60}분` : `${mins}분`
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

// ── Helpers ───────────────────────────────────────────────────
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
    gap: 0.5rem;
    padding-bottom: 1rem;
    overflow-x: auto;
    white-space: nowrap;
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.tabs-container::-webkit-scrollbar {
    display: none;
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
