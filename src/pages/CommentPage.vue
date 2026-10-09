<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BOOKS, calcBookHeat, formatHeatWan } from '@/data/books'
import { currentUser, isLoggedIn } from '@/store/auth'
import { readJSON, writeJSON } from '@/utils/storage'
import { useGuard } from '@/composables/useGuard'

const route = useRoute()
const router = useRouter()
const { showTip, tipText, showTipMessage } = useGuard()

interface CommentItem {
  id: number
  user: string
  avatar: string
  content: string
  time: string
  likes: number
  mine: boolean
}

const bookTitle = computed(() => String(route.query.bookTitle ?? ''))
const book = computed(() => BOOKS.find((b) => b.title === bookTitle.value) ?? null)
const comments = ref<CommentItem[]>([])
const inputText = ref('')

const seedComments: CommentItem[] = [
  { id: 1, user: '书海遨游', avatar: '📖', content: '一口气读完，情节紧凑，人物塑造很立体，强烈推荐！', time: '2小时前', likes: 128, mine: false },
  { id: 2, user: '夜读星人', avatar: '🌙', content: '前中期节奏稍慢，但越看越上头，后期直接封神。', time: '昨天', likes: 86, mine: false },
  { id: 3, user: '字里行间', avatar: '✍️', content: '文笔细腻，细节满满，值得反复品读。', time: '3天前', likes: 54, mine: false }
]

function storageKey(): string {
  const user = currentUser.value?.username ?? 'guest'
  return `comments_${user}_${bookTitle.value}`
}

function load() {
  comments.value = [...readJSON<CommentItem[]>(storageKey(), []), ...seedComments]
}

function publish() {
  const text = inputText.value.trim()
  if (!text) {
    showTipMessage('请输入书评内容')
    return
  }
  if (!isLoggedIn.value) {
    showTipMessage('请先登录')
    window.setTimeout(() => router.push('/login'), 800)
    return
  }
  const mine: CommentItem = {
    id: Date.now(),
    user: currentUser.value?.nickname ?? currentUser.value?.username ?? '我',
    avatar: currentUser.value?.avatar ?? '🙋',
    content: text,
    time: '刚刚',
    likes: 0,
    mine: true
  }
  const saved = readJSON<CommentItem[]>(storageKey(), [])
  saved.unshift(mine)
  writeJSON(storageKey(), saved)
  inputText.value = ''
  load()
  showTipMessage('书评发布成功')
}

function like(item: CommentItem) {
  item.likes++
}

onMounted(load)
</script>

<template>
  <div class="page">
    <div class="navbar">
      <span class="navbar__back" @click="router.back()">〈</span>
      <span class="navbar__title">书评</span>
    </div>

    <div class="page-body hide-scrollbar">
      <div v-if="book" class="book-head">
        <img :src="book.image" :alt="book.title" :style="{ background: book.color }" />
        <div style="flex: 1; min-width: 0; padding-left: 14px">
          <div style="font-size: 18px; font-weight: 700">{{ book.title }}</div>
          <div style="font-size: 13px; color: #6b6b70; margin-top: 4px">{{ book.author }} · {{ book.tag }}</div>
          <div style="font-size: 12px; color: #8e8e93; margin-top: 6px">
            🔥 热度 {{ formatHeatWan(calcBookHeat(book.title, book.hot).heatWan) }}
          </div>
        </div>
      </div>

      <div class="publish">
        <textarea v-model="inputText" class="publish__input" rows="3" placeholder="写下你的书评，与书友一起讨论…"></textarea>
        <div style="display: flex; align-items: center; margin-top: 8px">
          <span style="font-size: 12px; color: #999">共 {{ comments.length }} 条书评</span>
          <button class="btn-primary" style="height: 34px; font-size: 14px; margin-left: auto" @click="publish">发布</button>
        </div>
      </div>

      <div style="padding: 0 18px 20px">
        <div v-for="item in comments" :key="item.id" class="comment">
          <div class="comment__avatar">{{ item.avatar }}</div>
          <div style="flex: 1; min-width: 0">
            <div style="display: flex; align-items: center">
              <span class="comment__user">{{ item.user }}</span>
              <span v-if="item.mine" class="chip" style="background: #fff3ee; color: #ff5e2a; margin-left: 8px">我的</span>
              <span class="comment__time">{{ item.time }}</span>
            </div>
            <div class="comment__content">{{ item.content }}</div>
            <div class="comment__like" @click="like(item)">👍 {{ item.likes }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showTip" class="toast">{{ tipText }}</div>
  </div>
</template>

<style scoped>
.book-head {
  display: flex;
  padding: 16px 18px;
  background: #fff;
  border-bottom: 8px solid #f2f4f8;
}
.book-head img {
  width: 76px;
  height: 100px;
  border-radius: 10px;
  object-fit: cover;
  flex: 0 0 76px;
}
.publish {
  background: #fff;
  padding: 14px 18px;
  border-bottom: 1px solid #f0f2f5;
}
.publish__input {
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  background: #f7f8fb;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  font-family: inherit;
}
.comment {
  display: flex;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f5f6f8;
}
.comment__avatar {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 50%;
  background: #f4f6fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.comment__user {
  font-size: 14px;
  font-weight: 700;
  color: #333;
}
.comment__time {
  margin-left: auto;
  font-size: 11px;
  color: #999;
}
.comment__content {
  font-size: 14px;
  color: #4a4a4a;
  margin-top: 6px;
  line-height: 1.5;
}
.comment__like {
  font-size: 12px;
  color: #8e8e93;
  margin-top: 8px;
  cursor: pointer;
  display: inline-block;
}
</style>
