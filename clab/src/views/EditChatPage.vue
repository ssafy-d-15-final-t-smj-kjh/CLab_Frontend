<template>
    <div class="update-chat-page">

        <!-- 헤더 -->
        <header class="page-header">
            <button class="back-btn" @click="router.push(`/chat/detail/${chatId}`)">
                <span class="back-icon">←</span>
            </button>
            <h1 class="page-title">✏️ 대화 수정</h1>
            <div class="header-spacer"></div>
        </header>

        <div class="content-wrapper">

            <div class="section-card">
                <h2 class="section-title">
                    <span class="section-icon">📝</span>
                    대화 정보 수정
                </h2>

                <!-- 제목 -->
                <div class="form-group">
                    <label class="form-label" for="title">
                        <span class="label-icon">📌</span>
                        제목
                    </label>
                    <div class="input-wrapper">
                        <input id="title" v-model="form.title" type="text" class="form-input" placeholder="제목을 입력하세요"
                            :class="{ 'input-error': errors.title }" />
                    </div>
                    <p v-if="errors.title" class="error-text">{{ errors.title }}</p>
                </div>

                <!-- 내용 -->
                <div class="form-group">
                    <label class="form-label" for="description">
                        <span class="label-icon">📄</span>
                        내용
                    </label>
                    <textarea id="content" v-model="form.content" class="form-textarea" placeholder="내용을 입력하세요"
                        rows="6" :class="{ 'input-error': errors.content }" />
                    <p v-if="errors.content" class="error-text">{{ errors.content }}</p>
                </div>

            </div>

            <!-- 버튼 -->
            <div class="button-group">
                <button class="btn-cancel" @click="router.push(`/chat/${chatId}`)">
                    취소
                </button>
                <button class="btn-submit" :disabled="isLoading" @click="handleSubmit">
                    <span v-if="isLoading">⏳</span>
                    <span v-else>✅</span>
                    {{ isLoading ? '수정 중...' : '수정하기' }}
                </button>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import api from '@/api/axios'

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()
const { chatInfo } = storeToRefs(chatStore)

// URL 파라미터에서 chatId 추출
const chatId = route.params.id

// ── 폼 상태 ─────────────────────────────────────────────────
const isLoading = ref(false)

const form = reactive({
    title: '',
    content: ''
})

const errors = reactive({
    title: '',
    content: ''
})

// ── 기존 값 세팅 ─────────────────────────────────────────────
onMounted(() => {
    if (chatInfo.value) {
        form.title = chatInfo.value.title ?? ''
        form.content = chatInfo.value.content ?? ''
    }
})

// ── 유효성 검사 ──────────────────────────────────────────────
const validate = () => {
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

// ── 수정 제출 ────────────────────────────────────────────────
const handleSubmit = async () => {
    if (!validate()) return

    isLoading.value = true
    try {
        await api.patch(`/chat/${chatId}`, {
            "userId": chatInfo.value.userId,
            "createdAt": chatInfo.value.createdAt,
            "updatedAt": Date.now,
            "source": chatInfo.value.source,
            "title": form.title.trim(),
            "content": form.content.trim()
        })

        chatStore.fetchChatInfo(chatId);

        alert('수정이 완료되었습니다.')
        router.push(`/chat/${chatId}`)

    } catch (error) {
        console.error(error)
        const msg = error.response?.data?.message || '수정 중 오류가 발생했습니다.'
        alert(msg)
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
/* ── 페이지 ─────────────────────────────────────────────── */
.update-chat-page {
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

/* ── 폼 ─────────────────────────────────────────────────── */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
}

.form-group:last-child {
    margin-bottom: 0;
}

.form-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
    padding-left: 2px;
}

.label-icon {
    font-size: 14px;
}

.input-wrapper {
    position: relative;
}

.form-input {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid var(--sand-dark);
    border-radius: 14px;
    font-size: 14px;
    color: var(--text-dark);
    background: var(--sand-light);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.form-textarea {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid var(--sand-dark);
    border-radius: 14px;
    font-size: 14px;
    color: var(--text-dark);
    background: var(--sand-light);
    outline: none;
    resize: vertical;
    min-height: 140px;
    line-height: 1.6;
    font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.form-input::placeholder,
.form-textarea::placeholder {
    color: #bbb;
}

.form-input:focus,
.form-textarea:focus {
    border-color: var(--ocean-blue);
    background: var(--white);
    box-shadow: 0 0 0 3px rgba(91, 180, 196, 0.15);
}

.form-input.input-error,
.form-textarea.input-error {
    border-color: var(--crab-orange);
    box-shadow: 0 0 0 3px rgba(232, 85, 78, 0.1);
}

.error-text {
    font-size: 12px;
    color: var(--crab-orange);
    padding-left: 4px;
}

/* ── 버튼 ───────────────────────────────────────────────── */
.button-group {
    display: flex;
    gap: 12px;
}

.btn-cancel {
    flex: 1;
    padding: 15px;
    border: 1.5px solid var(--sand-dark);
    border-radius: 16px;
    background: var(--white);
    color: var(--text-gray);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.btn-cancel:hover {
    background: var(--sand);
    border-color: var(--ocean-blue);
    color: var(--text-dark);
}

.btn-submit {
    flex: 2;
    padding: 15px;
    border: none;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--ocean-blue), var(--sky-blue));
    color: var(--white);
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 14px rgba(91, 180, 196, 0.4);
    transition: opacity 0.2s, transform 0.1s;
}

.btn-submit:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
}

.btn-submit:active:not(:disabled) {
    transform: translateY(0);
}

.btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* ── 반응형 ─────────────────────────────────────────────── */
@media (max-width: 480px) {
    .content-wrapper {
        padding: 16px 12px 48px;
    }

    .section-card {
        padding: 18px 14px;
    }

    .button-group {
        flex-direction: column;
    }

    .btn-cancel,
    .btn-submit {
        flex: unset;
        width: 100%;
    }
}
</style>
