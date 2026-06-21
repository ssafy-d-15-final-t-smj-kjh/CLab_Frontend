<template>
    <div v-if="isVisible" class="modal-overlay" @click.self="handleCancel">
        <div class="modal-container">
            <div class="modal-header">
                <h3>분석 준비 완료 🦀</h3>
            </div>

            <div class="modal-body">
                <p class="file-info">업로드된 파일 크기: <strong>{{ fileSizeKB }} KB</strong></p>
                <p class="time-info">예상 소요 시간: 약 <strong>{{ props.estimatedSeconds }}초</strong></p>
                <p class="question">분석을 시작하시겠습니까?</p>
            </div>

            <div class="modal-actions">
                <button class="btn-cancel" @click="handleCancel">취소</button>
                <button class="btn-confirm" @click="handleConfirm">시작하기</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    isVisible: {
        type: Boolean,
        default: false
    },
    fileSize: {
        type: Number,
        default: 0 // Byte 단위
    },
    estimatedSeconds: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['confirm', 'cancel'])

// 파일 크기를 KB로 변환
const fileSizeKB = computed(() => {
    return (props.fileSize / 1024).toFixed(1)
})

const handleConfirm = () => {
    emit('confirm')
}

const handleCancel = () => {
    emit('cancel')
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(58, 58, 58, 0.5);
    /* var(--text-dark) with opacity */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-container {
    background-color: var(--white);
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    text-align: center;
}

.modal-header h3 {
    color: var(--crab-red);
    margin-bottom: 16px;
    font-size: 1.5rem;
}

.modal-body {
    color: var(--text-dark);
    margin-bottom: 24px;
    line-height: 1.6;
}

.file-info,
.time-info {
    font-size: 1.1rem;
}

.question {
    margin-top: 16px;
    font-weight: bold;
    color: var(--ocean-blue);
}

.modal-actions {
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-cancel {
    background-color: var(--sand-dark);
    color: var(--text-dark);
}

.btn-cancel:hover {
    background-color: var(--sand);
}

.btn-confirm {
    background-color: var(--ocean-blue);
    color: var(--white);
}

.btn-confirm:hover {
    background-color: var(--sky-blue);
    color: var(--text-dark);
}
</style>