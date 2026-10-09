<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { currentUsername, isLoggedIn } from '@/store/auth'
import { MESSAGES, getUserReadIds, hasReadRecord, markAllRead, markRead, type MessageItem } from '@/data/messages'
import { useGuard } from '@/composables/useGuard'

const router = useRouter()
const { showTip, tipText } = useGuard()

const messages = ref<MessageItem[]>([])
const unread = ref(0)
const useServerData = ref(false)
const hasUnread = computed(() => unread.value > 0)

function applyReadState(list: MessageItem[]) {
  const username = currentUsername.value
  const readIds = hasReadRecord(username) ? getUserReadIds(username) : MESSAGES.map((m) => m.id)
  list.forEach((m) => {
    m.read = readIds.includes(m.id)
  })
  messages.value = list
  unread.value = list.filter((m) => !m.read).length
}

async function loadMessages() {
  let list: MessageItem[] = []
  try {
    const res: any = await api.getMessages()
    const raw: any[] = res?.list ?? []
    list = raw.map((item) => ({
      id: Number(item.id),
      type: String(item.type ?? '系统'),
      icon: String(item.icon ?? '📣'),
      title: String(item.title ?? ''),
      content: String(item.content ?? ''),
      time: String(item.time ?? ''),
      read: item.read === true
    }))
    if (list.length) useServerData.value = true
  } catch (err) {
    console.info('消息接口请求失败，使用本地数据', err)
  }
  if (!list.length) list = MESSAGES.map((m) => ({ ...m }))
  applyReadState(list)
}

function openMessage(item: MessageItem) {
  if (!item.read) {
    markRead(currentUsername.value, item.id)
    item.read = true
    unread.value = messages.value.filter((m) => !m.read).length
    api.markMessageRead(item.id).catch((err) => console.info('消息已读同步后端失败', err))
  }
}

function readAll() {
  markAllRead(currentUsername.value)
  messages.value.forEach((m) => (m.read = true))
  unread.value = 0
  api.markAllMessagesRead().catch((err) => console.info('全部已读同步后端失败', err))
}

onMounted(() => {
  if (!isLoggedIn.value) {
    router.replace('/login')
    return
  }
  loadMessages()
})
</script>

<template>
  <div class="page">
    <div class="navbar">
      <span class="navbar__back" @click="router.back()">〈</span>
      <span class="navbar__title">消息通知</span>
      <span v-if="hasUnread" style="font-size: 13px; color: #ff5e2a; cursor: pointer" @click="readAll">全部已读</span>
    </div>

    <div class="page-body hide-scrollbar">
      <div class="msg-summary">
        <span>共 {{ messages.length }} 条消息{{ useServerData ? ' · 后端数据' : '' }}</span>
        <span style="margin-left: auto; color: #ff5e2a">{{ unread }} 条未读</span>
      </div>

      <div v-for="item in messages" :key="item.id" class="msg-item" @click="openMessage(item)">
        <div class="msg-item__icon">{{ item.icon }}</div>
        <div style="flex: 1; min-width: 0">
          <div class="msg-item__head">
            <span class="msg-item__title ellipsis">{{ item.title }}</span>
            <span class="msg-item__time">{{ item.time }}</span>
          </div>
          <div class="msg-item__content ellipsis-2">{{ item.content }}</div>
          <div style="margin-top: 6px"><span class="chip">{{ item.type }}</span></div>
        </div>
        <div v-if="!item.read" class="msg-item__dot"></div>
      </div>

      <div v-if="!messages.length" class="empty">
        <span class="empty__icon">🔔</span>
        <span>暂无消息</span>
      </div>
    </div>

    <div v-if="showTip" class="toast">{{ tipText }}</div>
  </div>
</template>

<style scoped>
.msg-summary {
  display: flex;
  padding: 12px 18px 8px;
  font-size: 14px;
  color: #666;
}
.msg-item {
  display: flex;
  gap: 12px;
  padding: 14px 18px;
  background: #fff;
  border-bottom: 1px solid #f5f6f8;
  cursor: pointer;
  align-items: flex-start;
}
.msg-item__icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 50%;
  background: #f4f6fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.msg-item__head {
  display: flex;
  align-items: center;
}
.msg-item__title {
  font-size: 15px;
  font-weight: 700;
  color: #1f1f1f;
  flex: 1;
  min-width: 0;
}
.msg-item__time {
  font-size: 11px;
  color: #999;
  margin-left: 8px;
  white-space: nowrap;
}
.msg-item__content {
  font-size: 13px;
  color: #6b6b70;
  margin-top: 4px;
}
.msg-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff4d4f;
  margin-top: 8px;
  flex: 0 0 8px;
}
</style>
