<template>
    <header class="app-header">
        <div class="header-left">
            <h1 class="logo" @click="goMain">CLab</h1>
            <nav class="nav-menu">
                <router-link to="/main" class="nav-item" active-class="active">메인</router-link>
                <router-link to="/chat" class="nav-item" active-class="active">대화 목록</router-link>
                <router-link v-if="isLoggedIn" to="/my-info" class="nav-item" active-class="active">내 정보</router-link>
            </nav>
        </div>

        <div class="header-right">
            <div v-if="isLoggedIn" class="profile-img" @click="goMyInfo">
                <img v-if="userInfo?.image" :src="userInfo.image" alt="profile" />
                <img v-else src="https://api.dicebear.com/7.x/fun-emoji/svg?seed=crab" alt="profile" />
            </div>
            <button v-if="isLoggedIn" class="auth-btn logout" @click="logout">로그아웃</button>
            <button v-else class="auth-btn login" @click="goLogin">로그인</button>
        </div>
    </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const router = useRouter()
const authStore = useAuthStore();

const { isLoggedIn, userInfo } = storeToRefs(authStore)

const goMain = () => router.push('/main')
const goMyInfo = () => router.push('/my-info')
const goLogin = () => router.push('/login')

const logout = () => {
    const answer = confirm('정말 로그아웃하시겠습니까?')
    if (answer) {
        authStore.logout();
        alert('성공적으로 로그아웃 되었습니다.')
        router.push('/login')
    } else {
        return
    }
}

const fetchUserInfo = async () => {
    try {
        await authStore.fetchUserInfo()
    } catch (e) {
        console.log('VHeader.vue - fetchUserInfo :', e)
    }
}

onMounted(async () => {
    await fetchUserInfo()
})
</script>

<style scoped>
.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 40px;
    background: var(--sand-dark);
    border-bottom: 2px dashed var(--sky-blue);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 40px;
}

.logo {
    color: var(--crab-red);
    font-size: 24px;
    font-weight: 800;
    cursor: pointer;
}

.nav-menu {
    display: flex;
    gap: 28px;
}

.nav-item {
    text-decoration: none;
    color: var(--text-gray);
    font-size: 15px;
    font-weight: 600;
    padding: 4px 8px;
    transition: color 0.2s;
}

.nav-item:hover {
    color: var(--crab-red);
}

.nav-item.active {
    color: var(--crab-red);
    border-bottom: 2px solid var(--crab-red);
}

.header-right {
    display: flex;
    align-items: center;
    gap: 16px;
}

.profile-img {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--ocean-blue);
    cursor: pointer;
}

.profile-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.auth-btn {
    border: none;
    border-radius: 20px;
    padding: 8px 18px;
    font-size: 14px;
    font-weight: 700;
    color: var(--white);
    cursor: pointer;
    transition: transform 0.15s;
}

.auth-btn:hover {
    transform: scale(1.05);
}

.auth-btn.logout {
    background: var(--crab-red);
}

.auth-btn.login {
    background: var(--ocean-blue);
}
</style>
