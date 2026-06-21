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
import MeetingAnalysisPage from "@/views/chat/MeetingAnalysisPage.vue";
import PersonaAnalysisParticipantDetailPage from "@/views/chat/PersonaAnalysisParticipantDetailPage.vue";
import PersonaAnalysisPage from "@/views/chat/PersonaAnalysisPage.vue";

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
    path: '/chat/:chatId/persona-analysis',
    name: 'PersonaAnalysis',
    component: PersonaAnalysisPage
  },
  {
    path: '/chat/:chatId/persona-analysis/participant/:participantId',
    name: 'PersonaAnalysisParticipantDetail',
    component: PersonaAnalysisParticipantDetailPage
  },
  {
    path: '/chat/:chatId/meeting-analysis',
    name: 'MeetingAnalysis',
    component: MeetingAnalysisPage
  },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
