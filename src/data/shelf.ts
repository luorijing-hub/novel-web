// 书架本地数据（按账号隔离）
import { readJSON, writeJSON } from '@/utils/storage'
import type { BookItem } from './books'

export interface ShelfBook {
  title: string
  desc: string
  author: string
  tag: string
  hot: string
  image: string
  color: string
  addedTime: string
  readProgress: number
  lastReadTime: string
}

function key(username: string): string {
  return username ? `shelf_${username}` : 'shelf'
}

export function getShelf(username: string): ShelfBook[] {
  return readJSON<ShelfBook[]>(key(username), [])
}

export function saveShelf(username: string, books: ShelfBook[]): void {
  writeJSON(key(username), books)
}

export function makeShelfBook(book: BookItem, progress = 0): ShelfBook {
  return {
    title: book.title,
    desc: book.desc,
    author: book.author,
    tag: book.tag,
    hot: book.hot,
    image: book.image,
    color: book.color,
    addedTime: new Date().toLocaleString(),
    readProgress: progress,
    lastReadTime: new Date().toLocaleString()
  }
}

// 加入书架（已存在返回 false）
export function addToShelfLocal(username: string, book: BookItem): boolean {
  const books = getShelf(username)
  if (books.some((b) => b.title === book.title)) return false
  books.unshift(makeShelfBook(book))
  saveShelf(username, books)
  return true
}

export function removeFromShelfLocal(username: string, titles: string[]): void {
  saveShelf(
    username,
    getShelf(username).filter((b) => !titles.includes(b.title))
  )
}

export function getShelfStats(username: string): { total: number; reading: number; finished: number } {
  const books = getShelf(username)
  return {
    total: books.length,
    reading: books.filter((b) => b.readProgress > 0 && b.readProgress < 100).length,
    finished: books.filter((b) => b.readProgress === 100).length
  }
}
