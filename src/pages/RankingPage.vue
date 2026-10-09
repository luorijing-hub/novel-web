<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BOOKS, calcBookHeat, formatHeatWan, mapServerBook, type BookItem } from '@/data/books'
import { api } from '@/api'
import { useGuard } from '@/composables/useGuard'

const router = useRouter()
const { guard, showTip, tipText } = useGuard()

interface RankBook extends BookItem {
  heatWan: number
  readWan: number
  favWan: number
  cmtWan: number
  trend: number
  isNew: boolean
}

const tabs = ['总榜', '男频榜', '女频榜']
const currentTab = ref(0)
const rankBooks = ref<RankBook[]>([])
const useServerData = ref(false)
const rankColors = ['#f5a623', '#b0bec5', '#d98e6b']

const maxHeat = computed(() => (rankBooks.value.length ? rankBooks.value[0].heatWan : 1))

function buildLocalRanking() {
  const scope = currentTab.value === 0 ? '' : currentTab.value === 1 ? '男频' : '女频'
  const list: RankBook[] = BOOKS.filter((b) => !scope || b.channel === scope).map((b) => {
    const h = calcBookHeat(b.title, b.hot)
    return { ...b, heatWan: h.heatWan, readWan: h.readWan, favWan: h.favWan, cmtWan: h.cmtWan, trend: h.trend, isNew: h.isNew }
  })
  list.sort((a, b) => b.heatWan - a.heatWan)
  rankBooks.value = list
  useServerData.value = false
}

async function fetchRanking() {
  const scope = currentTab.value === 0 ? 'total' : currentTab.value === 1 ? 'male' : 'female'
  try {
    const res: any = await api.getRanking(scope)
    const list: RankBook[] = (res?.list ?? [])
      .map((raw: any) => {
        const book = mapServerBook(raw)
        if (!book) return null
        return {
          ...book,
          heatWan: Number(raw.heatWan) || 0,
          readWan: Number(raw.readWan) || 0,
          favWan: Number(raw.favWan) || 0,
          cmtWan: Number(raw.cmtWan) || 0,
          trend: Number(raw.trend) || 0,
          isNew: raw.isNew === true
        } as RankBook
      })
      .filter((b: RankBook | null): b is RankBook => !!b)
    if (list.length > 0) {
      rankBooks.value = list
      useServerData.value = true
      return
    }
  } catch (err) {
    console.info('排行接口请求失败，回退本地计算', err)
  }
  buildLocalRanking()
}

function trendText(book: RankBook): string {
  if (book.isNew) return '新上榜'
  if (book.trend > 0) return `↑ ${book.trend * 6} 名`
  if (book.trend < 0) return `↓ ${-book.trend * 6} 名`
  return '— 持平'
}

function trendColor(book: RankBook): string {
  if (book.isNew) return '#52c41a'
  if (book.trend !== 0) return book.trend > 0 ? '#ff4d4f' : '#52c41a'
  return '#8e8e93'
}

function switchTab(index: number) {
  currentTab.value = index
  fetchRanking()
}

function addToShelf(book: RankBook) {
  router.push({ path: '/bookshelf', query: { add: book.title } })
}

onMounted(fetchRanking)
</script>

<template>
  <div class="page">
    <div class="navbar">
      <span class="navbar__back" @click="router.back()">〈</span>
      <span class="navbar__title">排行榜</span>
      <span class="navbar__action" @click="guard(() => router.push('/bookshelf'))">📖</span>
      <span class="navbar__action" style="margin-left: 18px" @click="router.push('/')">🏠</span>
    </div>

    <div class="rank-tabs">
      <div v-for="(t, i) in tabs" :key="t" class="rank-tabs__item" @click="switchTab(i)">
        <span :class="{ 'rank-tabs__text--active': currentTab === i }">{{ t }}</span>
        <span v-if="currentTab === i" class="rank-tabs__bar"></span>
      </div>
    </div>

    <div class="rank-head">
      <div>
        <div style="font-size: 18px; font-weight: 700">🔥 热度榜</div>
        <div style="font-size: 11px; color: #8e8e93; margin-top: 3px">热度 = 阅读量×0.5 + 收藏量×2 + 评论量×5</div>
      </div>
      <span style="font-size: 12px; color: #8e8e93; margin-left: auto">共 {{ rankBooks.length }} 本{{ useServerData ? ' · 后端数据' : '' }}</span>
    </div>

    <div class="page-body hide-scrollbar" style="padding: 4px 14px 16px">
      <div v-for="(book, index) in rankBooks" :key="book.title" class="rank-item">
        <div class="rank-item__no" :style="{ background: index < 3 ? rankColors[index] : 'transparent', color: index < 3 ? '#fff' : '#9aa0a6' }">
          {{ index + 1 }}
        </div>

        <img class="rank-item__cover" :src="book.image" :alt="book.title" :style="{ background: book.color }" @click="guard(() => addToShelf(book))" />

        <div class="rank-item__info">
          <div style="display: flex; align-items: center">
            <span class="rank-item__title" :style="{ color: index < 3 ? rankColors[index] : '#1f1f1f' }">{{ book.title }}</span>
            <span :style="{ color: trendColor(book), fontSize: '11px', marginLeft: '8px' }">{{ trendText(book) }}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px">
            <span style="font-size: 12px; color: #5a5a5f">{{ book.author }}</span>
            <span class="chip">{{ book.tag }}</span>
            <span style="margin-left: auto; font-size: 13px; font-weight: 700; color: #ff5e2a">🔥 {{ formatHeatWan(book.heatWan) }}热度</span>
          </div>
          <div class="heat-bar"><div class="heat-bar__fill" :style="{ width: (book.heatWan / maxHeat) * 100 + '%' }"></div></div>
          <div style="font-size: 11px; color: #8e8e93; margin-top: 5px">
            阅读 {{ formatHeatWan(book.readWan) }} · 收藏 {{ formatHeatWan(book.favWan) }} · 评论 {{ formatHeatWan(book.cmtWan) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="showTip" class="toast">{{ tipText }}</div>
  </div>
</template>

<style scoped>
.rank-tabs {
  display: flex;
  height: 44px;
  flex: 0 0 44px;
  background: #fff;
  border-bottom: 1px solid #f0f2f5;
}
.rank-tabs__item {
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
.rank-tabs__text--active {
  color: #ff5e2a;
  font-weight: 700;
}
.rank-tabs__bar {
  width: 20px;
  height: 3px;
  border-radius: 2px;
  background: #ff5e2a;
}
.rank-head {
  display: flex;
  align-items: flex-start;
  padding: 14px 18px 10px;
  background: #fff;
  border-bottom: 8px solid #f2f4f8;
}
.rank-item {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 10px;
}
.rank-item__no {
  width: 28px;
  height: 28px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  flex: 0 0 28px;
}
.rank-item__cover {
  width: 56px;
  height: 74px;
  border-radius: 8px;
  object-fit: cover;
  flex: 0 0 56px;
  cursor: pointer;
}
.rank-item__info {
  flex: 1;
  min-width: 0;
}
.rank-item__title {
  font-size: 16px;
  font-weight: 700;
}
.heat-bar {
  height: 5px;
  border-radius: 3px;
  background: #f0f2f5;
  margin-top: 7px;
  overflow: hidden;
}
.heat-bar__fill {
  height: 100%;
  background: #ff5e2a;
}
</style>
