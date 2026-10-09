<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BOOKS, calcBookHeat, formatHeatWan, type BookItem } from '@/data/books'
import { isLoggedIn, currentUser } from '@/store/auth'
import { useGuard } from '@/composables/useGuard'

const router = useRouter()
const { guard, showTip, tipText, showTipMessage } = useGuard()

const tabs = ['推荐', '男频', '女频', '排行', '书单', '分类', '发现']
const bottomTabs = ['首页', '书架', '发现', '我的']
const currentTab = ref(0)
const bottomTab = ref(0)

const banners = [
  { title: '剑来', image: '/covers/jianlaifm.webp' },
  { title: '诡秘之主', image: '/covers/guimifm.webp' },
  { title: '凡人修仙传', image: '/covers/fanrenfm.webp' },
  { title: '雪中悍刀行', image: '/covers/xuezhonfm.webp' }
]
const bannerIndex = ref(0)
let bannerTimer: number | undefined

const quickEntries = [
  { name: '男频', color: '#ffb07c', image: '/covers/doupo.webp' },
  { name: '女频', color: '#f5a3c7', image: '/covers/zhenhuan.webp' },
  { name: '排行', color: '#85c7f2', image: '/covers/heyi.webp' },
  { name: '书单', color: '#b7d7b0', image: '/covers/guimi.webp' },
  { name: '发现', color: '#e8b4b8', image: '/covers/fanren.webp' }
]

const allBooks = BOOKS
const books = computed(() => BOOKS.filter((b) => b.channel === '男频'))

const searchVisible = ref(false)
const searchText = ref('')
const searchResults = ref<BookItem[]>([])

function performSearch(keyword: string) {
  const kw = keyword.trim().toLowerCase()
  if (!kw) {
    searchResults.value = []
    return
  }
  const matchDesc = kw.length >= 2
  searchResults.value = allBooks.filter(
    (b) =>
      b.title.toLowerCase().includes(kw) ||
      b.author.toLowerCase().includes(kw) ||
      b.tag.toLowerCase().includes(kw) ||
      (matchDesc && b.desc.toLowerCase().includes(kw))
  )
}

function openSearch() {
  searchVisible.value = true
  searchText.value = ''
  searchResults.value = []
}

function clearSearch() {
  searchVisible.value = false
  searchText.value = ''
  searchResults.value = []
}

function useHotTag(tag: string) {
  searchText.value = tag
  performSearch(tag)
}

function goToCategory(channel?: string) {
  router.push({ path: '/category', query: channel ? { channel } : {} })
}
function goToRanking() {
  router.push('/ranking')
}
function goToBooklist() {
  router.push('/booklists')
}
function goToDiscover() {
  router.push('/discover')
}
// 加入书架 / 进入书架（需先登录）
function goToBookshelf(book?: BookItem) {
  if (!isLoggedIn.value) {
    showTipMessage('请先登录')
    window.setTimeout(() => router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } }), 800)
    return
  }
  if (book) router.push({ path: '/bookshelf', query: { add: book.title } })
  else router.push('/bookshelf')
}
function goToComment(book: BookItem) {
  router.push({ path: '/comment', query: { bookTitle: book.title } })
}
function goToProfile() {
  if (isLoggedIn.value) router.push('/profile')
  else router.push('/login')
}

function onTabClick(item: string) {
  if (item === '男频' || item === '女频') goToCategory(item)
  else if (item === '排行') goToRanking()
  else if (item === '书单') goToBooklist()
  else if (item === '分类') goToCategory()
  else if (item === '发现') goToDiscover()
}

function onQuickEntry(name: string) {
  if (name === '男频' || name === '女频') goToCategory(name)
  else if (name === '排行') goToRanking()
  else if (name === '书单') goToBooklist()
  else if (name === '发现') goToDiscover()
}

function onBottomTab(item: string) {
  if (item === '书架') guard(() => router.push('/bookshelf'))
  else if (item === '发现') router.push('/discover')
  else if (item === '我的') goToProfile()
}

onMounted(() => {
  bannerTimer = window.setInterval(() => {
    bannerIndex.value = (bannerIndex.value + 1) % banners.length
  }, 3000)
})
onBeforeUnmount(() => window.clearInterval(bannerTimer))
</script>

<template>
  <div class="page">
    <div class="navbar" style="height: 44px; flex: 0 0 44px">
      <div style="display: flex; align-items: center">
        <span class="navbar__back">〈</span>
        <span style="font-size: 18px; font-weight: 500">起点</span>
      </div>
      <div style="margin-left: auto; display: flex; gap: 18px; font-size: 20px">
        <span>🔔</span>
        <span>☰</span>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div style="padding: 12px 18px 16px; background: #fff">
      <div class="search-bar" @click="openSearch">
        <span style="font-size: 18px; margin-right: 8px">🔍</span>
        <span style="flex: 1; font-size: 15px; color: #7a7a7a">搜索书籍、作者</span>
        <span style="font-size: 20px">📷</span>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="category-nav">
      <span
        v-for="(item, index) in tabs"
        :key="item"
        class="category-nav__item"
        :class="{ 'category-nav__item--active': index === 0 }"
        @click="currentTab = index; onTabClick(item)"
        >{{ item }}</span
      >
    </div>

    <div class="page-body hide-scrollbar">
      <!-- 轮播 -->
      <div style="background: #fff; padding: 14px 18px 8px">
        <div class="banner">
          <img :src="banners[bannerIndex].image" alt="" />
          <div class="banner__label">{{ banners[bannerIndex].title }}</div>
        </div>
        <div style="display: flex; justify-content: center; margin-top: 8px">
          <span
            v-for="(b, i) in banners"
            :key="b.title"
            class="banner__dot"
            :class="{ 'banner__dot--active': i === bannerIndex }"
            @click="bannerIndex = i"
          ></span>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="quick-entry">
        <div v-for="item in quickEntries" :key="item.name" class="quick-entry__item" @click="onQuickEntry(item.name)">
          <div class="quick-entry__icon" :style="{ background: item.color }">
            <img :src="item.image" alt="" />
          </div>
          <span class="quick-entry__label">{{ item.name }}</span>
        </div>
      </div>

      <!-- 热门推荐 -->
      <div style="background: #fff; padding: 0 18px 12px">
        <div class="section-head" style="padding-top: 16px">
          <span class="section-head__title">📚 热门推荐</span>
          <span class="section-head__more" @click="goToRanking">更多 ›</span>
        </div>

        <div v-for="(book, index) in books" :key="book.title" class="book-row" :class="{ 'book-row--last': index === books.length - 1 }">
          <img class="book-row__cover" :src="book.image" :alt="book.title" :style="{ background: book.color }" />
          <div class="book-row__info">
            <div class="book-row__title">{{ book.title }}</div>
            <div class="book-row__desc ellipsis-2">{{ book.desc }}</div>
            <div class="book-row__meta">
              <span class="book-row__author">{{ book.author }}</span>
              <span class="chip">{{ book.tag }}</span>
              <span class="book-row__hot">🔥 {{ formatHeatWan(calcBookHeat(book.title, book.hot).heatWan) }}</span>
            </div>
            <div class="book-row__actions">
              <button class="mini-btn mini-btn--accent" @click.stop="goToBookshelf(book)">+ 书架</button>
              <button class="mini-btn" @click.stop="goToComment(book)">💬 评论</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="bottom-nav">
      <div v-for="(item, index) in bottomTabs" :key="item" class="bottom-nav__item" @click="bottomTab = index; onBottomTab(item)">
        <span class="bottom-nav__icon" :class="{ 'bottom-nav__icon--active': index === bottomTab }">
          {{ item === '首页' ? '🏠' : item === '书架' ? '📖' : item === '发现' ? '📌' : isLoggedIn && currentUser ? currentUser.avatar : '👤' }}
        </span>
        <span class="bottom-nav__label" :class="{ 'bottom-nav__label--active': index === bottomTab }">{{ item }}</span>
      </div>
    </div>

    <!-- 搜索面板 -->
    <div v-if="searchVisible" class="search-mask" @click.self="clearSearch">
      <div class="search-panel" :style="{ minHeight: searchText ? '420px' : '300px' }">
        <div style="padding: 20px 18px 12px">
          <div class="search-bar" style="background: #f4f6fa">
            <span style="font-size: 18px; margin-right: 8px">🔍</span>
            <input v-model="searchText" class="search-input" placeholder="搜索书籍、作者" @input="performSearch(searchText)" />
            <span v-if="searchText" style="font-size: 18px; color: #999; cursor: pointer" @click="searchText = ''; searchResults = []">✕</span>
          </div>
        </div>

        <div v-if="searchResults.length > 0" style="flex: 1; overflow-y: auto">
          <div style="padding: 0 18px 8px; font-size: 14px; color: #666">找到 {{ searchResults.length }} 个结果</div>
          <div v-for="book in searchResults" :key="book.title" class="search-result" @click="goToBookshelf(book); clearSearch()">
            <img :src="book.image" :alt="book.title" :style="{ background: book.color }" />
            <div style="flex: 1">
              <div style="font-size: 16px; font-weight: 700">{{ book.title }}</div>
              <div style="font-size: 13px; color: #666; margin: 2px 0">{{ book.author }}</div>
              <div style="display: flex; align-items: center; gap: 8px">
                <span class="chip">{{ book.tag }}</span>
                <span style="font-size: 12px; color: #8e8e93">🔥 {{ formatHeatWan(calcBookHeat(book.title, book.hot).heatWan) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="searchText" class="empty" style="padding: 30px">
          <span class="empty__icon">📚</span>
          <span>未找到相关书籍</span>
        </div>

        <div v-else style="padding: 0 18px 16px">
          <div style="font-size: 14px; font-weight: 500; color: #333; margin-bottom: 12px">热门搜索</div>
          <div style="display: flex; flex-wrap: wrap; gap: 10px">
            <span v-for="tag in ['剑来', '诡秘之主', '凡人修仙传', '雪中悍刀行', '三体', '斗破苍穹']" :key="tag" class="hot-tag" @click="useHotTag(tag)">{{ tag }}</span>
          </div>
        </div>

        <div style="text-align: center; padding: 12px 0 20px; color: #ff5e2a; font-size: 16px; cursor: pointer" @click="clearSearch">取消</div>
      </div>
    </div>

    <div v-if="showTip" class="toast">{{ tipText }}</div>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 18px;
  background: #f4f6fa;
  border-radius: 30px;
  cursor: pointer;
}
.category-nav {
  display: flex;
  justify-content: space-around;
  height: 44px;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #f0f2f5;
  flex: 0 0 44px;
}
.category-nav__item {
  font-size: 15px;
  color: #4a4a4a;
  padding: 6px 8px;
  cursor: pointer;
}
.category-nav__item--active {
  color: #ff5e2a;
  font-weight: 700;
}
.banner {
  position: relative;
  height: 150px;
  border-radius: 16px;
  overflow: hidden;
}
.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.banner__label {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
  display: flex;
  align-items: flex-end;
  padding: 0 0 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0 0 16px 16px;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
}
.banner__dot {
  width: 7px;
  height: 7px;
  border-radius: 4px;
  background: #ddd;
  margin-right: 8px;
  cursor: pointer;
  transition: width 0.2s;
}
.banner__dot--active {
  width: 18px;
  background: #ff5e2a;
}
.quick-entry {
  display: flex;
  padding: 12px 10px 16px;
  background: #fff;
  border-bottom: 8px solid #f2f4f8;
}
.quick-entry__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.quick-entry__icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  overflow: hidden;
}
.quick-entry__icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.quick-entry__label {
  font-size: 12px;
  color: #3d3d3d;
  margin-top: 6px;
}
.section-head {
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f2f5;
}
.section-head__title {
  font-size: 18px;
  font-weight: 700;
}
.section-head__more {
  margin-left: auto;
  font-size: 14px;
  color: #8e8e93;
  cursor: pointer;
}
.book-row {
  display: flex;
  padding: 14px 0;
  border-bottom: 1px solid #f5f6f8;
}
.book-row--last {
  border-bottom: none;
}
.book-row__cover {
  width: 92px;
  height: 122px;
  border-radius: 12px;
  object-fit: cover;
  flex: 0 0 92px;
}
.book-row__info {
  flex: 1;
  padding-left: 16px;
  min-width: 0;
}
.book-row__title {
  font-size: 17px;
  font-weight: 700;
  color: #1f1f1f;
  margin-bottom: 4px;
}
.book-row__desc {
  font-size: 14px;
  color: #6b6b70;
  margin-bottom: 6px;
}
.book-row__meta {
  display: flex;
  align-items: center;
  gap: 12px;
}
.book-row__author {
  font-size: 13px;
  color: #5a5a5f;
}
.book-row__hot {
  font-size: 13px;
  color: #8e8e93;
}
.book-row__actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.mini-btn {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  border: none;
  background: #f4f6fa;
  color: #666;
  cursor: pointer;
}
.mini-btn--accent {
  background: #fff5f0;
  color: #ff5e2a;
}
.bottom-nav {
  display: flex;
  height: 60px;
  flex: 0 0 60px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}
.bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}
.bottom-nav__icon {
  font-size: 22px;
  filter: grayscale(1);
}
.bottom-nav__icon--active {
  filter: none;
}
.bottom-nav__label {
  font-size: 11px;
  color: #8a8a8f;
}
.bottom-nav__label--active {
  color: #ff5e2a;
}
.search-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 500;
}
.search-panel {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  max-height: 80%;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #333;
}
.search-result {
  display: flex;
  gap: 12px;
  padding: 10px 18px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
}
.search-result img {
  width: 60px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}
.hot-tag {
  font-size: 13px;
  color: #333;
  background: #f0f2f5;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
}
</style>
