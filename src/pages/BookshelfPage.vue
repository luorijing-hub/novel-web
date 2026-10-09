<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BOOKS } from '@/data/books'
import { api } from '@/api'
import { currentUsername, isLoggedIn } from '@/store/auth'
import { addToShelfLocal, getShelf, makeShelfBook, removeFromShelfLocal, saveShelf, type ShelfBook } from '@/data/shelf'
import { useGuard } from '@/composables/useGuard'

const route = useRoute()
const router = useRouter()
const { showTip, tipText, showTipMessage } = useGuard()

const tabs = ['全部', '在读', '已读完']
const currentTab = ref(0)
const shelfBooks = ref<ShelfBook[]>([])
const isEditMode = ref(false)
const selected = ref<string[]>([])

const finishedCount = computed(() => shelfBooks.value.filter((b) => b.readProgress === 100).length)

const displayBooks = computed(() => {
  const list = shelfBooks.value
  if (currentTab.value === 1) return list.filter((b) => b.readProgress > 0 && b.readProgress < 100)
  if (currentTab.value === 2) return list.filter((b) => b.readProgress === 100)
  return list
})

function loadLocal() {
  shelfBooks.value = getShelf(currentUsername.value)
}

// 后端书架合并（后端有、本地没有的补齐）
async function syncFromServer() {
  try {
    const res: any = await api.getShelf()
    const titles: string[] = res?.list ?? []
    let added = false
    titles.forEach((title) => {
      if (shelfBooks.value.some((b) => b.title === title)) return
      const book = BOOKS.find((b) => b.title === title)
      if (book) {
        shelfBooks.value.unshift(makeShelfBook(book))
        added = true
      }
    })
    if (added) saveShelf(currentUsername.value, shelfBooks.value)
  } catch (err) {
    console.info('书架同步后端失败，仅使用本地数据', err)
  }
}

// 处理 ?add=书名（来自各页面的“加入书架”）
function handleAddQuery() {
  const title = String(route.query.add ?? '')
  if (!title) return
  const book = BOOKS.find((b) => b.title === title)
  if (!book) return
  if (addToShelfLocal(currentUsername.value, book)) {
    showTipMessage(`已添加《${book.title}》到书架`)
    api.addToShelf(book.title).catch((err) => console.info('书架同步后端失败', err))
  } else {
    showTipMessage(`《${book.title}》已在书架中`)
  }
  loadLocal()
  router.replace({ path: '/bookshelf' })
}

function toggleSelection(title: string) {
  const i = selected.value.indexOf(title)
  if (i >= 0) selected.value.splice(i, 1)
  else selected.value.push(title)
}

// 删除（本地 + 后端同步删除，避免重新进入被合并回来）
function deleteSelected() {
  const titles = [...selected.value]
  if (!titles.length) return
  removeFromShelfLocal(currentUsername.value, titles)
  loadLocal()
  selected.value = []
  isEditMode.value = false
  showTipMessage(`已删除 ${titles.length} 本书`)
  titles.forEach((t) => {
    api.removeFromShelf(t).catch((err) => console.info('书架删除同步后端失败', err))
  })
}

onMounted(async () => {
  loadLocal()
  await syncFromServer()
  handleAddQuery()
})
</script>

<template>
  <div class="page">
    <div class="navbar">
      <span class="navbar__back" @click="router.back()">〈</span>
      <span class="navbar__title">我的书架</span>
      <span class="navbar__action" style="font-size: 16px" @click="isEditMode = !isEditMode; selected = []">
        {{ isEditMode ? '完成' : '编辑' }}
      </span>
    </div>

    <div v-if="!isLoggedIn" class="page-body">
      <div class="empty">
        <span class="empty__icon">🔒</span>
        <span>登录后才能查看书架</span>
        <button class="btn-primary" style="margin-top: 10px" @click="router.push('/login')">去登录</button>
      </div>
    </div>

    <template v-else>
      <div class="shelf-tabs">
        <div v-for="(t, i) in tabs" :key="t" class="shelf-tabs__item" @click="currentTab = i">
          <span :class="{ 'shelf-tabs__text--active': currentTab === i }">{{ t }}</span>
          <span v-if="currentTab === i" class="shelf-tabs__bar"></span>
        </div>
      </div>

      <div class="page-body hide-scrollbar">
        <div v-if="!isEditMode" class="shelf-stats">
          <span>共 {{ shelfBooks.length }} 本书</span>
          <span style="margin-left: auto">已读完 {{ finishedCount }} 本</span>
        </div>

        <div v-if="displayBooks.length" style="padding: 4px 14px 16px">
          <div v-for="book in displayBooks" :key="book.title" class="shelf-item">
            <div v-if="isEditMode" class="shelf-check" :class="{ 'shelf-check--on': selected.includes(book.title) }" @click="toggleSelection(book.title)">
              <span v-if="selected.includes(book.title)">✓</span>
            </div>

            <img class="shelf-item__cover" :src="book.image" :alt="book.title" :style="{ background: book.color }" />

            <div class="shelf-item__info">
              <div class="shelf-item__title">{{ book.title }}</div>
              <div class="shelf-item__author">{{ book.author }}</div>
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px">
                <span class="chip">{{ book.tag }}</span>
                <span style="font-size: 12px; color: #8e8e93">🔥 {{ book.hot }}</span>
              </div>
              <div style="margin-top: 6px; font-size: 12px">
                <template v-if="book.readProgress === 100"><span style="color: #52c41a">✅ 已读完</span></template>
                <template v-else-if="book.readProgress > 0">
                  <div style="display: flex; align-items: center; gap: 6px">
                    <span style="color: #666">阅读进度</span>
                    <div class="progress"><div class="progress__fill" :style="{ width: book.readProgress + '%' }"></div></div>
                    <span style="color: #ff5e2a">{{ book.readProgress }}%</span>
                  </div>
                </template>
                <template v-else><span style="color: #8e8e93">📖 未开始</span></template>
              </div>
              <div style="font-size: 11px; color: #999; margin-top: 4px">上次阅读: {{ book.lastReadTime }}</div>
            </div>
          </div>
        </div>

        <div v-else class="empty">
          <span class="empty__icon">📚</span>
          <span>书架还是空的</span>
          <span style="font-size: 13px; color: #999">去首页或分类页挑几本书吧</span>
          <button class="btn-primary" style="margin-top: 10px" @click="router.push('/')">去首页</button>
        </div>
      </div>

      <div v-if="isEditMode && displayBooks.length" class="shelf-bottom">
        <button class="btn-primary" style="background: #ff4d4f" :disabled="!selected.length" @click="deleteSelected">
          删除所选（{{ selected.length }}）
        </button>
      </div>
    </template>

    <div v-if="showTip" class="toast">{{ tipText }}</div>
  </div>
</template>

<style scoped>
.shelf-tabs {
  display: flex;
  height: 44px;
  flex: 0 0 44px;
  background: #fff;
  border-bottom: 1px solid #f0f2f5;
}
.shelf-tabs__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 15px;
  color: #4a4a4a;
  cursor: pointer;
}
.shelf-tabs__text--active {
  color: #ff5e2a;
  font-weight: 700;
}
.shelf-tabs__bar {
  width: 20px;
  height: 3px;
  border-radius: 2px;
  background: #ff5e2a;
}
.shelf-stats {
  display: flex;
  padding: 12px 18px 8px;
  font-size: 14px;
  color: #666;
}
.shelf-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 10px;
}
.shelf-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ddd;
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
  cursor: pointer;
}
.shelf-check--on {
  background: #ff5e2a;
}
.shelf-item__cover {
  width: 80px;
  height: 106px;
  border-radius: 10px;
  object-fit: cover;
  flex: 0 0 80px;
}
.shelf-item__info {
  flex: 1;
  min-width: 0;
}
.shelf-item__title {
  font-size: 17px;
  font-weight: 700;
}
.shelf-item__author {
  font-size: 14px;
  color: #6b6b70;
  margin-top: 4px;
}
.progress {
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: #f0f2f5;
  overflow: hidden;
}
.progress__fill {
  height: 100%;
  background: #ff5e2a;
}
.shelf-bottom {
  flex: 0 0 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}
</style>
