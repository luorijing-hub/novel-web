// 书单收藏（对应鸿蒙 model/FavoritesData.ets，按账号隔离）
import { readJSON, writeJSON } from '@/utils/storage'
import type { Booklist } from './booklists'

function key(username: string): string {
  return username ? `favorite_booklists_${username}` : 'favorite_booklists'
}

export function getFavoriteBooklists(username: string): Booklist[] {
  return readJSON<Booklist[]>(key(username), [])
}

export function isBooklistFavorite(username: string, id: number): boolean {
  return getFavoriteBooklists(username).some((l) => l.id === id)
}

// 切换收藏，返回切换后的状态（true = 已收藏）
export function toggleBooklistFavorite(username: string, list: Booklist): boolean {
  const favorites = getFavoriteBooklists(username)
  const index = favorites.findIndex((l) => l.id === list.id)
  if (index >= 0) {
    favorites.splice(index, 1)
    writeJSON(key(username), favorites)
    return false
  }
  favorites.unshift(list)
  writeJSON(key(username), favorites)
  return true
}
