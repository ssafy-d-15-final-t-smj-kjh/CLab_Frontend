<template>
    <div class="upload-page">

        <!-- 헤더 -->
        <header class="page-header">
            <button class="back-btn" @click="router.push('/chat-list')">
                <span>←</span>
            </button>
            <h1 class="page-title">대화 업로드하기</h1>
            <div class="header-spacer"></div>
        </header>

        <div class="content-wrapper">

            <!-- 페이지 설명 -->
            <div class="page-desc">
                <span class="desc-icon">🦀</span>
                <div>
                    <p class="desc-title">어떤 대화를 분석할까요?</p>
                    <p class="desc-sub">파일을 업로드하고 분석 유형을 선택해주세요!</p>
                </div>
            </div>

            <div class="main-grid">

                <!-- ── 왼쪽 : 파일 업로드 ── -->
                <div class="left-section">
                    <div class="section-card">
                        <h2 class="section-title">
                            <span class="section-icon">📂</span>
                            채팅 파일 업로드
                        </h2>

                        <!-- 드래그앤드롭 영역 -->
                        <div class="drop-zone" :class="{
                            'drop-zone--active': isDragging,
                            'drop-zone--uploaded': uploadedFile
                        }" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
                            @drop.prevent="handleDrop" @click="triggerFileInput">
                            <input ref="fileInput" type="file" accept=".txt,.csv" class="file-input-hidden"
                                @change="handleFileChange" />

                            <template v-if="!uploadedFile">
                                <div class="drop-icon">🏖️</div>
                                <p class="drop-title">채팅 로그를 모래사장에 던져주세요!</p>
                                <p class="drop-sub">또는 클릭해서 파일을 선택해주세요</p>
                                <div class="drop-badge">
                                    <span>.txt</span>
                                    <span>.csv</span>
                                </div>
                            </template>

                            <template v-else>
                                <div class="drop-icon">✅</div>
                                <p class="drop-title">파일이 업로드되었어요!</p>
                                <p class="drop-sub">다시 클릭하면 교체할 수 있어요</p>
                            </template>
                        </div>

                        <!-- 파일 미리보기 -->
                        <transition name="fade">
                            <div v-if="uploadedFile" class="file-preview">
                                <div class="file-preview-inner">
                                    <span class="file-icon">📄</span>
                                    <div class="file-info">
                                        <p class="file-name">{{ uploadedFile.name }}</p>
                                        <p class="file-size">{{ formatFileSize(uploadedFile.size) }}</p>
                                        <span class="time-badge"> | ⏱️ 예상 분석 시간: {{ formattedAnticipatedTime }}</span>
                                    </div>
                                    <button class="file-remove-btn" @click.stop="removeFile">✕</button>
                                </div>
                            </div>
                        </transition>

                    </div>
                </div>

                <!-- ── 오른쪽 : 분석 유형 ── -->
                <div class="right-section">
                    <div class="section-card">
                        <h2 class="section-title">
                            <span class="section-icon">🔍</span>
                            분석 유형 선택
                        </h2>

                        <div class="category-list">

                            <!-- 성격 분석 (활성화) -->
                            <button class="category-btn"
                                :class="{ 'category-btn--active': selectedCategory === 'personality' }"
                                @click="selectedCategory = 'personality'">
                                <span class="category-emoji">🧠</span>
                                <div class="category-text">
                                    <p class="category-name">성격 분석</p>
                                    <p class="category-desc">대화 패턴으로 성격을 분석해요</p>
                                </div>
                                <span v-if="selectedCategory === 'personality'" class="category-check">✓</span>
                            </button>

                            <!-- 에겐 테토 경쟁 (비활성화) -->
                            <button class="category-btn category-btn--disabled" disabled>
                                <span class="category-emoji">⚔️</span>
                                <div class="category-text">
                                    <p class="category-name">에겐 테토 경쟁</p>
                                    <p class="category-desc category-wip">🚧 개발 진행중</p>
                                </div>
                            </button>

                            <!-- 회의 정리 및 분석 (비활성화) -->
                            <button class="category-btn category-btn--disabled" disabled>
                                <span class="category-emoji">📊</span>
                                <div class="category-text">
                                    <p class="category-name">회의 정리 및 분석</p>
                                    <p class="category-desc category-wip">🚧 개발 진행중</p>
                                </div>
                            </button>

                            <!-- 싸움 해결 조언 (비활성화) -->
                            <button class="category-btn category-btn--disabled" disabled>
                                <span class="category-emoji">🕊️</span>
                                <div class="category-text">
                                    <p class="category-name">싸움 해결 조언</p>
                                    <p class="category-desc category-wip">🚧 개발 진행중</p>
                                </div>
                            </button>

                        </div>
                    </div>


                </div>
            </div>
            <div class="section-card">
                <h2 class="section-title">
                    <span class="section-icon">✍️</span>
                    대화 정보 입력
                </h2>

                <div class="form-group">
                    <label class="form-label" for="title">대화 제목</label>
                    <div class="input-wrapper">
                        <input id="title" v-model="form.title" type="text" class="form-input"
                            placeholder="분석할 대화의 제목을 입력하세요" :class="{ 'input-error': errors.title }" />
                    </div>
                    <p v-if="errors.title" class="error-text">{{ errors.title }}</p>
                </div>

                <div class="form-group" style="margin-top: 16px;">
                    <label class="form-label" for="content">설명 또는 메모</label>
                    <textarea id="content" v-model="form.content" class="form-textarea"
                        placeholder="이 대화에 대한 간단한 설명이나 메모를 입력하세요" rows="5"
                        :class="{ 'input-error': errors.content }"></textarea>
                    <p v-if="errors.content" class="error-text">{{ errors.content }}</p>
                </div>
            </div>

            <!-- 분석하기 버튼 -->
            <button class="btn-analyze" :disabled="!canSubmit" @click="requestSubmit">
                <span>🔬</span>
                분석하기
            </button>
        </div>

        <AnticipatedTimeModal :isVisible="showTimeModal"
        :fileSize="uploadedFile?.size || 0"
        :estimated-seconds = "estimatedSeconds"
        @confirm="executeUpload"
        @cancel="showTimeModal = false" />

        <AnalysisLoading :is-loading="isLoading" :file-size="uploadedFile?.size" :estimated-seconds="estimatedSeconds"/>

    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

import AnticipatedTimeModal from '@/components/AnticipatedTimeModal.vue'
import AnalysisLoading from '@/components/AnalysisLoading.vue'
import { chatApi } from '@/api/restApi'

const router = useRouter()
const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)

// ── 상태 ────────────────────────────────────────────────────
const fileInput = ref(null)
const uploadedFile = ref(null)
const fileContent = ref('')
const isDragging = ref(false)
const selectedCategory = ref('personality')   // 기본값 : 성격 분석
const showTimeModal = ref(false)
const isLoading = ref(false)

// ✨ [신규] 제목 및 내용 폼 상태 추가 ───────────────────────────
const form = reactive({
    title: '',
    content: ''
})

const errors = reactive({
    title: '',
    content: ''
})

// ── 분석하기 버튼 활성 조건 ──────────────────────────────────
const canSubmit = computed(() =>
    uploadedFile.value &&
    selectedCategory.value &&
    form.title.trim() &&
    form.content.trim()
)

const estimatedSeconds = computed(() => {
    if (!uploadedFile.value) return 0
    const kb = uploadedFile.value.size / 1024
    return Math.ceil((kb * 5) + 10) // 1KB당 5초 + 기본 10초
})

const formattedAnticipatedTime = computed(() => {
    const seconds = estimatedSeconds.value
    if (seconds === 0) return ''
    if (seconds < 60) return `약 ${seconds}초`
    
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return s === 0 ? `약 ${m}분` : `약 ${m}분 ${s}초`
})

// ── 유효성 검사 함수 추가 ──────────────────────────────────────
const validateForm = () => {
    errors.title = ''
    errors.content = ''
    let isValid = true

    if (!form.title.trim()) {
        errors.title = '제목을 입력해주세요.'
        isValid = false
    } else if (form.title.trim().length < 2) {
        errors.title = '제목은 2자 이상 입력해주세요.'
        isValid = false
    }

    if (!form.content.trim()) {
        errors.content = '내용을 입력해주세요.'
        isValid = false
    }

    return isValid
}

// ── 파일 입력 트리거 ─────────────────────────────────────────
const triggerFileInput = () => fileInput.value.click()

// ── 파일 용량 포맷 ───────────────────────────────────────────
const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── 파일 읽기 ────────────────────────────────────────────────
const handleFile = (file) => {
    if (!file) return
    const extOk = file.name.endsWith('.txt') || file.name.endsWith('.csv')

    if (!extOk) {
        alert('txt 또는 csv 파일만 업로드할 수 있어요!')
        return
    }

    uploadedFile.value = file

    // 💡 편리함을 위해 파일을 올렸을 때 제목 칸이 비어있다면 파일명으로 자동 세팅해줍니다.
    if (!form.title.trim()) {
        form.title = file.name.replace(/\.[^/.]+$/, "") // 확장자 제거한 파일명
    }
}

// ── 파일 선택 ────────────────────────────────────────────────
const handleFileChange = (e) => {
    handleFile(e.target.files[0])
}

// ── 드래그앤드롭 ─────────────────────────────────────────────
const handleDrop = (e) => {
    isDragging.value = false
    handleFile(e.dataTransfer.files[0])
}

// ── 파일 제거 ────────────────────────────────────────────────
const removeFile = () => {
    uploadedFile.value = null
    fileContent.value = ''
    if (fileInput.value) fileInput.value.value = ''
}

// ── 제출 ────────────────────────────────────────────────────
const requestSubmit = () => {
    if (!canSubmit.value || !validateForm()) return

    if (!uploadedFile.value) {
        alert('파일을 선택해주세요.')
        return
    }

    showTimeModal.value = true
}

const executeUpload = async () => {
    showTimeModal.value = false
    isLoading.value = true

    try {
        const formData = new FormData()

        formData.append('file', uploadedFile.value)

        const chatDto = {
            userId: userInfo.value?.id ?? 0,
            title: form.title.trim(),
            content: form.content.trim()
        }

        const jsonBlob = new Blob([JSON.stringify(chatDto)], { type: 'application/json' })
        formData.append('dto', jsonBlob)

        const response = await chatApi.uploadChat(formData)
        const apiResponse = response.data
        const chatId = apiResponse.data.id

        alert('업로드가 완료되었습니다! 분석 결과를 확인해보세요 🦀')
        router.push(`/chat-detail/${chatId}`)

    } catch (error) {
        console.error(error)
        const msg = error.response?.data?.message || '업로드 중 오류가 발생했습니다.'
        alert(msg)
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
/* ── 페이지 ─────────────────────────────────────────────── */
.upload-page {
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
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.back-btn:hover {
    background: var(--sand-dark);
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
    max-width: 900px;
    margin: 0 auto;
    padding: 28px 20px 60px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* ── 페이지 설명 ────────────────────────────────────────── */
.page-desc {
    display: flex;
    align-items: center;
    gap: 14px;
    background: linear-gradient(135deg, var(--ocean-blue), var(--sky-blue));
    padding: 18px 22px;
    border-radius: 18px;
    color: var(--white);
    box-shadow: 0 4px 14px rgba(91, 180, 196, 0.3);
}

.desc-icon {
    font-size: 36px;
    line-height: 1;
}

.desc-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 4px;
}

.desc-sub {
    font-size: 13px;
    opacity: 0.85;
}

/* ── 그리드 ─────────────────────────────────────────────── */
.main-grid {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 20px;
    align-items: start;
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
    margin-bottom: 20px;
    border-bottom: 1px solid var(--sand);
}

.section-icon {
    font-size: 18px;
}

/* ── 드롭존 ─────────────────────────────────────────────── */
.drop-zone {
    border: 2.5px dashed var(--sand-dark);
    border-radius: 18px;
    background: var(--sand-light);
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 220px;
    text-align: center;
}

.drop-zone:hover,
.drop-zone--active {
    border-color: var(--ocean-blue);
    background: rgba(168, 218, 220, 0.12);
}

.drop-zone--uploaded {
    border-color: var(--ocean-blue);
    border-style: solid;
    background: rgba(168, 218, 220, 0.1);
}

.file-input-hidden {
    display: none;
}

.drop-icon {
    font-size: 48px;
}

.drop-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-dark);
}

.drop-sub {
    font-size: 12px;
    color: var(--text-gray);
}

.drop-badge {
    display: flex;
    gap: 8px;
    margin-top: 4px;
}

.drop-badge span {
    background: var(--sand);
    color: var(--ocean-blue);
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    border: 1px solid var(--sand-dark);
}

/* ── 파일 미리보기 ──────────────────────────────────────── */
.file-preview {
    margin-top: 12px;
}

.file-preview-inner {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--sand);
    border-radius: 12px;
    padding: 10px 14px;
    border: 1px solid var(--sand-dark);
}

.file-icon {
    font-size: 22px;
    flex-shrink: 0;
}

.file-info {
    flex: 1;
    overflow: hidden;
}

.file-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-size {
    font-size: 11px;
    color: var(--text-gray);
    margin-top: 2px;
}

.file-remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-gray);
    font-size: 14px;
    padding: 4px;
    border-radius: 50%;
    transition: background 0.2s, color 0.2s;
    flex-shrink: 0;
}

.file-remove-btn:hover {
    background: var(--crab-orange);
    color: var(--white);
}

/* ── 카테고리 버튼 ──────────────────────────────────────── */
.category-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.category-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 14px 16px;
    border: 1.5px solid var(--sand-dark);
    border-radius: 14px;
    background: var(--sand-light);
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    position: relative;
}

.category-btn:hover:not(:disabled) {
    border-color: var(--ocean-blue);
    background: rgba(168, 218, 220, 0.12);
}

.category-btn--active {
    border-color: var(--ocean-blue) !important;
    background: rgba(168, 218, 220, 0.2) !important;
    box-shadow: 0 0 0 3px rgba(91, 180, 196, 0.15);
}

.category-btn--disabled {
    opacity: 0.45;
    cursor: not-allowed;
    background: var(--sand);
}

.category-emoji {
    font-size: 24px;
    flex-shrink: 0;
}

.category-text {
    flex: 1;
}

.category-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-dark);
}

.category-desc {
    font-size: 11px;
    color: var(--text-gray);
    margin-top: 2px;
}

.category-wip {
    color: var(--crab-orange) !important;
    font-weight: 600;
}

.category-check {
    position: absolute;
    right: 14px;
    width: 22px;
    height: 22px;
    background: var(--ocean-blue);
    color: var(--white);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
}

.form-input {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid var(--sand-dark, #ccc);
    border-radius: 14px;
    font-size: 14px;
    color: var(--text-dark, #333);
    background: var(--sand-light, #f9f9f9);
    outline: none;
    resize: none;
    /* 크기조절 바 비활성화 */
    font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.form-input::placeholder {
    color: #bbb;
}

.form-input:focus {
    border-color: var(--ocean-blue, #5bb4c4);
    background: var(--white, #fff);
    box-shadow: 0 0 0 3px rgba(91, 180, 196, 0.15);
}

.form-textarea {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid var(--sand-dark, #ccc);
    border-radius: 14px;
    font-size: 14px;
    color: var(--text-dark, #333);
    background: var(--sand-light, #f9f9f9);
    outline: none;
    resize: none;
    /* 크기조절 바 비활성화 */
    font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.form-textarea::placeholder {
    color: #bbb;
}

.form-textarea:focus {
    border-color: var(--ocean-blue, #5bb4c4);
    background: var(--white, #fff);
    box-shadow: 0 0 0 3px rgba(91, 180, 196, 0.15);
}

.form-textarea.input-error {
    border-color: var(--crab-orange, #e8554e);
    box-shadow: 0 0 0 3px rgba(232, 85, 78, 0.1);
}

/* ── 분석하기 버튼 ──────────────────────────────────────── */
.btn-analyze {
    width: 100%;
    padding: 18px;
    border: none;
    border-radius: 18px;
    background: linear-gradient(135deg, var(--ocean-blue), var(--sky-blue));
    color: var(--white);
    font-size: 17px;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow: 0 6px 18px rgba(91, 180, 196, 0.4);
    transition: opacity 0.2s, transform 0.15s;
    letter-spacing: -0.3px;
}

.btn-analyze:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-2px);
}

.btn-analyze:active:not(:disabled) {
    transform: translateY(0);
}

.btn-analyze:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
}

/* ── 로딩 오버레이 ──────────────────────────────────────── */
.loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(253, 246, 232, 0.92);
    backdrop-filter: blur(6px);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 48px 40px;
    background: var(--white);
    border-radius: 28px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
    border: 2px solid var(--sand);
}

.crab-wrap {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--ocean-blue), var(--sky-blue));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.crab-icon {
    font-size: 40px;
    animation: crab-bounce 0.6s infinite alternate;
}

@keyframes crab-bounce {
    from {
        transform: translateY(0) rotate(-10deg);
    }

    to {
        transform: translateY(-8px) rotate(10deg);
    }
}

.loading-title {
    font-size: 18px;
    font-weight: 800;
    color: var(--text-dark);
}

.loading-sub {
    font-size: 14px;
    color: var(--text-gray);
}

/* 점 애니메이션 */
.loading-dots {
    display: flex;
    gap: 8px;
}

.loading-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--ocean-blue);
    animation: dot-pulse 1.2s infinite ease-in-out;
}

.loading-dots span:nth-child(2) {
    animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes dot-pulse {

    0%,
    100% {
        transform: scale(0.8);
        opacity: 0.4;
    }

    50% {
        transform: scale(1.3);
        opacity: 1;
    }
}
</style>
