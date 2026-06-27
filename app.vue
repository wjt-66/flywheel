<template>
  <div class="app-container">
    <ControlPanel class="sidebar" />
    <GameBoard class="main" />
    <GameTip />
  </div>
</template>

<script setup>
import ControlPanel from './components/ControlPanel.vue'
import GameBoard from './components/GameBoard.vue'
import GameTip from './components/GameTip.vue'
</script>

<style scoped>
.app-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
  min-height: 100vh;
}

.sidebar {
  flex-shrink: 0;
  margin-top: 40px;
}

.main {
  flex-shrink: 0;
}
</style>