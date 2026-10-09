// 本地存储封装（对应鸿蒙的 preferences，按账号隔离 key）
const PREFIX = 'novel_'

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (err) {
    console.error('本地存储写入失败', err)
  }
}

export function readString(key: string, fallback = ''): string {
  return localStorage.getItem(PREFIX + key) ?? fallback
}

export function writeString(key: string, value: string): void {
  localStorage.setItem(PREFIX + key, value)
}

export function removeKey(key: string): void {
  localStorage.removeItem(PREFIX + key)
}

export function hasKey(key: string): boolean {
  return localStorage.getItem(PREFIX + key) !== null
}
