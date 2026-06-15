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
                        <div class="info-item">
                            <span class="info-label">Nickname</span>
                            <span class="info-value">{{ userInfo?.username }}</span>
                            <span class="bar bar-yellow"></span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email</span>
                            <span class="info-value">{{ userInfo?.email }}</span>
                            <span class="bar bar-blue"></span>
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
    background: var(--white);
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
    color: var(--text-dark);
}

.card-subtitle {
    font-size: 12px;
    color: var(--text-gray);
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
    border: 3px solid var(--sand-dark);
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
    background: var(--ocean-blue);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.info-item {
    position: relative;
    background: #f7f7f7;
    border-radius: 12px;
    padding: 12px 16px;
    overflow: hidden;
}

.info-label {
    display: block;
    font-size: 11px;
    color: var(--text-gray);
    margin-bottom: 4px;
}

.info-value {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-dark);
}

.bar {
    position: absolute;
    right: 0;
    top: 0;
    width: 6px;
    height: 100%;
}

.bar-yellow {
    background: #e6b800;
}

.bar-blue {
    background: var(--ocean-blue);
}

.bar-red {
    background: var(--crab-red);
}

.edit-btn {
    width: 100%;
    background: var(--ocean-blue);
    color: var(--white);
    border: none;
    border-radius: 24px;
    padding: 14px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 24px;
    transition: transform 0.15s;
}

.edit-btn:hover {
    transform: scale(1.02);
}

.logout-btn {
    width: 100%;
    background: var(--sand);
    color: var(--text-dark);
    border: none;
    border-radius: 24px;
    padding: 14px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 12px;
}

.logout-btn:hover {
    background: var(--sand-dark);
}
</style>
