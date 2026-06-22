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
import UnauthorizedPage from "@/views/error/UnauthorizedPage.vue";
import ForbiddenPage from "@/views/error/ForbiddenPage.vue";
import NotFoundPage from "@/views/error/NotFoundPage.vue";
import ServerErrorPage from "@/views/error/ServerErrorPage.vue";
import NetworkErrorPage from "@/views/error/NetworkErrorPage.vue";

const routes = [
{
  path: '/',
  redirect: '/main'
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
  path: '/chat',
  name: 'ChatList',
  component: ChatListPage,
},
{
  path: '/chat/:chatId',
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
  {
    path: '/error/401',
    name: 'Unauthorized',
    component: UnauthorizedPage
  },
  {
    path: '/error/403',
    name: 'Forbidden',
    component: ForbiddenPage
  },
  // {
  //   path: '/error/404',
  //   name: 'NotFound',
  //   component: NotFoundPage
  // },
  {
    path: '/error/500',
    name: 'ServerError',
    component: ServerErrorPage
  },
  {
    path: '/error/network',
    name: 'NetworkError',
    component: NetworkErrorPage
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFoundPage,
  },
  


]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
