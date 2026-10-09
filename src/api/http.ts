// 网络请求封装（对应鸿蒙 common/HttpUtil.ets，改用浏览器 fetch）
export const BASE_URL = 'http://127.0.0.1:8080/api'

const TOKEN_KEY = 'novel_token'

export interface ApiError extends Error {
  status?: number
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

type Query = Record<string, string | number | boolean>

function buildUrl(path: string, method: string, params?: Query): string {
  let url = BASE_URL + path
  // GET / DELETE 参数拼到 query（与鸿蒙端 HttpUtil 行为一致）
  if (params && (method === 'GET' || method === 'DELETE')) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => qs.append(k, String(v)))
    const query = qs.toString()
    if (query) url += (url.includes('?') ? '&' : '?') + query
  }
  return url
}

async function request<T = any>(path: string, method: string, params?: Query): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const init: RequestInit = { method, headers }
  if (params && method !== 'GET' && method !== 'DELETE') {
    init.body = JSON.stringify(params)
  }

  let res: Response
  try {
    res = await fetch(buildUrl(path, method, params), init)
  } catch {
    throw new Error('网络请求失败') as ApiError
  }

  if (!res.ok) {
    const e: ApiError = new Error(`服务端错误: HTTP ${res.status}`)
    e.status = res.status
    throw e
  }

  const text = await res.text()
  if (!text) return {} as T
  return JSON.parse(text) as T
}

export const http = {
  get: <T = any>(path: string, params?: Query) => request<T>(path, 'GET', params),
  post: <T = any>(path: string, params?: Query) => request<T>(path, 'POST', params),
  del: <T = any>(path: string, params?: Query) => request<T>(path, 'DELETE', params)
}
