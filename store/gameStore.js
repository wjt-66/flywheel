import { defineStore } from 'pinia'
import {
    getRandomInterval,
    getWindupProgress,
    isInDodgeWindow,
    getHitTime,
    DODGE_WINDOW,
} from '../utils/gameLogic.js'

// ========== 监管者立绘图片导入（图片放在 public/assets/hunters/ 目录下） ==========
import hunterA from '/assets/hunters/hunter_a.jpg'
import hunterB from '/assets/hunters/hunter_b.jpg'
import hunterC from '/assets/hunters/hunter_c.jpg'
import hunterD from '/assets/hunters/hunter_d.jpg'
import hunterE from '/assets/hunters/hunter_e.jpg'
import hunterF from '/assets/hunters/hunter_f.jpg'

const hunterAImg = hunterA
const hunterBImg = hunterB
const hunterCImg = hunterC
const hunterDImg = hunterD
const hunterEImg = hunterE
const hunterFImg = hunterF

// ========== 监管者攻击音效路径（音效文件放在 public/assets/sounds/ 目录下） ==========
const SOUNDS = {
    hunter_a: '/assets/sounds/hunter_a.mp3',
    hunter_b: '/assets/sounds/hunter_b.mp3',
    hunter_c: '/assets/sounds/hunter_c.mp3',
    hunter_d: '/assets/sounds/hunter_d.mp3',
    hunter_e: '/assets/sounds/hunter_e.mp3',
    hunter_f: '/assets/sounds/hunter_f.mp3',
}

/** 预加载音效 */
const audioCache = {}
Object.entries(SOUNDS).forEach(([id, path]) => {
    const audio = new Audio(path)
    audio.preload = 'auto'
    audioCache[id] = audio
})

/** 监管者配置：每种监管绑定专属出刀前摇时长（秒） */
const HUNTERS = [
    { id: 'hunter_a', name: '阿猩', windupTime: 0.35, image: hunterAImg, sound: audioCache.hunter_a },
    { id: 'hunter_b', name: '西蓝花', windupTime: 0.25, image: hunterBImg, sound: audioCache.hunter_b },
    { id: 'hunter_c', name: '老团长（黑化版）', windupTime: 0.32, image: hunterCImg, sound: audioCache.hunter_c },
    { id: 'hunter_d', name: '破轮', windupTime: 0.43, image: hunterDImg, sound: audioCache.hunter_d },
    { id: 'hunter_e', name: '圣诞沙龙', windupTime: 0.55, image: hunterEImg, sound: audioCache.hunter_e },
    { id: 'hunter_f', name: '战乙女', windupTime: 0.5, image: hunterFImg, sound: audioCache.hunter_f },
]

export const useGameStore = defineStore('game', {
    state: () => ({
        /** 所有可选监管者 */
        hunters: HUNTERS,
        /** 当前选中监管者 ID */
        selectedHunterId: HUNTERS[0].id,
        /** 游戏状态: idle | waiting | windup | gameover */
        gameState: 'idle',
        /** 成功闪避次数 */
        score: 0,
        /** 当前攻击开始时间戳 (ms) */
        attackStartTime: 0,
        /** 前摇进度 0~100 */
        windupProgress: 0,
        /** 提示文字 */
        message: '',
        /** 弹窗提示: null | { type: 'success'|'fail', text: string } */
        tip: null,
        /** 定时器 ID 集合 */
        _timers: [],
    }),

    getters: {
        selectedHunter(state) {
            return state.hunters.find(h => h.id === state.selectedHunterId)
        },
        /** 是否在闪避窗口内（实时计算） */
        inDodgeWindow(state) {
            if (state.gameState !== 'windup' || !state.attackStartTime) return false
            return isInDodgeWindow(
                state.attackStartTime,
                this.selectedHunter.windupTime,
                Date.now(),
            )
        },
    },

    actions: {
        /** 选择监管者 */
        selectHunter(id) {
            if (this.gameState === 'idle' || this.gameState === 'gameover') {
                this.selectedHunterId = id
            }
        },

        /** 开始游戏 */
        startGame() {
            this._clearAllTimers()
            this.score = 0
            this.windupProgress = 0
            this.attackStartTime = 0
            this.message = '准备开始…'
            this.tip = null
            this.gameState = 'waiting'
            this._scheduleNextAttack()
        },

        /** 重置游戏 */
        resetGame() {
            this._clearAllTimers()
            this.gameState = 'idle'
            this.score = 0
            this.windupProgress = 0
            this.attackStartTime = 0
            this.message = ''
            this.tip = null
        },

        /** 按下飞轮闪避 */
        pressDodge() {
            if (this.gameState === 'idle' || this.gameState === 'gameover') return

            // 等待中按飞轮 → 无效飞轮
            if (this.gameState === 'waiting') {
                this._onHit('无效飞轮！监管尚未出刀，被击中！')
                return
            }

            const now = Date.now()
            const hunter = this.selectedHunter
            const inWindow = isInDodgeWindow(this.attackStartTime, hunter.windupTime, now)

            if (inWindow) {
                // 闪避成功
                this._clearAllTimers()
                this.score++
                    this.windupProgress = 0
                this.message = `闪避成功！当前得分：${this.score}`
                this.tip = { type: 'success', text: '闪避成功！' }
                    // 暂停游戏，等待玩家点击"确定"后继续
            } else {
                // 按早了（无敌已结束 或 窗口未到）
                this._onHit('按早了！飞轮无敌已结束，被击中！')
            }
        },

        /** 弹窗确认：成功时继续游戏，失败时仅关闭弹窗 */
        confirmTip() {
            if (!this.tip) return
            if (this.tip.type === 'success') {
                this.gameState = 'waiting'
                this.tip = null
                this._scheduleNextAttack()
            } else {
                this.tip = null
            }
        },

        /** 推进前摇进度（由游戏循环调用） */
        tickWindup() {
            if (this.gameState !== 'windup') return
            const hunter = this.selectedHunter
            const now = Date.now()
            this.windupProgress = getWindupProgress(this.attackStartTime, hunter.windupTime, now)

            // 检查是否超出命中时间（超时未按）
            if (this.windupProgress >= 100) {
                this._onHit('超时未闪避，被击中！')
            }
        },

        // ========== 内部方法 ==========

        /** 排定下一次攻击 */
        _scheduleNextAttack() {
            const delay = getRandomInterval()
            const timer = setTimeout(() => {
                this._startAttack()
            }, delay)
            this._timers.push(timer)
        },

        /** 开始攻击前摇 */
        _startAttack() {
            this.attackStartTime = Date.now()
            this.gameState = 'windup'
            this.windupProgress = 0
            this.message = '⚠️ 监管出刀！快按飞轮闪避！'

            // 播放当前监管者攻击音效
            const hunter = this.selectedHunter
            if (hunter && hunter.sound) {
                hunter.sound.currentTime = 0
                hunter.sound.play().catch(() => {})
            }

            // 启动前摇进度更新循环
            this._tickLoop = setInterval(() => {
                this.tickWindup()
            }, 16)
            this._timers.push(this._tickLoop)
        },

        /** 被击中 */
        _onHit(text) {
            this._clearAllTimers()
            this.gameState = 'gameover'
            this.windupProgress = 100
            this.message = text + ` 最终得分：${this.score}`
            this.tip = { type: 'fail', text }
        },

        /** 清除所有定时器 */
        _clearAllTimers() {
            this._timers.forEach(t => {
                if (t) clearTimeout(t)
                if (t) clearInterval(t)
            })
            this._timers = []
        },
    },
})