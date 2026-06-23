<template>
    <div class="page-container">
        
        <LoadingInfo v-if="isLoading" :is-loading="isLoading" />
        
        <RetryInfo v-else-if="error" :message="error" @retry="fetchUserInfo" />

        <div v-else class="myinfo-page">
            <main class="myinfo-content">
                <div class="profile-card">
                    <div class="card-header">
                        <div>
                            <h2 class="card-title">연구원 프로필</h2>
                            <p class="card-subtitle">(Researcher Profile)</p>
                        </div>
                        <span class="flask-icon">🧪</span>
                    </div>

                    <div class="avatar-wrap">
                        <div class="avatar">
                            <img v-if="userInfo?.image" :src="userInfo.image" alt="avatar" class="profile-preview" />
                            <img v-else src="https://api.dicebear.com/7.x/fun-emoji/svg?seed=crab" alt="avatar" />
                            <span class="avatar-badge">🦀</span>
                        </div>
                    </div>

                    <div class="info-list">
                        <div class="info-item border-blue">
                            <div class="item-icon">📧</div>
                            <div class="item-details">
                                <span class="info-label">Email</span>
                                <span class="info-value">{{ userInfo?.email || '-' }}</span>
                            </div>
                        </div>
                        
                        <div class="info-item border-yellow">
                            <div class="item-icon">👤</div>
                            <div class="item-details">
                                <span class="info-label">Nickname</span>
                                <span class="info-value">{{ userInfo?.username || '-' }}</span>
                            </div>
                        </div>
                        
                        <div class="info-item border-red">
                            <div class="item-icon">📱</div>
                            <div class="item-details">
                                <span class="info-label">전화번호</span>
                                <span class="info-value">{{ userInfo?.phoneNumber || '-' }}</span>
                            </div>
                        </div>
                        
                        <div class="info-item border-red">
                            <div class="item-icon">🌱</div>
                            <div class="item-details">
                                <span class="info-label">가입일자</span>
                                <span class="info-value">{{ formatDateTime(userInfo?.createdAt) }}</span>
                            </div>
                        </div>
                        
                        <div class="info-item border-red">
                            <div class="item-icon">📝</div>
                            <div class="item-details">
                                <span class="info-label">수정일자</span>
                                <span class="info-value">{{ formatDateTime(userInfo?.updatedAt) }}</span>
                            </div>
                        </div>
                    </div>

                    <button class="edit-btn" @click="goToEditProfile">✏️ 정보 수정 (Edit Info)</button>
                    <button class="logout-btn" @click="logout">↪️ 로그아웃 (Logout)</button>
                </div>
            </main>
        </div>
        
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoadingInfo from '@/components/LoadingInfo.vue'
import RetryInfo from '@/components/RetryInfo.vue'

const router = useRouter()
const authStore = useAuthStore()

const {userInfo} = storeToRefs(authStore)

const isLoading = ref(false)
const error = ref(null)

const formatDateTime = (datetime) => {
    if (!datetime) return '-'

    const date = new Date(datetime)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')

    return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분 ${second}초`
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

const goToEditProfile = () => {
    router.push('/edit-profile')
}

const logout = async() => {
    isLoading.value = true
    error.value = null
    try {
        await authStore.logout()
        alert('성공적으로 로그아웃 되었습니다.')
        router.push('/login')
    } catch (e) {
        error.value = '로그아웃에 실패하였습니다.'
        console.error(e)
    } finally {
        isLoading.value = false
    }
}

onMounted(async () => {
    if(!userInfo.value){
        await fetchUserInfo()
    }
})
</script>

<style scoped>
.myinfo-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(160deg, #eaf4f7 0%, #f5ecd9 100%);
}

.myinfo-content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 50px 20px;
}

.profile-card {
    background: var(--white, #ffffff);
    border-radius: 22px;
    padding: 30px 34px;
    width: 380px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.card-title {
    font-size: 20px;
    font-weight: 800;
    color: var(--text-dark, #333333);
}

.card-subtitle {
    font-size: 12px;
    color: var(--text-gray, #888888);
}

.flask-icon {
    font-size: 24px;
}

.avatar-wrap {
    display: flex;
    justify-content: center;
    margin: 24px 0;
}

.avatar {
    position: relative;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    border: 3px solid var(--sand-dark, #d8ccb8);
    overflow: visible;
}

.avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.avatar-badge {
    position: absolute;
    bottom: -4px;
    right: -4px;
    background: var(--ocean-blue, #0077b6);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

/* 새롭게 변경된 info-list 스타일 */
.info-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.info-item {
    display: flex;
    align-items: center;
    background: #f8f9fa; /* 기존보다 살짝 더 밝고 부드러운 배경 */
    border-radius: 12px;
    padding: 14px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03); /* 은은한 입체감 */
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border-left: 4px solid transparent; /* 좌측 포인트 바를 위한 공간 확보 */
}

.info-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
}

/* 각 항목별 좌측 포인트 컬러 설정 */
.border-blue {
    border-left-color: var(--ocean-blue, #0077b6);
}

.border-yellow {
    border-left-color: #e6b800;
}

.border-red {
    border-left-color: var(--crab-red, #ff4d4d);
}

/* 항목별 아이콘 컨테이너 */
.item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    margin-right: 14px;
    font-size: 18px;
}

.item-details {
    display: flex;
    flex-direction: column;
    flex: 1; /* 남은 공간 모두 차지 */
    overflow: hidden;
}

.info-label {
    font-size: 11px;
    color: var(--text-gray, #888888);
    margin-bottom: 3px;
    font-weight: 600;
}

.info-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-dark, #333333);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; /* 글자가 길 경우 ... 처리 */
}

/* 버튼 스타일링 유지 */
.edit-btn {
    width: 100%;
    background: var(--ocean-blue, #0077b6);
    color: var(--white, #ffffff);
    border: none;
    border-radius: 24px;
    padding: 14px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 24px;
    transition: transform 0.15s, background-color 0.2s;
}

.edit-btn:hover {
    transform: scale(1.02);
    filter: brightness(1.1); /* 호버 시 살짝 밝아짐 */
}

.logout-btn {
    width: 100%;
    background: var(--sand, #f0e6d2);
    color: var(--text-dark, #333333);
    border: none;
    border-radius: 24px;
    padding: 14px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 12px;
    transition: background-color 0.2s;
}

.logout-btn:hover {
    background: var(--sand-dark, #d8ccb8);
}
</style>