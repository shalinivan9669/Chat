import { defineStore } from 'pinia';

export const useChatStore = defineStore('chat', {
  state: () => ({
    chats: [
      { id: 1, participants: ['Алиса', 'Адиль'], messages: [] },
      { id: 2, participants: ['Алиса', 'Каролина'], messages: [] },
      { id: 3, participants: ['Адиль', 'Каролина'], messages: [] }
    ]
  }),
  actions: {
    getChatById(chatId) {
      return this.chats.find(chat => chat.id === chatId);
    }
  }
});