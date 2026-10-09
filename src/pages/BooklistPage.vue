<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BOOKLISTS, mapServerBooklist, type Booklist } from '@/data/booklists'
import { getBooksByTitles, type BookItem } from '@/data/books'
import { FREE_BOOK_TITLES, NEW_BOOK_TITLES } from '@/data/topics'
import { api } from '@/api'
import { currentUsername } from '@/store/auth'
import { isBooklistFavorite, toggleBooklistFavorite } from '@/data/favorites'
import { CHECKIN_EXP_PER_DAY, doCheckin, getCheckinDay, getCheckinExp, isSignedToday } from '@/data/checkin'
import { useGuard } from '@/composables/useGuard'

const route = useRoute()
const router = useRouter()
const { guard, showTip, tipText, showTipMessage } = useGuard()

const booklists = ref<Booklist[]>(BOOKLISTS)
const useServerData = ref(false)
const detail = ref<Booklist | null>(null)
const detailBooks = ref<BookItem[]>([])
const isFavorited = ref(false)

const detailId = computed(() => Number(route.query.id ?? 0))
const isDetail = computed(() => detailId.value > 0)

// ===== 活动 =====
const showFree = ref(false)
const showCheckin = ref(false)
const showNew = ref(false)
const signedToday = ref(false)
const checkinExp = ref(0)
const checkinDay = computed(() => getCheckinDay())
const checkinRewards = [10, 10, 10, 10, 10, 10, 10]
const freeBooks = ref<BookItem[]>([])
const newBooks = ref<BookItem[]>([])

function initActivities() {
  freeBooks.value = getBooksByTitles(FREE_BOOK_TITLES)
  newBooks.value = getBooksByTitles(NEW_BOOK_TITLES)
}

function loadCheckin() {
  const user = currentUsername.value
  signedToday.value = isSignedToday(user)
  checkinExp.value = getCheckinExp(user)
}

function onCheckin() {
  const res = doCheckin(currentUsername.value)
  showTipMessage(res.message)
  loadCheckin()
}

function refreshFavorite(id: number) {
  isFavorited.value = isBooklistFavorite(currentUsername.value, id)
}

function toggleFavorite(list: Booklist) {
  guard(() => {
    const now = toggleBooklistFavorite(currentUsername.value, list)
    showTipMessage(now ? '已收藏书单' : '已取消收藏')
    if (isDetail.value) isFavorited.value = now
    booklists.value = [...booklists.value]
  })
}

async function loadBooklists() {
  try {
    const res: any = await api.getBooklists()
    const list: Booklist[] = (res?.list ?? [])
      .map((raw: unknown) => mapServerBooklist(raw))
      .filter((l: Booklist | null): l is Booklist => !!l)
    if (list.length) {
      booklists.value = list
      useServerData.value = true
    }
  } catch (err) {
    console.info('书单接口请求失败，使用本地数据', err)
  }
}

async function loadDetail(id: number) {
  let list: Booklist | undefined = BOOKLISTS.find((l) => l.id === id)
  try {
    const res: any = await api.getBooklistDetail(id)
    const mapped = mapServerBooklist(res)
    if (mapped) list = mapped
  } catch (err) {
    console.info('书单详情接口请求失败，使用本地数据', err)
  }
  if (!list) return
  detail.value = list
  detailBooks.value = getBooksByTitles(list.bookTitles)
  refreshFavorite(list.id)
}

function openDetail(list: Booklist) {
  router.push({ path: '/booklists', query: { id: list.id } })
}

function addToShelf(book: BookItem) {
  router.push({ path: '/bookshelf', query: { add: book.title } })
}

onMounted(async () => {
  initActivities()
  loadCheckin()
  if (isDetail.value) await loadDetail(detailId.value)
  else await loadBooklists()
})
</script>

<template>
  <div class="page">
    <div class="navbar">
      <span class="navbar__back" @click="isDetail ? router.push('/booklists') : router.back()">〈</span>
      <span class="navbar__title">{{ isDetail ? detail?.title ?? '书单详情' : '书单' }}</span>
      <span class="navbar__action" @click="guard(() => router.push('/favorites'))">⭐</span>
      <span class="navbar__action" style="margin-left: 18px" @click="router.push('/')">🏠</span>
    </div>

    <!-- 书单详情 -->
    <div v-if="isDetail" class="page-body hide-scrollbar">
      <div v-if="detail" class="detail-head">
        <div style="font-size: 20px; font-weight: 700">{{ detail.title }}</div>
        <div style="font-size: 14px; color: #6b6b70; margin-top: 8px">{{ detail.desc }}</div>
        <div style="display: flex; align-items: center; gap: 16px; margin-top: 10px; font-size: 12px; color: #8e8e93">
          <span>👤 {{ detail.creator }}</span>
          <span>🔥 {{ detail.follows }} 人关注</span>
          <span>📚 {{ detail.bookTitles.length }} 本</span>
        </div>
        <button class="btn-primary" style="height: 36px; font-size: 14px; margin-top: 14px" @click="toggleFavorite(detail)">
          {{ isFavorited ? '⭐ 已收藏' : '☆ 收藏书单' }}
        </button>
      </div>

      <div style="padding: 12px 14px 16px">
        <div v-for="book in detailBooks" :key="book.title" class="detail-book">
          <img class="detail-book__cover" :src="book.image" :alt="book.title" :style="{ background: book.color }" @click="guard(() => addToShelf(book))" />
          <div style="flex: 1; min-width: 0; padding-left: 12px">
            <div style="font-size: 16px; font-weight: 700">{{ book.title }}</div>
            <div class="ellipsis-2" style="font-size: 13px; color: #6b6b70; margin-top: 5px">{{ book.desc }}</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px">
              <span style="font-size: 12px; color: #5a5a5f">{{ book.author }}</span>
              <span class="chip">{{ book.tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 书单列表 -->
    <div v-else class="page-body hide-scrollbar">
      <div class="activity-row">
        <div class="activity-card" style="background: #ff8a65" @click="showFree = true">
          <span style="font-size: 22px">📖</span>
          <span class="activity-card__title">限时免费</span>
          <span class="activity-card__desc">全场精选免费读</span>
        </div>
        <div class="activity-card" style="background: #ff6b9d" @click="showCheckin = true">
          <span style="font-size: 22px">🎁</span>
          <span class="activity-card__title">签到有礼</span>
          <span class="activity-card__desc">{{ signedToday ? '今日已签到' : `签到 +${CHECKIN_EXP_PER_DAY} 经验` }}</span>
        </div>
        <div class="activity-card" style="background: #5b8def" @click="showNew = true">
          <span style="font-size: 22px">🔥</span>
          <span class="activity-card__title">新书首发</span>
          <span class="activity-card__desc">独家首发抢先看</span>
        </div>
      </div>

      <div style="padding: 12px 14px 16px">
        <div style="font-size: 14px; color: #666; padding: 0 4px 10px">
          精选书单 · 共 {{ booklists.length }} 个{{ useServerData ? ' · 后端数据' : '' }}
        </div>

        <div v-for="list in booklists" :key="list.id" class="bl-card">
          <div @click="openDetail(list)" style="cursor: pointer">
            <div style="display: flex; align-items: center">
              <span class="bl-card__title ellipsis">{{ list.title }}</span>
              <span style="margin-left: auto; font-size: 20px; cursor: pointer" @click.stop="toggleFavorite(list)">
                {{ isBooklistFavorite(currentUsername, list.id) ? '⭐' : '☆' }}
              </span>
            </div>
            <div class="bl-card__desc ellipsis-2">{{ list.desc }}</div>
            <div class="bl-card__meta">
              <span>👤 {{ list.creator }}</span>
              <span>🔥 {{ list.follows }}</span>
              <span>📚 {{ list.bookTitles.length }} 本</span>
            </div>
            <div class="bl-card__books">
              <img
                v-for="book in getBooksByTitles(list.bookTitles).slice(0, 4)"
                :key="book.title"
                :src="book.image"
                :alt="book.title"
                :style="{ background: book.color }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 限时免费 -->
    <div v-if="showFree" class="sheet-mask" @click.self="showFree = false">
      <div class="sheet" style="height: 62%">
        <div style="padding: 16px; display: flex; align-items: center">
          <span style="font-size: 17px; font-weight: 700">📖 限时免费</span>
          <span style="margin-left: auto; font-size: 18px; color: #999; cursor: pointer" @click="showFree = false">✕</span>
        </div>
        <div style="padding: 0 16px 10px; font-size: 12px; color: #8e8e93">全场精选好书限时免费读，点击封面加入书架</div>
        <div style="flex: 1; overflow-y: auto; padding: 0 14px 16px">
          <div v-for="book in freeBooks" :key="book.title" class="sheet-book">
            <img :src="book.image" :alt="book.title" :style="{ background: book.color }" @click="guard(() => addToShelf(book))" />
            <div style="flex: 1; min-width: 0; padding-left: 12px">
              <div style="font-size: 15px; font-weight: 700">{{ book.title }}</div>
              <div class="ellipsis" style="font-size: 12px; color: #6b6b70; margin-top: 4px">{{ book.desc }}</div>
              <div style="margin-top: 6px"><span class="chip" style="background: #fff3ee; color: #ff5e2a">免费</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 签到有礼 -->
    <div v-if="showCheckin" class="sheet-mask" @click.self="showCheckin = false">
      <div class="sheet" style="height: 48%">
        <div style="padding: 16px 18px 12px; display: flex; align-items: center">
          <span style="font-size: 17px; font-weight: 700">🎁 签到有礼</span>
          <span style="margin-left: auto; font-size: 18px; color: #999; cursor: pointer" @click="showCheckin = false">✕</span>
        </div>

        <div style="display: flex; padding: 8px 18px 16px">
          <div v-for="(reward, index) in checkinRewards" :key="index" style="flex: 1; display: flex; flex-direction: column; align-items: center">
            <div
              class="checkin-dot"
              :style="{
                background: signedToday && index === checkinDay - 1 ? '#ff5e2a' : index === checkinDay - 1 ? '#fff3ee' : '#f4f6fa',
                color: signedToday && index === checkinDay - 1 ? '#fff' : index === checkinDay - 1 ? '#ff5e2a' : '#8e8e93'
              }"
            >
              {{ index + 1 }}
            </div>
            <span style="font-size: 10px; color: #8e8e93; margin-top: 4px">+{{ reward }}</span>
          </div>
        </div>

        <div style="text-align: center; font-size: 13px; color: #666">
          {{ signedToday ? '✅ 今日已签到' : `今日签到可领 ${CHECKIN_EXP_PER_DAY} 经验` }}
        </div>

        <div style="display: flex; justify-content: center">
          <button
            class="btn-primary"
            style="width: 86%; height: 44px; font-size: 16px; margin-top: 24px"
            :style="{ background: signedToday ? '#ccc' : '#ff5e2a' }"
            @click="onCheckin"
          >
            {{ signedToday ? '已签到' : '立即签到' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 新书首发 -->
    <div v-if="showNew" class="sheet-mask" @click.self="showNew = false">
      <div class="sheet" style="height: 62%">
        <div style="padding: 16px; display: flex; align-items: center">
          <span style="font-size: 17px; font-weight: 700">🔥 新书首发</span>
          <span style="margin-left: auto; font-size: 18px; color: #999; cursor: pointer" @click="showNew = false">✕</span>
        </div>
        <div style="padding: 0 16px 10px; font-size: 12px; color: #8e8e93">全网独家首发，抢先阅读，点击封面加入书架</div>
        <div style="flex: 1; overflow-y: auto; padding: 0 14px 16px">
          <div v-for="book in newBooks" :key="book.title" class="sheet-book">
            <img :src="book.image" :alt="book.title" :style="{ background: book.color }" @click="guard(() => addToShelf(book))" />
            <div style="flex: 1; min-width: 0; padding-left: 12px">
              <div style="font-size: 15px; font-weight: 700">{{ book.title }}</div>
              <div class="ellipsis" style="font-size: 12px; color: #6b6b70; margin-top: 4px">{{ book.desc }}</div>
              <div style="margin-top: 6px"><span class="chip" style="background: #fff3ee; color: #ff5e2a">首发</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showTip" class="toast">{{ tipText }}</div>
  </div>
</template>

<style scoped>
.activity-row {
  display: flex;
  gap: 10px;
  padding: 14px 14px 6px;
}
.activity-card {
  flex: 1;
  height: 88px;
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  color: #fff;
  cursor: pointer;
}
.activity-card__title {
  font-size: 14px;
  font-weight: 700;
  margin-top: 4px;
}
.activity-card__desc {
  font-size: 11px;
  opacity: 0.9;
  margin-top: 2px;
}
.bl-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
}
.bl-card__title {
  font-size: 17px;
  font-weight: 700;
  flex: 1;
  min-width: 0;
}
.bl-card__desc {
  font-size: 13px;
  color: #6b6b70;
  margin-top: 6px;
}
.bl-card__meta {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: #8e8e93;
  margin-top: 8px;
}
.bl-card__books {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.bl-card__books img {
  width: 52px;
  height: 68px;
  border-radius: 8px;
  object-fit: cover;
}
.detail-head {
  background: #fff;
  padding: 18px;
  border-bottom: 8px solid #f2f4f8;
}
.detail-book {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
}
.detail-book__cover {
  width: 76px;
  height: 100px;
  border-radius: 10px;
  object-fit: cover;
  flex: 0 0 76px;
  cursor: pointer;
}
.sheet-book {
  display: flex;
  padding: 10px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 10px;
}
.sheet-book img {
  width: 56px;
  height: 74px;
  border-radius: 8px;
  object-fit: cover;
  flex: 0 0 56px;
  cursor: pointer;
}
.checkin-dot {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
}
</style>
