<template>
  <div v-if="chat">
    <h1>Чат с  {{ chatParticipants }}</h1>
    <ul class="message-list">
      <li 
        v-for="(message, index) in chat.messages" 
        :key="index" 
        :class="{'my-message': message.sender === user.name, 'other-message': message.sender !== user.name}" 
        class="message-item"
      >
        <div class="message-content">
          <strong>{{ message.sender }}:</strong> {{ message.text }}
        </div>
        <div class="message-timestamp" :title="message.fullDate">
          {{ message.timestamp }} <!-- Отображаем сохранённое время сообщения -->
        </div>
      </li>
    </ul>

    <!-- Контейнер для поля ввода и кнопки отправки -->
    <div class="input-group mt-3">
      <input 
        v-model="newMessage" 
        placeholder="Напишите ваше сообщение" 
        class="form-control message-input"
      />
      <button @click="sendMessage" class="btn btn-primary">
        Отправить
      </button>
    </div>
  </div>
  <div v-else>
    <p>Чат не найден.</p>
  </div>
</template>

<script>
import { useUserStore } from '../store/userStore';
import { useChatStore } from '../store/chatStore';
import { addMessage, getMessages } from '../db';

export default {
  data() {
    return {
      newMessage: '',
      broadcastChannel: null,
      isLoading: true
    };
  },
  computed: {
    user() {
      const userStore = useUserStore();
      const savedUser = localStorage.getItem('currentUser'); // Сохраняем текущего пользователя в localStorage

      if (!userStore.currentUser && savedUser) {
        userStore.currentUser = JSON.parse(savedUser); // Восстанавливаем пользователя из localStorage
      }

      return userStore.currentUser;
    },
    chat() {
      const chatStore = useChatStore();
      const chatId = Number(this.$route.params.chatId);
      return chatStore.getChatById(chatId);
    },
    chatParticipants() {
      if (!this.chat) return '';
      return this.chat.participants.filter(p => p !== this.user.name).join(', ');
    }
  },
  methods: {
    formatMessageTime(date) {
      const optionsTime = { hour: '2-digit', minute: '2-digit' };
      const optionsFull = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      
      return {
        time: date.toLocaleTimeString([], optionsTime),
        fullDate: date.toLocaleDateString('ru-RU', optionsFull)
      };
    },

    async sendMessage() {
  if (this.newMessage.trim() !== '') {
    try {
      const now = new Date();
      const formattedTime = this.formatMessageTime(now);  
      const message = {
        sender: this.user.name,
        text: this.newMessage,
        timestamp: formattedTime.time, // Добавляем время отправки
        fullDate: formattedTime.fullDate // И полную дату
      };

      // Добавляем сообщение в текущий чат
      this.chat.messages.push(message);

      // Сохраняем сообщение в IndexedDB
      await addMessage(this.chat.id, this.user.name, this.newMessage, formattedTime);

      // Отправляем сообщение через BroadcastChannel
      this.broadcastChannel.postMessage({
        chatId: this.chat.id,
        message
      });

      this.newMessage = '';  
    } catch (error) {
      console.error("Ошибка при отправке сообщения: ", error);
    }
  }
}
,

    async loadMessages() {
      try {
        const messages = await getMessages(this.chat.id);
        this.chat.messages = messages;
        this.isLoading = false;
      } catch (error) {
        console.error("Ошибка при загрузке сообщений: ", error);
      }
    },

    receiveMessage(event) {
      try {
        if (event.data.chatId === this.chat.id) {
          const newMessage = event.data.message;
          this.chat.messages.push(newMessage);
  
          if (Notification.permission === 'granted' && !document.hasFocus()) {
            this.showNotification(newMessage.sender, newMessage.text);
          }
        }
      } catch (error) {
        console.error("Ошибка при получении сообщения через BroadcastChannel: ", error);
      }
    },

    showNotification(sender, message) {
      try {
        new Notification(`Новое сообщение от ${sender}`, {
          body: message,
        });
      } catch (error) {
        console.error("Ошибка при показе уведомления: ", error);
      }
    }
  },

  async created() {
    try {
      this.broadcastChannel = new BroadcastChannel('chat_channel');
      this.broadcastChannel.onmessage = this.receiveMessage;
  
      const chatId = Number(this.$route.params.chatId);
      const chatStore = useChatStore();
      const chat = chatStore.getChatById(chatId);
      if (chat) {
        this.chat = chat;
        await this.loadMessages();
      } else {
        this.$router.push('/chats');
      }
  
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Пользователь разрешил уведомления');
        } else {
          console.log('Пользователь отклонил уведомления');
        }
      });

      // Сохраняем пользователя в localStorage
      localStorage.setItem('currentUser', JSON.stringify(this.user));

    } catch (error) {
      console.error("Ошибка в created(): ", error);
    }
  },

  beforeUnmount() {
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.close();
      }
    } catch (error) {
      console.error("Ошибка при закрытии BroadcastChannel: ", error);
    }
  }
};
</script>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.message-list {
  padding: 0;
  margin-bottom: 10px;
  max-height: 400px;  
  overflow-y: auto;   
}

.message-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f1f1f1;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
}

.other-message {
  background-color: #e1f5fe; /* Голубой цвет */
}

.my-message {
  background-color: #c8e6c9; /* Зелёный цвет */
  align-self: flex-end;
}

.message-content {
  display: inline-block;
}

.message-timestamp {
  font-size: 0.8em;
  color: #888;
  cursor: pointer;
  display: inline-block;
}

.message-input {
  border-radius: 20px;
}
</style>
