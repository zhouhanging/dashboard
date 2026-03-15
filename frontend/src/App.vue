<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

onMounted(() => {
  // 无需登录检查，直接展示默认页面
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #0a101f;
  color: #fff;
}

.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>