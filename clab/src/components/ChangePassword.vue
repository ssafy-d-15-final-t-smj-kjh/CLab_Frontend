<template>
  <div class="modal-backdrop" @click.self="handleBackdropClick">
    <div class="modal">
      <div class="modal-header">
        <span class="crab">🦀</span>
        <h2 class="modal-title">비밀번호 변경</h2>
        <p class="modal-subtitle">안전한 해변을 위해 비밀번호를 바꿔주세요</p>
      </div>

      <form class="modal-form" @submit.prevent="submitPassword">
        <!-- 현재 비밀번호 -->
        <div class="form-group">
          <label class="form-label">현재 비밀번호</label>
          <div class="input-wrapper">
            <input
              v-model="form.currentPassword"
              :type="showPassword.currentPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'input-error': formErrors.currentPassword }"
              placeholder="현재 비밀번호를 입력하세요"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="toggle-button"
              @click="togglePassword('currentPassword')"
            >
              {{ showPassword.currentPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <p v-if="formErrors.currentPassword" class="error-text">
            {{ formErrors.currentPassword }}
          </p>
        </div>

        <!-- 새 비밀번호 -->
        <div class="form-group">
          <label class="form-label">새 비밀번호</label>
          <div class="input-wrapper">
            <input
              v-model="form.newPassword"
              :type="showPassword.newPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'input-error': formErrors.newPassword }"
              placeholder="8자 이상 입력하세요"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="toggle-button"
              @click="togglePassword('newPassword')"
            >
              {{ showPassword.newPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <p v-if="formErrors.newPassword" class="error-text">
            {{ formErrors.newPassword }}
          </p>
        </div>

        <!-- 새 비밀번호 확인 -->
        <div class="form-group">
          <label class="form-label">새 비밀번호 확인</label>
          <div class="input-wrapper">
            <input
              v-model="form.confirmPassword"
              :type="showPassword.confirmPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'input-error': formErrors.confirmPassword }"
              placeholder="새 비밀번호를 다시 입력하세요"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="toggle-button"
              @click="togglePassword('confirmPassword')"
            >
              {{ showPassword.confirmPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <p v-if="formErrors.confirmPassword" class="error-text">
            {{ formErrors.confirmPassword }}
          </p>
        </div>

        <div class="button-group">
          <button
            type="button"
            class="cancel-button"
            :disabled="isSubmitting"
            @click="closeModal"
          >
            취소
          </button>
          <button
            type="submit"
            class="submit-button"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '변경 중...' : '변경하기' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<!-- src/components/ChangePassword.vue -->
<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { memberApi } from '@/api/restApi'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const emit = defineEmits(['close'])


const router = useRouter()
const authStore = useAuthStore()

const { userInfo } = storeToRefs(authStore)

const isSubmitting = ref(false)

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const formErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showPassword = reactive({
  currentPassword: false,
  newPassword: false,
  confirmPassword: false,
})

const resetErrors = () => {
  formErrors.currentPassword = ''
  formErrors.newPassword = ''
  formErrors.confirmPassword = ''
}

const validateForm = () => {
  resetErrors()

  let isValid = true

  if (!form.currentPassword) {
    formErrors.currentPassword = '현재 비밀번호를 입력해주세요.'
    isValid = false
  }

  if (!form.newPassword) {
    formErrors.newPassword = '새 비밀번호를 입력해주세요.'
    isValid = false
  } else if (form.newPassword.length < 8) {
    formErrors.newPassword = '비밀번호는 8자 이상이어야 해요.'
    isValid = false
  } else if (form.newPassword === form.currentPassword) {
    formErrors.newPassword = '현재 비밀번호와 다른 비밀번호를 입력해주세요.'
    isValid = false
  }

  if (!form.confirmPassword) {
    formErrors.confirmPassword = '새 비밀번호를 다시 입력해주세요.'
    isValid = false
  } else if (form.newPassword !== form.confirmPassword) {
    formErrors.confirmPassword = '새 비밀번호가 일치하지 않아요.'
    isValid = false
  }

  return isValid
}

const togglePassword = (field) => {
  showPassword[field] = !showPassword[field]
}

const closeModal = () => {
  emit('close')
}

const handleBackdropClick = () => {
  if (isSubmitting.value) return
  closeModal()
}

const submitPassword = async () => {
    if (!validateForm()) return

    isSubmitting.value = true

    try {
        const dto = {
            originPassword: form.currentPassword,
            password: form.newPassword,
        }
        await memberApi.updateMemberPassword(dto)
        alert('비밀번호가 성공적으로 변경되었습니다.\n안전을 위해 다시 로그인해주세요.')
        await authStore.logout()
        closeModal()
        router.push('/login')
    } catch (error) {
        console.log('ChangePassword.vue - submitPassword :', error)
        alert('비밀번호 변경에 실패했어요. 잠시 후 다시 시도해주세요.')
    } finally {
        isSubmitting.value = false
    }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(58, 58, 58, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal {
  width: 100%;
  max-width: 420px;
  background: var(--sand-light);
  border-radius: 24px;
  padding: 32px 28px;
  box-shadow: 0 20px 50px rgba(58, 58, 58, 0.25);
  animation: pop-in 0.25s ease;
}

@keyframes pop-in {
  from {
    transform: scale(0.92) translateY(12px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.crab {
  font-size: 48px;
  display: inline-block;
  animation: crab-wiggle 2s ease-in-out infinite;
}

@keyframes crab-wiggle {
  0%,
  100% {
    transform: rotate(-8deg);
  }
  50% {
    transform: rotate(8deg);
  }
}

.modal-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--crab-red);
  margin-top: 8px;
}

.modal-subtitle {
  font-size: 13px;
  color: var(--text-gray);
  margin-top: 6px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 12px 44px 12px 16px;
  font-size: 15px;
  color: var(--text-dark);
  background: var(--white);
  border: 2px solid var(--sand-dark);
  border-radius: 12px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-input:focus {
  border-color: var(--ocean-blue);
  box-shadow: 0 0 0 3px rgba(91, 180, 196, 0.2);
}

.form-input.input-error {
  border-color: var(--crab-orange);
}

.form-input.input-error:focus {
  box-shadow: 0 0 0 3px rgba(232, 85, 78, 0.2);
}

.toggle-button {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}

.error-text {
  font-size: 12px;
  color: var(--crab-orange);
  font-weight: 500;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.cancel-button,
.submit-button {
  flex: 1;
  padding: 14px;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.cancel-button {
  color: var(--text-dark);
  background: var(--sand-dark);
  box-shadow: 0 4px 0 #d9bf85;
}

.cancel-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #d9bf85;
}

.cancel-button:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #d9bf85;
}

.submit-button {
  color: var(--white);
  background: var(--crab-orange);
  box-shadow: 0 4px 0 var(--crab-red);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 var(--crab-red);
}

.submit-button:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 var(--crab-red);
}

.cancel-button:disabled,
.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
