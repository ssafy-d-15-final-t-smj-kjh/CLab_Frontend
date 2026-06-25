<template>
  <Teleport to="body">
    <div v-if="isVisible" class="agreement-overlay" @click.self="handleCancel">
      <div class="agreement-container">
        <!-- 헤더 -->
        <div class="agreement-header">
          <div class="crab-icon">🦀</div>
          <h1 class="agreement-title">개인정보 처리 동의</h1>
          <p class="agreement-subtitle">
            서비스 이용 전 아래 내용을 꼭 확인해주세요
          </p>
        </div>

        <!-- 경고 배너 -->
        <div class="warning-banner">
          <span class="warning-icon">⚠️</span>
          <p>
            이 서비스는 카카오톡 대화 파일을 분석합니다.<br />
            업로드 전 반드시 아래 동의 사항을 확인하세요.
          </p>
        </div>

        <!-- 동의 내용 박스 -->
        <div class="agreement-content">
          <div class="content-section">
            <h3 class="section-title">
              <span class="section-icon">💬</span>
              서비스 이용 안내
            </h3>
            <ul class="content-list">
              <li>본 서비스는 업로드된 대화 파일을 분석하여 참여자별 통계를 제공합니다.</li>
              <li>대화 파일은 분석 목적으로만 사용되며, 분석 완료 후 즉시 삭제됩니다.</li>
              <li>서버에 대화 내용이 영구적으로 저장되지 않습니다.</li>
            </ul>
          </div>

          <div class="divider" />

          <div class="content-section">
            <h3 class="section-title">
              <span class="section-icon">🔒</span>
              개인정보 보호 안내
            </h3>
            <ul class="content-list">
              <li>대화 파일에는 타인의 개인정보(이름, 연락처, 사진 등)가 포함될 수 있습니다.</li>
              <li>
                타인의 동의 없이 대화 내용을 업로드할 경우,
                <strong>개인정보보호법에 따른 법적 책임</strong>이 발생할 수 있습니다.
              </li>
              <li>업로드는 반드시 본인이 직접 참여한 대화에 한해 허용됩니다.</li>
            </ul>
          </div>

          <div class="divider" />

          <div class="content-section highlight-section">
            <h3 class="section-title">
              <span class="section-icon">📋</span>
              수집 및 이용 목적
            </h3>
            <div class="info-table">
              <div class="info-row">
                <span class="info-label">수집 항목</span>
                <span class="info-value">대화 참여자 닉네임, 메시지 수, 날짜 정보</span>
              </div>
              <div class="info-row">
                <span class="info-label">이용 목적</span>
                <span class="info-value">대화 패턴 분석 및 통계 제공</span>
              </div>
              <div class="info-row">
                <span class="info-label">보유 기간</span>
                <span class="info-value">분석 완료 즉시 삭제 (최대 24시간)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 체크박스 동의 항목 -->
        <div class="checkbox-section">
          <label
            class="checkbox-item"
            :class="{ checked: agreements.isParticipant }"
            @click="toggleAgreement('isParticipant')"
          >
            <div class="custom-checkbox" :class="{ checked: agreements.isParticipant }">
              <span v-if="agreements.isParticipant" class="check-icon">✓</span>
            </div>
            <p class="checkbox-text">
              <strong>[필수]</strong> 업로드하는 대화 파일은 본인이 직접 참여한 대화임을 확인합니다.
            </p>
          </label>

          <label
            class="checkbox-item"
            :class="{ checked: agreements.acceptResponsibility }"
            @click="toggleAgreement('acceptResponsibility')"
          >
            <div class="custom-checkbox" :class="{ checked: agreements.acceptResponsibility }">
              <span v-if="agreements.acceptResponsibility" class="check-icon">✓</span>
            </div>
            <p class="checkbox-text">
              <strong>[필수]</strong> 대화 파일 업로드로 인한 개인정보 침해 관련 법적 책임은 본인에게
              있음에 동의합니다.
            </p>
          </label>

          <label
            class="checkbox-item"
            :class="{ checked: agreements.noLeakage }"
            @click="toggleAgreement('noLeakage')"
          >
            <div class="custom-checkbox" :class="{ checked: agreements.noLeakage }">
              <span v-if="agreements.noLeakage" class="check-icon">✓</span>
            </div>
            <p class="checkbox-text">
              <strong>[필수]</strong> 서비스 제공자는 대화 파일을 개인적인 목적으로 저장하거나 외부에
              유출하지 않음을 확인하였습니다.
            </p>
          </label>

          <label
            class="checkbox-item"
            :class="{ checked: agreements.ageVerification }"
            @click="toggleAgreement('ageVerification')"
          >
            <div class="custom-checkbox" :class="{ checked: agreements.ageVerification }">
              <span v-if="agreements.ageVerification" class="check-icon">✓</span>
            </div>
            <p class="checkbox-text">
              <strong>[필수]</strong> 본인은 만 14세 이상이며, 위 내용을 모두 읽고 이해하였습니다.
            </p>
          </label>

          <!-- 전체 동의 -->
          <label
            class="checkbox-item all-agree"
            :class="{ checked: isAllAgreed }"
            @click="toggleAllAgreement"
          >
            <div class="custom-checkbox all" :class="{ checked: isAllAgreed }">
              <span v-if="isAllAgreed" class="check-icon">✓</span>
            </div>
            <p class="checkbox-text">
              <strong>위 항목에 모두 동의합니다</strong>
            </p>
          </label>
        </div>

        <!-- 안내 문구 -->
        <p class="footer-notice">
          동의 후에도 서비스 이용 중 언제든지 동의를 철회할 수 있습니다.<br />
          문의사항은 <strong>tjalswhd1@naver.com</strong>으로 연락해주세요.
        </p>

        <!-- 버튼 -->
        <div class="button-group">
          <button class="btn-cancel" @click="handleCancel">취소</button>
          <button
            class="btn-agree"
            :disabled="!isAllAgreed"
            :class="{ active: isAllAgreed }"
            @click="handleAgree"
          >
            <span v-if="isLoading" class="loading-spinner">⏳</span>
            <span v-else>동의하고 시작하기 🦀</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, computed, ref, watch } from 'vue'

// ============================================
// Props & Emits
// ============================================
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['agreed', 'cancelled'])

// ============================================
// 상태 관리
// ============================================
const isLoading = ref(false)

const agreements = reactive({
  isParticipant: false,
  acceptResponsibility: false,
  noLeakage: false,
  ageVerification: false,
})

// ============================================
// ✅ 모달이 닫힐 때 체크박스 초기화
// ============================================
watch(
  () => props.isVisible,
  (newVal) => {
    if (!newVal) {
      resetAgreements()
    }
  }
)

// ============================================
// Computed
// ============================================
const isAllAgreed = computed(() =>
  Object.values(agreements).every((v) => v === true)
)

// ============================================
// Methods
// ============================================
function toggleAgreement(key) {
  agreements[key] = !agreements[key]
}

function toggleAllAgreement() {
  const newValue = !isAllAgreed.value
  Object.keys(agreements).forEach((key) => {
    agreements[key] = newValue
  })
}

function resetAgreements() {
  Object.keys(agreements).forEach((key) => {
    agreements[key] = false
  })
}

function handleCancel() {
  emit('cancelled')
}

async function handleAgree() {
  if (!isAllAgreed.value) return

  isLoading.value = true

  try {
    // 세션스토리지에 동의 기록 저장
    saveAgreementToSession()

    emit('agreed', {
      agreedAt: new Date().toISOString(),
      agreements: { ...agreements },
    })
  } catch (error) {
    console.error('동의 처리 중 오류 발생:', error)
    alert('처리 중 오류가 발생했습니다. 다시 시도해주세요.')
  } finally {
    isLoading.value = false
  }
}

function saveAgreementToSession() {
  const agreementData = {
    agreedAt: new Date().toISOString(),
    agreements: { ...agreements },
  }
  sessionStorage.setItem('chatAnalysis_agreement', JSON.stringify(agreementData))
}
</script>

<style scoped>
/* ==========================================
   오버레이
========================================== */
.agreement-overlay {
  position: fixed;
  inset: 0;
  background: rgba(58, 58, 58, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ==========================================
   컨테이너
========================================== */
.agreement-container {
  background: var(--white);
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 640px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow:
    0 20px 60px rgba(91, 180, 196, 0.2),
    0 4px 20px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--sand-dark);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.agreement-container::-webkit-scrollbar {
  width: 4px;
}
.agreement-container::-webkit-scrollbar-track {
  background: var(--sand);
}
.agreement-container::-webkit-scrollbar-thumb {
  background: var(--ocean-blue);
  border-radius: 2px;
}

/* ==========================================
   헤더
========================================== */
.agreement-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.crab-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  display: block;
  animation: wave 2s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.agreement-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 0.4rem;
}

.agreement-subtitle {
  font-size: 0.9rem;
  color: var(--text-gray);
}

/* ==========================================
   경고 배너
========================================== */
.warning-banner {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border: 1.5px solid #f0c040;
  border-radius: 12px;
  padding: 1rem 1.2rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.warning-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.warning-banner p {
  font-size: 0.875rem;
  color: #7a5c00;
  line-height: 1.6;
}

/* ==========================================
   동의 내용
========================================== */
.agreement-content {
  background: var(--sand-light);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--sand-dark);
}

.content-section {
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.content-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.content-list li {
  font-size: 0.85rem;
  color: #555;
  line-height: 1.6;
  padding-left: 1rem;
  position: relative;
}

.content-list li::before {
  content: '·';
  position: absolute;
  left: 0;
  color: var(--ocean-blue);
  font-weight: bold;
}

.divider {
  height: 1px;
  background: var(--sand-dark);
  margin: 1rem 0;
}

.highlight-section {
  background: rgba(91, 180, 196, 0.08);
  border-radius: 10px;
  padding: 1rem;
}

.info-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
}

.info-label {
  font-weight: 600;
  color: var(--ocean-blue);
  min-width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #555;
}

/* ==========================================
   체크박스
========================================== */
.checkbox-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1.5px solid var(--sand-dark);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--white);
}

.checkbox-item:hover {
  border-color: var(--ocean-blue);
  background: rgba(168, 218, 220, 0.08);
}

.checkbox-item.checked {
  border-color: var(--ocean-blue);
  background: rgba(168, 218, 220, 0.12);
}

.all-agree {
  border: 2px solid var(--sand-dark);
  background: var(--sand-light);
  margin-top: 0.25rem;
}

.all-agree.checked {
  border-color: var(--crab-orange);
  background: rgba(232, 85, 78, 0.06);
}

.custom-checkbox {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid var(--sand-dark);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: var(--white);
  margin-top: 1px;
}

.custom-checkbox.checked {
  background: var(--ocean-blue);
  border-color: var(--ocean-blue);
}

.custom-checkbox.all.checked {
  background: var(--crab-orange);
  border-color: var(--crab-orange);
}

.check-icon {
  color: white;
  font-size: 0.8rem;
  font-weight: 800;
}

.checkbox-text {
  font-size: 0.875rem;
  color: var(--text-dark);
  line-height: 1.5;
}

.checkbox-text strong {
  color: var(--ocean-blue);
}

.all-agree .checkbox-text strong {
  color: var(--crab-orange);
}

/* ==========================================
   푸터 & 버튼
========================================== */
.footer-notice {
  font-size: 0.78rem;
  color: var(--text-gray);
  text-align: center;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: var(--sand-light);
  border-radius: 8px;
}

.footer-notice strong {
  color: var(--ocean-blue);
}

.button-group {
  display: flex;
  gap: 0.75rem;
}

.btn-cancel {
  flex: 1;
  padding: 0.875rem;
  border-radius: 12px;
  border: 1.5px solid var(--sand-dark);
  background: var(--white);
  color: var(--text-gray);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  border-color: var(--text-gray);
  color: var(--text-dark);
}

.btn-agree {
  flex: 2;
  padding: 0.875rem;
  border-radius: 12px;
  border: none;
  background: var(--sand-dark);
  color: var(--text-gray);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: not-allowed;
  transition: all 0.3s ease;
}

.btn-agree.active {
  background: linear-gradient(135deg, var(--ocean-blue), var(--sky-blue));
  color: var(--white);
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(91, 180, 196, 0.4);
}

.btn-agree.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(91, 180, 196, 0.5);
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ==========================================
   반응형
========================================== */
@media (max-width: 480px) {
  .agreement-container {
    padding: 1.5rem 1.25rem;
    border-radius: 16px;
  }

  .agreement-title {
    font-size: 1.3rem;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>
