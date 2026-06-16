import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "@/views/auth/LoginPage.vue";
import MainPage from "@/views/MainPage.vue";
import MyInfoPage from "@/views/MyInfoPage.vue";
import FindEmailPage from "@/views/auth/FindEmailPage.vue";
import FindPasswordPage from "@/views/auth/FindPasswordPage.vue";
import RegisterPage from "@/views/auth/RegisterPage.vue";
import EditProfilePage from "@/views/EditProfilePage.vue";
import ChatListPage from "@/views/chat/ChatListPage.vue";
import ChatDetailPage from "@/views/chat/ChatDetailPage.vue";
import UploadChatPage from "@/views/chat/UploadChatPage.vue";
import EditChatPage from "@/views/chat/EditChatPage.vue";
import ParticipantListPage from "@/views/chat/ParticipantListPage.vue";
import ParticipantDetailPage from "@/views/chat/ParticipantDetailPage.vue";

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
  path: '/chat-detail/:id',
  name: 'ChatDetail',
  component: ChatDetailPage,
},
{
    path: "/upload-chat",
    name: "UploadChat",
    component: UploadChatPage
  },
  {
    path: '/edit-chat/:id',
    name: 'EditChat',
    component: EditChatPage
  },
  {
    path: '/chat/:chatId/participant-list',
    name: 'ParticipantList',
    component: ParticipantListPage
  },
  {
    path: '/chat/:chatId/participant-detail/:participantId',
    name: 'ParticipantDetail',
    component: ParticipantDetailPage
  },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
