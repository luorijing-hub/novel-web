// 消息通知（对应鸿蒙 model/MessageData.ets，已读记录按账号隔离）
import { readJSON, writeJSON, hasKey } from '@/utils/storage'

export interface MessageItem {
  id: number
  type: string
  icon: string
  title: string
  content: string
  time: string
  read: boolean
}

export const MESSAGES: MessageItem[] = [
  { id: 1, type: '系统', icon: '🎁', title: '签到福利', content: '连续签到 7 天可领 100 书币，快去签到吧！', time: '10分钟前', read: false },
  { id: 2, type: '追更', icon: '📖', title: '《剑来》更新提醒', content: '你收藏的《剑来》更新了 2 章。', time: '1小时前', read: false },
  { id: 3, type: '互动', icon: '💬', title: '收到新评论', content: '凡人道友 评论了你的书评：「说得太对了，同感！」', time: '3小时前', read: false },
  { id: 4, type: '系统', icon: '🔥', title: '限时免费', content: '《三体》《斗破苍穹》限时免费阅读 48 小时，别错过。', time: '昨天', read: true },
  { id: 5, type: '互动', icon: '👍', title: '收到点赞', content: '书中仙 赞了你的评论：「这个解读角度很新颖」。', time: '昨天', read: true },
  { id: 6, type: '追更', icon: '✨', title: '《诡秘之主》更新提醒', content: '你收藏的《诡秘之主》更新了 1 章。', time: '2天前', read: true },
  { id: 7, type: '系统', icon: '📣', title: '平台公告', content: 'App 版本升级至 1.3.0，新增书单与发现频道。', time: '3天前', read: true },
  { id: 8, type: '互动', icon: '⭐', title: '收到收藏', content: '甜宠文爱好者 收藏了你的书单「甜宠言情·高甜预警」。', time: '5天前', read: true }
]

function readKey(username: string): string {
  return username ? `message_reads_${username}` : 'message_reads'
}

// 是否已有已读记录（新注册账号没有记录）
export function hasReadRecord(username: string): boolean {
  return hasKey(readKey(username))
}

export function getUserReadIds(username: string): number[] {
  return readJSON<number[]>(readKey(username), [])
}

export function saveUserReadIds(username: string, ids: number[]): void {
  writeJSON(readKey(username), ids)
}

// 未读数：新账号（无记录）默认全部已读 → 0
export function getUnreadMessageCount(username: string): number {
  if (!hasReadRecord(username)) return 0
  const readIds = getUserReadIds(username)
  return MESSAGES.filter((m) => !readIds.includes(m.id)).length
}

export interface ReadResult {
  unread: number
  readIds: number[]
}

export function markRead(username: string, id: number): ReadResult {
  const ids = getUserReadIds(username)
  if (!ids.includes(id)) ids.push(id)
  saveUserReadIds(username, ids)
  return { unread: MESSAGES.filter((m) => !ids.includes(m.id)).length, readIds: ids }
}

export function markAllRead(username: string): ReadResult {
  const ids = MESSAGES.map((m) => m.id)
  saveUserReadIds(username, ids)
  return { unread: 0, readIds: ids }
}
