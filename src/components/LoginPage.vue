<template>
  <div class="login">
    <h1>Выберите пользователя</h1>
    <ul>
      <li v-for="user in users" :key="user.id">
        <button @click="selectUser(user)">{{ user.name }}</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { useUserStore } from '../store/userStore';

export default {
  data() {
    return {
      users: [
        { id: 1, name: 'Алиса' },
        { id: 2, name: 'Адиль' },
        { id: 3, name: 'Каролина' }
      ]
    };
  },
  methods: {
    selectUser(user) {
      const userStore = useUserStore();
      userStore.setUser(user);
      this.$router.push('/chats');
    }
  }
};
</script>


<style scoped>
.login {
  text-align: center;
  margin-top: 50px;
}
button {
  margin: 10px;
  padding: 10px;
}
</style>
