import Dexie from 'dexie';

// Создаём базу данных
const db = new Dexie('ChatDatabase');

// Создаём хранилища для чатов и сообщений
db.version(1).stores({
  messages: '++id, chatId, sender, text, timestamp, fullDate', // Хранилище сообщений
  chats: '++id, participants' // Хранилище чатов
});

// Функция для добавления чата
export function addChat(participants) {
  return db.chats.add({
    participants
  });
}

// Функция для получения всех чатов
export function getChats() {
  return db.chats.toArray();
}

// Функция для получения чата по id
export function getChatById(chatId) {
  return db.chats.get(chatId);
}

// Функция для добавления сообщения
export function addMessage(chatId, sender, text, formattedTime) {
  return db.messages.add({
    chatId,
    sender,
    text,
    timestamp: formattedTime.time, // Сохранение корректного времени
    fullDate: formattedTime.fullDate, // Сохранение полной даты
    read: false // Сообщение по умолчанию непрочитанное
  });
}

// Функция для пометки сообщений как прочитанных
export function markMessagesAsRead(chatId) {
  return db.messages.where({ chatId }).modify({ read: true });
}

// Функция для получения сообщений по chatId
export function getMessages(chatId) {
  return db.messages.where({ chatId }).sortBy('timestamp'); // Возвращаем также timestamp и fullDate
}

export default db;
