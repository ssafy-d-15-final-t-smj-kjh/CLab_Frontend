<template>
    <div class="page-container">
        <LoadingInfo v-if="isLoading" :is-loading="isLoading"/>
        <RetryInfo v-else-if="error" :message="error" @retry="fetchUserInfo"/>

        <div class="edit-profile-page" v-else>
            <header class="page-header">
                <button class="back-btn" @click="router.push('/my-info')">
                    <span class="back-icon">←</span>
                </button>
                <h1 class="page-title">내 정보 수정</h1>
                <div class="header-spacer"></div>
            </header>

            <div class="content-wrapper">
                <div class="section-card">
                    
                    <div class="form-section">
                        <h2 class="section-title">
                            <span class="section-icon">🖼️</span>
                            프로필 이미지
                        </h2>
                        <div class="image-upload-area">
                            <div class="image-preview-wrapper" @click="triggerFileInput">
                                <img v-if="previewImage" :src="previewImage" alt="프로필 이미지" class="profile-preview" />
                                <img v-else src="https://api.dicebear.com/7.x/fun-emoji/svg?seed=crab" alt="avatar" />
                                <div class="image-overlay">
                                    <span class="camera-icon">📷</span>
                                </div>
                            </div>
                            <input ref="fileInput" type="file" accept="image/*" class="file-input-hidden" @change="handleImageChange" />
                            <p class="image-hint">클릭하여 이미지를 변경하세요</p>
                            
                            <div class="image-actions" style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                                <button 
                                    v-if="previewImage" 
                                    type="button" 
                                    class="btn-submit" 
                                    style="padding: 8px 16px; font-size: 14px;" 
                                    @click="submitImageUpdate"
                                    :disabled="!selectedFile"
                                    :style="{ opacity: !selectedFile ? 0.5 : 1, cursor: !selectedFile ? 'not-allowed' : 'pointer' }"
                                >
                                    이미지 업로드
                                </button>
                                <button v-if="previewImage" type="button" class="remove-image-btn" @click="removeImage">
                                    이미지 제거
                                </button>
                            </div>
                        </div>
                    </div>

                    <hr class="divider" />

                    <form @submit.prevent="submitInfoUpdate">
                        <div class="form-section">
                            <h2 class="section-title">
                                <span class="section-icon">👤</span>
                                사용자 이름
                            </h2>
                            <div class="form-group">
                                <div class="input-wrapper">
                                    <span class="input-icon">🐚</span>
                                    <input id="username" v-model="form.username" type="text" class="form-input"
                                        placeholder="사용자 이름을 입력하세요" :class="{ 'input-error': formErrors.username }" />
                                </div>
                                <p v-if="formErrors.username" class="error-text">
                                    {{ formErrors.username }}
                                </p>
                            </div>
                        </div>

                        <div class="form-section">
                            <h2 class="section-title">
                                <span class="section-icon">☎️</span>
                                전화번호
                            </h2>
                            <div class="form-group">
                                <div class="input-wrapper">
                                    <span class="input-icon">📱</span>
                                    <input id="phoneNumber" v-model="form.phoneNumber" type="text" class="form-input"
                                        placeholder="전화번호를 입력하세요 (예: 010-1234-5678)" :class="{ 'input-error': formErrors.phoneNumber }" />
                                </div>
                                <p v-if="formErrors.phoneNumber" class="error-text">
                                    {{ formErrors.phoneNumber }}
                                </p>
                            </div>
                        </div>

                        <div class="card-footer">
                            <button type="submit" class="btn-submit">💾 정보 수정하기</button>
                        </div>
                    </form>

                    <hr class="divider" />

                    <div class="form-section">
                        <h2 class="section-title">
                            <span class="section-icon">🔐</span>
                            비밀번호 변경
                        </h2>
                        <button type="button" class="btn-submit" @click="showChangePassword = true">
                            비밀번호 변경하기
                        </button>
                    </div>
                    <div class="card-footer">
                    </div>
                <ChangePassword v-if="showChangePassword" @close="showChangePassword = false" />
            </div>
        </div>
    </div>
</div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { memberApi } from '@/api/restApi'

import LoadingInfo from '@/components/LoadingInfo.vue'
import RetryInfo from '@/components/RetryInfo.vue'
import ChangePassword from '@/components/ChangePassword.vue'

const router = useRouter()
const authStore = useAuthStore();
const { userInfo } = storeToRefs(authStore);

const isLoading = ref(false)
const error = ref(null)

const showChangePassword = ref(false)

// ════════════════════════════════════════════════════════════
// 통합 폼 상태 관리
// ════════════════════════════════════════════════════════════
const form = reactive({
    username: '',
    phoneNumber: '',
})

const formErrors = reactive({
    username: '',
    phoneNumber: '',
})

const validateForm = () => {
    // 에러 초기화
    Object.keys(formErrors).forEach(key => formErrors[key] = '')
    let isValid = true

    if (!form.username.trim()) {
        formErrors.username = '사용자 이름을 입력해주세요.'
        isValid = false
    } else if (form.username.trim().length < 2) {
        formErrors.username = '사용자 이름은 2자 이상이어야 합니다.'
        isValid = false
    }
    return isValid
}

const submitInfoUpdate = async () => {
    if (!validateForm()) return

    isLoading.value = true

    try {
        const formData = new FormData();
        const dto = {
            username: form.username,
            phoneNumber: form.phoneNumber,
        };
        formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));

        await memberApi.updateMember(formData)
        await authStore.fetchUserInfo()

        alert('회원 정보가 성공적으로 수정되었습니다.')
        router.push('/my-info')
    } catch (error) {
        console.log('EditProfilePage.vue - submitInfoUpdate :', error)
        const msg = error.response?.data?.message || '정보 수정 중 오류가 발생했습니다.'
        alert(msg)
    } finally {
        isLoading.value = false
    }
};

// ════════════════════════════════════════════════════════════
// 이미지 처리
// ════════════════════════════════════════════════════════════
const fileInput = ref(null)
const previewImage = ref(null)
const selectedFile = ref(null)

const triggerFileInput = () => fileInput.value.click()

const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.')
        return
    }

    selectedFile.value = file

    const reader = new FileReader()
    reader.onload = (e) => {
        previewImage.value = e.target.result
        form.image = e.target.result // Base64 데이터를 form.image에 저장
    }
    reader.readAsDataURL(file)
}

const removeImage = () => {
    previewImage.value = null
    form.image = null
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = ''
}

const submitImageUpdate = async () => {
    if (!selectedFile.value) {
        alert('변경할 이미지를 선택해주세요.');
        return;
    }

    isLoading.value = true;
    try {
        const formData = new FormData();

        formData.append('image', selectedFile.value);

        await memberApi.updateMember(formData); 
        await authStore.fetchUserInfo();

        alert('프로필 이미지가 성공적으로 수정되었습니다.');
        selectedFile.value = null;
    } catch (error) {
        console.log('EditProfilePage.vue - submitImageUpdate :', error);
        const msg = error.response?.data?.message || '이미지 수정 중 오류가 발생했습니다.';
        alert(msg);
    } finally {
        isLoading.value = false;
    }
};



// ════════════════════════════════════════════════════════════
// 데이터 초기화
// ════════════════════════════════════════════════════════════
const fetchUserInfo = async() => {
    isLoading.value = true
    error.value = null
    try {
        await authStore.fetchUserInfo()
    } catch (e) {
        error.value = '사용자 정보를 불러오지 못했습니다.'
        console.error(e)
    } finally {
        isLoading.value = false
    }
}

// userInfo가 변경되거나 초기화될 때 폼에 데이터 바인딩
watch(
    userInfo,
    (newInfo) => {
        if (newInfo) {
            form.username = newInfo.username || ''
            form.phoneNumber = newInfo.phoneNumber || ''
            form.image = newInfo.image || null
            previewImage.value = newInfo.image || null
        }
    },
    { immediate: true }
)

onMounted(() => {
    if (!userInfo.value) {
        fetchUserInfo()
    }
})
</script>

<style scoped>
.edit-profile-page {
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
    max-width: 480px;
    margin: 0 auto;
    padding: 24px 16px 60px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.divider {
    border: 0;
    height: 1px;
    background: #e0e0e0;
    margin: 30px 0;
}
.form-section {
    margin-bottom: 20px;
}

/* ── 섹션 카드 ──────────────────────────────────────────── */

.section-desc {
    font-size: 0.9em;
    color: #666;
    margin-bottom: 15px;
}

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

/* ── 카드 하단 버튼 영역 ─────────────────────────────────── */
.card-footer {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--sand);
    display: flex;
    justify-content: flex-end;
}

/* ── 이미지 업로드 ──────────────────────────────────────── */
.image-upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.image-preview-wrapper {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    border: 3px solid var(--sand-dark);
    transition: border-color 0.2s, transform 0.2s;
}

.image-preview-wrapper:hover {
    border-color: var(--ocean-blue);
    transform: scale(1.03);
}

.profile-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-placeholder {
    width: 100%;
    height: 100%;
    background: var(--sand);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.placeholder-icon {
    font-size: 36px;
}

.placeholder-text {
    font-size: 11px;
    color: var(--text-gray);
    font-weight: 500;
}

.image-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
}

.image-preview-wrapper:hover .image-overlay {
    opacity: 1;
}

.camera-icon {
    font-size: 28px;
}

.file-input-hidden {
    display: none;
}

.image-hint {
    font-size: 12px;
    color: var(--text-gray);
}

.remove-image-btn {
    background: none;
    border: 1.5px solid var(--crab-orange);
    color: var(--crab-orange);
    font-size: 12px;
    padding: 6px 16px;
    border-radius: 20px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
}

.remove-image-btn:hover {
    background: var(--crab-orange);
    color: var(--white);
}

/* ── 폼 그룹 ────────────────────────────────────────────── */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
}

.form-group:last-of-type {
    margin-bottom: 0;
}

.form-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
    padding-left: 4px;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 14px;
    font-size: 16px;
    pointer-events: none;
}

.form-input {
    width: 100%;
    padding: 13px 44px;
    border: 1.5px solid var(--sand-dark);
    border-radius: 14px;
    font-size: 14px;
    color: var(--text-dark);
    background: var(--sand-light);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.form-input::placeholder {
    color: #bbb;
}

.form-input:focus {
    border-color: var(--ocean-blue);
    background: var(--white);
    box-shadow: 0 0 0 3px rgba(91, 180, 196, 0.15);
}

.form-input.input-error {
    border-color: var(--crab-orange);
    box-shadow: 0 0 0 3px rgba(232, 85, 78, 0.1);
}

.toggle-password {
    position: absolute;
    right: 14px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
}

.error-text {
    font-size: 12px;
    color: var(--crab-orange);
    padding-left: 4px;
}

.match-text {
    font-size: 12px;
    color: var(--ocean-blue);
    padding-left: 4px;
    font-weight: 600;
}

/* ── 제출 버튼 ──────────────────────────────────────────── */
.btn-submit {
    padding: 12px 24px;
    border: none;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--ocean-blue), var(--sky-blue));
    color: var(--white);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: opacity 0.2s, transform 0.1s;
    box-shadow: 0 4px 12px rgba(91, 180, 196, 0.35);
}

.btn-submit:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
}

.btn-submit:active:not(:disabled) {
    transform: translateY(0);
}

.btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ── 반응형 ─────────────────────────────────────────────── */
@media (max-width: 480px) {
    .content-wrapper {
        padding: 16px 12px 48px;
    }

    .section-card {
        padding: 20px 16px;
    }

    .page-title {
        font-size: 16px;
    }
}
</style>