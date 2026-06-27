<template>
  <Transition name="tip">
    <div v-if="store.tip" class="tip-overlay" @click="store.confirmTip()">
      <div class="tip-card" :class="store.tip.type" @click.stop>
        <div class="tip-icon">{{ store.tip.type === 'success' ? '✅' : '💀' }}</div>
        <div class="tip-text">{{ store.tip.text }}</div>
        <div class="tip-score" v-if="store.tip.type === 'success'">
          闪避次数：{{ store.score }}
        </div>
        <div class="tip-score" v-else>
          最终得分：{{ store.score }}
        </div>
        <button class="tip-close" @click="store.confirmTip()">确定</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useGameStore } from '../store/gameStore.js'

const store = useGameStore()
</script>

<style scoped>
.tip-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}

.tip-card {
  background: #16213e;
  border-radius: 16px;
  padding: 32px 40px;
  text-align: center;
  min-width: 260px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.tip-card.success {
  border: 2px solid #00b894;
}
.tip-card.fail {
  border: 2px solid #d63031;
}

.tip-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.tip-text {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}
.success .tip-text { color: #00b894; }
.fail .tip-text { color: #d63031; }

.tip-score {
  font-size: 16px;
  color: #fdcb6e;
  margin-bottom: 16px;
}

.tip-close {
  padding: 8px 24px;
  border-radius: 8px;
  border: none;
  background: #0f3460;
  color: #e0e0e0;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.tip-close:hover {
  background: #1a4a8a;
}

/* 过渡动画 */
.tip-enter-active { transition: all 0.3s ease; }
.tip-leave-active { transition: all 0.2s ease; }
.tip-enter-from { opacity: 0; }
.tip-enter-from .tip-card { transform: scale(0.9); }
.tip-leave-to { opacity: 0; }
</style>