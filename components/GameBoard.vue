<template>
  <div class="game-board">
    <!-- 监管立绘展示区 -->
    <div class="hunter-display" :class="{ 'attack-warning': store.gameState === 'windup' }">
      <div class="hunter-avatar">
        <img
          v-if="store.selectedHunter?.image"
          :src="store.selectedHunter.image"
          :alt="store.selectedHunter.name"
          class="hunter-img"
        />
        <span v-else class="hunter-placeholder">🖼️</span>
      </div>
      <div class="hunter-name">{{ store.selectedHunter?.name }}</div>
      <div class="hunter-stat">
        出刀前摇：{{ store.selectedHunter?.windupTime }}s
      </div>
    </div>

    <!-- 飞轮闪避按钮 -->
    <button
      class="dodge-btn"
      :class="{ active: store.gameState === 'windup', danger: store.gameState === 'waiting' }"
      :disabled="store.gameState === 'idle' || store.gameState === 'gameover'"
      @click="store.pressDodge()"
    >
      🛡️ 飞轮闪避
      <span class="btn-hint" v-if="store.gameState === 'windup'">（0.4s 无敌）</span>
      <span class="btn-hint" v-else-if="store.gameState === 'waiting'">等待攻击…</span>
      <span class="btn-hint" v-else-if="store.gameState === 'gameover'">游戏结束</span>
      <span class="btn-hint" v-else>未开始</span>
    </button>

    <!-- 攻击动画 & 前摇进度条 -->
    <div class="progress-section" v-if="store.gameState === 'windup' || store.gameState === 'gameover'">
      <div class="progress-bar-track">
        <div
          class="progress-bar-fill"
          :style="{ width: store.windupProgress + '%' }"
          :class="{ danger: store.windupProgress > 80 }"
        ></div>
        <!-- 闪避窗口标记 -->
        <div
          class="dodge-zone"
          v-if="store.selectedHunter"
          :style="{ left: dodgeZoneLeft + '%', width: dodgeZoneWidth + '%' }"
        ></div>
      </div>
      <div class="progress-label">
        <span>前摇</span>
        <span v-if="store.gameState === 'windup'">闪避窗口</span>
        <span>命中</span>
      </div>
    </div>

    <!-- 提示文字 & 分数 -->
    <div class="info-section">
      <div class="score-display">
        闪避次数：<span class="score-value">{{ store.score }}</span>
      </div>
      <div class="message" :class="messageClass">{{ store.message }}</div>
    </div>

    <!-- 等待攻击提示 -->
    <div class="waiting-hint" v-if="store.gameState === 'waiting'">
      <span class="pulse-dot"></span>
      等待监管攻击中…
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../store/gameStore.js'
import { DODGE_WINDOW } from '../utils/gameLogic.js'

const store = useGameStore()

/** 闪避窗口在进度条上的位置（百分比） */
const dodgeZoneLeft = computed(() => {
  if (!store.selectedHunter) return 0
  const windup = store.selectedHunter.windupTime
  return ((windup - DODGE_WINDOW) / windup) * 100
})

const dodgeZoneWidth = computed(() => {
  if (!store.selectedHunter) return 0
  return (DODGE_WINDOW / store.selectedHunter.windupTime) * 100
})

const messageClass = computed(() => {
  if (store.gameState === 'gameover') return 'msg-fail'
  if (store.gameState === 'windup') return 'msg-warning'
  return 'msg-info'
})
</script>

<style scoped>
.game-board {
  background: #16213e;
  border-radius: 16px;
  padding: 32px 40px;
  max-width: 520px;
  width: 100%;
  text-align: center;
}

/* 监管展示 */
.hunter-display {
  padding: 24px;
  border-radius: 12px;
  background: #0f3460;
  transition: all 0.3s;
  margin-bottom: 20px;
}
.hunter-display.attack-warning {
  background: #4a1525;
  animation: shake 0.1s infinite;
}
.hunter-avatar {
  width: 300px;
  height: 300px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  background: #0a0a1a;
}
.hunter-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hunter-placeholder {
  font-size: 80px;
  opacity: 0.3;
}
.hunter-name {
  font-size: 24px;
  font-weight: bold;
  margin-top: 12px;
}
.hunter-stat {
  font-size: 14px;
  color: #8899aa;
  margin-top: 6px;
}

/* 飞轮按钮 */
.dodge-btn {
  width: 100%;
  padding: 18px 24px;
  border-radius: 12px;
  border: 2px solid #444;
  background: #1a1a2e;
  color: #8899aa;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
}
.dodge-btn.active {
  border-color: #fdcb6e;
  background: #2d1b00;
  color: #fdcb6e;
  animation: glow 1s ease-in-out infinite;
  cursor: pointer;
}
.dodge-btn.danger {
  border-color: #e17055;
  background: #2d1515;
  color: #e17055;
  cursor: pointer;
}
.dodge-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.dodge-btn.active:active {
  transform: scale(0.95);
  background: #fdcb6e;
  color: #1a1a2e;
}
.btn-hint {
  font-size: 12px;
  font-weight: normal;
  opacity: 0.7;
}

/* 进度条 */
.progress-section {
  margin-bottom: 16px;
}
.progress-bar-track {
  position: relative;
  height: 20px;
  background: #1a1a2e;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #333;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00b894, #00cec9);
  border-radius: 10px;
  transition: width 0.05s linear;
}
.progress-bar-fill.danger {
  background: linear-gradient(90deg, #e17055, #d63031);
}
.dodge-zone {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(255, 234, 167, 0.35);
  border-left: 2px solid #fdcb6e;
  border-right: 2px solid #fdcb6e;
  box-sizing: border-box;
}
.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #667788;
  margin-top: 4px;
  padding: 0 4px;
}

/* 信息区 */
.info-section {
  margin-bottom: 12px;
}
.score-display {
  font-size: 18px;
  margin-bottom: 8px;
}
.score-value {
  color: #fdcb6e;
  font-weight: bold;
  font-size: 24px;
}
.message {
  font-size: 15px;
  min-height: 22px;
  transition: color 0.3s;
}
.msg-info { color: #74b9ff; }
.msg-warning { color: #fdcb6e; }
.msg-fail { color: #d63031; }

/* 等待提示 */
.waiting-hint {
  color: #667788;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.pulse-dot {
  width: 8px;
  height: 8px;
  background: #74b9ff;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}
@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 8px rgba(253, 203, 110, 0.3); }
  50% { box-shadow: 0 0 20px rgba(253, 203, 110, 0.6); }
}

/* 手机端适配 */
@media (max-width: 640px) {
  .game-board {
    padding: 20px 16px;
    border-radius: 12px;
  }
  .hunter-display {
    padding: 16px;
    margin-bottom: 14px;
  }
  .hunter-avatar {
    width: 200px;
    height: 200px;
  }
  .hunter-name {
    font-size: 20px;
    margin-top: 8px;
  }
  .hunter-stat {
    font-size: 12px;
  }
  .dodge-btn {
    padding: 14px 16px;
    font-size: 18px;
    margin-bottom: 12px;
  }
  .btn-hint {
    font-size: 11px;
  }
  .progress-bar-track {
    height: 16px;
  }
  .progress-section {
    margin-bottom: 12px;
  }
  .score-display {
    font-size: 14px;
  }
  .message {
    font-size: 13px;
  }
  .waiting-hint {
    font-size: 13px;
  }
}
</style>