<template>
    <div class="list-page">
        <div class="page-header">
            <div class="header-inner">
                <button class="back-btn" @click="goToChatDetail">
                    <span>←</span>
                </button>
                <div class="header-title">
                    <h1>🦀 대화 참여자 분석</h1>
                </div>
            </div>
        </div>

        <LoadingInfo v-if="isLoading" :is-loading="isLoading" />
        <RetryInfo v-else-if="error" :message="error" @retry="fetchParticipants" />
        <div class="container" v-else>
            <p class="chat-title">{{ chatInfo?.title }}</p>

            <div class="summary-section">
                <div class="summary-card">
                    <span class="summary-icon">💬</span>
                    <div>
                        <p class="summary-label">총 대화 수</p>
                        <p class="summary-value">{{ totalMessages }}</p>
                    </div>
                </div>
                <div class="summary-card">
                    <span class="summary-icon">👥</span>
                    <div>
                        <p class="summary-label">참여자 수</p>
                        <p class="summary-value">{{ participants.length }}명</p>
                    </div>
                </div>
                <div class="summary-card">
                    <span class="summary-icon">⏱️</span>
                    <div>
                        <p class="summary-label">평균 답장시간</p>
                        <p class="summary-value">{{ avgReplyTime }}</p>
                    </div>
                </div>
            </div>

            <div class="main-tabs">
                <button class="main-tab" :class="{ active: currentMainTab === 'summary' }"
                    @click="currentMainTab = 'summary'">
                    📋 참여자 요약
                </button>
                <button class="main-tab" :class="{ active: currentMainTab === 'chart' }"
                    @click="currentMainTab = 'chart'">
                    📊 참여자 비교 차트
                </button>
            </div>

            <div v-if="currentMainTab === 'summary'" class="tab-content">
                <div class="section">
                    <h2 class="section-title">📋 참여자 요약</h2>
                    <p class="section-desc">대화 참여자 요약 정보입니다</p>

                    <div class="participant-cards">
                        <div v-for="(p, index) in rankedParticipants" :key="p.id" class="participant-card"
                            :class="{ 'rank-1': index === 0, 'rank-2': index === 1, 'rank-3': index === 2 }"
                            @click="goToParticipantDetail(p.id)">
                            <div class="rank-badge">
                                <span v-if="index === 0">🥇</span>
                                <span v-else-if="index === 1">🥈</span>
                                <span v-else-if="index === 2">🥉</span>
                                <span v-else class="rank-num">{{ index + 1 }}</span>
                            </div>

                            <div class="avatar" :style="{ backgroundColor: avatarColors[index % avatarColors.length] }">
                                {{ index + 1 }}
                            </div>

                            <div class="card-info">
                                <h3 class="participant-name">{{ p.name }}</h3>

                                <div class="stats-grid">
                                    <div class="stat-item">
                                        <span class="stat-label">💬 대화 수</span>
                                        <span class="stat-value">{{ p.count }}회</span>
                                        <div class="stat-bar">
                                            <div class="stat-bar-fill"
                                                :style="{ width: getPercent(p.count, maxCount) + '%', backgroundColor: '#5bb4c4' }">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="stat-item">
                                        <span class="stat-label">⏱️ 평균 답장</span>
                                        <span class="stat-value">{{ formatReplyTime(p.averageReplyTime) }}</span>
                                        <div class="stat-bar">
                                            <div class="stat-bar-fill"
                                                :style="{ width: getReplyPercent(p.averageReplyTime) + '%', backgroundColor: '#a8dadc' }">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="stat-item">
                                        <span class="stat-label">📝 대화 길이</span>
                                        <span class="stat-value">{{ p.chatLength }}자</span>
                                        <div class="stat-bar">
                                            <div class="stat-bar-fill"
                                                :style="{ width: getPercent(p.chatLength, maxLength) + '%', backgroundColor: '#e8554e' }">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="stat-item">
                                        <span class="stat-label">⚡ 테토 점수</span>
                                        <span class="stat-value teto-score" :class="tetoClass(p.tetoScore)">
                                            {{ p.tetoScore ?? '-' }}점
                                        </span>
                                        <div class="stat-bar">
                                            <div class="stat-bar-fill teto-bar" :style="{
                                                width: (p.tetoScore ?? 0) + '%',
                                                background: tetoGradient(p.tetoScore)
                                            }"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card-arrow">→</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">⚡ 테토 에너지 분포</h2>
                    <p class="section-desc">0점 = 에겐(붉은색), 100점 = 테토(푸른색)</p>

                    <div class="teto-distribution">
                        <div v-for="p in participants" :key="p.id" class="teto-item" @click="goToDetail(p.id)">
                            <span class="teto-name" :title="p.name">{{ p.name }}</span>

                            <div class="teto-bar-container">
                                <div class="teto-label-left">에겐</div>

                                <div class="teto-bidirectional-wrap">
                                    <div class="teto-side left-side">
                                        <div class="teto-fill ether-fill" v-if="p.tetoScore < 50"
                                            :style="{ width: ((50 - p.tetoScore) * 2) + '%' }">
                                        </div>
                                    </div>

                                    <div class="teto-center-mark"></div>

                                    <div class="teto-side right-side">
                                        <div class="teto-fill teto-fill-blue" v-if="p.tetoScore > 50"
                                            :style="{ width: ((p.tetoScore - 50) * 2) + '%' }">
                                        </div>
                                    </div>

                                    <span class="teto-score-label"
                                        :class="{ 'left-score': p.tetoScore < 50, 'right-score': p.tetoScore >= 50 }">
                                        {{ p.tetoScore ?? 0 }}점
                                    </span>
                                </div>

                                <div class="teto-label-right">테토</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="currentMainTab === 'chart'" class="tab-content">
                <div class="section">
                    <div class="chart-header">
                        <div>
                            <h2 class="section-title">📊 참여자 비교 차트</h2>
                            <p class="section-desc">참여자 간의 수치를 한눈에 비교해보세요.</p>
                        </div>
                        <button class="sort-btn" @click="toggleSortOrder">
                            {{ sortOrder === 'desc' ? '⬇️ 내림차순' : '⬆️ 오름차순' }}
                        </button>
                    </div>

                    <div class="chart-tabs">
                        <button v-for="tab in chartTabs" :key="tab.key" class="chart-tab"
                            :class="{ active: activeChart === tab.key }" @click="activeChart = tab.key">
                            {{ tab.label }}
                        </button>
                    </div>

                    <div class="chart-wrapper" :style="{ height: Math.max(300, participants.length * 45) + 'px' }">
                        <canvas ref="barChartRef"></canvas>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import { storeToRefs } from 'pinia'

import { useChatStore } from '@/stores/chat'
import { useParticipantStore } from '@/stores/participant'

import LoadingInfo from '@/components/LoadingInfo.vue'
import RetryInfo from '@/components/RetryInfo.vue'

Chart.register(...registerables)

const route = useRoute()
const router = useRouter()

const chatStore = useChatStore()
const participantStore = useParticipantStore()

const isLoading = ref(false)
const error = ref(null)

const { chatInfo } = storeToRefs(chatStore)
const { participants } = storeToRefs(participantStore)

const chatId = route.params.chatId

// ── 탭 상태 ──────────────────────────────────────────
const currentMainTab = ref('summary') // 'summary' | 'chart'

// ── 차트 상태 ─────────────────────────────────────────
const barChartRef = ref(null)
let barChartInstance = null

const activeChart = ref('count')
const sortOrder = ref('desc') // 'desc' (내림차순) | 'asc' (오름차순)

const chartTabs = [
    { key: 'count', label: '💬 대화 수' },
    { key: 'reply', label: '⏱️ 답장 시간' },
    { key: 'length', label: '📝 대화 길이' },
    { key: 'teto', label: '⚡ 테토 점수' },
]

const avatarColors = ['#5bb4c4', '#e8554e', '#f0d9a8', '#a8dadc', '#c41e3a', '#88bbcc']

// ── 계산값 ──────────────────────────────────────────
const totalMessages = computed(() =>
    participants.value.reduce((sum, p) => sum + p.count, 0)
)

const avgReplyTime = computed(() => {
    const valid = participants.value.filter(p => p.averageReplyTime > 0)
    if (!valid.length) return '-'
    const avg = valid.reduce((s, p) => s + p.averageReplyTime, 0) / valid.length
    return formatReplyTime(avg)
})

const rankedParticipants = computed(() =>
    [...participants.value].sort((a, b) => b.count - a.count)
)

const maxCount = computed(() => Math.max(...participants.value.map(p => p.count), 1))
const maxLength = computed(() => Math.max(...participants.value.map(p => p.chatLength), 1))
const maxReply = computed(() => Math.max(...participants.value.map(p => p.averageReplyTime), 1))

// 차트 정렬용 데이터 (현재 활성화된 탭과 정렬 기준에 맞춰 재정렬)
const chartSortedParticipants = computed(() => {
    return [...participants.value].sort((a, b) => {
        let valA = 0, valB = 0;

        switch (activeChart.value) {
            case 'count':
                valA = a.count; valB = b.count; break;
            case 'reply':
                valA = a.averageReplyTime ?? 0; valB = b.averageReplyTime ?? 0; break;
            case 'length':
                valA = a.chatLength; valB = b.chatLength; break;
            case 'teto':
                valA = a.tetoScore ?? 0; valB = b.tetoScore ?? 0; break;
        }

        return sortOrder.value === 'desc' ? valB - valA : valA - valB;
    });
})

// ── 유틸 ────────────────────────────────────────────
const getPercent = (val, max) => max === 0 ? 0 : Math.round((val / max) * 100)

const getReplyPercent = (val) => {
    if (!val || val === 0) return 100
    return Math.max(10, 100 - Math.round((val / maxReply.value) * 100))
}

const formatReplyTime = (seconds) => {
    if (!seconds || seconds === 0) return '즉시'
    if (seconds < 60) return `${Math.round(seconds)}초`
    if (seconds < 3600) return `${Math.round(seconds / 60)}분`
    return `${Math.round(seconds / 3600)}시간`
}

const tetoClass = (score) => {
    if (score === null || score === undefined) return ''
    if (score >= 70) return 'score-high'
    if (score >= 40) return 'score-mid'
    return 'score-low'
}

const tetoGradient = (score) => {
    if (!score) return 'linear-gradient(90deg, #a8dadc, #5bb4c4)'
    if (score >= 70) return 'linear-gradient(90deg, #e8554e, #c41e3a)'
    if (score >= 40) return 'linear-gradient(90deg, #f0d9a8, #e8554e)'
    return 'linear-gradient(90deg, #a8dadc, #5bb4c4)'
}

const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const goToChatDetail = () => router.push(`/chat/${chatId}`)
const goToParticipantDetail = (participantId) => router.push(`/chat/${chatId}/persona-analysis/participant/${participantId}`)

// ── 차트 ────────────────────────────────────────────
const buildChartData = () => {
    const list = chartSortedParticipants.value;
    const names = list.map(p => p.name)

    const datasets = {
        count: {
            label: '대화 수',
            data: list.map(p => p.count),
            backgroundColor: '#5bb4c480',
            borderColor: '#5bb4c4',
            borderWidth: 2,
        },
        reply: {
            label: '평균 답장 시간 (초)',
            data: list.map(p => p.averageReplyTime ?? 0),
            backgroundColor: '#a8dadc80',
            borderColor: '#a8dadc',
            borderWidth: 2,
        },
        length: {
            label: '대화 길이 (자)',
            data: list.map(p => p.chatLength),
            backgroundColor: '#e8554e80',
            borderColor: '#e8554e',
            borderWidth: 2,
        },
        teto: {
            label: '테토 점수',
            data: list.map(p => p.tetoScore ?? 0),
            backgroundColor: list.map(p =>
                (p.tetoScore ?? 0) >= 70 ? '#c41e3a80'
                    : (p.tetoScore ?? 0) >= 40 ? '#e8554e80'
                        : '#a8dadc80'
            ),
            borderColor: '#c41e3a',
            borderWidth: 2,
        },
    }

    return { names, dataset: datasets[activeChart.value] }
}

async function renderChart() {
    // 탭이 차트가 아닐 때는 렌더링 시도 방지 (canvas가 없음)
    if (currentMainTab.value !== 'chart') return;

    await nextTick()
    if (!barChartRef.value) return

    if (barChartInstance) {
        barChartInstance.destroy()
    }

    const { names, dataset } = buildChartData()

    barChartInstance = new Chart(barChartRef.value, {
        type: 'bar',
        data: {
            labels: names,
            datasets: [dataset],
        },
        options: {
            indexAxis: 'y', // 가로 막대 그래프
            responsive: true,
            maintainAspectRatio: false, // 컨테이너의 높이를 채우기 위해 false
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#3a3a3a',
                    titleColor: '#fdf6e8',
                    bodyColor: '#fdf6e8',
                },
            },
            scales: {
                x: {
                    grid: { color: '#f0d9a830' },
                    ticks: { color: '#3a3a3a', font: { size: 13 } },
                    beginAtZero: true,
                },
                y: {
                    grid: { color: '#f0d9a830' },
                    ticks: { color: '#3a3a3a', font: { size: 13 } },
                },
            },
        },
    })
}

// 탭, 차트 종류, 정렬 순서가 바뀌면 다시 그리기
watch([currentMainTab, activeChart, sortOrder], renderChart)

// ── API 호출 ─────────────────────────────────────────
const fetchData = async () => {
    isLoading.value = true
    error.value = null
    try {
        await chatStore.fetchChatInfo(chatId)
        await participantStore.fetchParticipants(chatId)
    } catch (e) {
        console.error(e)
        error.value = '정보를 불러오는 데 실패하였습니다.'
    } finally {
        isLoading.value = false
    }
}

onMounted(fetchData)
</script>

<style scoped>
.list-page {
    min-height: 100vh;
    background: var(--sand-light);
    font-family: 'Pretendard', sans-serif;
}

/* ── 헤더 ── */
.page-header {
    background: linear-gradient(135deg, var(--ocean-blue), var(--sky-blue));
    padding: 20px 24px 24px;
    color: var(--white);
}

.header-inner {
    display: flex;
    align-items: center;
    gap: 16px;
    max-width: 900px;
    margin: 0 auto;
}

.back-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.35);
}

.header-title h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
}

.chat-title {
    margin: 0 0 16px;
    padding-bottom: 10px;
    font-size: 24px;
    font-weight: 700;
    color: #000000;
    border-bottom: 2px solid rgba(0, 119, 182, 0.15);
}

/* ── 컨테이너 ── */
.container {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 20px;
}

/* ── 요약 카드 ── */
.summary-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;
}

.summary-card {
    background: var(--white);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.summary-icon {
    font-size: 28px;
}

.summary-label {
    margin: 0;
    font-size: 12px;
    color: var(--text-gray);
}

.summary-value {
    margin: 2px 0 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-dark);
}

/* ── 메인 탭 ── */
.main-tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 32px;
    border-bottom: 2px solid var(--sand-dark);
    padding-bottom: 4px;
}

.main-tab {
    background: none;
    border: none;
    padding: 12px 16px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-gray);
    cursor: pointer;
    position: relative;
    transition: color 0.2s;
}

.main-tab:hover {
    color: var(--text-dark);
}

.main-tab.active {
    color: var(--ocean-blue);
}

.main-tab.active::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 100%;
    height: 4px;
    background: var(--ocean-blue);
    border-radius: 4px 4px 0 0;
}

.tab-content {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ── 섹션 ── */
.section {
    margin-bottom: 36px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 4px;
}

.section-desc {
    font-size: 13px;
    color: var(--text-gray);
    margin: 0 0 16px;
}

/* 차트 헤더 영역 (정렬 버튼 배치) */
.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.sort-btn {
    background: var(--white);
    border: 1px solid var(--sand-dark);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
    cursor: pointer;
    transition: background 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.sort-btn:hover {
    background: var(--sand-light);
}

/* ── 참여자 카드 ── */
.participant-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.participant-card {
    background: var(--white);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 2px solid transparent;
}

.participant-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    border-color: var(--sky-blue);
}

.participant-card.rank-1 {
    border-color: #ffd700;
    background: linear-gradient(135deg, #fffef0, var(--white));
}

.participant-card.rank-2 {
    border-color: #c0c0c0;
}

.participant-card.rank-3 {
    border-color: #cd7f32;
}

.rank-badge {
    font-size: 28px;
    min-width: 36px;
    text-align: center;
}

.rank-num {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-gray);
}

.avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
    color: var(--white);
    flex-shrink: 0;
}

.card-info {
    flex: 1;
}

.participant-name {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 700;
    color: var(--text-dark);
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.stat-label {
    font-size: 11px;
    color: var(--text-gray);
}

.stat-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
}

.teto-score.score-high {
    color: var(--crab-red);
}

.teto-score.score-mid {
    color: var(--crab-orange);
}

.teto-score.score-low {
    color: var(--ocean-blue);
}

.stat-bar {
    height: 4px;
    background: var(--sand);
    border-radius: 4px;
    overflow: hidden;
}

.stat-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.8s ease;
}

.card-arrow {
    font-size: 20px;
    color: var(--text-gray);
    flex-shrink: 0;
}

/* ── 차트 탭 ── */
.chart-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.chart-tab {
    padding: 8px 16px;
    border: 2px solid var(--sand-dark);
    border-radius: 20px;
    background: var(--white);
    color: var(--text-dark);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}

.chart-tab.active {
    background: var(--ocean-blue);
    border-color: var(--ocean-blue);
    color: var(--white);
    font-weight: 600;
}

.chart-wrapper {
    background: var(--white);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    /* 높이는 인라인 스타일에서 동적으로 관리됩니다. */
}

/* ── 테토 분포 ── */
.teto-distribution {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.teto-item {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.teto-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
    width: 60px;
    flex-shrink: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.teto-bar-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
}

.teto-label-left,
.teto-label-right {
    font-size: 11px;
    color: var(--text-gray);
    white-space: nowrap;
}

.teto-bidirectional-wrap {
    flex: 1;
    height: 22px;
    background: var(--sand);
    border-radius: 11px;
    display: flex;
    align-items: center;
    position: relative;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.teto-side {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
}

.left-side {
    justify-content: flex-end;
    border-radius: 11px 0 0 11px;
}

.right-side {
    justify-content: flex-start;
    border-radius: 0 11px 11px 0;
}

.teto-fill {
    height: 100%;
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.ether-fill {
    background: linear-gradient(270deg, var(--crab-orange), var(--crab-red));
    border-radius: 11px 0 0 11px;
}

.teto-fill-blue {
    background: linear-gradient(90deg, var(--sky-blue), var(--ocean-blue));
    border-radius: 0 11px 11px 0;
}

.teto-center-mark {
    width: 2px;
    height: 140%;
    background: var(--text-gray);
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    border-radius: 1px;
}

.teto-score-label {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    font-weight: 700;
    color: var(--text-dark);
    z-index: 3;
    background: rgba(255, 255, 255, 0.85);
    padding: 2px 6px;
    border-radius: 8px;
}

.left-score {
    left: 8px;
}

.right-score {
    right: 8px;
}

/* ── 반응형 ── */
@media (max-width: 600px) {
    .summary-section {
        grid-template-columns: 1fr;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>