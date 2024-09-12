<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { useUserStore } from './store/userStore';

export default {
  name: 'App',
  created() {
    const userStore = useUserStore();
    userStore.loadUserFromStorage();
  }
}
 
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  margin-left: 80px;
  margin-right: 80px;
}
</style>
