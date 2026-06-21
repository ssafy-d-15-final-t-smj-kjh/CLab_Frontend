<template>
    <LoadingInfo v-if="isLoading" :is-loading="isLoading" />
    <RetryInfo v-else-if="error" :message="error" @retry="fetchAll" />
    <div class="detail-page" v-else>
        <!-- 헤더 -->
        <div class="page-header">
            <div class="header-inner">
                <button class="back-btn" @click="goToList">←</button>

                <div class="avatar-wrap">
                    <div class="avatar-large" :style="{ backgroundColor: avatarColor }">
                        {{ participant?.name?.charAt(0) }}
                    </div>
                </div>

                <div class="header-info">
                    <h1 class="participant-name">{{ participant?.name }}</h1>
                    <div class="header-badges">
                        <span class="badge badge-blue">대화 {{ participant?.count }}회</span>
                        <span class="badge badge-orange">
                            테토 {{ participant?.tetoScore ?? '-' }}점
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="container">

            <!-- ── 기본 스탯 ── -->
            <div class="stats-row">
                <div class="mini-stat">
                    <span class="mini-stat-icon">💬</span>
                    <span class="mini-stat-val">{{ participant?.count }}</span>
                    <span class="mini-stat-label">대화 수</span>
                </div>
                <div class="mini-stat">
                    <span class="mini-stat-icon">⏱️</span>
                    <span class="mini-stat-val">{{ formatReplyTime(participant?.averageReplyTime) }}</span>
                    <span class="mini-stat-label">평균 답장 시간</span>
                </div>
                <div class="mini-stat">
                    <span class="mini-stat-icon">📝</span>
                    <span class="mini-stat-val">{{ participant?.chatLength }}</span>
                    <span class="mini-stat-label">총 글자 수</span>
                </div>
                <div class="mini-stat">
                    <span class="mini-stat-icon">⚡</span>
                    <span class="mini-stat-val" :class="tetoClass">{{ participant?.tetoScore ?? '-' }}</span>
                    <span class="mini-stat-label">테토 점수</span>
                </div>
            </div>

            <!-- ── 페르소나 분석 ── -->
            <div class="section card" v-if="persona">
                <h2 class="section-title">🧬 페르소나 분석</h2>

                <div class="persona-grid">
                    <div class="persona-box analysis">
                        <h3>📋 분석 요약</h3>
                        <p>{{ analysis.analysisSummary }}</p>
                    </div>
                    <div class="persona-box speech">
                        <h3>🗣️ 말투 특징</h3>
                        <p>{{ analysis.speechStyle }}</p>
                    </div>
                </div>

                <!-- 테토 게이지 -->
                <div class="teto-gauge-section">
                    <div class="teto-gauge-labels">
                        <span class="gauge-label-left">🌸 에테르형</span>
                        <span class="gauge-score">{{ analysis.tetoScore }}점</span>
                        <span class="gauge-label-right">⚡ 테토형</span>
                    </div>
                    <div class="teto-gauge-bar">
                        <div class="teto-gauge-fill" :style="{
                            width: analysis.tetoScore + '%',
                            background: tetoGradient(analysis.tetoScore)
                        }"></div>
                        <div class="gauge-marker" :style="{ left: analysis.tetoScore + '%' }"></div>
                    </div>
                    <p class="teto-desc">{{ tetoDescription(analysis.tetoScore) }}</p>
                </div>
            </div>

            <!-- ── 레이더 차트 ── -->
            <div class="section card">
                <h2 class="section-title">🕸️ 대화 성향 분석</h2>
                <p class="section-desc">6가지 대화 카테고리별 빈도</p>

                <RadarChart :participant-name="participant?.name" :labels="chartLabels" :chart-data="chartData"
                    :colors="chartColors" />

                <!-- 카테고리 범례 -->
                <div class="category-legend">
                    <div v-for="category in categories" :key="category.id" class="legend-item">
                        <span class="legend-dot" :style="{ backgroundColor: categoryColors[category.id] }"></span>
                        <span class="legend-name">{{ category.name }}</span>
                        <span class="legend-count">
                            {{ getCategoryCount(category.id) }}회
                        </span>
                        <div class="legend-bar">
                            <div class="legend-bar-fill" :style="{
                                width: getCategoryPercent(category.id) + '%',
                                backgroundColor: categoryColors[category.id] || '#aaaccc'
                            }"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ── 대화 내용 목록 ── -->
            <div class="section">
                <h2 class="section-title">💭 대화 내용</h2>
                <p class="section-desc">메시지에 마우스를 올리면 카테고리를 확인할 수 있어요</p>

                <!-- 필터 -->
                <div class="filter-row">
                    <button class="filter-btn" :class="{ active: selectedFilter === null }"
                        @click="selectedFilter = null">
                        전체
                    </button>
                    <button v-for="category in categories" :key="category.id" class="filter-btn"
                        :class="{ active: selectedFilter === category.id }" @click="selectedFilter = category.id"
                        :style="selectedFilter === category.id ? { backgroundColor: categoryColors[category.id], borderColor: categoryColors[category.id] } : {}">
                        {{ category.name }}
                    </button>
                </div>

                <div class="contents-list">
                    <div v-for="content in filteredContents" :key="content.id" class="content-item"
                        @mouseenter="hoveredContentId = content.id" @mouseleave="hoveredContentId = null">
                        <!-- 말풍선 -->
                        <div class="bubble-row">
                            <div class="bubble" :class="getBubbleClass(content)">
                                {{ content.content }}
                            </div>

                            <!-- 카테고리 오버레이 -->
                            <Transition name="overlay-fade">
                                <div v-if="hoveredContentId === content.id" class="category-overlay">
                                    <div v-for="catId in getContentCategories(content.id)" :key="catId"
                                        class="overlay-tag" :style="{ backgroundColor: categoryColors[catId] }">
                                        {{ getCategoryName(catId) }}
                                    </div>
                                    <span v-if="!getContentCategories(content.id).length" class="overlay-empty">
                                        분류 없음
                                    </span>
                                </div>
                            </Transition>
                        </div>

                        <!-- 시간 & 카테고리 칩 -->
                        <div class="content-meta">
                            <span class="content-time">{{ formatTime(content.time) }}</span>
                            <div class="category-chips">
                                <span v-for="catId in getContentCategories(content.id)" :key="catId"
                                    class="category-chip"
                                    :style="{ backgroundColor: categoryColors[catId] + '30', color: categoryColors[catId] }">
                                    {{ getCategoryName(catId) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 더 보기 -->
                <div class="load-more" v-if="hasMore">
                    <button class="load-more-btn" @click="loadMore">더 보기</button>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import { storeToRefs } from 'pinia'

import { useParticipantStore } from '@/stores/participant'
import { usePersonaStore } from '@/stores/persona'
import { useContentStore } from '@/stores/contents'
import { usePersonaAnalysisStore } from '@/stores/persona-analysis'
import { useContentCategoryStore } from '@/stores/content-category'
import { useParticipantCategoryStore } from '@/stores/participant-category'
import { useCategoryStore } from '@/stores/category'

import LoadingInfo from '@/components/LoadingInfo.vue'
import RetryInfo from '@/components/RetryInfo.vue'
import RadarChart from '@/components/RadarChart.vue'

Chart.register(...registerables)

const route = useRoute()
const router = useRouter()
const participantStore = useParticipantStore()
const personaStore = usePersonaStore()
const contentStore = useContentStore()
const personaAnalysisStore = usePersonaAnalysisStore()
const contentCategoryStore = useContentCategoryStore()
const participantCategoryStore = useParticipantCategoryStore()
const categoryStore = useCategoryStore()


const chatId = route.params.chatId
const participantId = route.params.participantId

// ── 상태 ─────────────────────────────────────────────
const isLoading = ref(false)
const error = ref(null)
const { participant } = storeToRefs(participantStore)
const { persona } = storeToRefs(personaStore)
const { contents } = storeToRefs(contentStore)
const { personaAnalysis } = storeToRefs(personaAnalysisStore)
const { contentCategories } = storeToRefs(contentCategoryStore)
const { participantCategories } = storeToRefs(participantCategoryStore)
const { categories } = storeToRefs(categoryStore)

const hoveredContentId = ref(null)
const selectedFilter = ref(null)
const pageSize = 30
const page = ref(1)

const chartLabels = computed(() => categories.value.map(c => c.name))
const chartData = computed(() => categories.value.map(c => getCategoryCount(c.id)))
const chartColors = computed(() => categories.value.map(c => categoryColors[c.id]))

const goToList = () => {
    router.push(`/chat/${chatId}/participant-list`)
}

// ── 색상 ─────────────────────────────────────────────
const avatarColor = '#5bb4c4'

// 카테고리별 색상 (id 기준)
const categoryColors = {
    1001: '#e8554e', // 감정표현도
    1002: '#c41e3a', // 확신성
    1003: '#5bb4c4', // 지시성
    1004: '#3a7d8c', // 직설성
    1005: '#a8dadc', // 공감성
    1006: '#f0b429', // 배려도
}

// ── 계산값 ──────────────────────────────────────────
const tetoClass = computed(() => {
    const s = persona.value?.teto_score
    if (s >= 70) return 'score-high'
    if (s >= 40) return 'score-mid'
    return 'score-low'
})

const pagedContents = computed(() => contents.value.slice(0, page.value * pageSize))

const filteredContents = computed(() => {
    if (!selectedFilter.value) return pagedContents.value
    return pagedContents.value.filter(c =>
        getContentCategories(c.id).includes(selectedFilter.value)
    )
})

const hasMore = computed(() => page.value * pageSize < contents.value.length)

const maxCategoryCount = computed(() => {
    if (!participantCategories.value.length) return 1
    return Math.max(...participantCategories.value.map(pc => pc.count), 1)
})

// ── 유틸 ─────────────────────────────────────────────
function formatReplyTime(seconds) {
    if (!seconds || seconds === 0) return '즉시'
    if (seconds < 60) return `${Math.round(seconds)}초`
    if (seconds < 3600) return `${Math.round(seconds / 60)}분`
    return `${Math.round(seconds / 3600)}시간`
}

function formatTime(timeStr) {
    if (!timeStr) return ''
    const d = new Date(timeStr)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function tetoGradient(score) {
    if (!score) return 'linear-gradient(90deg, #a8dadc, #5bb4c4)'
    if (score >= 70) return 'linear-gradient(90deg, #e8554e, #c41e3a)'
    if (score >= 40) return 'linear-gradient(90deg, #f0d9a8, #e8554e)'
    return 'linear-gradient(90deg, #a8dadc, #5bb4c4)'
}

function tetoDescription(score) {
    if (score >= 80) return '매우 직설적이고 주도적인 테토형 성향이 강합니다.'
    if (score >= 60) return '논리적이고 직접적인 표현을 선호하는 편입니다.'
    if (score >= 40) return '상황에 따라 직접적/공감적 표현을 균형있게 사용합니다.'
    if (score >= 20) return '공감적이고 배려하는 에테르형 성향이 나타납니다.'
    return '감성적이고 공감 중심의 대화 방식을 가집니다.'
}

function getContentCategories(contentId) {
    return contentCategories.value
        .filter(cc => cc.contentId === contentId)
        .map(cc => cc.categoryId)
}

function getCategoryCount(catId) {
    const pc = participantCategories.value.find(p => p.categoryId === catId)
    return pc?.count ?? 0
}

function getCategoryPercent(catId) {
    return Math.round((getCategoryCount(catId) / maxCategoryCount.value) * 100)
}

function getCategoryName(catId) {
    return categories.value.find(c => c.id === catId)?.name ?? ''
}

function getBubbleClass(content) {
    const cats = getContentCategories(content.id)
    if (!cats.length) return ''
    // 첫 번째 카테고리 기준으로 스타일
    return cats[0] <= 4 ? 'bubble-direct' : 'bubble-empathy'
}

function loadMore() {
    page.value++
}

// ── API 호출 ──────────────────────────────────────────
async function fetchData() {
    try {
        isLoading.value = true

        await fetchCategories()
        await fetchParticipantInfo()
        await fetchContents()
        await fetchContentCategories()
        await fetchParticipantCategories()
        await fetchAnalysis()
        await fetchPersona()

    } catch (e) {
        console.error(e)
    } finally {
        isLoading.value = false
    }
}
const fetchParticipantInfo = async () => {
    await participantStore.fetchParticipantInfo(participantId)
}
const fetchPersona = async () => {
    if (!personaAnalysis.value.personaId) return
    await personaStore.fetchPersona(personaAnalysis.value.personaId)
}
const fetchContents = async () => {
    await contentStore.fetchContents(participantId)
}
const fetchAnalysis = async () => {
    await personaAnalysisStore.fetchPersonaAnalysis(participantId)
}
const fetchContentCategories = async () => {
    if (!contents.value || contents.value.length === 0) return

    const fetchPromises = contents.value.map(content =>
        contentCategoryStore.fetchContentCategories(content.id)
    )

    await Promise.all(fetchPromises)
}
const fetchParticipantCategories = async () => {
    await participantCategoryStore.fetchParticipantCategories(participantId)
}
const fetchCategories = async () => {
    await categoryStore.fetchCategories()
}

onMounted(fetchData)
</script>

<style scoped>
.detail-page {
    min-height: 100vh;
    background: var(--sand-light);
    font-family: 'Pretendard', sans-serif;
}

/* ── 헤더 ── */
.page-header {
    background: linear-gradient(135deg, var(--crab-red), var(--crab-orange));
    padding: 20px 24px 32px;
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
    flex-shrink: 0;
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.35);
}

.avatar-wrap {
    flex-shrink: 0;
}

.avatar-large {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    color: var(--white);
    border: 3px solid rgba(255, 255, 255, 0.5);
}

.header-info {
    flex: 1;
}

.participant-name {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 700;
}

.header-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
}

.badge-blue {
    background: rgba(168, 218, 220, 0.4);
}

.badge-orange {
    background: rgba(255, 255, 255, 0.25);
}

/* ── 컨테이너 ── */
.container {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 20px;
}

/* ── 미니 스탯 ── */
.stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 24px;
}

.mini-stat {
    background: var(--white);
    border-radius: 16px;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.mini-stat-icon {
    font-size: 22px;
}

.mini-stat-val {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
}

.mini-stat-val.score-high {
    color: var(--crab-red);
}

.mini-stat-val.score-mid {
    color: var(--crab-orange);
}

.mini-stat-val.score-low {
    color: var(--ocean-blue);
}

.mini-stat-label {
    font-size: 11px;
    color: var(--text-gray);
}

/* ── 섹션 & 카드 ── */
.section {
    margin-bottom: 32px;
}

.card {
    background: var(--white);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
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

/* ── 페르소나 ── */
.persona-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
}

.persona-box {
    border-radius: 14px;
    padding: 16px;
}

.persona-box h3 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 700;
    color: var(--text-dark);
}

.persona-box p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-dark);
}

.persona-box.analysis {
    background: rgba(168, 218, 220, 0.15);
}

.persona-box.speech {
    background: rgba(232, 85, 78, 0.1);
}

/* ── 테토 게이지 ── */
.teto-gauge-section {
    margin-top: 8px;
}

.teto-gauge-labels {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.gauge-label-left,
.gauge-label-right {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-gray);
}

.gauge-score {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-dark);
}

.teto-gauge-bar {
    height: 24px;
    background: var(--sand);
    border-radius: 12px;
    overflow: visible;
    position: relative;
}

.teto-gauge-fill {
    height: 100%;
    border-radius: 12px;
    transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.gauge-marker {
    position: absolute;
    top: -4px;
    transform: translateX(-50%);
    width: 8px;
    height: 32px;
    background: var(--text-dark);
    border-radius: 4px;
    transition: left 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.teto-desc {
    margin: 10px 0 0;
    font-size: 13px;
    color: var(--text-gray);
    text-align: center;
    font-style: italic;
}

/* ── 레이더 차트 ── */
.radar-wrapper {
    max-width: 340px;
    margin: 0 auto 24px;
}

.category-legend {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.legend-item {
    display: grid;
    grid-template-columns: 12px 80px 36px 1fr;
    align-items: center;
    gap: 10px;
}

.legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
}

.legend-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
}

.legend-count {
    font-size: 13px;
    color: var(--text-gray);
    text-align: right;
}

.legend-bar {
    width: 100%;
    /* 부모 컨테이너 너비를 꽉 채우도록 */
    height: 8px;
    /* 게이지 바의 두께 (원하는 크기로 조절) */
    background-color: #e0e0e0;
    /* 게이지의 배경색 (빈 영역) */
    border-radius: 4px;
    /* 둥근 모서리 */
    overflow: hidden;
    /* 자식이 부모 밖으로 삐져나가지 않도록 */
    margin-top: 4px;
}

.legend-bar-fill {
    height: 100%;
    /* 부모(.legend-bar)의 높이를 그대로 상속 */
    min-height: 8px;
    /* 안전하게 최소 높이를 강제 부여해 보세요 */
    border-radius: 4px;
    transition: width 0.3s ease-in-out;
    /* 너비가 바뀔 때 부드럽게 차오르는 애니메이션 */
}

/* .legend-bar {
    height: 6px;
    background: var(--sand);
    border-radius: 4px;
    overflow: hidden;
}

.legend-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.8s ease;
} */

/* ── 필터 ── */
.filter-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
}

.filter-btn {
    padding: 6px 14px;
    border: 2px solid var(--sand-dark);
    border-radius: 16px;
    background: var(--white);
    color: var(--text-dark);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-btn.active {
    color: var(--white);
    font-weight: 600;
    border-color: transparent;
    background: var(--ocean-blue);
}

/* ── 대화 내용 ── */
.contents-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.content-item {
    position: relative;
}

.bubble-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    position: relative;
}

.bubble {
    background: var(--white);
    border: 2px solid var(--sand-dark);
    border-radius: 18px 18px 18px 4px;
    padding: 12px 16px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-dark);
    max-width: 80%;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
    transition: border-color 0.2s, box-shadow 0.2s;
    cursor: default;
}

.bubble:hover {
    border-color: var(--sky-blue);
    box-shadow: 0 3px 12px rgba(91, 180, 196, 0.2);
}

.bubble.bubble-direct {
    border-color: rgba(232, 85, 78, 0.3);
}

.bubble.bubble-empathy {
    border-color: rgba(168, 218, 220, 0.5);
}

/* ── 카테고리 오버레이 ── */
.category-overlay {
    position: absolute;
    left: calc(80% + 12px);
    top: 50%;
    transform: translateY(-50%);
    background: var(--text-dark);
    border-radius: 12px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 100;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    min-width: 100px;
    white-space: nowrap;
}

.category-overlay::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-right-color: var(--text-dark);
}

.overlay-tag {
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--white);
    text-align: center;
}

.overlay-empty {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
}

/* 오버레이 트랜지션 */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
    opacity: 0;
    transform: translateY(-50%) translateX(-8px);
}

/* ── 메타 ── */
.content-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 5px;
    padding-left: 8px;
}

.content-time {
    font-size: 11px;
    color: var(--text-gray);
}

.category-chips {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.category-chip {
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
}

/* ── 더 보기 ── */
.load-more {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.load-more-btn {
    padding: 12px 32px;
    background: var(--ocean-blue);
    color: var(--white);
    border: none;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
}

.load-more-btn:hover {
    background: var(--crab-orange);
    transform: translateY(-2px);
}

/* ── 로딩 ── */
.loading-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 16px;
}

.loading-crab {
    font-size: 48px;
    animation: bounce 1s infinite;
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-12px);
    }
}

/* ── 반응형 ── */
@media (max-width: 600px) {
    .stats-row {
        grid-template-columns: repeat(2, 1fr);
    }

    .persona-grid {
        grid-template-columns: 1fr;
    }

    .category-overlay {
        left: 8px;
        top: auto;
        bottom: calc(100% + 8px);
        transform: none;
    }

    .category-overlay::before {
        display: none;
    }

    .bubble {
        max-width: 90%;
    }
}
</style>
