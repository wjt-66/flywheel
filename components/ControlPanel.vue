<template>
  <div class="control-panel">
    <h2 class="panel-title">飞轮闪避训练</h2>

    <!-- 监管选择 -->
    <div class="control-group">
      <label class="control-label">选择监管者</label>
      <select
        class="hunter-select"
        :value="store.selectedHunterId"
        @change="onSelectHunter"
        :disabled="isPlaying"
      >
        <option
          v-for="h in store.hunters"
          :key="h.id"
          :value="h.id"
        >
          {{ h.name }}（前摇 {{ h.windupTime }}s）
        </option>
      </select>
    </div>

    <!-- 开始 / 重置 -->
    <div class="action-buttons">
      <button
        v-if="store.gameState === 'idle' || store.gameState === 'gameover'"
        class="btn btn-start"
        @click="store.startGame()"
      >
        开始游戏
      </button>
      <button
        v-if="store.gameState === 'waiting' || store.gameState === 'windup' || store.gameState === 'gameover'"
        class="btn btn-reset"
        @click="store.resetGame()"
      >
        重置
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../store/gameStore.js'

const store = useGameStore()

const isPlaying = computed(() =>
  store.gameState === 'waiting' || store.gameState === 'windup'
)

function onSelectHunter(e) {
  store.selectHunter(e.target.value)
}
</script>

<style scoped>
.control-panel {
  background: #16213e;
  border-radius: 12px;
  padding: 16px;
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-title {
  font-size: 16px;
  text-align: center;
  color: #fdcb6e;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.control-label {
  font-size: 11px;
  color: #8899aa;
}
.hunter-select {
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #333;
  background: #0f3460;
  color: #e0e0e0;
  font-size: 12px;
  cursor: pointer;
  outline: none;
}
.hunter-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.hunter-select option {
  background: #0f3460;
  color: #e0e0e0;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.btn {
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-start {
  background: #00b894;
  color: #fff;
}
.btn-start:hover {
  background: #00a381;
}
.btn-reset {
  background: #636e72;
  color: #fff;
}
.btn-reset:hover {
  background: #4a5558;
}

/* 手机端适配 */
@media (max-width: 640px) {
  .control-panel {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    padding: 12px;
    gap: 10px;
    border-radius: 12px;
  }
  .panel-title {
    width: 100%;
    font-size: 15px;
  }
  .control-group {
    flex: 1;
    min-width: 140px;
  }
  .action-buttons {
    flex-direction: row;
    gap: 6px;
  }
  .btn {
    padding: 6px 14px;
    font-size: 12px;
  }
  .hunter-select {
    font-size: 12px;
    padding: 5px 6px;
  }
}
</style>