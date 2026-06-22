<template>
    <LoadingInfo v-if="isLoading" :is-loading="isLoading"/>
    <div class="login-wrapper">
        <div class="bubble bubble1"></div>
        <div class="bubble bubble2"></div>
        <div class="bubble bubble3"></div>

        <div class="login-card">
            <div class="crab-icon">
                <img src="@/assets/imgs/CrabIcon.PNG" alt="crab" height="100px">
            </div>
            <h1 class="brand">CLab</h1>
            <p class="subtitle">연구소 입장하기</p>
            <p class="subtitle-en">(Welcome Back)</p>

            <form class="login-form" @submit.prevent="handleLogin">
                <label>이메일 (Email)</label>
                <div class="input-box">
                    <span class="input-icon">✉️</span>
                    <input type="email" v-model="email" placeholder="이메일을 입력해주세요" />
                </div>  

                <label>비밀번호 (Password)</label>
                <div class="input-box">
                    <span class="input-icon">🔒</span>
                    <input type="password" v-model="password" placeholder="••••••••" />
                </div>

                <div class="options-row">
                    <a href="find-email" class="find-email">이메일 찾기</a>
                    <a href="find-pwd" class="find-password">비밀번호 찾기</a>
                </div>

                <button type="submit" class="login-btn">🦀 로그인 (Login)</button>
            </form>

            <div class="social-row">
                <button class="social-btn register" @click="goToRegister">🧪 회원가입</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoadingInfo from '@/components/LoadingInfo.vue'

const router = useRouter()
const authStore = useAuthStore();

const isLoading = ref(false)

const email = ref('')
const password = ref('')

const handleLogin = async () => {
    isLoading.value = true
    try {
        await authStore.login({
            email: email.value,
            password: password.value
        })
        alert('로그인에 성공하였습니다!')
        goToMain()
    } catch (e) {
        console.error('API 호출 에러:', e);
    } finally {
        isLoading.value = false
    }
}

const goToRegister = () => {
    router.push('/register')
}

const goToMain = () => {
    router.push('/main')
}
</script>

<style scoped>
.login-wrapper {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(180deg, #eaf4f7 0%, #f5ecd9 100%);
    position: relative;
    overflow: hidden;
}

.bubble {
    position: absolute;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
}

.bubble1 {
    width: 80px;
    height: 80px;
    top: 20%;
    left: 15%;
}

.bubble2 {
    width: 50px;
    height: 50px;
    bottom: 25%;
    right: 20%;
}

.bubble3 {
    width: 100px;
    height: 100px;
    bottom: 10%;
    right: 35%;
}

.login-card {
    background: var(--sand-light);
    border: 2px solid var(--ocean-blue);
    border-radius: 16px;
    padding: 30px 36px 24px;
    width: 360px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    z-index: 1;
}

.crab-icon {
    width: 56px;
    height: 56px;
    background: var(--crab-red);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin: 0 auto 10px;
}

.brand {
    color: var(--crab-red);
    font-size: 32px;
    font-weight: 800;
    letter-spacing: 2px;
}

.subtitle {
    color: var(--text-dark);
    font-size: 14px;
    margin-top: 4px;
}

.subtitle-en {
    color: var(--text-gray);
    font-size: 12px;
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px dashed var(--sky-blue);
}

.error-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fde0e0;
    color: var(--crab-red);
    font-size: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    text-align: left;
    margin-bottom: 16px;
}

.login-form {
    text-align: left;
}

.login-form label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
    margin: 12px 0 6px;
}

.input-box {
    display: flex;
    align-items: center;
    background: var(--sand);
    border: 1px solid var(--sand-dark);
    border-radius: 8px;
    padding: 0 12px;
}

.input-icon {
    margin-right: 8px;
}

.input-box input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 12px 0;
    font-size: 14px;
    outline: none;
}

.options-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 16px 0;
    font-size: 12px;
}

.keep-login {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-gray);
}

.forgot {
    color: var(--ocean-blue);
    text-decoration: none;
}

.login-btn {
    width: 100%;
    background: var(--crab-red);
    color: var(--white);
    border: none;
    border-radius: 24px;
    padding: 14px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s;
}

.login-btn:hover {
    transform: scale(1.02);
}

.social-row {
    display: flex;
    gap: 12px;
    margin: 16px 0;
}

.social-btn {
    flex: 1;
    border: none;
    border-radius: 20px;
    padding: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--white);
    cursor: pointer;
}

.social-btn.register {
    background: var(--ocean-blue);
}

.social-btn.beach {
    background: #e6b800;
}

.register-link {
    font-size: 12px;
    color: var(--text-gray);
    padding-top: 14px;
    border-top: 1px dashed var(--sky-blue);
}

.register-link a {
    color: var(--crab-red);
    font-weight: 600;
    text-decoration: none;
}
</style>
