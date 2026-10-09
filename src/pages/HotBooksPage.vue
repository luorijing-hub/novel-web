<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BOOKS, calcBookHeat, formatHeatWan, mapServerBook, type BookItem } from '@/data/books'
import { api } from '@/api'
import { useGuard } from '@/composables/useGuard'

const router = useRouter()
const { guard, showTip, tipText } = useGuard()

const books = ref<BookItem[]>([])
const rankColors = ['#ff5e2a', '#f59e0b', '#c0a062']

async function loadBooks() {
  try {
    const res: any = await api.getDiscover()
    const mapped: BookItem[] = (res?.hotBooks ?? [])
      .map((raw: unknown) => mapServerBook(raw))
      .filter((b: BookItem | null): b is BookItem => !!b)
    if (mapped.length) {
      books.value = mapped
      return
    }
  } catch (err) {
    console.info('热门书籍接口请求失败，使用本地数据', err)
  }
  books.value = [...BOOKS].sort((a, b) => calcBookHeat(b.title, b.hot).heatWan - calcBookHeat(a.title, a.hot).heatWan).slice(0, 10)
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
      <span class="navbar__title">大家都在看</span>
    </div>

    <div class="page-body hide-scrollbar" style="padding: 12px 14px 16px">
      <div style="font-size: 14px; color: #666; padding: 0 4px 10px">共 {{ books.length }} 本热门好书 · 点击封面加入书架</div>

      <div v-for="(book, index) in books" :key="book.title" class="hot-card">
        <div class="hot-card__no" :style="{ background: index < 3 ? rankColors[index] : 'transparent', color: index < 3 ? '#fff' : '#9aa0a6' }">
          {{ index + 1 }}
        </div>
        <img class="hot-card__cover" :src="book.image" :alt="book.title" :style="{ background: book.color }" @click="guard(() => addToShelf(book))" />
        <div style="flex: 1; min-width: 0; padding-left: 12px">
          <div class="hot-card__title ellipsis">{{ book.title }}</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px">
            <span style="font-size: 12px; color: #5a5a5f">{{ book.author }}</span>
            <span class="chip">{{ book.tag }}</span>
          </div>
          <div style="font-size: 13px; color: #ff5e2a; margin-top: 8px">🔥 {{ formatHeatWan(calcBookHeat(book.title, book.hot).heatWan) }}</div>
        </div>
      </div>
    </div>

    <div v-if="showTip" class="toast">{{ tipText }}</div>
  </div>
</template>

<style scoped>
.hot-card {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 10px;
}
.hot-card__no {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
}
.hot-card__cover {
  width: 56px;
  height: 74px;
  border-radius: 8px;
  object-fit: cover;
  flex: 0 0 56px;
  margin-left: 8px;
  cursor: pointer;
}
.hot-card__title {
  font-size: 16px;
  font-weight: 700;
}
</style>
