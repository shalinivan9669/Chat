import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null
  }),
  actions: {
    setUser(user) {
      this.currentUser = user;
      sessionStorage.setItem('currentUser', JSON.stringify(user)); // Сохраняем в sessionStorage
    },
    loadUserFromStorage() {
      const storedUser = sessionStorage.getItem('currentUser'); // Читаем из sessionStorage
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
  }
});
