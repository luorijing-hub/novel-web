// 签到与经验（按账号隔离）
// 规则：签到 1 天 = 10 经验；读完 1 本书 = 100 经验；每 300 经验升一级（上限 Lv.10）
import { readString, writeString } from '@/utils/storage'

export const CHECKIN_EXP_PER_DAY = 10
export const BOOK_EXP = 100
export const LEVEL_EXP_NEED = 300

function dateKey(username: string): string {
  return `checkin_date_${username}`
}

function expKey(username: string): string {
  return `checkin_exp_${username}`
}

export function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function getCheckinExp(username: string): number {
  const raw = readString(expKey(username), '')
  return raw ? Number(raw) : 0
}

export function isSignedToday(username: string): boolean {
  return readString(dateKey(username), '') === todayString()
}

// 当前签到日（1~7）
export function getCheckinDay(): number {
  return ((new Date().getDate() - 1) % 7) + 1
}

export interface CheckinResult {
  ok: boolean
  reward: number
  totalExp: number
  message: string
}

export function doCheckin(username: string): CheckinResult {
  if (isSignedToday(username)) {
    return { ok: false, reward: 0, totalExp: getCheckinExp(username), message: '今日已签到，明天再来吧' }
  }
  const total = getCheckinExp(username) + CHECKIN_EXP_PER_DAY
  writeString(dateKey(username), todayString())
  writeString(expKey(username), String(total))
  return { ok: true, reward: CHECKIN_EXP_PER_DAY, totalExp: total, message: `签到成功，经验 +${CHECKIN_EXP_PER_DAY}` }
}

// ===== 经验与等级 =====
export function getTotalExp(username: string, finishedBooks: number): number {
  return finishedBooks * BOOK_EXP + getCheckinExp(username)
}

export function getLevel(totalExp: number): number {
  return Math.min(10, 1 + Math.floor(totalExp / LEVEL_EXP_NEED))
}

export function getLevelTitle(level: number): string {
  const titles = ['初入书海', '书海学徒', '阅读新手', '小书虫', '书虫', '资深书虫', '博览群书', '学富五车', '至尊书虫', '书海宗师']
  return titles[Math.min(level, 10) - 1] ?? '初入书海'
}

export function getLevelProgress(totalExp: number): number {
  return ((totalExp % LEVEL_EXP_NEED) / LEVEL_EXP_NEED) * 100
}

export function getLevelRemain(totalExp: number): number {
  return LEVEL_EXP_NEED - (totalExp % LEVEL_EXP_NEED)
}
