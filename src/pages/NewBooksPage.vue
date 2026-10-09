<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getBooksByTitles, type BookItem } from '@/data/books'
import { NEW_BOOK_TITLES } from '@/data/topics'
import { useGuard } from '@/composables/useGuard'

const router = useRouter()
const { guard, showTip, tipText } = useGuard()

const books = ref<BookItem[]>([])

onMounted(() => {
  books.value = getBooksByTitles(NEW_BOOK_TITLES)
})

function addToShelf(book: BookItem) {
  router.push({ path: '/bookshelf', query: { add: book.title } })
}
</script>

<template>
  <div class="page">
    <div class="navbar">
      <span class="navbar__back" @click="router.back()">〈</span>
      <span class="navbar__title">新书首发</span>
    </div>

    <div class="page-body hide-scrollbar" style="padding: 12px 14px 16px">
      <div style="font-size: 14px; color: #666; padding: 0 4px 10px">共 {{ books.length }} 本新书首发</div>

      <div v-for="book in books" :key="book.title" class="new-card">
        <img class="new-card__cover" :src="book.image" :alt="book.title" :style="{ background: book.color }" @click="guard(() => addToShelf(book))" />
        <div style="flex: 1; min-width: 0; padding-left: 14px">
          <div style="display: flex; align-items: center">
            <span class="new-card__title ellipsis">{{ book.title }}</span>
            <span class="chip" style="background: #fff3ee; color: #ff5e2a; margin-left: 8px">首发</span>
          </div>
          <div class="new-card__desc ellipsis-2">{{ book.desc }}</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px">
            <span style="font-size: 12px; color: #5a5a5f">{{ book.author }}</span>
            <span class="chip">{{ book.tag }}</span>
          </div>
          <button class="btn-primary" style="height: 32px; font-size: 13px; margin-top: 10px" @click="guard(() => addToShelf(book))">
            加入书架
          </button>
        </div>
      </div>
    </div>

    <div v-if="showTip" class="toast">{{ tipText }}</div>
  </div>
</template>

<style scoped>
.new-card {
  display: flex;
  padding: 14px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
}
.new-card__cover {
  width: 88px;
  height: 116px;
  border-radius: 10px;
  object-fit: cover;
  flex: 0 0 88px;
  cursor: pointer;
}
.new-card__title {
  font-size: 16px;
  font-weight: 700;
  max-width: 60%;
}
.new-card__desc {
  font-size: 13px;
  color: #6b6b70;
  margin-top: 6px;
}
</style>
