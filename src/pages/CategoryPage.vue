<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BOOKS, calcBookHeat, formatHeatWan, mapServerBook, type BookItem } from '@/data/books'
import { api } from '@/api'
import { useGuard } from '@/composables/useGuard'

const route = useRoute()
const router = useRouter()
const { guard, showTip, tipText } = useGuard()

interface CategoryItem {
  name: string
  icon: string
  color: string
}

const maleCategories: CategoryItem[] = [
  { name: '全部', icon: '📚', color: '#ff6b6b' },
  { name: '玄幻', icon: '⚡', color: '#ffb07c' },
  { name: '奇幻', icon: '🧙', color: '#85c7f2' },
  { name: '仙侠', icon: '🌄', color: '#b7d7b0' },
  { name: '武侠', icon: '🗡️', color: '#c7b8d4' },
  { name: '科幻', icon: '🚀', color: '#aacfcf' },
  { name: '悬疑', icon: '🔍', color: '#d4c5a0' },
  { name: '游戏', icon: '🎮', color: '#f5d6b0' },
  { name: '历史', icon: '🏛️', color: '#e8b4b8' },
  { name: '都市', icon: '🌆', color: '#b5d1e0' }
]

const femaleCategories: CategoryItem[] = [
  { name: '全部', icon: '💗', color: '#ff6b9d' },
  { name: '古代言情', icon: '🏮', color: '#f2c6d0' },
  { name: '现代言情', icon: '💍', color: '#f5c6d8' },
  { name: '都市情感', icon: '☕', color: '#f0d0b8' },
  { name: '青春校园', icon: '🎓', color: '#bfe0d9' },
  { name: '仙侠奇缘', icon: '🦋', color: '#e3c8f0' },
  { name: '宫斗宅斗', icon: '👑', color: '#f0e0b8' },
  { name: '悬疑灵异', icon: '🕯️', color: '#b8c8d9' },
  { name: '重生逆袭', icon: '🔄', color: '#f0b8b8' },
  { name: '轻松甜宠', icon: '🍬', color: '#f8d0c0' }
]

const channel = ref(String(route.query.channel ?? '男频') === '女频' ? '女频' : '男频')
const selectedCategory = ref('全部')
const allBooks = ref<BookItem[]>(BOOKS)
const useServerData = ref(false)

const categories = computed(() => (channel.value === '女频' ? femaleCategories : maleCategories))

function countOf(name: string): number {
  const list = allBooks.value.filter((b) => b.channel === channel.value)
  return name === '全部' ? list.length : list.filter((b) => b.tag === name).length
}

const filteredBooks = computed(() =>
  allBooks.value.filter(
    (b) => b.channel === channel.value && (selectedCategory.value === '全部' || b.tag === selectedCategory.value)
  )
)

function switchChannel(ch: string) {
  channel.value = ch
  selectedCategory.value = '全部'
}

// 优先请求后端，失败保留本地数据
async function loadBooks() {
  try {
    const res: any = await api.getBooks('', '')
    const list: BookItem[] = (res?.list ?? [])
      .map((raw: unknown) => mapServerBook(raw))
      .filter((b: BookItem | null): b is BookItem => !!b)
    if (list.length > 0) {
      allBooks.value = list
      useServerData.value = true
    }
  } catch (err) {
    console.info('书籍接口请求失败，使用本地数据', err)
  }
}

function addToShelf(book: BookItem) {
  router.push({ path: '/bookshelf', query: { add: book.title } })
}

onMounted(loadBooks)
</script>

<template>
  <div class="page">
    <div class="navbar">
      <span class="navbar__back" @click="router.back()">〈</span>
      <span class="navbar__title">分类</span>
      <span class="navbar__action" @click="guard(() => router.push('/bookshelf'))">📖</span>
      <span class="navbar__action" style="margin-left: 18px" @click="router.push('/')">🏠</span>
    </div>

    <div class="page-body hide-scrollbar">
      <div style="display: flex; justify-content: center; background: #fff; padding: 12px 0 4px">
        <div class="channel-switch">
          <div class="channel-switch__item" :class="{ 'channel-switch__item--male': channel === '男频' }" @click="switchChannel('男频')">
            <span>👦</span><span>男频</span>
          </div>
          <div class="channel-switch__item" :class="{ 'channel-switch__item--female': channel === '女频' }" @click="switchChannel('女频')">
            <span>👧</span><span>女频</span>
          </div>
        </div>
      </div>

      <div class="cat-grid">
        <div
          v-for="cat in categories"
          :key="cat.name"
          class="cat-grid__item"
          :class="{ 'cat-grid__item--active': selectedCategory === cat.name }"
          @click="selectedCategory = cat.name"
        >
          <div class="cat-grid__icon" :style="{ background: selectedCategory === cat.name ? cat.color : '#f4f6fa' }">
            {{ cat.icon }}
          </div>
          <span class="cat-grid__name" :class="{ 'cat-grid__name--active': selectedCategory === cat.name }">{{ cat.name }}</span>
          <span class="cat-grid__count">{{ countOf(cat.name) }}</span>
        </div>
      </div>

      <div style="background: #f2f4f8; padding: 12px 18px 8px; font-size: 14px; color: #666">
        {{ channel }}频道 · 共 {{ filteredBooks.length }} 本书{{ useServerData ? ' · 后端数据' : '' }}
      </div>

      <div v-if="filteredBooks.length" style="padding: 0 14px 16px">
        <div v-for="book in filteredBooks" :key="book.title" class="list-card">
          <img class="list-card__cover" :src="book.image" :alt="book.title" :style="{ background: book.color }" />
          <div class="list-card__info">
            <div class="list-card__title">{{ book.title }}</div>
            <div class="list-card__desc ellipsis-2">{{ book.desc }}</div>
            <div class="list-card__meta">
              <span style="font-size: 13px; color: #5a5a5f">{{ book.author }}</span>
              <span class="chip">{{ book.tag }}</span>
              <span style="font-size: 13px; color: #8e8e93">🔥 {{ formatHeatWan(calcBookHeat(book.title, book.hot).heatWan) }}</span>
            </div>
            <button class="btn-primary" style="height: 32px; font-size: 13px; margin-top: 8px" @click="guard(() => addToShelf(book))">
              加入书架
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty">
        <span class="empty__icon">📚</span>
        <span>暂无此类书籍</span>
      </div>
    </div>

    <div v-if="showTip" class="toast">{{ tipText }}</div>
  </div>
</template>

<style scoped>
.channel-switch {
  display: flex;
  width: 88%;
  height: 42px;
  padding: 3px;
  background: #f2f4f8;
  border-radius: 21px;
}
.channel-switch__item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 15px;
  color: #666;
  border-radius: 18px;
  cursor: pointer;
}
.channel-switch__item--male {
  background: #fff3ee;
  color: #ff5e2a;
  font-weight: 700;
}
.channel-switch__item--female {
  background: #fff0f6;
  color: #ff4d94;
  font-weight: 700;
}
.cat-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  padding: 12px;
  background: #fff;
  border-bottom: 8px solid #f2f4f8;
}
.cat-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  border-radius: 12px;
  cursor: pointer;
}
.cat-grid__item--active {
  background: #fff5f0;
}
.cat-grid__icon {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.cat-grid__name {
  font-size: 12px;
  color: #666;
  margin-top: 6px;
}
.cat-grid__name--active {
  color: #ff5e2a;
  font-weight: 700;
}
.cat-grid__count {
  font-size: 10px;
  color: #999;
  margin-top: 1px;
}
.list-card {
  display: flex;
  padding: 14px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
}
.list-card__cover {
  width: 92px;
  height: 122px;
  border-radius: 12px;
  object-fit: cover;
  flex: 0 0 92px;
}
.list-card__info {
  flex: 1;
  padding-left: 16px;
  min-width: 0;
}
.list-card__title {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 4px;
}
.list-card__desc {
  font-size: 14px;
  color: #6b6b70;
  margin-bottom: 6px;
}
.list-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
