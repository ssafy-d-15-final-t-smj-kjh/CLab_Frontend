<template>
    <div class="register-wrapper">
        <div class="register-card">
            <h1 class="title">신규 연구원 등록 <span class="paper">🦀</span></h1>
            <p class="subtitle">(New Researcher)</p>

            <form class="register-form" @submit.prevent="handleRegister">
                <label>✉️ 이메일 (Email)</label>
                <div class="input-box">
                    <input type="email" v-model="email" placeholder="crab@coastal-lab.com" />
                </div>

                <label>🔒 비밀번호 (Password)</label>
                <div class="input-box">
                    <input type="password" v-model="password" placeholder="••••••••" />
                </div>

                <label>🦀 닉네임 (Nickname)</label>
                <div class="input-box" :class="{ error: nicknameError }">
                    <input type="text" v-model="nickname" placeholder="CrabbyPatty" />
                    <span v-if="nicknameError" class="error-mark">❗</span>
                </div>
                <p v-if="nicknameError" class="error-text">
                    ⚠️ 이미 사용 중인 닉네임 (Nickname already in use)
                </p>

                <button type="submit" class="signup-btn">계정 만들기 (Sign Up) 📝</button>
            </form>

            <p class="login-link">
                <router-link to="/login">이미 연구원이신가요? (Log In) →</router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const nickname = ref('')
const nicknameError = ref(false)

const handleRegister = () => {
    if (nickname.value.toLowerCase() === 'crabbypatty') {
        nicknameError.value = true
        return
    }
    nicknameError.value = false
    router.push('/login')
}
</script>

<style scoped>
.register-wrapper {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #a8dadc 0%, #f7e9c9 60%, #f0d9a8 100%);
    padding: 20px;
}

.register-card {
    background: var(--white);
    border-radius: 20px;
    padding: 36px 40px;
    width: 380px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.title {
    color: var(--crab-red);
    font-size: 26px;
    font-weight: 800;
}

.paper {
    font-size: 22px;
}

.subtitle {
    color: var(--text-gray);
    font-size: 13px;
    margin-bottom: 24px;
}

.register-form label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
    margin: 16px 0 6px;
}

.input-box {
    display: flex;
    align-items: center;
    border: 1.5px solid #e0e0e0;
    border-radius: 24px;
    padding: 0 16px;
}

.input-box.error {
    border-color: var(--crab-red);
}

.input-box input {
    flex: 1;
    border: none;
    padding: 12px 0;
    font-size: 14px;
    outline: none;
    background: transparent;
}

.error-mark {
    color: var(--crab-red);
}

.error-text {
    color: var(--crab-red);
    font-size: 12px;
    margin-top: 6px;
}

.signup-btn {
    width: 100%;
    background: var(--crab-red);
    color: var(--white);
    border: none;
    border-radius: 24px;
    padding: 14px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 28px;
    transition: transform 0.15s;
}

.signup-btn:hover {
    transform: scale(1.02);
}

.login-link {
    text-align: center;
    margin-top: 18px;
}

.login-link a {
    color: var(--ocean-blue);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
}
</style>
