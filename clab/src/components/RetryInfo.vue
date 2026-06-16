<template>
    <div class="error-wrap">
        <p>{{ message || '정보를 불러오지 못했습니다.' }}</p>
        
        <button @click="emit('retry')" class="retry-btn">다시 시도</button>
    </div>
</template>

<script setup>
// 부모로부터 에러 메시지를 전달받습니다.
defineProps({
    message: {
        type: String,
        default: ''
    }
})

// 부모 컴포넌트에게 버튼 클릭 이벤트를 전달하기 위한 정의
const emit = defineEmits(['retry'])
</script>

<style scoped>
/* ── 에러 및 재시도 스타일 ── */
.error-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
}

.error-wrap p {
    color: var(--crab-orange, #e8554e);
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 16px;
}

.retry-btn {
    padding: 10px 24px;
    background: linear-gradient(135deg, var(--ocean-blue, #5bb4c4), var(--sky-blue, #7ecad6));
    color: var(--white, #ffffff);
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(91, 180, 196, 0.2);
    transition: opacity 0.2s, transform 0.1s;
}

.retry-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

.retry-btn:active {
    transform: translateY(0);
}
</style>