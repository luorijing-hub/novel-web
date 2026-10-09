// 登录态与账号（对应鸿蒙 common/AuthUtil.ets）
import { computed, ref } from 'vue'
import { readJSON, writeJSON, removeKey } from '@/utils/storage'
import { clearToken } from '@/api/http'

export interface UserInfo {
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  registerTime: string
}

export interface LocalUser extends UserInfo {
  password: string
}

const CURRENT_KEY = 'current_user'
const USERS_KEY = 'local_users'

export const currentUser = ref<UserInfo | null>(readJSON<UserInfo | null>(CURRENT_KEY, null))
export const isLoggedIn = computed(() => currentUser.value !== null)
export const currentUsername = computed(() => currentUser.value?.username ?? '')

export function saveUser(user: UserInfo): void {
  currentUser.value = user
  writeJSON(CURRENT_KEY, user)
}

export function logout(): void {
  currentUser.value = null
  removeKey(CURRENT_KEY)
  clearToken()
}

// ===== 本地账号（后端不可用时的兜底） =====
export function getLocalUsers(): LocalUser[] {
  return readJSON<LocalUser[]>(USERS_KEY, [])
}

export function addLocalUser(user: LocalUser): void {
  const users = getLocalUsers()
  users.push(user)
  writeJSON(USERS_KEY, users)
}

export function findLocalUser(username: string, password: string): LocalUser | null {
  return getLocalUsers().find((u) => u.username === username && u.password === password) ?? null
}

export function localUserExists(username: string): boolean {
  return getLocalUsers().some((u) => u.username === username)
}

export function randomAvatar(): string {
  const avatars = ['👤', '👨', '👩', '🧑', '👦', '👧', '🧒']
  return avatars[Math.floor(Math.random() * avatars.length)]
}

// 后端返回的用户数据 → 前端 UserInfo
export function toUserInfo(raw: any, fallbackUsername = ''): UserInfo {
  return {
    username: String(raw?.username ?? fallbackUsername),
    nickname: String(raw?.nickname ?? fallbackUsername),
    avatar: String(raw?.avatar ?? '👤'),
    email: String(raw?.email ?? ''),
    phone: String(raw?.phone ?? ''),
    registerTime: String(raw?.registerTime ?? new Date().toLocaleString())
  }
}
