import { createRouter, createWebHashHistory } from 'vue-router';
import LoginPage from '../components/LoginPage.vue';
import ChatList from '../components/ChatList.vue';
import ChatWindow from '../components/ChatWindow.vue'; 

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/chats',
    name: 'ChatList',
    component: ChatList
  },
  {
    path: '/chats/:chatId',
    name: 'ChatWindow',
    component: ChatWindow
  }
];

const router = createRouter({
  history: createWebHashHistory(),  
  routes
});

export default router;
