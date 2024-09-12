<template>
  <b-container fluid class="pt-4 pb-4 chat-container">
    <b-row class="justify-content-center">
      <b-col cols="12" md="8" lg="6">
        <div class="chat-header text-center mb-4 p-3">
          <h1 class="text-white">Добро пожаловать, {{ user.name }}!</h1>
          <h2 class="text-white-50">Выберите чат:</h2>
        </div>

        <b-list-group class="shadow chat-list">
          <b-list-group-item 
            v-for="chat in availableChats" 
            :key="chat.id" 
            @click="selectChat(chat.id)" 
            class="chat-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{{ getChatParticipants(chat) }}</strong>
              <p class="chat-last-message mb-0">{{ getLastMessage(chat) }}</p>
            </div>
            <div class="text-right">
              <span v-if="getUnreadCount(chat)" class="unread-count">
                {{ getUnreadCount(chat) }}
              </span>
              <p class="chat-time mb-0">{{ getLastMessageTime(chat) }}</p>
            </div>
          </b-list-group-item>
        </b-list-group>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { useUserStore } from '../store/userStore';
import { getMessages, markMessagesAsRead } from '../db';

export default {
  data() {
    return {
      chats: [
        { id: 1, participants: ['Алиса', 'Адиль'], messages: [] },
        { id: 2, participants: ['Алиса', 'Каролина'], messages: [] },
        { id: 3, participants: ['Адиль', 'Каролина'], messages: [] },
      ],
      broadcastChannel: null,
    };
  },
  computed: {
    user() {
      const userStore = useUserStore();
      return userStore.currentUser;
    },
    availableChats() {
      return this.chats.filter(chat => chat.participants.includes(this.user.name));
    }
  },
  methods: {
    getChatParticipants(chat) {
      return chat.participants.filter(p => p !== this.user.name).join(', ');
    },
    async selectChat(chatId) {
      await markMessagesAsRead(chatId);
      this.$router.push({ name: 'ChatWindow', params: { chatId } });
      this.loadChats();
    },
    async loadChats() {
      this.chats.forEach(async (chat) => {
        chat.messages = await getMessages(chat.id);
      });
    },
    getLastMessage(chat) {
      if (chat.messages.length > 0) {
        const lastMessage = chat.messages[chat.messages.length - 1];
        return `${lastMessage.text}`;
      } else {
        return 'No messages yet';
      }
    },
    getLastMessageTime(chat) {
      if (chat.messages.length > 0) {
        const lastMessage = chat.messages[chat.messages.length - 1];
        return lastMessage.timestamp || '';
      }
      return '';
    },
    getUnreadCount(chat) {
      return chat.messages.filter(message => message.sender !== this.user.name && !message.read).length;
    },
    updateChatWithNewMessage(chatId, message) {
      const chat = this.chats.find(c => c.id === chatId);
      if (chat) {
        chat.messages.push(message);
      }
    }
  },
  created() {
    this.loadChats();

    this.broadcastChannel = new BroadcastChannel('chat_channel');
    this.broadcastChannel.onmessage = (event) => {
      const { chatId, message } = event.data;
      this.updateChatWithNewMessage(chatId, message);
    };
  },
  beforeUnmount() {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
  }
};
</script>

<style scoped>
.chat-container {
  background-color: #343a40;
}

.chat-header {
  background-color: #495057;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chat-list {
  background-color: white;
  border-radius: 10px;
}

.chat-item {
  cursor: pointer;
  transition: background-color 0.3s;
  padding: 15px;
  border-bottom: 1px solid #ddd;
  background-color: #f8f9fa;
}

.chat-item:hover {
  background-color: #e9ecef;
}

.chat-last-message {
  font-size: 0.85em;
  color: #6c757d;
}

.chat-time {
  font-size: 0.75em;
  color: #adb5bd;
}

.unread-count {
  background-color: #ff3b30;
  color: #fff;
  border-radius: 50%;
  padding: 5px 10px;
  font-size: 0.85em;
  margin-left: 10px;
}
</style>
