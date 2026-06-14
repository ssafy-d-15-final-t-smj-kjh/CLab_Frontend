import LoginPage from '@/views/LoginPage.vue'
import MainPage from '@/views/MainPage.vue'
import MyInfoPage from '@/views/MyInfoPage.vue'
import { createRouter, createWebHistory } from 'vue-router'
import FindEmailPage from '@/views/FindEmailPage.vue'
import FindPasswordPage from '@/views/FindPasswordPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import EditProfilePage from '@/views/EditProfilePage.vue'
import ChatListPage from '@/views/ChatListPage.vue'
import ChatDetailPage from '@/views/ChatDetailPage.vue'

const routes = [
{
  path: '/',
  redirect: '/login'
},
{
  path: '/find-email',
  name: 'FindEmail',
  component: FindEmailPage,
},
{
  path: '/find-pwd',
  name: 'FindPassword',
  component: FindPasswordPage,
},
{
  path: '/register',
  name: 'Register',
  component: RegisterPage,
},
{
  path: '/main',
  name: 'Main',
  component: MainPage,
},
{
  path: '/login',
  name: 'Login',
  component: LoginPage,
},
{
  path: '/my-info',
  name: 'MyInfo',
  component: MyInfoPage,
},
{
  path: '/edit-profile',
  name: 'EditProfile',
  component: EditProfilePage,
},
{
  path: '/chat-list',
  name: 'ChatList',
  component: ChatListPage,
},
{
  path: '/chat/:id',
  name: 'ChatDetail',
  component: ChatDetailPage,
},
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
