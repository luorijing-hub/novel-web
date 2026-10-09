// 业务接口层（对应鸿蒙 services/ApiService.ets）
import { http } from './http'
import { currentUsername } from '@/store/auth'

export const api = {
  // 认证
  login: (username: string, password: string) => http.post('/auth/login', { username, password }),
  register: (username: string, password: string, nickname: string) =>
    http.post('/auth/register', { username, password, nickname }),

  // 书籍 / 排行
  getBooks: (channel = '', category = '') => http.get('/books', { channel, category }),
  getRanking: (scope: string) => http.get('/ranking', { scope }),

  // 书单
  getBooklists: () => http.get('/booklists'),
  getBooklistDetail: (id: number) => http.get(`/booklists/${id}`),

  // 发现页
  getDiscover: () => http.get('/discover'),
  submitComment: (topicId: number, content: string) => http.post(`/topics/${topicId}/comments`, { content }),

  // 消息（按账号）
  getMessages: () => http.get('/messages', { username: currentUsername.value }),
  markMessageRead: (id: number) => http.post(`/messages/${id}/read`, { username: currentUsername.value }),
  markAllMessagesRead: () => http.post('/messages/read-all', { username: currentUsername.value }),

  // 书架（按账号）
  getShelf: () => http.get('/shelf', { username: currentUsername.value }),
  addToShelf: (title: string) => http.post('/shelf', { title, username: currentUsername.value }),
  removeFromShelf: (title: string) => http.del('/shelf', { title, username: currentUsername.value }),

  health: () => http.get('/health')
}
