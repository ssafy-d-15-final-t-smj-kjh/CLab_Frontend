import LoginPage from '@/views/LoginPage.vue'
import MainPage from '@/views/MainPage.vue'
import MyInfoPage from '@/views/MyInfoPage.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
{
  path: '/',
  redirect: '/login'
},
{
  path: '/main',
  name: 'main',
  component: MainPage,
},
{
  path: '/login',
  name: 'login',
  component: LoginPage,
},
{
  path: '/myinfo',
  name: 'myinfo',
  component: MyInfoPage,
},
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
