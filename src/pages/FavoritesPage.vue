<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getFavoriteBooklists, toggleBooklistFavorite } from '@/data/favorites'
import { getBooksByTitles } from '@/data/books'
import type { Booklist } from '@/data/booklists'
import { currentUsername } from '@/store/auth'
import { useGuard } from '@/composables/useGuard'

const router = useRouter()
const { showTip, tipText, showTipMessage } = useGuard()

const favorites = ref<Booklist[]>([])

function load() {
  favorites.value = getFavoriteBooklists(currentUsername.value)
}

function unfavorite(list: Booklist) {
  toggleBooklistFavorite(currentUsername.value, list)
  load()
  showTipMessage(`已取消收藏《${list.title}》`)
}

function openDetail(list: Booklist) {
  router.push({ path: '/booklists', query: { id: list.id } })
}

onMounted(load)
</script>

<template>
  <div class="page">
    <div class="navbar">
      <span class="navbar__back" @click="router.back()">〈</span>
      <span class="navbar__title">我的收藏</span>
      <span style="font-size: 13px; color: #8e8e93">{{ favorites.length }} 个书单</span>
    </div>

    <div class="page-body hide-scrollbar" style="padding: 12px 14px 16px">
      <div v-if="favorites.length">
        <div v-for="list in favorites" :key="list.id" class="fav-card">
          <div class="fav-card__head" @click="openDetail(list)">
            <div style="flex: 1; min-width: 0">
              <div class="fav-card__title ellipsis">{{ list.title }}</div>
              <div class="fav-card__desc ellipsis-2">{{ list.desc }}</div>
              <div class="fav-card__meta">
                <span>👤 {{ list.creator }}</span>
                <span>🔥 {{ list.follows }} 人关注</span>
                <span>📚 {{ list.bookTitles.length }} 本</span>
              </div>
            </div>
            <span style="font-size: 20px; color: #ccc">›</span>
          </div>

          <div class="fav-card__books">
            <img
              v-for="book in getBooksByTitles(list.bookTitles).slice(0, 4)"
              :key="book.title"
              :src="book.image"
              :alt="book.title"
              :style="{ background: book.color }"
            />
          </div>

          <div class="fav-card__foot">
            <button class="fav-btn" @click="unfavorite(list)">💔 取消收藏</button>
            <button class="fav-btn fav-btn--accent" @click="openDetail(list)">查看书单</button>
          </div>
        </div>
      </div>

      <div v-else class="empty">
        <span class="empty__icon">⭐</span>
        <span>还没有收藏任何书单</span>
        <span style="font-size: 13px; color: #999">去书单页收藏喜欢的书单吧</span>
        <button class="btn-primary" style="margin-top: 10px" @click="router.push('/booklists')">逛书单</button>
      </div>
    </div>

    <div v-if="showTip" class="toast">{{ tipText }}</div>
  </div>
</template>

<style scoped>
.fav-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
}
.fav-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.fav-card__title {
  font-size: 17px;
  font-weight: 700;
}
.fav-card__desc {
  font-size: 13px;
  color: #6b6b70;
  margin-top: 4px;
}
.fav-card__meta {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: #8e8e93;
  margin-top: 6px;
}
.fav-card__books {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.fav-card__books img {
  width: 56px;
  height: 74px;
  border-radius: 8px;
  object-fit: cover;
}
.fav-card__foot {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.fav-btn {
  flex: 1;
  height: 34px;
  border-radius: 17px;
  border: none;
  background: #f4f6fa;
  color: #666;
  font-size: 13px;
  cursor: pointer;
}
.fav-btn--accent {
  background: #fff3ee;
  color: #ff5e2a;
}
</style>
