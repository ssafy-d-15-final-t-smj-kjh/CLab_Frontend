<template>
    <div class="register-wrapper">
        <div class="register-card">
            <h1 class="title">신규 연구원 등록 <span class="paper">🦀</span></h1>
            <p class="subtitle">(New Researcher)</p>

            <form class="register-form" @submit.prevent="handleRegister">
                <label>✉️ 이메일 (Email)</label>
                <div class="input-box">
                    <input type="email" v-model="email" placeholder="이메일을 입력해주세요" :class="{ 'input-error': errors.email }" />
                </div>
                <p v-if="errors.email" class="error-text">{{ errors.email }}</p>

                <label>🔒 비밀번호 (Password)</label>
                <div class="input-box">
                    <input type="password" v-model="password" placeholder="8자리 이상 입력해주세요" :class="{ 'input-error': errors.password }" />
                </div>
                <p v-if="errors.password" class="error-text">{{ errors.password }}</p>

                <label>🦀 닉네임 (Nickname)</label>
                <div class="input-box">
                    <input type="text" v-model="username" placeholder="닉네임을 입력해주세요" :class="{ 'input-error': errors.username }" />
                </div>
                <p v-if="errors.username" class="error-text">{{ errors.username }}</p>

                <label>☎️ 전화번호 (Phone-Number)</label>
                <div class="input-box">
                    <input type="text" v-model="phoneNumber" placeholder="전화번호를 입력해주세요 010-xxxx-xxxx" 
                           maxlength="13" @input="filterPhoneInput" :class="{ 'input-error': errors.phoneNumber }" />
                </div>
                <p v-if="errors.phoneNumber" class="error-text">{{ errors.phoneNumber }}</p>
                
                <button type="submit" class="signup-btn">계정 만들기 (Sign Up) 📝</button>
            </form>

            <p class="login-link">
                <router-link to="/login">이미 연구원이신가요? (Log In) →</router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { memberApi } from '@/api/restApi'

const router = useRouter()

const email = ref('')
const password = ref('')
const username = ref('')
const phoneNumber = ref('')

const errors = reactive({
    email: '',
    password: '',
    username: '',
    phoneNumber: ''
})

const filterPhoneInput = (event) => {
    phoneNumber.value = event.target.value.replace(/[^0-9-]/g, '')
}

const validateForm = () => {
    Object.keys(errors).forEach(key => errors[key] = '')
    let isValid = true

    if (!email.value.trim()) {
        errors.email = '이메일을 입력해주세요.'
        isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        errors.email = '올바른 이메일 형식이 아닙니다.'
        isValid = false
    }

    if (!password.value) {
        errors.password = '비밀번호를 입력해주세요.'
        isValid = false
    } else if (password.value.length < 8) {
        errors.password = '비밀번호는 최소 8자리 이상이어야 합니다.'
        isValid = false
    }

    if (!username.value.trim()) {
        errors.username = '닉네임을 입력해주세요.'
        isValid = false
    } else if (username.value.trim().length < 2) {
        errors.username = '닉네임은 2자 이상이어야 합니다.'
        isValid = false
    }

    const cleanPhone = phoneNumber.value.replace(/[- ]/g, '')
    if (!cleanPhone) {
        errors.phoneNumber = '전화번호를 입력해주세요.'
        isValid = false
    } else if (!/^\d{10,11}$/.test(cleanPhone)) {
        errors.phoneNumber = '올바른 전화번호 형식(10~11자리 숫자)이 아닙니다.'
        isValid = false
    } else if (!cleanPhone.startsWith('01')) {
        errors.phoneNumber = '유효하지 않은 번호 앞자리입니다.'
        isValid = false
    }

    if (isValid) {
        phoneNumber.value = cleanPhone
    }

    return isValid
}

const handleRegister = async () => {
    if (!validateForm()) return

    try {
        const response = await memberApi.createMember({
            email: email.value,
            password: password.value,
            username: username.value,
            phoneNumber: phoneNumber.value
        })
        const apiResponse = response.data;
        alert(apiResponse.data);
        router.push('/login');
    } catch (error) {
        console.error('RegisterPage.vue - handleRegister :', error);
        alert('회원가입 처리에 실패했습니다. 입력 정보를 확인해주세요.');
    }
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

.input-box input.input-error {
    border-color: #ef4444;
    background-color: #fef2f2;
}

.error-mark {
    color: var(--crab-red);
}

.error-text {
    color: #ef4444;
    font-size: 13px;
    margin-top: 4px;
    margin-bottom: 12px;
    text-align: left;
    padding-left: 4px;
    font-weight: 500;
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
