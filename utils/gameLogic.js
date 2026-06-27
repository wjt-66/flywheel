/**
 * 游戏核心工具函数
 * - 随机攻击间隔
 * - 闪避判定
 * - 前摇进度计算
 */

/** 飞轮无敌帧时长（秒） */
export const DODGE_WINDOW = 0.4

/** 随机攻击间隔范围（秒） */
export const ATTACK_INTERVAL_MIN = 2
export const ATTACK_INTERVAL_MAX = 5

/**
 * 生成随机攻击间隔（毫秒）
 */
export function getRandomInterval() {
  return (Math.random() * (ATTACK_INTERVAL_MAX - ATTACK_INTERVAL_MIN) + ATTACK_INTERVAL_MIN) * 1000
}

/**
 * 计算前摇进度百分比 0~100
 * @param {number} attackStartTime - 攻击开始时间戳 (ms)
 * @param {number} windupTime - 前摇总时长 (秒)
 * @param {number} now - 当前时间戳 (ms)
 */
export function getWindupProgress(attackStartTime, windupTime, now) {
  const elapsed = now - attackStartTime
  return Math.min((elapsed / (windupTime * 1000)) * 100, 100)
}

/**
 * 判断当前是否在飞轮无敌帧判定窗口内
 * 窗口：攻击命中前 0~0.4s，即 [hitTime - 0.4s, hitTime]
 * @param {number} attackStartTime - 攻击开始时间戳 (ms)
 * @param {number} windupTime - 前摇总时长 (秒)
 * @param {number} now - 当前时间戳 (ms)
 */
export function isInDodgeWindow(attackStartTime, windupTime, now) {
  const hitTime = attackStartTime + windupTime * 1000
  const windowStart = hitTime - DODGE_WINDOW * 1000
  return now >= windowStart && now <= hitTime
}

/**
 * 获取攻击命中时间戳
 * @param {number} attackStartTime - 攻击开始时间戳 (ms)
 * @param {number} windupTime - 前摇总时长 (秒)
 */
export function getHitTime(attackStartTime, windupTime) {
  return attackStartTime + windupTime * 1000
}

/**
 * 获取闪避窗口开始时间戳
 * @param {number} attackStartTime - 攻击开始时间戳 (ms)
 * @param {number} windupTime - 前摇总时长 (秒)
 */
export function getDodgeWindowStart(attackStartTime, windupTime) {
  return getHitTime(attackStartTime, windupTime) - DODGE_WINDOW * 1000
}