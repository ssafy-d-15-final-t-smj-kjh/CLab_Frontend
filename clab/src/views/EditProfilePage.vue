<template>
    <div class="page-container">

        <LoadingInfo v-if="isLoading" :is-loading="isLoading"/>
        <RetryInfo v-else-if="error" :message="error" @retry="fetchUserInfo"/>

        <div class="edit-profile-page">
            <!-- Header -->
            <header class="page-header">
                <button class="back-btn" @click="router.push('/my-info')">
                    <span class="back-icon">←</span>
                </button>
                <h1 class="page-title">내 정보 수정</h1>
                <div class="header-spacer"></div>
            </header>

            <div class="content-wrapper">

                <!-- ① 프로필 이미지 -->
                <div class="section-card">
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
                        <input ref="fileInput" type="file" accept="image/*" class="file-input-hidden"
                            @change="handleImageChange" />
                        <p class="image-hint">클릭하여 이미지를 변경하세요</p>
                        <button v-if="previewImage" type="button" class="remove-image-btn" @click="removeImage">
                            이미지 제거
                        </button>
                    </div>
                    <div class="card-footer">
                        <button type="button" class="btn-submit" :disabled="imageLoading || !imageChanged"
                            @click="submitImage">
                            <span v-if="imageLoading">⏳</span>
                            <span v-else>💾</span>
                            {{ imageLoading ? '저장 중...' : '이미지 저장' }}
                        </button>
                    </div>
                </div>

                <!-- ② 사용자 이름 변경 -->
                <div class="section-card">
                    <h2 class="section-title">
                        <span class="section-icon">👤</span>
                        사용자 이름 변경
                    </h2>
                    <div class="form-group">
                        <label class="form-label" for="username">사용자 이름</label>
                        <div class="input-wrapper">
                            <span class="input-icon">🐚</span>
                            <input id="username" v-model="usernameForm.username" type="text" class="form-input"
                                placeholder="새 사용자 이름을 입력하세요" :class="{ 'input-error': usernameErrors.username }" />
                        </div>
                        <p v-if="usernameErrors.error" class="error-text">
                            {{ usernameErrors.error }}
                        </p>
                    </div>
                    <div class="card-footer">
                        <button type="button" class="btn-submit" :disabled="usernameLoading" @click="submitUsername">
                            <span v-if="usernameLoading">⏳</span>
                            <span v-else>✅</span>
                            {{ usernameLoading ? '변경 중...' : '이름 변경' }}
                        </button>
                    </div>
                </div>

                <!-- ③ 비밀번호 변경 -->
                <div class="section-card">
                    <h2 class="section-title">
                        <span class="section-icon">🔐</span>
                        비밀번호 변경
                    </h2>

                    <!-- 현재 비밀번호 -->
                    <div class="form-group">
                        <label class="form-label" for="currentPassword">현재 비밀번호</label>
                        <div class="input-wrapper">
                            <span class="input-icon">🔒</span>
                            <input id="currentPassword" v-model="passwordForm.currentPassword"
                                :type="showCurrentPassword ? 'text' : 'password'" class="form-input"
                                placeholder="현재 비밀번호를 입력하세요"
                                :class="{ 'input-error': passwordErrors.currentPassword }" />
                            <button type="button" class="toggle-password"
                                @click="showCurrentPassword = !showCurrentPassword">
                                {{ showCurrentPassword ? '🙈' : '👁️' }}
                            </button>
                        </div>
                        <p v-if="passwordErrors.currentPassword" class="error-text">
                            {{ passwordErrors.currentPassword }}
                        </p>
                    </div>

                    <!-- 새 비밀번호 -->
                    <div class="form-group">
                        <label class="form-label" for="newPassword">새 비밀번호</label>
                        <div class="input-wrapper">
                            <span class="input-icon">🔑</span>
                            <input id="newPassword" v-model="passwordForm.newPassword"
                                :type="showNewPassword ? 'text' : 'password'" class="form-input"
                                placeholder="새 비밀번호를 입력하세요 (6자 이상)"
                                :class="{ 'input-error': passwordErrors.newPassword }" />
                            <button type="button" class="toggle-password" @click="showNewPassword = !showNewPassword">
                                {{ showNewPassword ? '🙈' : '👁️' }}
                            </button>
                        </div>
                        <p v-if="passwordErrors.newPassword" class="error-text">
                            {{ passwordErrors.newPassword }}
                        </p>
                    </div>

                    <!-- 새 비밀번호 확인 -->
                    <div class="form-group">
                        <label class="form-label" for="confirmPassword">새 비밀번호 확인</label>
                        <div class="input-wrapper">
                            <span class="input-icon">🔑</span>
                            <input id="confirmPassword" v-model="passwordForm.confirmPassword"
                                :type="showConfirmPassword ? 'text' : 'password'" class="form-input"
                                placeholder="새 비밀번호를 다시 입력하세요"
                                :class="{ 'input-error': passwordErrors.confirmPassword }" />
                            <button type="button" class="toggle-password"
                                @click="showConfirmPassword = !showConfirmPassword">
                                {{ showConfirmPassword ? '🙈' : '👁️' }}
                            </button>
                        </div>
                        <p v-if="passwordErrors.confirmPassword" class="error-text">
                            {{ passwordErrors.confirmPassword }}
                        </p>
                        <!-- 비밀번호 일치 여부 실시간 표시 -->
                        <p v-if="passwordForm.newPassword && passwordForm.confirmPassword"
                            :class="passwordMatch ? 'match-text' : 'error-text'">
                            {{ passwordMatch ? '✅ 비밀번호가 일치합니다.' : '❌ 비밀번호가 일치하지 않습니다.' }}
                        </p>
                    </div>

                    <div class="card-footer">
                        <button type="button" class="btn-submit" :disabled="passwordLoading" @click="submitPassword">
                            <span v-if="passwordLoading">⏳</span>
                            <span v-else>🔐</span>
                            {{ passwordLoading ? '변경 중...' : '비밀번호 변경' }}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'

import LoadingInfo from '@/components/LoadingInfo.vue'
import RetryInfo from '@/components/RetryInfo.vue'

const router = useRouter()
const authStore = useAuthStore();
const { userInfo } = storeToRefs(authStore);

const isLoading = ref(false)
const error = ref(null)

// ════════════════════════════════════════════════════════════
// ① 이미지
// ════════════════════════════════════════════════════════════
const fileInput = ref(null)
const previewImage = ref(null)
const imageBase64 = ref(null)
const imageChanged = ref(false)
const imageLoading = ref(false)

const triggerFileInput = () => fileInput.value.click()

const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.')
        return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
        previewImage.value = e.target.result
        imageBase64.value = e.target.result
        imageChanged.value = true
    }
    reader.readAsDataURL(file)
}

const removeImage = () => {
    previewImage.value = null
    imageBase64.value = null
    imageChanged.value = true
    if (fileInput.value) fileInput.value.value = ''
}

const submitImage = async () => {
    if (!imageChanged.value) return

    imageLoading.value = true
    try {
        await api.patch('/member/me', {
            email: userInfo.value.email,
            password: userInfo.value.password,
            username: userInfo.value.username,
            image: imageBase64.value
        })

        await authStore.fetchUserInfo();

        alert('프로필 이미지가 변경되었습니다.')
        router.push('/my-info')
    } catch (error) {
        const msg = error.response?.data?.message || '이미지 저장 중 오류가 발생했습니다.'
        alert(msg)
    } finally {
        imageLoading.value = false
        imageChanged.value = false
    }
}

// ════════════════════════════════════════════════════════════
// ② 사용자 이름
// ════════════════════════════════════════════════════════════
const usernameForm = reactive({ username: '' })
const usernameErrors = reactive({ error: '' })
const usernameLoading = ref(false)


const validateUsername = () => {
    usernameErrors.error = ''
    if (!usernameForm.username.trim()) {
        usernameErrors.error = '사용자 이름을 입력해주세요.'
        return false
    }
    if (usernameForm.username.trim().length < 2) {
        usernameErrors.error = '사용자 이름은 2자 이상이어야 합니다.'
        return false
    }
    return true
}

const submitUsername = async () => {

    if (!validateUsername()) return

    usernameLoading.value = true
    try {
        await api.patch('/member/me',
            {
                email: userInfo.value.email,
                password: userInfo.value.password,
                username: usernameForm.username.trim(),
                image: userInfo.value.image
            }
        )

        authStore.fetchUserInfo()

        alert('사용자 이름이 변경되었습니다.')
        router.push('/my-info')
    } catch (error) {
        const msg = error.response?.data?.message || '이름 변경 중 오류가 발생했습니다.'
        alert(msg)
    } finally {
        usernameLoading.value = false
    }
}

// ════════════════════════════════════════════════════════════
// ③ 비밀번호
// ════════════════════════════════════════════════════════════
const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})
const passwordErrors = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})
const passwordLoading = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordMatch = computed(() =>
    passwordForm.newPassword === passwordForm.confirmPassword
)

const validatePassword = () => {
    passwordErrors.currentPassword = ''
    passwordErrors.newPassword = ''
    passwordErrors.confirmPassword = ''
    let isValid = true

    if (!passwordForm.currentPassword) {
        passwordErrors.currentPassword = '현재 비밀번호를 입력해주세요.'
        isValid = false
    }
    if (!passwordForm.newPassword) {
        passwordErrors.newPassword = '새 비밀번호를 입력해주세요.'
        isValid = false
    }
    if (!passwordForm.confirmPassword) {
        passwordErrors.confirmPassword = '새 비밀번호 확인을 입력해주세요.'
        isValid = false
    } else if (!passwordMatch.value) {
        passwordErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
        isValid = false
    }
    return isValid
}

const submitPassword = async () => {
    if (!validatePassword()) return

    passwordLoading.value = true
    try {
        await api.patch('/member/me', {
            email: userInfo.value.email,
            password: passwordForm.newPassword,
            username: userInfo.value.username,
            image: imageBase64.value
        })

        alert('비밀번호가 변경되었습니다.')
        router.push('/my-info')
    } catch (error) {
        const msg = error.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.'
        alert(msg)
    } finally {
        passwordLoading.value = false
    }
}

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

watch(
    userInfo,
    (newValue) => {
        if (newValue) {
            if (newValue.username) {
                usernameForm.username = newValue.username;
            }
            if (newValue.image && !imageChanged.value) {
                previewImage.value = newValue.image;
            }
        }
    },
    { immediate: true }
);

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